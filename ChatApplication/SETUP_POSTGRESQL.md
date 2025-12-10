## 🚀 HƯỚNG DẪN KẾT NỐI POSTGRESQL VÀO WEB

### ✅ Đã hoàn thành:
- ✓ Cài đặt PostgreSQL
- ✓ Cài đặt Python dependencies
- ✓ Tạo file cấu hình `.env`

### 📋 CÁC BƯỚC TIẾP THEO:

#### **Bước 1: Tạo Database và User trong PostgreSQL**

Mở terminal và chạy:

```bash
sudo -u postgres psql
```

Sau đó trong PostgreSQL shell, chạy các lệnh sau:

```sql
-- Tạo user
CREATE USER chatapp_user WITH PASSWORD 'matkhau123';

-- Tạo database
CREATE DATABASE chatapp_db;

-- Grant quyền
GRANT ALL PRIVILEGES ON DATABASE chatapp_db TO chatapp_user;

-- Kết nối vào database
\c chatapp_db

-- Grant quyền trên schema
GRANT ALL ON SCHEMA public TO chatapp_user;

-- Kiểm tra databases
\l

-- Thoát
\q
```

#### **Bước 2: Cập nhật file `.env`**

Mở file `backend/.env` và đảm bảo có nội dung sau (thay password nếu cần):

```env
DATABASE_URL=postgresql://chatapp_user:matkhau123@localhost:5432/chatapp_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,http://127.0.0.1:5500
DEBUG=True
APP_NAME=ChatApp
```

#### **Bước 3: Khởi tạo database tables**

```bash
cd backend
source venv/bin/activate
python init_db.py
```

#### **Bước 4: Chạy server**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server sẽ chạy tại: http://localhost:8000

#### **Bước 5: Kết nối từ Frontend**

Trong file JavaScript frontend (ví dụ `assets/js/script.js`), sử dụng:

```javascript
const API_URL = 'http://localhost:8000/api';

// Ví dụ: Đăng ký user
async function register(username, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    });
    return await response.json();
}

// Ví dụ: Đăng nhập
async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    return await response.json();
}
```

### 🔍 Kiểm tra kết nối:

```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kết nối vào database
psql -U chatapp_user -d chatapp_db -h localhost

# Xem các tables
\dt
```

### 📝 Các lệnh hữu ích:

```bash
# Khởi động PostgreSQL
sudo systemctl start postgresql

# Dừng PostgreSQL
sudo systemctl stop postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Xem logs
sudo journalctl -u postgresql
```

### 🔐 Bảo mật quan trọng:

1. **Đổi password mặc định** trong `.env`
2. **Đổi SECRET_KEY** thành chuỗi ngẫu nhiên dài
3. **Không commit file `.env`** lên git (đã có trong .gitignore)
4. Trong production, sử dụng HTTPS và password mạnh hơn

### 📚 API Documentation:

Sau khi chạy server, truy cập:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

**Lưu ý:** Nhớ thay đổi các giá trị password và secret key trước khi deploy lên production!
