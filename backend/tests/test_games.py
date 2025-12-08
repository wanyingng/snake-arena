from fastapi.testclient import TestClient
from app.main import app
from app.db_models import Base
from app.database import engine
import pytest


@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup test database for each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_get_active_games():
    response = client.get("/api/games/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
