from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Literal

TaskType = Literal["sns_post", "document", "data_entry", "lp", "other"]


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    task_type: TaskType
    raw_input: str = Field(min_length=1, max_length=4000)
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: datetime | None = None

    @model_validator(mode="after")
    def check_budget_range(self) -> "ProjectCreate":
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min > self.budget_max:
                raise ValueError("budget_min は budget_max 以下である必要があります。")
        return self


class ProjectResponse(BaseModel):
    id: str
    title: str
    task_type: str
    requirements: dict
    status: str
    created_at: datetime
