import json
import logging


class JsonLogFormatter(logging.Formatter):
    EXTRA_FIELDS = (
        "request_id",
        "event",
        "method",
        "path",
        "status_code",
        "user_id",
        "role",
        "order_id",
        "payment_id",
        "token_ws",
        "duration_ms",
    )

    def format(self, record):
        payload = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field in self.EXTRA_FIELDS:
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value
        return json.dumps(payload, ensure_ascii=False)
