from app.database.connection import SessionLocal, engine
from app.database.models import Base, User
from app.core.security import get_password_hash
import sys

print("Starting database reset...", file=sys.stderr)

# Drop all tables and recreate
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create only 2 users
users_data = [
    {
        "username": "alice_nguyen",
        "email": "alice@example.com",
        "display_name": "Alice Nguyễn",
        "phone": "0901234567",
        "password": "demo123"
    },
    {
        "username": "binh",
        "email": "binh@example.com",
        "display_name": "Bình",
        "phone": "0909876543",
        "password": "demo123"
    }
]

print("Creating users...", file=sys.stderr)
for user_data in users_data:
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        display_name=user_data["display_name"],
        phone=user_data["phone"],
        password=get_password_hash(user_data["password"])
    )
    db.add(user)
    print(f"Created user: {user_data['display_name']} ({user_data['username']})", file=sys.stderr)

db.commit()

print("\nDatabase reset complete!", file=sys.stderr)
print("\nYou can now login with:", file=sys.stderr)
print("- Username: alice_nguyen, Password: demo123", file=sys.stderr)
print("- Username: binh, Password: demo123", file=sys.stderr)

db.close()
