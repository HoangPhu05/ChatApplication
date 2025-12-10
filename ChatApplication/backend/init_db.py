"""
Script để khởi tạo database và tạo tables
"""
from app.database.connection import init_db, engine
from app.database.models import Base

def main():
    print("=== Khởi tạo Database ===")
    print(f"Kết nối tới: {engine.url}")
    
    # Tạo tất cả tables
    Base.metadata.create_all(bind=engine)
    
    print("✓ Database đã được khởi tạo thành công!")
    print("✓ Tất cả tables đã được tạo!")

if __name__ == "__main__":
    main()
