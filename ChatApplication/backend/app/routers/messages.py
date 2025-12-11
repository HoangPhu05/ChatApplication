from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.deps import get_db, get_current_user
from app.database import models
from app.schemas.message import MessageCreate, MessageResponse, MessageWithSender

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_message(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

@router.post("/", response_model=MessageWithSender, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify conversation exists and user is participant
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == message_data.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create message
    message = models.Message(
        conversation_id=message_data.conversation_id,
        sender_id=current_user.id,
        content=message_data.content,
        message_type=message_data.message_type,
        file_url=message_data.file_url,
        file_name=message_data.file_name,
        file_size=message_data.file_size,
        reply_to_id=message_data.reply_to_id
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message

@router.get("/conversation/{conversation_id}", response_model=List[MessageWithSender])
async def get_conversation_messages(
    conversation_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify conversation and access
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages ordered by created_at ASC (oldest first, newest last)
    # Eager load reply_to relationship and its sender
    messages = db.query(models.Message).options(
        joinedload(models.Message.reply_to).joinedload(models.Message.sender)
    ).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at.asc()).offset(skip).limit(limit).all()
    
    return messages

@router.put("/{message_id}/read", response_model=MessageResponse)
async def mark_message_read(
    message_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow deleting own messages
    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    db.delete(message)
    db.commit()
    return None

@router.websocket("/ws/{user_id}")
async def delete_message(
    message_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only allow sender to delete their own message
    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    db.delete(message)
    db.commit()
    
    return None

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming messages
            # Broadcast to conversation participants
            await websocket.send_json({"status": "received"})
    except WebSocketDisconnect:
        manager.disconnect(user_id)
