from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.database import models
from app.schemas.cloud import CloudFileCreate, CloudFileResponse

router = APIRouter()

@router.post("/", response_model=CloudFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file_data: CloudFileCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cloud_file = models.CloudFile(
        owner_id=current_user.id,
        file_name=file_data.file_name,
        file_url=file_data.file_url,
        file_type=file_data.file_type,
        file_size=file_data.file_size
    )
    db.add(cloud_file)
    db.commit()
    db.refresh(cloud_file)
    return cloud_file

@router.get("/", response_model=List[CloudFileResponse])
async def get_user_files(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(models.CloudFile).filter(
        models.CloudFile.owner_id == current_user.id
    ).order_by(models.CloudFile.created_at.desc()).all()
    return files

@router.get("/storage-info")
async def get_storage_info(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func
    
    total_size = db.query(func.sum(models.CloudFile.file_size)).filter(
        models.CloudFile.owner_id == current_user.id
    ).scalar() or 0
    
    file_counts = db.query(
        models.CloudFile.file_type,
        func.count(models.CloudFile.id),
        func.sum(models.CloudFile.file_size)
    ).filter(
        models.CloudFile.owner_id == current_user.id
    ).group_by(models.CloudFile.file_type).all()
    
    return {
        "total_size": total_size,
        "max_size": 500 * 1024 * 1024,  # 500 MB
        "file_counts": {item[0]: {"count": item[1], "size": item[2]} for item in file_counts}
    }

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(models.CloudFile).filter(
        models.CloudFile.id == file_id,
        models.CloudFile.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    db.delete(file)
    db.commit()
    return None
