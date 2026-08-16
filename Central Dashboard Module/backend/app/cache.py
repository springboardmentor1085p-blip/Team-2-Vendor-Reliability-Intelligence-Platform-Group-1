"""
Cache layer: tries Redis first, falls back to an in-process TTL dict.
The in-process cache means the dashboard is fast even without Redis running.
"""
import json
import time
import logging
from typing import Any, Optional
import redis
from app.config import settings

logger = logging.getLogger(__name__)

# ── Redis client (optional) ───────────────────────────────────────────────────
_redis_client: Optional[redis.Redis] = None
_redis_checked = False          # only attempt connection once per worker


def get_redis() -> Optional[redis.Redis]:
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client
    _redis_checked = True
    try:
        client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
        )
        client.ping()
        _redis_client = client
    except Exception:
        _redis_client = None
    return _redis_client


# ── In-process TTL cache (fallback when Redis is unavailable) ─────────────────
_mem: dict[str, tuple[Any, float]] = {}   # key -> (value, expires_at)


def _mem_get(key: str) -> Optional[Any]:
    entry = _mem.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        _mem.pop(key, None)
        return None
    return value


def _mem_set(key: str, value: Any, ttl: int) -> None:
    # Keep memory bounded: evict all expired entries when dict exceeds 500 keys
    if len(_mem) > 500:
        now = time.time()
        expired = [k for k, (_, exp) in _mem.items() if now > exp]
        for k in expired:
            _mem.pop(k, None)
    _mem[key] = (value, time.time() + ttl)


def _mem_delete_pattern(pattern: str) -> None:
    prefix = pattern.rstrip("*")
    for k in list(_mem.keys()):
        if k.startswith(prefix):
            _mem.pop(k, None)


# ── Public API ────────────────────────────────────────────────────────────────

def cache_get(key: str) -> Optional[Any]:
    client = get_redis()
    if client:
        try:
            raw = client.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            pass
    return _mem_get(key)


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    client = get_redis()
    if client:
        try:
            client.setex(key, ttl, json.dumps(value, default=str))
            return
        except Exception:
            pass
    _mem_set(key, value, ttl)


def cache_delete(key: str) -> None:
    client = get_redis()
    if client:
        try:
            client.delete(key)
        except Exception:
            pass
    _mem.pop(key, None)


def cache_delete_pattern(pattern: str) -> None:
    client = get_redis()
    if client:
        try:
            keys = client.keys(pattern)
            if keys:
                client.delete(*keys)
        except Exception:
            pass
    _mem_delete_pattern(pattern)
