# ChatApplication


# 💬 ChatApp - Real-time Chat Application

Ứng dụng chat real-time với FastAPI (Python) và Vanilla JavaScript, hỗ trợ nhắn tin văn bản, file, hình ảnh cho cả chat 1-1 và nhóm.

---

## ✨ Tính năng chính

### 🔐 Xác thực & Quản lý người dùng
- Đăng ký và đăng nhập với JWT authentication (expires 7 ngày)
- Cập nhật profile: avatar, display name, bio, số điện thoại
- Tìm kiếm người dùng theo username/email/phone
- Hiển thị trạng thái online/offline và lần cuối online

### 💬 Nhắn tin
- **Real-time messaging** với WebSocket
- Chat **1-1** và **nhóm** (group chat)
- Gửi: văn bản, hình ảnh, file đính kèm
- **Reply tin nhắn** (trích dẫn)
- Đánh dấu đã đọc
- Hiển thị timestamp

### 🗂️ Quản lý Conversations
- Tạo chat 1-1 hoặc group chat
- Danh sách conversations với tin nhắn preview
- Xem lịch sử tin nhắn
- Xóa conversation

### ☁️ Cloud Storage
- Upload file cá nhân lên server
- Quản lý danh sách files đã upload
- Xem dung lượng đã sử dụng
- Xóa file

### 🎨 Giao diện
- Responsive design (mobile-friendly)
- Dark/Light mode
- Material Icons
- Toast notifications
- Empty states

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI 0.104.1, Python 3.10+ |
| **Server** | Uvicorn (ASGI) |
| **Database** | PostgreSQL 14+ |
| **ORM** | SQLAlchemy 2.0 |
| **Authentication** | JWT (PyJWT), Passlib + bcrypt |
| **Real-time** | WebSocket |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Storage** | Local file system (`uploads/`) |

**📖 Chi tiết kiến trúc**: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)

---

## 📋 Database Schema

**5 bảng chính:**

1. **users** - Thông tin người dùng (email, username, password, avatar, bio, is_online, last_seen)
2. **conversations** - Cuộc hội thoại (name, is_group, avatar)
3. **conversation_participants** - Người tham gia (many-to-many)
4. **messages** - Tin nhắn (content, message_type, file_url, is_read, reply_to_id)
5. **cloud_files** - File metadata (file_name, file_url, file_type, file_size)

