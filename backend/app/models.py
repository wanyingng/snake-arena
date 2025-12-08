from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class GameMode(str, Enum):
    walls = "walls"
    pass_through = "pass-through"

class User(BaseModel):
    id: str
    username: str
    email: EmailStr

class AuthResponse(BaseModel):
    user: User
    token: str = Field(..., description="JWT token for authentication")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(..., min_length=6)

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    timestamp: datetime

class SubmitScoreRequest(BaseModel):
    score: int
    mode: GameMode

class Point(BaseModel):
    x: int
    y: int

class ActiveGame(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Point]
    food: Point
