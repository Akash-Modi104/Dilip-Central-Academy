from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.role == 'super_admin')


class IsStaffOrSuper(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.role in ('super_admin', 'staff'))


class IsTeacherOrSuper(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.role in ('super_admin', 'teacher'))


class ReadOnlyOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        u = request.user
        return bool(u and u.is_authenticated and u.role == 'super_admin')


class ReadOnlyOrStaff(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        u = request.user
        return bool(u and u.is_authenticated and u.role in ('super_admin', 'staff'))
