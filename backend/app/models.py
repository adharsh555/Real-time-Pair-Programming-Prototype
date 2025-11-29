from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import uuid4, UUID

class Room(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    code: str = Field(default="")
    language: str = Field(default="python")
    updated_at: datetime = Field(default_factory=datetime.utcnow)
