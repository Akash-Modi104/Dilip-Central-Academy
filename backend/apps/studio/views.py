import hashlib
import json
import secrets

from PIL import Image, UnidentifiedImageError
from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from django.core import signing
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import SiteContent, StudioGalleryUpload
from apps.admissions.models import Enquiry


TOKEN_SALT = 'dca-admin-studio'
TOKEN_MAX_AGE = 2 * 60 * 60
LOGIN_WINDOW = 15 * 60
LOGIN_USER_LIMIT = 8
LOGIN_IP_LIMIT = 30
MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
ENQUIRY_WINDOW = 60 * 60
ENQUIRY_IP_LIMIT = 6


def _json(request):
    try:
        return json.loads(request.body or '{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}


def _authorized(request):
    header = request.headers.get('Authorization', '')
    if not header.startswith('Bearer '):
        return False
    try:
        payload = signing.loads(header[7:], salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
        user = get_user_model().objects.filter(
            pk=payload.get('user_id'), is_active=True, is_staff=True
        ).only('password').first()
        if not user:
            return False
        password_fingerprint = hashlib.sha256(user.password.encode()).hexdigest()[:16]
        return secrets.compare_digest(payload.get('password_fingerprint', ''), password_fingerprint)
    except (signing.BadSignature, signing.SignatureExpired):
        return False


def _login_keys(request, username):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip_address = forwarded.split(',')[0].strip() or request.META.get('REMOTE_ADDR', 'unknown')
    username_hash = hashlib.sha256(username.lower().encode()).hexdigest()
    ip_hash = hashlib.sha256(ip_address.encode()).hexdigest()
    return f'dca-login-user:{username_hash}', f'dca-login-ip:{ip_hash}'


def _increment_failure(key):
    cache.set(key, int(cache.get(key, 0)) + 1, LOGIN_WINDOW)


def _client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return forwarded.split(',')[0].strip() or request.META.get('REMOTE_ADDR', 'unknown')


def _enquiry_json(enquiry):
    return {
        'id': enquiry.pk,
        'student_name': enquiry.student_name,
        'parent_name': enquiry.parent_name,
        'grade_applying': enquiry.grade_applying,
        'email': enquiry.email,
        'phone': enquiry.phone,
        'message': enquiry.message,
        'admin_note': enquiry.admin_note,
        'status': enquiry.status,
        'created_at': enquiry.created_at.isoformat(),
    }


@require_http_methods(['GET'])
def health(request):
    return JsonResponse({'status': 'ok'})


@csrf_exempt
@require_http_methods(['POST'])
def login_api(request):
    body = _json(request)
    username = str(body.get('username', ''))[:150]
    user_key, ip_key = _login_keys(request, username)
    if int(cache.get(user_key, 0)) >= LOGIN_USER_LIMIT or int(cache.get(ip_key, 0)) >= LOGIN_IP_LIMIT:
        response = JsonResponse({'error': 'Too many attempts'}, status=429)
        response['Retry-After'] = str(LOGIN_WINDOW)
        return response
    user = authenticate(
        username=username,
        password=body.get('password', ''),
    )
    if not user or not user.is_active or not user.is_staff:
        _increment_failure(user_key)
        _increment_failure(ip_key)
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    cache.delete_many([user_key, ip_key])
    password_fingerprint = hashlib.sha256(user.password.encode()).hexdigest()[:16]
    token = signing.dumps(
        {'user_id': user.pk, 'password_fingerprint': password_fingerprint},
        salt=TOKEN_SALT,
    )
    return JsonResponse({'token': token, 'user': user.username})


@csrf_exempt
@require_http_methods(['GET', 'PUT'])
def site_content(request):
    record, _ = SiteContent.objects.get_or_create(key='main', defaults={'data': {}})
    if request.method == 'GET':
        return JsonResponse({'data': record.data, 'updated_at': record.updated_at})
    if not _authorized(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    body = _json(request)
    if not isinstance(body.get('data'), dict):
        return JsonResponse({'error': 'data must be an object'}, status=400)
    record.data = body['data']
    record.save(update_fields=['data', 'updated_at'])
    return JsonResponse({'data': record.data, 'updated_at': record.updated_at})


@csrf_exempt
@require_http_methods(['POST'])
def gallery_upload(request):
    if not _authorized(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    image = request.FILES.get('image')
    if not image:
        return JsonResponse({'error': 'image is required'}, status=400)
    if image.size > MAX_IMAGE_SIZE:
        return JsonResponse({'error': 'image must be 10 MB or smaller'}, status=400)
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        return JsonResponse({'error': 'only JPEG, PNG, WebP or GIF images are allowed'}, status=400)
    try:
        Image.open(image).verify()
        image.seek(0)
    except (UnidentifiedImageError, OSError, ValueError):
        return JsonResponse({'error': 'the uploaded file is not a valid image'}, status=400)
    item = StudioGalleryUpload.objects.create(
        title=str(request.POST.get('title', 'School gallery'))[:160], image=image
    )
    return JsonResponse({'title': item.title, 'image': item.image.url}, status=201)


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def parent_enquiries(request):
    if request.method == 'GET':
        if not _authorized(request):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        enquiries = Enquiry.objects.all()[:500]
        return JsonResponse({'results': [_enquiry_json(item) for item in enquiries]})

    body = _json(request)
    if body.get('website'):
        return JsonResponse({'submitted': True}, status=201)
    ip_hash = hashlib.sha256(_client_ip(request).encode()).hexdigest()
    rate_key = f'dca-enquiry-ip:{ip_hash}'
    if int(cache.get(rate_key, 0)) >= ENQUIRY_IP_LIMIT:
        response = JsonResponse({'error': 'Too many enquiries. Please try again later.'}, status=429)
        response['Retry-After'] = str(ENQUIRY_WINDOW)
        return response

    parent_name = str(body.get('parent_name', '')).strip()[:200]
    student_name = str(body.get('student_name', '')).strip()[:200]
    grade_applying = str(body.get('grade_applying', '')).strip()[:80]
    phone = ''.join(character for character in str(body.get('phone', '')) if character.isdigit())[:15]
    email = str(body.get('email', '')).strip()[:254]
    message = str(body.get('message', '')).strip()[:3000]
    if not parent_name or not student_name or not grade_applying or len(phone) < 10:
        return JsonResponse({'error': 'Parent, student, class and a valid phone number are required.'}, status=400)
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'error': 'Enter a valid email address.'}, status=400)
    enquiry = Enquiry.objects.create(
        parent_name=parent_name,
        student_name=student_name,
        grade_applying=grade_applying,
        phone=phone,
        email=email,
        message=message,
    )
    cache.set(rate_key, int(cache.get(rate_key, 0)) + 1, ENQUIRY_WINDOW)
    return JsonResponse({'submitted': True, 'id': enquiry.pk}, status=201)


@csrf_exempt
@require_http_methods(['PATCH', 'DELETE'])
def parent_enquiry_detail(request, enquiry_id):
    if not _authorized(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    enquiry = Enquiry.objects.filter(pk=enquiry_id).first()
    if not enquiry:
        return JsonResponse({'error': 'Enquiry not found'}, status=404)
    if request.method == 'DELETE':
        enquiry.delete()
        return JsonResponse({'deleted': True})
    body = _json(request)
    status = body.get('status')
    if status is not None:
        valid_statuses = {choice[0] for choice in Enquiry.STATUS}
        if status not in valid_statuses:
            return JsonResponse({'error': 'Invalid status'}, status=400)
        enquiry.status = status
    if 'admin_note' in body:
        enquiry.admin_note = str(body.get('admin_note', ''))[:3000]
    enquiry.save(update_fields=['status', 'admin_note'])
    return JsonResponse(_enquiry_json(enquiry))
