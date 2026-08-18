"""add_google_auth_columns

Revision ID: 4cc164124134
Revises: 84d09deddd3c
Create Date: 2026-08-01

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4cc164124134"
down_revision: Union[str, Sequence[str], None] = "84d09deddd3c"
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.add_column(
        "users",
        sa.Column(
            "provider",
            sa.String(length=20),
            nullable=False,
            server_default="local",
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "google_id",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "profile_picture",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.create_unique_constraint(
        "uq_users_google_id",
        "users",
        ["google_id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "uq_users_google_id",
        "users",
        type_="unique",
    )

    op.drop_column(
        "users",
        "profile_picture",
    )

    op.drop_column(
        "users",
        "google_id",
    )

    op.drop_column(
        "users",
        "provider",
    )