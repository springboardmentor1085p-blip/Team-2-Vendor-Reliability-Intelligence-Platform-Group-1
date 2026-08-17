import logging
from typing import Any, Dict

import httpx

logger = logging.getLogger(__name__)

# Default fallback data used when a downstream service is unreachable
_VENDOR_FALLBACK: Dict[str, Any] = {
    "vendor_name": "ABC Pvt Ltd",
    "vendor_status": "Approved",
    "contract_status": "Active",
}

_ORDER_FALLBACK: Dict[str, Any] = {
    "total_orders": 18,
    "latest_status": "Delivered",
}

_MESSAGING_FALLBACK: Dict[str, Any] = {
    "last_message": "Yesterday",
    "notification_count": 4,
}


class IntegrationService:
    """Aggregates data from Vendor, Purchase Order, and Messaging modules.

    When a downstream service is not reachable, the service gracefully
    returns pre-defined fallback/mock data so the platform remains functional
    during local development without other services running.
    """

    def __init__(self) -> None:
        self._vendor_url = "http://vendor-service/api/v1/vendor"
        self._purchase_order_url = "http://purchase-order-service/api/v1/purchase-orders"
        self._messaging_url = "http://messaging-service/api/v1/messages"
        self._timeout = 5.0  # seconds

    async def _fetch(self, url: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
        """Attempt an HTTP GET; return *fallback* on any error."""
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            logger.warning("Service unavailable at %s — using fallback data. Error: %s", url, exc)
            return fallback

    async def fetch_vendor_data(self) -> Dict[str, Any]:
        return await self._fetch(self._vendor_url, _VENDOR_FALLBACK)

    async def fetch_purchase_order_data(self) -> Dict[str, Any]:
        return await self._fetch(self._purchase_order_url, _ORDER_FALLBACK)

    async def fetch_messaging_data(self) -> Dict[str, Any]:
        return await self._fetch(self._messaging_url, _MESSAGING_FALLBACK)

    async def fetch_integration_summary(self) -> Dict[str, Any]:
        vendor_data   = await self.fetch_vendor_data()
        order_data    = await self.fetch_purchase_order_data()
        messaging_data = await self.fetch_messaging_data()

        return {
            "vendor_name":        vendor_data.get("vendor_name", "Unknown Vendor"),
            "vendor_status":      vendor_data.get("vendor_status", "Unknown"),
            "contract_status":    vendor_data.get("contract_status", "Unknown"),
            "purchase_orders":    order_data.get("total_orders", 0),
            "latest_order":       order_data.get("latest_status", "Pending"),
            "last_message":       messaging_data.get("last_message", "No messages"),
            "notification_count": messaging_data.get("notification_count", 0),
        }
