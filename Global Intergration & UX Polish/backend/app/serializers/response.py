from typing import Any, Dict, List, Optional


def success_response(message: str = "Request Successful", data: Any = None) -> Dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data or {},
    }


def error_response(message: str = "Something went wrong", errors: Optional[List[str]] = None) -> Dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "data": {},
        "errors": errors or [],
    }
