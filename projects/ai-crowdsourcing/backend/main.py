import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, matching, payments

app = FastAPI(title="AI Crowdsourcing API", version="0.1.0")

_frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(matching.router)
app.include_router(payments.router)

@app.get("/health")
def health():
    return {"status": "ok"}
