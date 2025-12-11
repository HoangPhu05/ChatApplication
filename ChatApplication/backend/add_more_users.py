#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.connection import SessionLocal
from app.database.models import User
from app.core.security import get_password_hash

db = SessionLocal()

# Danh sách user mới
new_users = [
    {
        "username": "bob_tran",
        "email": "bob.tran@example.com",
        "display_name": "Bob Trần",
        "phone": "0902345678",
        "password": "demo123"
    },
    {
        "username": "charlie_le",
        "email": "charlie.le@example.com",
        "display_name": "Charlie Lê",
        "phone": "0903456789",
        "password": "demo123"
    },
    {
        "username": "david_pham",
        "email": "david.pham@example.com",
        "display_name": "David Phạm",
        "phone": "0904567890",
        "password": "demo123"
    },
    {
        "username": "eva_hoang",
        "email": "eva.hoang@example.com",
        "display_name": "Eva Hoàng",
        "phone": "0905678901",
        "password": "demo123"
    },
    {
        "username": "frank_vo",
        "email": "frank.vo@example.com",
        "display_name": "Frank Võ",
        "phone": "0906789012",
        "password": "demo123"
    },
    {
        "username": "grace_do",
        "email": "grace.do@example.com",
        "display_name": "Grace Đỗ",
        "phone": "0907890123",
        "password": "demo123"
    },
    {
        "username": "henry_bui",
        "email": "henry.bui@example.com",
        "display_name": "Henry Bùi",
        "phone": "0908901234",
        "password": "demo123"
    }
]

print("Đang thêm users...")
for user_data in new_users:
    # Kiểm tra xem user đã tồn tại chưa
    existing = db.query(User).filter(
        (User.username == user_data["username"]) | 
        (User.email == user_data["email"]) | 
        (User.phone == user_data["phone"])
    ).first()
    
    if existing:
        print(f"⚠️  User {user_data['display_name']} đã tồn tại - bỏ qua")
        continue
    
    # Tạo user mới
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        display_name=user_data["display_name"],
        phone=user_data["phone"],
        password=get_password_hash(user_data["password"])
    )
    db.add(user)
    print(f"✅ Đã thêm: {user_data['display_name']} - {user_data['phone']}")

db.commit()

print("\n=== HOÀN TẤT ===")
print("Tất cả tài khoản đều có password: demo123")
print("\nDanh sách tài khoản:")
all_users = db.query(User).all()
for u in all_users:
    print(f"  • {u.display_name} ({u.username}) - {u.phone}")

db.close()
