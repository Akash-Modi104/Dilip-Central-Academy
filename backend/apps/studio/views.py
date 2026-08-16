import hashlib
import json
import secrets

from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from django.core import signing
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import SiteContent, StudioGalleryUpload


TOKEN_SALT = 'dca-admin-studio'
TOKEN_MAX_AGE = 2 * 60 * 60
LOGIN_WINDOW = 15 * 60
LOGIN_USER_LIMIT = 8
LOGIN_IP_LIMIT = 30
MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}


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
    item = StudioGalleryUpload.objects.create(
        title=request.POST.get('title', 'School gallery'), image=image
    )
    return JsonResponse({'title': item.title, 'image': item.image.url}, status=201)
