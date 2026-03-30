import logging
import time
import uuid

from .log_context import reset_request_id, set_request_id

logger = logging.getLogger("api.request")


class RequestIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        incoming_request_id = (request.META.get("HTTP_X_REQUEST_ID") or "").strip()
        request_id = incoming_request_id if incoming_request_id and len(incoming_request_id) <= 128 else str(uuid.uuid4())
        token = set_request_id(request_id)
        request.request_id = request_id

        start = time.perf_counter()
        try:
            response = self.get_response(request)
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.info(
                "HTTP request processed",
                extra={
                    "event": "http_request",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.path,
                    "status_code": getattr(locals().get("response"), "status_code", 500),
                    "duration_ms": duration_ms,
                },
            )
            reset_request_id(token)

        response["X-Request-ID"] = request_id
        return response
