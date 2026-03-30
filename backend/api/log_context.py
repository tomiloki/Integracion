from contextvars import ContextVar
import logging


request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


def set_request_id(request_id: str):
    return request_id_var.set(request_id)


def get_request_id() -> str:
    return request_id_var.get()


def reset_request_id(token):
    request_id_var.reset(token)


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = get_request_id()
        return True
