import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_422_UNPROCESSABLE_ENTITY

logger = logging.getLogger("procurement_api")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning("Validation error: %s", exc)
        return JSONResponse(status_code=HTTP_422_UNPROCESSABLE_ENTITY, content={
            "success": False,
            "message": "Validation failed",
            "errors": exc.errors(),
        })

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception", exc_info=exc)
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={
            "success": False,
            "message": "Internal server error",
        })
