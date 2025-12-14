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

@router.post("/group", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_group_conversation(
    conversation_data: ConversationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a group conversation with minimum 3 participants"""
    # Validate minimum participants (must include current user + at least 2 others)
    if len(conversation_data.participant_ids) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group conversation requires at least 3 participants"
        )
    
    # Validate group name
    if not conversation_data.name or not conversation_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group name is required"
        )
    
    # Create group conversation
    conversation = models.Conversation(
        name=conversation_data.name,
        is_group=True
    )
    db.add(conversation)
    db.flush()
    
    # Add all participants
    participants = db.query(models.User).filter(
        models.User.id.in_(conversation_data.participant_ids)
    ).all()
    
    # Ensure current user is included
    if current_user not in participants:
        participants.append(current_user)
    
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

@router.post("/{conversation_id}/leave", status_code=status.HTTP_200_OK)
async def leave_group(
    conversation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a group conversation"""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation.is_group:
        raise HTTPException(
            status_code=400, 
            detail="Cannot leave a 1-on-1 conversation"
        )
    
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="You are not in this group")
    
    # Remove user from participants
    conversation.participants.remove(current_user)
    
    # If no participants left, delete the conversation
    if len(conversation.participants) == 0:
        db.delete(conversation)
    
    db.commit()
    return {"message": "Successfully left the group"}

@router.post("/{conversation_id}/add-members", response_model=ConversationWithParticipants)
async def add_members_to_group(
    conversation_id: int,
    user_ids: List[int],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add members to a group conversation"""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not conversation.is_group:
        raise HTTPException(
            status_code=400, 
            detail="Cannot add members to a 1-on-1 conversation"
        )
    
    if current_user not in conversation.participants:
        raise HTTPException(status_code=403, detail="You are not in this group")
    
    # Get users to add
    users_to_add = db.query(models.User).filter(
        models.User.id.in_(user_ids)
    ).all()
    
    if not users_to_add:
        raise HTTPException(status_code=404, detail="No valid users found")
    
    # Get current participant IDs
    current_participant_ids = [p.id for p in conversation.participants]
    
    # Add only users who are not already in the group
    added_count = 0
    for user in users_to_add:
        if user.id not in current_participant_ids:
            conversation.participants.append(user)
            added_count += 1
    
    if added_count == 0:
        raise HTTPException(
            status_code=400, 
            detail="All selected users are already in the group"
        )
    
    db.commit()
    db.refresh(conversation)
    return conversation
