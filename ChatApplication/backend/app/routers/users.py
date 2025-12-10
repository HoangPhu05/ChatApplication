from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.database import models
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.display_name is not None:
        current_user.display_name = user_update.display_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.avatar is not None:
        current_user.avatar = user_update.avatar
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserResponse])
async def search_users(
    query: str = "",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Tìm kiếm theo username, display_name, email hoặc phone
    if not query:
        # Nếu không có query, trả về danh sách rỗng
        return []
    
    # Build search conditions
    search_conditions = [
        models.User.username.contains(query),
        models.User.display_name.contains(query),
        models.User.email.contains(query)
    ]
    
    # Only add phone search if phone is not null
    if query:
        search_conditions.append(
            models.User.phone.ilike(f"%{query}%")
        )
    
    from sqlalchemy import or_
    users = db.query(models.User).filter(
        models.User.id != current_user.id,
        or_(*search_conditions)
    ).limit(20).all()
    
    return users
