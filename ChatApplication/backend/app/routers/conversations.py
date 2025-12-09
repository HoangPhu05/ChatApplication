from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.database import models
from app.schemas.conversation import ConversationCreate, ConversationResponse, ConversationWithParticipants

router = APIRouter()

@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create new conversation
    conversation = models.Conversation(
        name=conversation_data.name,
        is_group=conversation_data.is_group
    )
    db.add(conversation)
    db.flush()
    
    # Add participants
    participants = db.query(models.User).filter(
        models.User.id.in_(conversation_data.participant_ids + [current_user.id])
    ).all()
    conversation.participants.extend(participants)
    
    db.commit()
    db.refresh(conversation)
    return conversation

@router.get("/", response_model=List[ConversationWithParticipants])
async def get_user_conversations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(models.Conversation).join(
        models.conversation_participants
    ).filter(
        models.conversation_participants.c.user_id == current_user.id
    ).all()
    return conversations

@router.get("/{conversation_id}", response_model=ConversationWithParticipants)
async def get_conversation(
    conversation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is participant
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return conversation

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(conversation)
    db.commit()
    return None