**📊 ERD Diagram**: Xem [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md#2-database-schema)

---

## 📚 API Endpoints

### 🔐 Authentication (`/api/auth`)
---

## 🚀 Cài đặt & Chạy ứng dụng

### Yêu cầu
- Python 3.10+
- PostgreSQL 14+
- pip

### Bước 1: Setup Databaseuser hiện tại |
| PUT | `/me` | Cập nhật profile |
| GET | `/{user_id}` | Thông tin user theo ID |
| GET | `/?search={keyword}` | Tìm kiếm users |

### 💬 Conversations (`/api/conversations`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/` | Tạo conversation (1-1 hoặc group) |
| GET | `/` | Danh sách conversations |
| GET | `/{id}` | Chi tiết conversation |
| DELETE | `/{id}` | Xóa conversation |

### 📨 Messages (`/api/messages`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/` | Gửi tin nhắn |
| GET | `/conversation/{id}` | Lấy tin nhắn theo conversation |
| PUT | `/{id}/read` | Đánh dấu đã đọc |
| WebSocket | `/ws/{user_id}` | Real-time connection |

### ☁️ Cloud Storage (`/api/cloud`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/` | Upload file |
| GET | `/` | Danh sách files |
| GET | `/storage-info` | Thông tin dung lượng |
| DELETE | `/{file_id}` | Xóa file |

**📖 Swagger UI**: `http://localhost:8000/docs`

## 📋 Prerequisites

Trước khi cài đặt, đảm bảo bạn đã cài:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **pip** (Python package manager)
- **Git** (optional)

## 🚀 Installation & Setup

```bash
sudo -u postgres psql
CREATE DATABASE chatapp;
CREATE USER chatapp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatapp_user;
\q
```

### Bước 2: Setup Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Bước 3: Tạo file `.env`

```bash
# backend/.env
DATABASE_URL=postgresql://chatapp_user:your_password@localhost:5432/chatapp
SECRET_KEY=your-super-secret-key-min-32-chars
DEBUG=True
```

### Bước 4: Tạo bảng dd
```

## 🏃 Running the Application

### Method 1: Development Mode

#### Terminal 1 - Backend:

```bash
cd backend
source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: **http://localhost:8000**

#### Terminal 2 - Frontend:

**Option A**: Python HTTP Server
```bash
cd frontend
cd backend
python -c "from app.database.connection import engine, Base; from app.database import models; Base.metadata.create_all(bind=engine); print('✅ Done!')"
```

### Bước 5: Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
→ Backend: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
python -m http.server 3000
```
→ Frontend: `http://localhost:3000`

---

## 🧪 Test ứng dụng

1. Mở `http://localhost:3000/register.html` → Tạo 2 tài khoản
2. Login với account 1 trên browser thường
3. Login với account 2 trên incognito mode
4. Tìm kiếm user → Tạo conversation → Chat real-time!

**API Docs**: `http://localhost:8000/docs`

---     │
│       └── schemas/                  # Pydantic schemas
│           ├── __init__.py
│           ├── user.py
│           ├── conversation.py
│           ├── message.py
│           └── cloud.py
│
└── frontend/                          # Frontend
    ├── index.html                    # Login page
    ├── register.html                 # Registration page
    ├── forgotpassword.html           # Forgot password
    ├── clear-storage.html            # Clear localStorage utility
    │
    └── assets/
        ├── chat.html                 # Main chat interface
        ├── settings.html             # User settings
        │
        ├── css/
        │   ├── style.css            # Auth pages styles
        │   ├── chat.css             # Chat interface styles
        │   ├── chat-messages.css    # Message bubbles
        │   └── settings.css         # Settings page styles
        │
        ├── js/
        │   ├── script.js            # Auth logic & utilities
        │   ├── chat.js              # Chat functionality
        │   └── settings.js          # Settings functionality
        │
        └── images/                   # Image assets
```

## 🗄️ Database Schema

### Tables

#### `users`
Lưu trữ thông tin người dùng
```sql
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- phone (UNIQUE)
- display_name
- password (hashed)
- avatar
- bio
- is_online
- last_seen
- created_at, updated_at
```

#### `conversations`
Cuộc hội thoại (1-1 hoặc nhóm)
```sql
- id (PK)
- name (nullable - for groups)
- is_group
- avatar
- created_at, updated_at
```

#### `conversation_participants`
Many-to-many relationship
```sql
- user_id (FK → users.id)
- conversation_id (FK → conversations.id)
- joined_at
```Cấu trúc Project

```
ChatApplication/
├── backend/
│   ├── main.py                  # Entry point
│   ├── requirements.txt
│   ├── .env                     # Config (tạo thủ công)
│   └── app/
│       ├── core/               # Security, config, dependencies
│       ├── database/           # Models, connection
│       ├── routers/            # API endpoints (auth, users, messages, conversations, cloud)
│       └── schemas/            # Pydantic validation schemas
│
└── frontend/
    ├── index.html              # Login page
    ├── register.html           # Register page
    └── assets/
        ├── chat.html           # Main chat interface
        ├── settings.html       # User settings
        ├── css/                # Styles
        └── js/                 # JavaScript (script.js, chat.js, settings.js)
```

---

## 📖 Documentation

- **Kiến trúc hệ thống**: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
- **Use Case Diagram**: [USE_CASE_DIAGRAM.md](USE_CASE_DIAGRAM.md)
- **Setup PostgreSQL**: [SETUP_POSTGRESQL.md](SETUP_POSTGRESQL.md)

---

## 🔧 Troubleshooting

**Backend không chạy?**
```bash
python --version  # Check >= 3.10
which python      # Check venv active
```

**Database error?**
```bash
sudo systemctl start postgresql
cat backend/.env  # Check DATABASE_URL
```

**WebSocket không kết nối?**
- Check backend đang chạy
- Xem Console trong Browser DevTools
- Đảm bảo đã login

---


