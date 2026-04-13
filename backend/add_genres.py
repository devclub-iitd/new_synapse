"""
Migration script: Add 'genres' column to organizations and events tables.
Run: python add_genres.py
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

from sqlalchemy import create_engine, text

engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    # 1. Add genres (comma-separated text) to organizations
    """
    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS genres TEXT DEFAULT NULL;
    """,
    # 2. Add genres (JSON array) to events
    """
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS genres JSONB DEFAULT '[]'::jsonb;
    """,
]

def run():
    with engine.begin() as conn:
        for i, sql in enumerate(MIGRATIONS, 1):
            print(f"Running migration {i}...")
            conn.execute(text(sql))
            print(f"  ✓ Migration {i} applied.")
    print("\nAll migrations applied successfully.")

if __name__ == "__main__":
    run()
