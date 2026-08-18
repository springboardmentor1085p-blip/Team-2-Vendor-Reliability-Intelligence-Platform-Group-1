"""create_vendor_performance_table

Revision ID: 84d09deddd3c
Revises: a248ce45d904
Create Date: 2026-07-29

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "84d09deddd3c"
down_revision: Union[str, Sequence[str], None] = "a248ce45d904"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "vendor_performance",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False
        ),

        sa.Column(
            "vendor_id",
            sa.Integer(),
            sa.ForeignKey("vendors.id"),
            nullable=False
        ),

        sa.Column(
            "on_time_deliveries",
            sa.Integer(),
            nullable=True
        ),

        sa.Column(
            "delayed_deliveries",
            sa.Integer(),
            nullable=True
        ),

        sa.Column(
            "quality_rating",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "response_time",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "issue_resolution_time",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "order_completion_rate",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "service_rating",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "performance_score",
            sa.Float(),
            nullable=True
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False
        ),
    )

    op.create_index(
        "ix_vendor_performance_id",
        "vendor_performance",
        ["id"],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_vendor_performance_id",
        table_name="vendor_performance"
    )

    op.drop_table("vendor_performance")