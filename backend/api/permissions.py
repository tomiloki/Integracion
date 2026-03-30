from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "Solo administradores pueden acceder a este recurso."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")


class IsDistributorOrAdmin(BasePermission):
    message = "Solo distribuidores y administradores pueden acceder a este recurso."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in {"distributor", "admin"}
        )
