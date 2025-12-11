from pydantic import BaseModel
from typing import Optional, ForwardRef
from datetime import datetime

class MessageBase(BaseModel):
    content: Optional[str] = None
    message_type: str = "text"
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    reply_to_id: Optional[int] = None  # ID của tin nhắn được reply

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    sender_id: int
    is_read: bool
    created_at: datetime
    reply_to_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Schema riêng cho reply preview (không có nested reply để tránh circular)
class ReplyPreview(MessageResponse):
    sender: Optional['UserResponse'] = None
    
    class Config:
        from_attributes = True

class MessageWithSender(MessageResponse):
    sender: 'UserResponse'
    reply_to: Optional[ReplyPreview] = None  # Dùng ReplyPreview thay vì MessageResponse
    
    class Config:
        from_attributes = True

from app.schemas.user import UserResponse
MessageWithSender.model_rebuild()
ReplyPreview.model_rebuild()
