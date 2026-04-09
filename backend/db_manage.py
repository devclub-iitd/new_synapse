#!/usr/bin/env python3
"""
Synapse Database Management
============================

Dump the dev (Neon/VM) database and restore into a local PostgreSQL,
or set up a fresh local database from SQLAlchemy models.

Usage
-----
  # 1. Dump the dev database to a SQL file
  python db_manage.py dump

  # 2. Restore that dump into a LOCAL database
  python db_manage.py restore --target "postgresql://user:pass@localhost:5432/synapse"

  # 3. One-shot: dump dev + restore local
  python db_manage.py sync --target "postgresql://user:pass@localhost:5432/synapse"

  # 4. Fresh setup (create tables + seed orgs, no data copy)
  python db_manage.py setup --target "postgresql://user:pass@localhost:5432/synapse"

Notes
-----
- By default, `dump` reads DATABASE_URL from .env (your Neon/dev DB).
- `restore` and `setup` require --target so you don't accidentally
  overwrite the dev database.
- Requires `pg_dump` and `psql` CLI tools installed locally.
"""

import argparse
import os
import subprocess
import sys
from urllib.parse import urlparse, parse_qs

# ---------------------------------------------------------------------------
# .env loader (minimal, no extra dependency)
# ---------------------------------------------------------------------------
def load_dotenv(path=".env"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            val = val.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), val)

load_dotenv()

# ---------------------------------------------------------------------------
# URL → pg env-vars
# ---------------------------------------------------------------------------
def parse_pg_url(url):
    """Return a dict of PG* environment variables from a postgres:// URL."""
    p = urlparse(url)
    env = {
        "PGHOST": p.hostname or "localhost",
        "PGPORT": str(p.port or 5432),
        "PGUSER": p.username or "postgres",
        "PGDATABASE": p.path.lstrip("/") or "postgres",
    }
    if p.password:
        env["PGPASSWORD"] = p.password
    qs = parse_qs(p.query)
    if "sslmode" in qs:
        env["PGSSLMODE"] = qs["sslmode"][0]
    return env


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
DUMP_FILE = "synapse_dump.sql"


def cmd_dump(args):
    """pg_dump the source (dev/Neon) database to a SQL file."""
    source_url = args.source or os.environ.get("DATABASE_URL")
    if not source_url:
        sys.exit("ERROR: No source URL. Set DATABASE_URL in .env or pass --source.")

    outfile = args.file or DUMP_FILE
    pg_env = {**os.environ, **parse_pg_url(source_url)}

    print(f"Dumping  → {outfile}")
    print(f"  host   : {pg_env['PGHOST']}")
    print(f"  db     : {pg_env['PGDATABASE']}")

    cmd = [
        "pg_dump",
        "--no-owner",          # don't emit ALTER OWNER (roles differ)
        "--no-privileges",     # skip GRANT/REVOKE
        "--clean",             # emit DROP before CREATE
        "--if-exists",         # don't error if objects missing
        "--format=plain",      # readable .sql
        f"--file={outfile}",
    ]

    result = subprocess.run(cmd, env=pg_env)
    if result.returncode != 0:
        sys.exit(f"pg_dump failed (exit {result.returncode})")
    print(f"✅ Dump saved to {outfile}")


def cmd_restore(args):
    """Restore a SQL dump into the target database."""
    target_url = args.target
    if not target_url:
        sys.exit("ERROR: --target is required (e.g. postgresql://user:pass@localhost:5432/synapse)")

    infile = args.file or DUMP_FILE
    if not os.path.exists(infile):
        sys.exit(f"ERROR: Dump file '{infile}' not found. Run `python db_manage.py dump` first.")

    pg_env = {**os.environ, **parse_pg_url(target_url)}

    print(f"Restoring {infile}")
    print(f"  target : {pg_env['PGHOST']}:{pg_env['PGPORT']}/{pg_env['PGDATABASE']}")

    # Use psql to apply the plain-SQL dump
    cmd = [
        "psql",
        "--single-transaction",
        "--set", "ON_ERROR_STOP=on",
        "-f", infile,
    ]

    result = subprocess.run(cmd, env=pg_env)
    if result.returncode != 0:
        sys.exit(f"psql restore failed (exit {result.returncode})")
    print("✅ Restore complete")


def cmd_sync(args):
    """Dump dev + restore into target in one shot."""
    cmd_dump(args)
    cmd_restore(args)


