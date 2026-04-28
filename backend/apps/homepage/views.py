from rest_framework import viewsets, generics
from apps.permissions import ReadOnlyOrSuperAdmin
from .models import Hero, Stat, Testimonial
from .serializers import HeroSerializer, StatSerializer, TestimonialSerializer


class HeroView(generics.RetrieveUpdateAPIView):
    serializer_class = HeroSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]

    def get_object(self):
        return Hero.load()


class StatViewSet(viewsets.ModelViewSet):
    queryset = Stat.objects.all()
    serializer_class = StatSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]
