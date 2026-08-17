from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    message: Optional[str] = None
