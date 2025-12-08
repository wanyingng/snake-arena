from sqlalchemy import Column, String, Integer, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone
import enum

Base = declarative_base()


class GameModeEnum(str, enum.Enum):
    """Game mode enumeration"""
    walls = "walls"
    pass_through = "pass-through"


class UserDB(Base):
    """User database model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class LeaderboardEntryDB(Base):
    """Leaderboard entry database model"""
    __tablename__ = "leaderboard"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False, index=True)
    score = Column(Integer, nullable=False)
    mode = Column(SQLEnum(GameModeEnum), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class ActiveGameDB(Base):
    """Active game database model"""
    __tablename__ = "active_games"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False, index=True)
    score = Column(Integer, nullable=False)
    mode = Column(SQLEnum(GameModeEnum), nullable=False)
    snake = Column(Text, nullable=False)  # JSON string of snake positions
    food = Column(Text, nullable=False)   # JSON string of food position
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
