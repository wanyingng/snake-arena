"""Integration test fixtures using SQLite database"""
import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db_models import Base
from app import database


@pytest.fixture(scope="function")
def integration_db():
    """Create a temporary SQLite database for integration tests"""
    # Create a temporary file for the database
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    database_url = f"sqlite:///{db_path}"
    
    # Create engine and session
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    # Replace the global engine and session factory
    original_engine = database.engine
    original_session_local = database.SessionLocal
    
    database.engine = engine
    database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    yield database.SessionLocal
    
    # Cleanup: restore original engine and session, close and delete temp file
    database.engine = original_engine
    database.SessionLocal = original_session_local
    
    os.close(db_fd)
    os.unlink(db_path)
