import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.serializers.response import success_response, error_response
from app.services.integration_service import IntegrationService

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Integration"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"},
    },
)


@router.get(
    "/integration",
    summary="Get combined vendor integration data",
    response_description="Consolidated integration summary from all modules",
)
async def get_integration_summary():
    """Return consolidated integration data from vendor, purchase order, and messaging modules.

    Falls back to mock data when downstream services are unavailable.
    """
    try:
        service = IntegrationService()
        summary = await service.fetch_integration_summary()
        return success_response(data=summary, message="Integration summary retrieved successfully")
    except Exception as exc:
        logger.exception("Unexpected error in get_integration_summary: %s", exc)
        return JSONResponse(
            status_code=500,
            content=error_response(
                message="Failed to retrieve integration summary",
                errors=[str(exc)],
            ),
        )
