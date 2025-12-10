"""
Script tạo người dùng ảo và tin nhắn demo
"""
from app.database.connection import SessionLocal
from app.database.models import User, Conversation, Message
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

def create_demo_users():
    db = SessionLocal()
    
    try:
        # Danh sách người dùng ảo
        demo_users = [
            {
                "username": "alice_nguyen",
                "email": "alice@example.com",
                "display_name": "Alice Nguyễn",
                "password": "demo123",
                "bio": "Developer & Designer",
                "avatar": "https://i.pravatar.cc/150?img=1"
            },
            {
                "username": "bob_tran",
                "email": "bob@example.com",
                "display_name": "Bob Trần",
                "password": "demo123",
                "bio": "Full Stack Developer",
                "avatar": "https://i.pravatar.cc/150?img=2"
            },
            {
                "username": "charlie_le",
                "email": "charlie@example.com",
                "display_name": "Charlie Lê",
                "password": "demo123",
                "bio": "UI/UX Designer",
                "avatar": "https://i.pravatar.cc/150?img=3"
            },
            {
                "username": "david_pham",
                "email": "david@example.com",
                "display_name": "David Phạm",
                "password": "demo123",
                "bio": "Backend Engineer",
                "avatar": "https://i.pravatar.cc/150?img=4"
            },
            {
                "username": "eva_hoang",
                "email": "eva@example.com",
                "display_name": "Eva Hoàng",
                "password": "demo123",
                "bio": "Product Manager",
                "avatar": "https://i.pravatar.cc/150?img=5"
            },
            {
                "username": "frank_vo",
                "email": "frank@example.com",
                "display_name": "Frank Võ",
                "password": "demo123",
                "bio": "DevOps Engineer",
                "avatar": "https://i.pravatar.cc/150?img=6"
            },
            {
                "username": "grace_do",
                "email": "grace@example.com",
                "display_name": "Grace Đỗ",
                "password": "demo123",
                "bio": "Marketing Specialist",
                "avatar": "https://i.pravatar.cc/150?img=7"
            },
            {
                "username": "henry_bui",
                "email": "henry@example.com",
                "display_name": "Henry Bùi",
                "password": "demo123",
                "bio": "Data Scientist",
                "avatar": "https://i.pravatar.cc/150?img=8"
            }
        ]
        
        created_users = []
        
        print("=== Đang tạo người dùng ảo ===\n")
        
        for user_data in demo_users:
            # Kiểm tra xem user đã tồn tại chưa
            existing_user = db.query(User).filter(
                (User.username == user_data["username"]) | 
                (User.email == user_data["email"])
            ).first()
            
            if existing_user:
                print(f"⚠️  User {user_data['username']} đã tồn tại, bỏ qua...")
                created_users.append(existing_user)
                continue
            
            # Tạo user mới
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                display_name=user_data["display_name"],
                password=get_password_hash(user_data["password"]),
                bio=user_data["bio"],
                avatar=user_data["avatar"],
                is_online=random.choice([True, False])
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            created_users.append(new_user)
            
            print(f"✓ Tạo user: {user_data['display_name']} (@{user_data['username']})")
        
        print(f"\n✓ Đã tạo {len(created_users)} người dùng\n")
        
        # Tạo conversations và messages demo
        print("=== Đang tạo cuộc hội thoại và tin nhắn demo ===\n")
        
        # Tạo một số cuộc hội thoại 1-1
        conversations_created = 0
        messages_created = 0
        
        # Conversation 1: Alice và Bob
        if len(created_users) >= 2:
            conv1 = Conversation(is_group=False)
            db.add(conv1)
            db.commit()
            db.refresh(conv1)
            
            conv1.participants.append(created_users[0])
            conv1.participants.append(created_users[1])
            db.commit()
            
            # Thêm tin nhắn
            messages = [
                {"sender": created_users[0], "content": "Chào Bob! Bạn có rảnh không?", "time_offset": 10},
                {"sender": created_users[1], "content": "Hi Alice! Có chứ, sao vậy?", "time_offset": 9},
                {"sender": created_users[0], "content": "Mình muốn hỏi về project mới đó", "time_offset": 8},
                {"sender": created_users[1], "content": "OK, cứ hỏi đi", "time_offset": 7},
                {"sender": created_users[0], "content": "Backend API đã hoàn thành chưa?", "time_offset": 6},
                {"sender": created_users[1], "content": "Rồi, mình đã deploy lên server test", "time_offset": 5},
            ]
            
            for msg_data in messages:
                msg = Message(
                    conversation_id=conv1.id,
                    sender_id=msg_data["sender"].id,
                    content=msg_data["content"],
                    message_type="text",
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(minutes=msg_data["time_offset"])
                )
                db.add(msg)
                messages_created += 1
            
            db.commit()
            conversations_created += 1
            print(f"✓ Tạo cuộc hội thoại: {created_users[0].display_name} ↔ {created_users[1].display_name}")
        
        # Conversation 2: Charlie và David
        if len(created_users) >= 4:
            conv2 = Conversation(is_group=False)
            db.add(conv2)
            db.commit()
            db.refresh(conv2)
            
            conv2.participants.append(created_users[2])
            conv2.participants.append(created_users[3])
            db.commit()
            
            messages = [
                {"sender": created_users[2], "content": "David, bạn check email chưa?", "time_offset": 15},
                {"sender": created_users[3], "content": "Rồi, mình vừa đọc xong", "time_offset": 14},
                {"sender": created_users[2], "content": "Design mới như thế nào?", "time_offset": 13},
                {"sender": created_users[3], "content": "Rất đẹp! Mình thích lắm 👍", "time_offset": 12},
            ]
            
            for msg_data in messages:
                msg = Message(
                    conversation_id=conv2.id,
                    sender_id=msg_data["sender"].id,
                    content=msg_data["content"],
                    message_type="text",
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(minutes=msg_data["time_offset"])
                )
                db.add(msg)
                messages_created += 1
            
            db.commit()
            conversations_created += 1
            print(f"✓ Tạo cuộc hội thoại: {created_users[2].display_name} ↔ {created_users[3].display_name}")
        
        # Conversation 3: Group chat
        if len(created_users) >= 5:
            conv3 = Conversation(
                is_group=True,
                name="Team Dev",
                avatar="https://i.pravatar.cc/150?img=20"
            )
            db.add(conv3)
            db.commit()
            db.refresh(conv3)
            
            # Thêm 5 người đầu tiên vào group
            for user in created_users[:5]:
                conv3.participants.append(user)
            db.commit()
            
            messages = [
                {"sender": created_users[0], "content": "Chào cả team!", "time_offset": 20},
                {"sender": created_users[1], "content": "Hi mọi người 👋", "time_offset": 19},
                {"sender": created_users[2], "content": "Hôm nay meeting lúc mấy giờ nhỉ?", "time_offset": 18},
                {"sender": created_users[3], "content": "3 giờ chiều nhé", "time_offset": 17},
                {"sender": created_users[4], "content": "OK, mình note lại", "time_offset": 16},
                {"sender": created_users[0], "content": "Nhớ chuẩn bị slide đấy!", "time_offset": 15},
            ]
            
            for msg_data in messages:
                msg = Message(
                    conversation_id=conv3.id,
                    sender_id=msg_data["sender"].id,
                    content=msg_data["content"],
                    message_type="text",
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(minutes=msg_data["time_offset"])
                )
                db.add(msg)
                messages_created += 1
            
            db.commit()
            conversations_created += 1
            print(f"✓ Tạo group chat: Team Dev (5 members)")
        
        # Thêm một số conversations nữa
        if len(created_users) >= 6:
            # Eva và Frank
            conv4 = Conversation(is_group=False)
            db.add(conv4)
            db.commit()
            db.refresh(conv4)
            
            conv4.participants.append(created_users[4])
            conv4.participants.append(created_users[5])
            db.commit()
            
            messages = [
                {"sender": created_users[4], "content": "Frank, server có vấn đề gì không?", "time_offset": 30},
                {"sender": created_users[5], "content": "Không có gì, mọi thứ đang chạy tốt", "time_offset": 29},
                {"sender": created_users[4], "content": "OK, cảm ơn nhé!", "time_offset": 28},
            ]
            
            for msg_data in messages:
                msg = Message(
                    conversation_id=conv4.id,
                    sender_id=msg_data["sender"].id,
                    content=msg_data["content"],
                    message_type="text",
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(minutes=msg_data["time_offset"])
                )
                db.add(msg)
                messages_created += 1
            
            db.commit()
            conversations_created += 1
            print(f"✓ Tạo cuộc hội thoại: {created_users[4].display_name} ↔ {created_users[5].display_name}")
        
        print(f"\n=== HOÀN TẤT ===")
        print(f"✓ Tổng số users: {len(created_users)}")
        print(f"✓ Tổng số conversations: {conversations_created}")
        print(f"✓ Tổng số messages: {messages_created}\n")
        
        print("📝 THÔNG TIN ĐĂNG NHẬP:")
        print("=" * 50)
        for user in created_users[:5]:  # Hiển thị 5 user đầu
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Password: demo123")
            print("-" * 50)
        
        print("\n💡 Bạn có thể đăng nhập bằng bất kỳ tài khoản nào ở trên!")
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_users()
