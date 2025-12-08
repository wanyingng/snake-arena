from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.models import LeaderboardEntry, SubmitScoreRequest, User, GameMode
from app.database import get_leaderboard, add_leaderboard_entry
from app.auth import get_current_user
import uuid

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard_entries(
    mode: Optional[GameMode] = None,
    limit: int = Query(10, ge=1, le=100)
):
    return get_leaderboard(mode, limit)

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_score(
    request: SubmitScoreRequest,
    current_user: User = Depends(get_current_user)
):
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username=current_user.username,
        score=request.score,
        mode=request.mode,
        timestamp=datetime.now(timezone.utc)
    )
    add_leaderboard_entry(entry)
    return {"description": "Score submitted successfully"}
