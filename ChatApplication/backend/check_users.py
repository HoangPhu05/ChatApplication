#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.connection import SessionLocal
from app.database.models import User

db = SessionLocal()

users = db.query(User).all()
print(f"Total users: {len(users)}")
for u in users:
    print(f"\n{u.id}: {u.username}")
    print(f"   Name: {u.display_name}")
    print(f"   Phone: {u.phone}")
    print(f"   Email: {u.email}")

alice = db.query(User).filter(User.phone == "0901234567").first()
print(f"\nSearch by phone '0901234567': {alice.display_name if alice else 'NOT FOUND'}")

db.close()
