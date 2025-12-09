from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ConversationBase(BaseModel):
    name: Optional[str] = None
    is_group: bool = False

class ConversationCreate(ConversationBase):
    participant_ids: List[int]

class ConversationResponse(ConversationBase):
    id: int
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ConversationWithParticipants(ConversationResponse):
    participants: List['UserResponse']
    
    class Config:
        from_attributes = True

from app.schemas.user import UserResponse
ConversationWithParticipants.model_rebuild()
