from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    desc: str | None = Field(default=None)
    completed: bool = Field(default=False)

    class Config:
            json_schema_extra = {
                "example": {
                    "title": "shopping",
                    "description": "milk and fruits",
                    "completed": False
                }
            }
