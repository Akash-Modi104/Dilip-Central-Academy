from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from apps.permissions import IsSuperAdmin
from .serializers import UserSerializer, MeSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            return Response(MeSerializer(request.user).data)
        ser = MeSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_pw = request.data.get('password')
        if not new_pw:
            return Response({'detail': 'password required'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_pw)
        user.save()
        return Response({'detail': 'password reset'})
