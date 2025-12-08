"""Integration tests for leaderboard functionality with database"""
import pytest
from datetime import datetime, timezone
import uuid
from app.database import create_user, add_leaderboard_entry, get_leaderboard
from app.models import LeaderboardEntry, GameMode
from app.auth import get_password_hash


def test_add_leaderboard_entry(integration_db):
    """Test adding a leaderboard entry to database"""
    db = integration_db()
    
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username="player1",
        score=100,
        mode=GameMode.walls,
        timestamp=datetime.now(timezone.utc)
    )
    
    add_leaderboard_entry(entry, db)
    
    # Retrieve and verify
    leaderboard = get_leaderboard(db=db)
    assert len(leaderboard) == 1
    assert leaderboard[0].username == "player1"
    assert leaderboard[0].score == 100
    
    db.close()


def test_leaderboard_sorting(integration_db):
    """Test that leaderboard is sorted by score descending"""
    db = integration_db()
    
    # Add multiple entries with different scores
    entries = [
        LeaderboardEntry(
            id=str(uuid.uuid4()),
            username=f"player{i}",
            score=score,
            mode=GameMode.walls,
            timestamp=datetime.now(timezone.utc)
        )
        for i, score in enumerate([50, 200, 75, 150, 25])
    ]
    
    for entry in entries:
        add_leaderboard_entry(entry, db)
    
    # Get leaderboard
    leaderboard = get_leaderboard(db=db)
    
    # Verify sorting (should be: 200, 150, 75, 50, 25)
    assert len(leaderboard) == 5
    assert leaderboard[0].score == 200
    assert leaderboard[1].score == 150
    assert leaderboard[2].score == 75
    assert leaderboard[3].score == 50
    assert leaderboard[4].score == 25
    
    db.close()


def test_leaderboard_filtering_by_mode(integration_db):
    """Test filtering leaderboard by game mode"""
    db = integration_db()
    
    # Add entries for different modes
    walls_entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username="walls_player",
        score=100,
        mode=GameMode.walls,
        timestamp=datetime.now(timezone.utc)
    )
    
    passthrough_entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username="pass_player",
        score=150,
        mode=GameMode.pass_through,
        timestamp=datetime.now(timezone.utc)
    )
    
    add_leaderboard_entry(walls_entry, db)
    add_leaderboard_entry(passthrough_entry, db)
    
    # Get walls leaderboard
    walls_leaderboard = get_leaderboard(mode=GameMode.walls, db=db)
    assert len(walls_leaderboard) == 1
    assert walls_leaderboard[0].mode == GameMode.walls
    assert walls_leaderboard[0].username == "walls_player"
    
    # Get pass-through leaderboard
    pass_leaderboard = get_leaderboard(mode=GameMode.pass_through, db=db)
    assert len(pass_leaderboard) == 1
    assert pass_leaderboard[0].mode == GameMode.pass_through
    assert pass_leaderboard[0].username == "pass_player"
    
    db.close()


def test_leaderboard_limit(integration_db):
    """Test leaderboard limit parameter"""
    db = integration_db()
    
    # Add 15 entries
    for i in range(15):
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            username=f"player{i}",
            score=i * 10,
            mode=GameMode.walls,
            timestamp=datetime.now(timezone.utc)
        )
        add_leaderboard_entry(entry, db)
    
    # Get top 5
    top_5 = get_leaderboard(limit=5, db=db)
    assert len(top_5) == 5
    
    # Get top 10
    top_10 = get_leaderboard(limit=10, db=db)
    assert len(top_10) == 10
    
    # Get all (default limit is 10)
    default = get_leaderboard(db=db)
    assert len(default) == 10
    
    db.close()


def test_complete_leaderboard_flow(integration_db):
    """Test complete flow: user signup, submit score, view leaderboard"""
    db = integration_db()
    
    # Step 1: Create users
    users = []
    for i in range(3):
        user_data = {
            "email": f"player{i}@example.com",
            "username": f"player{i}",
            "password_hash": get_password_hash("password123")
        }
        user = create_user(user_data, db)
        users.append(user)
    
    # Step 2: Submit scores
    scores = [150, 100, 200]
    for i, score in enumerate(scores):
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            username=users[i]["username"],
            score=score,
            mode=GameMode.walls,
            timestamp=datetime.now(timezone.utc)
        )
        add_leaderboard_entry(entry, db)
    
    # Step 3: Get leaderboard
    leaderboard = get_leaderboard(mode=GameMode.walls, db=db)
    
    # Verify results (should be sorted: 200, 150, 100)
    assert len(leaderboard) == 3
    assert leaderboard[0].score == 200
    assert leaderboard[0].username == "player2"
    assert leaderboard[1].score == 150
    assert leaderboard[1].username == "player0"
    assert leaderboard[2].score == 100
    assert leaderboard[2].username == "player1"
    
    db.close()


def test_multiple_scores_same_user(integration_db):
    """Test that a user can have multiple scores in leaderboard"""
    db = integration_db()
    
    # Add multiple entries for same user
    for score in [50, 100, 75]:
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            username="consistent_player",
            score=score,
            mode=GameMode.walls,
            timestamp=datetime.now(timezone.utc)
        )
        add_leaderboard_entry(entry, db)
    
    leaderboard = get_leaderboard(db=db)
    
    # All three scores should be in leaderboard
    player_entries = [e for e in leaderboard if e.username == "consistent_player"]
    assert len(player_entries) == 3
    
    # Verify they're sorted
    assert player_entries[0].score == 100
    assert player_entries[1].score == 75
    assert player_entries[2].score == 50
    
    db.close()
