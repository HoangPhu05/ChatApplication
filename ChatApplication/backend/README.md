# ChatApp Backend API

Backend API cho ứng dụng ChatApp được xây dựng với FastAPI.

## Tính năng

- **Authentication**: Đăng ký, đăng nhập với JWT
- **Users**: Quản lý thông tin người dùng, tìm kiếm
- **Conversations**: Tạo và quản lý cuộc hội thoại (1-1 và nhóm)
- **Messages**: Gửi/nhận tin nhắn, WebSocket real-time
- **Cloud Storage**: Lưu trữ file cá nhân

## Cài đặt

1. Tạo virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cập nhật thông tin database trong `.env`

5. Chạy migrations (nếu dùng Alembic):
```bash
alembic upgrade head
```

## Chạy ứng dụng

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API documentation sẽ có tại: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `PUT /api/users/me` - Cập nhật thông tin
- `GET /api/users/{user_id}` - Lấy thông tin user
- `GET /api/users/` - Tìm kiếm users

### Conversations
- `POST /api/conversations/` - Tạo cuộc hội thoại mới
- `GET /api/conversations/` - Lấy danh sách hội thoại
- `GET /api/conversations/{id}` - Chi tiết hội thoại
- `DELETE /api/conversations/{id}` - Xóa hội thoại

### Messages
- `POST /api/messages/` - Gửi tin nhắn
- `GET /api/messages/conversation/{id}` - Lấy tin nhắn theo hội thoại
- `PUT /api/messages/{id}/read` - Đánh dấu đã đọc
- `WS /api/messages/ws/{user_id}` - WebSocket connection

### Cloud Storage
- `POST /api/cloud/` - Upload file
- `GET /api/cloud/` - Lấy danh sách files
- `GET /api/cloud/storage-info` - Thông tin dung lượng
- `DELETE /api/cloud/{file_id}` - Xóa file

## Database Schema

- **users**: Thông tin người dùng
- **conversations**: Cuộc hội thoại
- **conversation_participants**: Người tham gia hội thoại
- **messages**: Tin nhắn
- **cloud_files**: File lưu trữ

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- WebSockets
- Pydantic
