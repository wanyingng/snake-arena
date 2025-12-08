from fastapi import APIRouter
from typing import List
from app.models import ActiveGame
from app.database import get_active_games

router = APIRouter(prefix="/games", tags=["Games"])

@router.get("/active", response_model=List[ActiveGame])
async def get_active_games_list():
    return get_active_games()
