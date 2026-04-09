"""
Migration script: OLD schema → CURRENT schema

Run from the backend directory:
    python migrate_to_orgs.py

What it does (idempotent — safe to run multiple times):
1. Create 'organizations' table
2. Create 'roles' table
3. Seed organizations from OrgName enum with correct org_type
4. Migrate auth_roles → roles (mapping org_name → org_id)  [if auth_roles exists]
5. Add org_id column to events, populate from org_name, drop org_name/org_type
6. Drop auth_roles table
7. Create 'api_keys' table                   (added post-migration)
8. Create 'calendar_shares' table            (added post-migration)
"""

import sys
from sqlalchemy import text
from app.core.database import SessionLocal, engine

# ── OrgName → org_type mapping ──────────────────────────────────
ORG_TYPE_MAP = {
    # Boards
    "student affairs council": "board",
    "board for hostel management": "board",
    "board for student welfare": "board",
    "board for sports activities": "board",
    "board for recreational and creative activities": "board",
    "board for student publications": "board",
    "co-curricular and academic interaction council": "board",
    # CAIC Technical Clubs
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
    # Academic Societies
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
    # BRCA Cultural Clubs
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
    # Independent
    "indradhanu": "club",
    # Fests
    "rendezvous": "fest",
    "tryst": "fest",
    "becon": "fest",
    "literati": "fest",
    "sportech": "fest",
    # Sports
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
    # Departments
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


def run_migration():
    db = SessionLocal()
    try:
        # ── Helper: check if a table exists ──
        def table_exists(name):
            row = db.execute(text(
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema='public' AND table_name=:t"
            ), {"t": name}).fetchone()
            return row is not None

        def column_exists(table, column):
            row = db.execute(text(
                "SELECT 1 FROM information_schema.columns "
                "WHERE table_name=:t AND column_name=:c"
            ), {"t": table, "c": column}).fetchone()
            return row is not None

        # ── 1. Create organizations table ──
        print("[1/8] Creating organizations table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR UNIQUE NOT NULL,
                org_type VARCHAR NOT NULL,
                banner_url VARCHAR,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_organizations_name     ON organizations(name)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_organizations_org_type ON organizations(org_type)"))
        db.commit()

        # ── 2. Create roles table ──
        print("[2/8] Creating roles table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                role_name VARCHAR NOT NULL,
                UNIQUE(user_id, org_id, role_name)
            )
        """))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_roles_user_id ON roles(user_id)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_roles_org_id  ON roles(org_id)"))
        db.commit()

        # ── 3. Seed organizations ──
        print("[3/8] Seeding organizations from OrgName enum...")
        for org_name, org_type in ORG_TYPE_MAP.items():
            db.execute(text("""
                INSERT INTO organizations (name, org_type)
                VALUES (:name, :org_type)
                ON CONFLICT (name) DO NOTHING
            """), {"name": org_name, "org_type": org_type})

        # Pull banners from auth_roles (only if it still exists)
        if table_exists("auth_roles"):
            db.execute(text("""
                UPDATE organizations o
                SET banner_url = ar.org_banner
                FROM (
                    SELECT DISTINCT org_name::text, org_banner
                    FROM auth_roles
                    WHERE org_banner IS NOT NULL
                ) ar
                WHERE o.name = ar.org_name::text
            """))
        db.commit()

        # ── 4. Migrate auth_roles → roles (skip if auth_roles already dropped) ──
        if table_exists("auth_roles"):
            print("[4/8] Migrating auth_roles → roles...")
            db.execute(text("""
                INSERT INTO roles (user_id, org_id, role_name)
                SELECT ar.user_id, o.id, ar.role_name
                FROM auth_roles ar
                JOIN organizations o ON o.name = ar.org_name::text
                ON CONFLICT (user_id, org_id, role_name) DO NOTHING
            """))
            db.commit()
        else:
            print("[4/8] auth_roles already dropped — skipping")

        # ── 5. Migrate events.org_name → events.org_id ──
        print("[5/8] Migrating events table...")

        # ── 5. Migrate events.org_name → events.org_id ──
        print("[5/8] Migrating events table...")

        if not column_exists("events", "org_id"):
            db.execute(text("ALTER TABLE events ADD COLUMN org_id INTEGER"))
            db.commit()

        # Populate org_id from org_name (only if org_name still exists)
        if column_exists("events", "org_name"):
            db.execute(text("""
                UPDATE events e
                SET org_id = o.id
                FROM organizations o
                WHERE e.org_name::text = o.name
            """))
            db.commit()

            unmapped = db.execute(text(
                "SELECT COUNT(*) FROM events WHERE org_id IS NULL"
            )).scalar()
            if unmapped:
                print(f"  ⚠ {unmapped} event(s) have no matching org. Review manually.")
            else:
                print("  ✓ All events mapped successfully.")

            # Make org_id NOT NULL and add FK
            db.execute(text("ALTER TABLE events ALTER COLUMN org_id SET NOT NULL"))
            db.execute(text("""
                ALTER TABLE events
                ADD CONSTRAINT fk_events_org_id
                FOREIGN KEY (org_id) REFERENCES organizations(id)
            """))
            db.execute(text("CREATE INDEX IF NOT EXISTS ix_events_org_id ON events(org_id)"))
            db.commit()

            # Drop old columns
            db.execute(text("ALTER TABLE events DROP COLUMN IF EXISTS org_name"))
            db.execute(text("ALTER TABLE events DROP COLUMN IF EXISTS org_type"))
            db.commit()
        else:
            print("  ✓ events.org_id already exists — skipping")

        # ── 6. Drop auth_roles table ──
        print("[6/8] Dropping auth_roles table...")
        db.execute(text("DROP TABLE IF EXISTS auth_roles CASCADE"))
        db.commit()

        # ── 7. Create api_keys table ──
        print("[7/8] Creating api_keys table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS api_keys (
                id SERIAL PRIMARY KEY,
                org_id INTEGER NOT NULL REFERENCES organizations(id),
                key_hash VARCHAR UNIQUE NOT NULL,
                key_prefix VARCHAR(8) NOT NULL,
                label VARCHAR NOT NULL DEFAULT 'default',
                is_active BOOLEAN DEFAULT TRUE,
                allowed_ips JSON DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                last_used_at TIMESTAMPTZ
            )
        """))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_api_keys_org_id   ON api_keys(org_id)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_api_keys_key_hash ON api_keys(key_hash)"))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_api_keys_is_active ON api_keys(is_active)"))
        db.commit()

        # ── 8. Create calendar_shares table ──
        print("[8/8] Creating calendar_shares table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS calendar_shares (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                share_token VARCHAR UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_calendar_shares_share_token ON calendar_shares(share_token)"))
        db.commit()

        print("\n✅ Migration complete!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
