#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.connection import SessionLocal, engine
from app.database.models import Base, User
from app.core.security import get_password_hash

def main():
    # Drop all tables and recreate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create Alice
    alice = User(
        username="alice_nguyen",
        email="alice@example.com",
        display_name="Alice Nguyễn",
        phone="0901234567",
        password=get_password_hash("demo123")
    )
    db.add(alice)
    
    # Create Binh
    binh = User(
        username="binh",
        email="binh@example.com",
        display_name="Bình",
        phone="0909876543",
        password=get_password_hash("demo123")
    )
    db.add(binh)
    
    db.commit()
    db.close()
    
    print("SUCCESS: Database reset complete!")
    print("Created 2 users: Alice Nguyễn and Bình")
    print("Password for both: demo123")

if __name__ == "__main__":
    main()
