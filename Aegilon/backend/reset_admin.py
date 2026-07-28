"""
AEGILON — Admin password reset / user creation utility.

Resets the password of an existing user, or creates a new one if the email
does not exist yet. The password is NEVER hardcoded here: it is read from the
ADMIN_PASSWORD environment variable that YOU supply at runtime, so the secret
only ever lives in your shell session.

Usage (run inside the already-running backend container, which has DATABASE_URL):

  docker exec \
    -e ADMIN_EMAIL=admin@aegilon.com \
    -e ADMIN_PASSWORD='YOUR_NEW_PASSWORD' \
    -e ADMIN_NAME='Admin' \
    aegilon-backend python /app/reset_admin.py

Environment variables:
  ADMIN_EMAIL     (required) email to reset or create
  ADMIN_PASSWORD  (required) the new plaintext password (bcrypt-hashed before save)
  ADMIN_NAME      (optional) display name, only used when creating a new user
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

from sqlalchemy import select

from app.database.database import AsyncSessionLocal, database_url
from app.core.security import get_password_hash
from app.models.user import User


async def main() -> int:
    email = os.getenv("ADMIN_EMAIL", "").strip()
    password = os.getenv("ADMIN_PASSWORD", "")
    name = os.getenv("ADMIN_NAME", "Admin").strip() or "Admin"

    if not email or not password:
        print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.")
        print("Nothing was changed.")
        return 2

    if len(password) < 6:
        print("ERROR: ADMIN_PASSWORD must be at least 6 characters. Nothing was changed.")
        return 2

    target = database_url.split("@")[-1] if "@" in database_url else database_url
    print(f"Connecting to database: {target}")

    async with AsyncSessionLocal() as db:
        existing = (
            await db.execute(select(User).where(User.email == email))
        ).scalar_one_or_none()

        if existing:
            existing.password_hash = get_password_hash(password)
            existing.is_active = True
            existing.updated_at = datetime.now(timezone.utc)
            await db.commit()
            print(f"OK: Password reset for existing user '{email}'.")
        else:
            user = User(
                name=name,
                email=email,
                password_hash=get_password_hash(password),
                is_active=True,
            )
            db.add(user)
            await db.commit()
            print(f"OK: Created new admin user '{email}' (name='{name}').")

    print("Done. You can now log in with the new credentials.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
