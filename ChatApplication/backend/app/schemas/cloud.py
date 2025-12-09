from pydantic import BaseModel
from datetime import datetime

class CloudFileBase(BaseModel):
    file_name: str
    file_url: str
    file_type: str
    file_size: int

class CloudFileCreate(CloudFileBase):
    pass

class CloudFileResponse(CloudFileBase):
    id: int
    owner_id: int
    is_on_cloud: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
