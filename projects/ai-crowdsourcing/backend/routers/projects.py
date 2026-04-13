from fastapi import APIRouter, HTTPException
from models.project import ProjectCreate
from services.wizard import structure_requirements
from services.embedding import generate_embedding
from db.supabase import get_client

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", status_code=201)
async def create_project(payload: ProjectCreate):
    requirements = structure_requirements(payload.task_type, payload.raw_input)
    req_text = f"{payload.title} {payload.task_type} {payload.raw_input}"
    req_vector = generate_embedding(req_text)

    db = get_client()
    result = db.table("projects").insert({
        "title": payload.title,
        "task_type": payload.task_type,
        "requirements": requirements,
        "budget_min": payload.budget_min,
        "budget_max": payload.budget_max,
        "deadline": payload.deadline.isoformat() if payload.deadline else None,
        "requirement_vector": req_vector,
        "status": "open",
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="案件の作成に失敗しました")

    return {"id": result.data[0]["id"], "requirements": requirements}


@router.get("/{project_id}")
async def get_project(project_id: str):
    db = get_client()
    result = db.table("projects").select("*").eq("id", project_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    return result.data


@router.patch("/{project_id}/assign")
async def assign_worker(project_id: str, worker_id: str):
    db = get_client()
    db.table("projects").update({
        "assigned_worker_id": worker_id,
        "status": "matched"
    }).eq("id", project_id).execute()
    return {"status": "matched", "worker_id": worker_id}
