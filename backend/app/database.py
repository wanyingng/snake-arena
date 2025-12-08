from typing import List, Optional, Dict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.db_models import Base, UserDB, LeaderboardEntryDB, ActiveGameDB, GameModeEnum
from app.models import LeaderboardEntry, ActiveGame, GameMode, Point
from datetime import datetime, timezone
import uuid
import json

# Create database engine
# SQLite-specific connect_args only for SQLite databases
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_user_by_email(email: str, db: Session = None) -> Optional[dict]:
    """Get user by email"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        user = db.query(UserDB).filter(UserDB.email == email).first()
        if user:
            return {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "password_hash": user.password_hash
            }
        return None
    finally:
        if should_close:
            db.close()


def get_user_by_id(user_id: str, db: Session = None) -> Optional[dict]:
    """Get user by ID"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        user = db.query(UserDB).filter(UserDB.id == user_id).first()
        if user:
            return {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "password_hash": user.password_hash
            }
        return None
    finally:
        if should_close:
            db.close()


def create_user(user_data: dict, db: Session = None) -> dict:
    """Create a new user"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        user_id = str(uuid.uuid4())
        user = UserDB(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            password_hash=user_data["password_hash"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "password_hash": user.password_hash
        }
    finally:
        if should_close:
            db.close()


def add_leaderboard_entry(entry: LeaderboardEntry, db: Session = None):
    """Add leaderboard entry"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        db_entry = LeaderboardEntryDB(
            id=entry.id,
            username=entry.username,
            score=entry.score,
            mode=GameModeEnum(entry.mode.value),
            timestamp=entry.timestamp
        )
        db.add(db_entry)
        db.commit()
    finally:
        if should_close:
            db.close()


def get_leaderboard(mode: Optional[GameMode] = None, limit: int = 10, db: Session = None) -> List[LeaderboardEntry]:
    """Get leaderboard entries"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        query = db.query(LeaderboardEntryDB)
        
        if mode:
            query = query.filter(LeaderboardEntryDB.mode == GameModeEnum(mode.value))
        
        # Sort by score descending
        entries = query.order_by(LeaderboardEntryDB.score.desc()).limit(limit).all()
        
        return [
            LeaderboardEntry(
                id=entry.id,
                username=entry.username,
                score=entry.score,
                mode=GameMode(entry.mode.value),
                timestamp=entry.timestamp
            )
            for entry in entries
        ]
    finally:
        if should_close:
            db.close()


def get_active_games(db: Session = None) -> List[ActiveGame]:
    """Get all active games"""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        games = db.query(ActiveGameDB).all()
        
        result = []
        for game in games:
            snake_data = json.loads(game.snake)
            food_data = json.loads(game.food)
            
            result.append(ActiveGame(
                id=game.id,
                username=game.username,
                score=game.score,
                mode=GameMode(game.mode.value),
                snake=[Point(**point) for point in snake_data],
                food=Point(**food_data)
            ))
        
        return result
    finally:
        if should_close:
            db.close()


# Initialize with fake data for testing
def _init_fake_data(db: Session = None):
    """Initialize the database with fake data for testing"""
    from app.auth import get_password_hash
    
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        # Check if data already exists
        existing_users = db.query(UserDB).count()
        if existing_users > 0:
            return  # Data already initialized
        
        # Sample users
        sample_users = [
            {"email": "alice@example.com", "username": "alice", "password": "password123"},
            {"email": "bob@example.com", "username": "bob", "password": "password123"},
            {"email": "charlie@example.com", "username": "charlie", "password": "password123"},
        ]
        
        for user in sample_users:
            user_data = {
                "email": user["email"],
                "username": user["username"],
                "password_hash": get_password_hash(user["password"])
            }
            create_user(user_data, db)
        
        # Sample leaderboard entries
        sample_scores = [
            {"username": "alice", "score": 150, "mode": GameMode.walls},
            {"username": "bob", "score": 120, "mode": GameMode.walls},
            {"username": "charlie", "score": 95, "mode": GameMode.walls},
            {"username": "alice", "score": 200, "mode": GameMode.pass_through},
            {"username": "bob", "score": 175, "mode": GameMode.pass_through},
            {"username": "charlie", "score": 140, "mode": GameMode.pass_through},
        ]
        
        for score in sample_scores:
            entry = LeaderboardEntry(
                id=str(uuid.uuid4()),
                username=score["username"],
                score=score["score"],
                mode=score["mode"],
                timestamp=datetime.now(timezone.utc)
            )
            add_leaderboard_entry(entry, db)
        
        # Sample active games
        sample_games = [
            {
                "username": "alice",
                "score": 75,
                "mode": GameMode.walls,
                "snake": [Point(x=10, y=10), Point(x=9, y=10), Point(x=8, y=10)],
                "food": Point(x=15, y=15)
            },
            {
                "username": "bob",
                "score": 50,
                "mode": GameMode.pass_through,
                "snake": [Point(x=5, y=5), Point(x=4, y=5)],
                "food": Point(x=12, y=8)
            },
        ]
        
        for game_data in sample_games:
            snake_json = json.dumps([{"x": p.x, "y": p.y} for p in game_data["snake"]])
            food_json = json.dumps({"x": game_data["food"].x, "y": game_data["food"].y})
            
            game = ActiveGameDB(
                id=str(uuid.uuid4()),
                username=game_data["username"],
                score=game_data["score"],
                mode=GameModeEnum(game_data["mode"].value),
                snake=snake_json,
                food=food_json
            )
            db.add(game)
        
        db.commit()
    finally:
        if should_close:
            db.close()
