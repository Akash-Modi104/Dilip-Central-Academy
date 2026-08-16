import json

from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import SiteContent, StudioGalleryUpload


TOKEN_SALT = 'dca-admin-studio'
TOKEN_MAX_AGE = 8 * 60 * 60


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
        return get_user_model().objects.filter(
            pk=payload.get('user_id'), is_active=True, is_staff=True
        ).exists()
    except (signing.BadSignature, signing.SignatureExpired):
        return False


@require_http_methods(['GET'])
def health(request):
    return JsonResponse({'status': 'ok'})


@csrf_exempt
@require_http_methods(['POST'])
def login_api(request):
    body = _json(request)
    user = authenticate(
        username=body.get('username', ''),
        password=body.get('password', ''),
    )
    if not user or not user.is_active or not user.is_staff:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    token = signing.dumps({'user_id': user.pk}, salt=TOKEN_SALT)
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
    item = StudioGalleryUpload.objects.create(
        title=request.POST.get('title', 'School gallery'), image=image
    )
    return JsonResponse({'title': item.title, 'image': item.image.url}, status=201)
