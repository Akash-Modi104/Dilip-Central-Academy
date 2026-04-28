from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    SUPER_ADMIN = 'super_admin'
    TEACHER = 'teacher'
    STAFF = 'staff'
    ROLE_CHOICES = [
        (SUPER_ADMIN, 'Super Admin'),
        (TEACHER, 'Teacher'),
        (STAFF, 'Staff'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STAFF)
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f'{self.username} ({self.role})'
