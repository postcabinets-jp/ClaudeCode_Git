from fastapi import APIRouter, HTTPException
from db.supabase import get_client

router = APIRouter(prefix="/projects", tags=["matching"])


@router.get("/{project_id}/matches")
async def get_matches(project_id: str):
    """
    案件のrequirement_vectorと最も類似したworkerをTop-3で返す。
    Supabase pgvectorのRPC関数 match_workers を使用。
    """
    db = get_client()

    project = db.table("projects").select("requirement_vector").eq("id", project_id).single().execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="案件が見つかりません")

    candidates = db.rpc("match_workers", {
        "query_vector": project.data["requirement_vector"],
        "match_count": 3,
    }).execute()

    return {"project_id": project_id, "candidates": candidates.data}
