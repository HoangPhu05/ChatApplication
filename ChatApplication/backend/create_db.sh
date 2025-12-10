#!/bin/bash

echo "=== TẠO DATABASE VÀ USER POSTGRESQL ==="
echo ""
echo "Đang tạo user và database..."
echo ""

sudo -u postgres psql << 'EOF'
-- Drop nếu đã tồn tại (để chạy lại script)
DROP DATABASE IF EXISTS chatapp_db;
DROP USER IF EXISTS chatapp_user;

-- Tạo user mới
CREATE USER chatapp_user WITH PASSWORD 'matkhau123';

-- Tạo database mới
CREATE DATABASE chatapp_db;

-- Đổi owner của database
ALTER DATABASE chatapp_db OWNER TO chatapp_user;

-- Kết nối vào database
\c chatapp_db

-- Grant quyền trên schema
GRANT ALL ON SCHEMA public TO chatapp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chatapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chatapp_user;

-- Hiển thị thông tin
\l chatapp_db
\du chatapp_user

EOF

echo ""
echo "=== ✓ HOÀN TẤT! ==="
echo ""
echo "Database: chatapp_db"
echo "User: chatapp_user"
echo "Password: matkhau123"
echo ""
echo "Bây giờ chạy: python init_db.py"
