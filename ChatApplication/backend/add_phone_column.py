"""
Script để thêm cột phone vào database và cập nhật số điện thoại cho users
"""
from sqlalchemy import text
from app.database.connection import SessionLocal, engine
from app.database.models import User

def add_phone_column():
    db = SessionLocal()
    
    try:
        print("=== Thêm cột phone vào bảng users ===\n")
        
        # Thêm cột phone nếu chưa có
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS phone VARCHAR UNIQUE;
            """))
            conn.commit()
            print("✓ Đã thêm cột phone vào bảng users\n")
        
        # Cập nhật số điện thoại cho các user demo
        print("=== Cập nhật số điện thoại cho users ===\n")
        
        phone_updates = {
            "alice_nguyen": "0901234567",
            "bob_tran": "0902345678",
            "charlie_le": "0903456789",
            "david_pham": "0904567890",
            "eva_hoang": "0905678901",
            "frank_vo": "0906789012",
            "grace_do": "0907890123",
            "henry_bui": "0908901234"
        }
        
        for username, phone in phone_updates.items():
            user = db.query(User).filter(User.username == username).first()
            if user:
                user.phone = phone
                db.commit()
                print(f"✓ {user.display_name}: {phone}")
        
        print("\n=== HOÀN TẤT ===")
        print("✓ Đã thêm số điện thoại cho tất cả users!")
        print("\n📱 Bây giờ bạn có thể tìm kiếm user bằng số điện thoại!")
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_phone_column()
