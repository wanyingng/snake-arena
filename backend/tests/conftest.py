"""Test fixtures for database testing"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db_models import Base
from app.database import init_db


@pytest.fixture(scope="function")
def test_db():
    """Create a test database in memory"""
    # Create in-memory SQLite database for tests
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def clean_db():
    """Create a clean test database without any data"""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    yield TestingSessionLocal
    
    Base.metadata.drop_all(bind=engine)
