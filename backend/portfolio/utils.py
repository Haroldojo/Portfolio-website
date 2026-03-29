"""
Utility decorators and helpers for the portfolio app.
"""
import inspect
from functools import wraps
from django.http import JsonResponse
from django.conf import settings


def admin_token_required(view_func):
    """
    Decorator that checks for a valid X-Admin-Token header.

    Works correctly for both:
    - Function-based views (FBV): @admin_token_required on a standalone function
    - Class-based view methods (CBV): @admin_token_required on a method like post()

    When applied to a CBV method, Django/DRF calls  wrapper(self, request, ...)
    so self is the first arg and request is the second.

    When applied to a FBV, Django calls wrapper(request, ...) so request is the first arg.
    """
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        # Detect calling convention:
        # - CBV method: first arg is `self` (view instance), second arg is `request`
        # - FBV: first arg is `request` directly
        #
        # A Django/DRF Request object always has the `method` attribute.
        # A view instance (self) does NOT have `method`.
        if args and hasattr(args[0], 'method'):
            # FBV style: wrapper(request, ...)
            request = args[0]
        elif len(args) >= 2 and hasattr(args[1], 'method'):
            # CBV style: wrapper(self, request, ...)
            request = args[1]
        else:
            # Fallback: try first arg
            request = args[0] if args else None

        if request is None:
            return JsonResponse({"detail": "Bad request — could not resolve request object."}, status=400)

        # Read header (case-insensitive via Django's HttpRequest.headers dict)
        token = request.headers.get("X-Admin-Token", "")
        expected = getattr(settings, "ADMIN_API_TOKEN", "")

        if not expected:
            return JsonResponse(
                {"detail": "Admin token not configured on this server. Set ADMIN_API_TOKEN in your environment."},
                status=500,
            )

        if token != expected:
            return JsonResponse(
                {"detail": "Unauthorized. Provide a valid X-Admin-Token header."},
                status=401,
            )

        return view_func(*args, **kwargs)

    return wrapper