def cmd_setup(args):
    """
    Create all tables from SQLAlchemy models on a FRESH database
    and seed the organizations table.  No data is copied.
    """
    target_url = args.target
    if not target_url:
        sys.exit("ERROR: --target is required")

    # Temporarily override DATABASE_URL so SQLAlchemy connects to the target
    os.environ["DATABASE_URL"] = target_url

    # Re-import after patching the env so the engine picks up the new URL
    from importlib import reload
    import app.core.config as cfg_mod
    reload(cfg_mod)
    import app.core.database as db_mod
    reload(db_mod)

    from app.core.database import Base, engine, SessionLocal
    # Import all models so Base.metadata knows every table
    import app.models  # noqa: F401

    print("Creating all tables from models...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")

    # Seed organizations
    from sqlalchemy import text
    db = SessionLocal()
    try:
        ORG_TYPE_MAP = {
            "student affairs council": "board",
            "board for hostel management": "board",
            "board for student welfare": "board",
            "board for sports activities": "board",
            "board for recreational and creative activities": "board",
            "board for student publications": "board",
            "co-curricular and academic interaction council": "board",
            "devclub": "club",
            "robotics club": "club",
            "aeromodelling club": "club",
            "business and consulting club": "club",
            "economics club": "club",
            "physics and astronomy club": "club",
            "algorithms and computing club": "club",
            "aries": "club",
            "igem": "club",
            "hyperloop club": "club",
            "indian game theory society": "club",
            "blockchain society": "society",
            "axlr8r formula racing": "club",
            "mathsoc": "society",
            "aces acm": "society",
            "beta": "society",
            "mses": "society",
            "cef": "society",
            "mes": "society",
            "ches": "society",
            "energy society": "society",
            "physoc": "society",
            "ees": "society",
            "tes": "society",
            "chemocronies": "society",
            "music club": "club",
            "dance club": "club",
            "dramatics club": "club",
            "literary club": "club",
            "debating club": "club",
            "photography and films club": "club",
            "fine arts and crafts club": "club",
            "design club": "club",
            "quizzing club": "club",
            "hindi samiti": "club",
            "spic macay": "club",
            "envogue": "club",
            "indradhanu": "club",
            "rendezvous": "fest",
            "tryst": "fest",
            "becon": "fest",
            "literati": "fest",
            "sportech": "fest",
            "aquatics": "sport",
            "athletics": "sport",
            "badminton": "sport",
            "basketball": "sport",
            "chess": "sport",
            "cricket": "sport",
            "football": "sport",
            "hockey": "sport",
            "lawn tennis": "sport",
            "squash": "sport",
            "table tennis": "sport",
            "volleyball": "sport",
            "weightlifting": "sport",
            "applied mechanics": "department",
            "biochemical engineering and biotechnology": "department",
            "chemical engineering": "department",
            "chemistry": "department",
            "civil engineering": "department",
            "computer science and engineering": "department",
            "design": "department",
            "electrical engineering": "department",
            "energy science and engineering": "department",
            "humanities and social sciences": "department",
            "management studies": "department",
            "materials science and engineering": "department",
            "mathematics": "department",
            "mechanical engineering": "department",
            "physics": "department",
            "textile and fibre engineering": "department",
        }
        print("Seeding organizations...")
        for org_name, org_type in ORG_TYPE_MAP.items():
            db.execute(text(
                "INSERT INTO organizations (name, org_type) "
                "VALUES (:name, :type) ON CONFLICT (name) DO NOTHING"
            ), {"name": org_name, "type": org_type})
        db.commit()
        count = db.execute(text("SELECT COUNT(*) FROM organizations")).scalar()
        print(f"✅ {count} organizations seeded")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Synapse DB management — dump / restore / sync / setup"
    )
    sub = parser.add_subparsers(dest="command")

    # dump
    p_dump = sub.add_parser("dump", help="Dump dev DB to a SQL file")
    p_dump.add_argument("--source", help="Source DB URL (default: DATABASE_URL from .env)")
    p_dump.add_argument("--file", help=f"Output file (default: {DUMP_FILE})")

    # restore
    p_restore = sub.add_parser("restore", help="Restore SQL dump into target DB")
    p_restore.add_argument("--target", required=True, help="Target DB URL")
    p_restore.add_argument("--file", help=f"Dump file to load (default: {DUMP_FILE})")

    # sync (dump + restore)
    p_sync = sub.add_parser("sync", help="Dump dev DB + restore into target (one shot)")
    p_sync.add_argument("--source", help="Source DB URL (default: DATABASE_URL from .env)")
    p_sync.add_argument("--target", required=True, help="Target DB URL")
    p_sync.add_argument("--file", help=f"Intermediate file (default: {DUMP_FILE})")

    # setup (fresh)
    p_setup = sub.add_parser("setup", help="Create tables from models + seed orgs (no data)")
    p_setup.add_argument("--target", required=True, help="Target DB URL")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    {"dump": cmd_dump, "restore": cmd_restore, "sync": cmd_sync, "setup": cmd_setup}[args.command](args)


if __name__ == "__main__":
    main()
