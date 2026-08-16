"""
Run this ONCE to create the database and tables.
Usage:  python create_db.py
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "vendor_db"
USER = "postgres"
PASSWORD = "postsql"   # ← Your PostgreSQL password
HOST = "localhost"
PORT = 5432

# 1. Create DB if not exists
conn = psycopg2.connect(dbname="postgres", user=USER, password=PASSWORD, host=HOST, port=PORT)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
cur.execute(f"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}'")
if not cur.fetchone():
    cur.execute(f"CREATE DATABASE {DB_NAME}")
    print(f"Created database: {DB_NAME}")
else:
    print(f"Database '{DB_NAME}' already exists.")
cur.close()
conn.close()

# 2. Create tables via SQLAlchemy
from app.database import Base, engine
import app.models  # noqa: F401 — registers all models
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
print("\nDone. You can now run:  uvicorn app.main:app --reload")
