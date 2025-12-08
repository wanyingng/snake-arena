from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, init_db, engine
from app.db_models import Base
import pytest


@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup test database for each test"""
    # Drop all tables and recreate for clean state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after test
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_signup():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "username": "testuser", "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    assert "token" in data


def test_login():
    # First signup
    client.post(
        "/api/auth/signup",
        json={"email": "login@example.com", "username": "loginuser", "password": "password123"}
    )
    
    # Then login
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "login@example.com"
    assert "token" in data


def test_login_invalid_credentials():
    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
