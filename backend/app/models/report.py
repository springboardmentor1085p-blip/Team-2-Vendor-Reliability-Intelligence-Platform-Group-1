from sqlalchemy import Column, String, DateTime, func

from app.models.base import BaseModel


class Report(BaseModel):
    __tablename__ = "reports"

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    report_name = Column(
        String(255),
        nullable=False,
    )

    report_type = Column(
        String(100),
        nullable=False,
    )

    generated_by = Column(
        String(150),
        nullable=False,
    )

    file_format = Column(
        String(50),
        nullable=False,
    )

    status = Column(
        String(50),
        default="Generated",
    )