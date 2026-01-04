from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    message = "You don't have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'board'):
            return obj.board.owner == request.user
        if hasattr(obj, 'column'):
            return obj.column.board.owner == request.user
        return False