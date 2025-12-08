"""Integration tests for active games functionality with database"""
import pytest
import json
from app.database import get_active_games
from app.db_models import ActiveGameDB, GameModeEnum
from app.models import Point, GameMode
import uuid


def test_active_games_retrieval(integration_db):
    """Test retrieving active games from database"""
    db = integration_db()
    
    # Add an active game directly to database
    snake_data = [{"x": 10, "y": 10}, {"x": 9, "y": 10}]
    food_data = {"x": 15, "y": 15}
    
    game = ActiveGameDB(
        id=str(uuid.uuid4()),
        username="active_player",
        score=50,
        mode=GameModeEnum.walls,
        snake=json.dumps(snake_data),
        food=json.dumps(food_data)
    )
    
    db.add(game)
    db.commit()
    
    # Retrieve active games
    active_games = get_active_games(db)
    
    assert len(active_games) == 1
    assert active_games[0].username == "active_player"
    assert active_games[0].score == 50
    assert active_games[0].mode == GameMode.walls
    assert len(active_games[0].snake) == 2
    assert active_games[0].snake[0].x == 10
    assert active_games[0].snake[0].y == 10
    assert active_games[0].food.x == 15
    assert active_games[0].food.y == 15
    
    db.close()


def test_multiple_active_games(integration_db):
    """Test retrieving multiple active games"""
    db = integration_db()
    
    # Add multiple active games
    games_data = [
        {
            "username": "player1",
            "score": 30,
            "mode": GameModeEnum.walls,
            "snake": [{"x": 5, "y": 5}, {"x": 4, "y": 5}],
            "food": {"x": 8, "y": 8}
        },
        {
            "username": "player2",
            "score": 60,
            "mode": GameModeEnum.pass_through,
            "snake": [{"x": 15, "y": 15}, {"x": 14, "y": 15}, {"x": 13, "y": 15}],
            "food": {"x": 10, "y": 10}
        }
    ]
    
    for game_data in games_data:
        game = ActiveGameDB(
            id=str(uuid.uuid4()),
            username=game_data["username"],
            score=game_data["score"],
            mode=game_data["mode"],
            snake=json.dumps(game_data["snake"]),
            food=json.dumps(game_data["food"])
        )
        db.add(game)
    
    db.commit()
    
    # Retrieve all active games
    active_games = get_active_games(db)
    
    assert len(active_games) == 2
    
    # Verify first game
    game1 = [g for g in active_games if g.username == "player1"][0]
    assert game1.score == 30
    assert game1.mode == GameMode.walls
    assert len(game1.snake) == 2
    
    # Verify second game
    game2 = [g for g in active_games if g.username == "player2"][0]
    assert game2.score == 60
    assert game2.mode == GameMode.pass_through
    assert len(game2.snake) == 3
    
    db.close()


def test_snake_position_serialization(integration_db):
    """Test that snake positions are correctly serialized/deserialized"""
    db = integration_db()
    
    # Create a game with longer snake
    snake_positions = [
        {"x": i, "y": i * 2} for i in range(10)
    ]
    
    game = ActiveGameDB(
        id=str(uuid.uuid4()),
        username="snake_test",
        score=90,
        mode=GameModeEnum.walls,
        snake=json.dumps(snake_positions),
        food=json.dumps({"x": 20, "y": 20})
    )
    
    db.add(game)
    db.commit()
    
    # Retrieve and verify
    active_games = get_active_games(db)
    assert len(active_games) == 1
    
    game = active_games[0]
    assert len(game.snake) == 10
    
    # Verify positions
    for i, point in enumerate(game.snake):
        assert point.x == i
        assert point.y == i * 2
    
    db.close()


def test_empty_active_games(integration_db):
    """Test retrieving active games when none exist"""
    db = integration_db()
    
    active_games = get_active_games(db)
    
    assert isinstance(active_games, list)
    assert len(active_games) == 0
    
    db.close()


def test_active_games_different_modes(integration_db):
    """Test active games with different game modes"""
    db = integration_db()
    
    # Add games with different modes
    for mode in [GameModeEnum.walls, GameModeEnum.pass_through]:
        game = ActiveGameDB(
            id=str(uuid.uuid4()),
            username=f"player_{mode.value}",
            score=100,
            mode=mode,
            snake=json.dumps([{"x": 10, "y": 10}]),
            food=json.dumps({"x": 5, "y": 5})
        )
        db.add(game)
    
    db.commit()
    
    # Retrieve all games
    active_games = get_active_games(db)
    
    assert len(active_games) == 2
    
    modes = {g.mode for g in active_games}
    assert GameMode.walls in modes
    assert GameMode.pass_through in modes
    
    db.close()
