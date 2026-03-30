from pydantic import BaseModel
from datetime import datetime

TASK_TYPES = ["sns_post", "document", "data_entry", "lp", "other"]


class ProjectCreate(BaseModel):
    title: str
    task_type: str
    raw_input: str
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: datetime | None = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    task_type: str
    requirements: dict
    status: str
    created_at: datetime
