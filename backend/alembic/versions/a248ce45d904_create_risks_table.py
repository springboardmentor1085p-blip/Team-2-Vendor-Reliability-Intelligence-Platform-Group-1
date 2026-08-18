"""create_risks_table

Revision ID: a248ce45d904
Revises: 27002b82eb84
Create Date: 2026-07-27 11:00:23.085493

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a248ce45d904'
down_revision: Union[str, Sequence[str], None] = '27002b82eb84'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
