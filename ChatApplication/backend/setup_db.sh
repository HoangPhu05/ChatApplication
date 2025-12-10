#!/bin/bash

# Script để setup PostgreSQL database cho ChatApp

echo "=== Setup PostgreSQL Database ==="

# Chạy các lệnh SQL để tạo user và database
sudo -u postgres psql << EOF
-- Tạo user mới
CREATE USER chatapp_user WITH PASSWORD 'your_password_here';

-- Tạo database mới
CREATE DATABASE chatapp_db;

-- Grant quyền cho user
GRANT ALL PRIVILEGES ON DATABASE chatapp_db TO chatapp_user;

-- Kết nối vào database
\c chatapp_db

-- Grant quyền trên schema
GRANT ALL ON SCHEMA public TO chatapp_user;

-- Hiển thị danh sách database
\l

-- Thoát
\q
EOF

echo ""
echo "=== Setup hoàn tất! ==="
echo "Database: chatapp_db"
echo "User: chatapp_user"
echo "Password: your_password_here"
echo ""
echo "Nhớ thay đổi password trong file .env và script này!"
