"""Integration tests for authentication flow with database"""
import pytest
from jose import jwt
from app.database import create_user, get_user_by_email, get_user_by_id
from app.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM


def test_user_creation(integration_db):
    """Test creating a user in the database"""
    db = integration_db()
    
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password_hash": get_password_hash("password123")
    }
    
    user = create_user(user_data, db)
    
    assert user["email"] == "test@example.com"
    assert user["username"] == "testuser"
    assert "id" in user
    assert "password_hash" in user
    
    db.close()


def test_user_retrieval_by_email(integration_db):
    """Test retrieving user by email"""
    db = integration_db()
    
    # Create user
    user_data = {
        "email": "retrieve@example.com",
        "username": "retrieveuser",
        "password_hash": get_password_hash("password123")
    }
    created_user = create_user(user_data, db)
    
    # Retrieve user
    retrieved_user = get_user_by_email("retrieve@example.com", db)
    
    assert retrieved_user is not None
    assert retrieved_user["email"] == "retrieve@example.com"
    assert retrieved_user["id"] == created_user["id"]
    
    db.close()


def test_user_retrieval_by_id(integration_db):
    """Test retrieving user by ID"""
    db = integration_db()
    
    # Create user
    user_data = {
        "email": "byid@example.com",
        "username": "byiduser",
        "password_hash": get_password_hash("password123")
    }
    created_user = create_user(user_data, db)
    
    # Retrieve by ID
    retrieved_user = get_user_by_id(created_user["id"], db)
    
    assert retrieved_user is not None
    assert retrieved_user["id"] == created_user["id"]
    assert retrieved_user["email"] == "byid@example.com"
    
    db.close()


def test_password_hashing_and_verification(integration_db):
    """Test password hashing and verification"""
    db = integration_db()
    
    password = "securepassword123"
    hashed = get_password_hash(password)
    
    # Create user with hashed password
    user_data = {
        "email": "hash@example.com",
        "username": "hashuser",
        "password_hash": hashed
    }
    created_user = create_user(user_data, db)
    
    # Verify password works
    assert verify_password(password, created_user["password_hash"])
    assert not verify_password("wrongpassword", created_user["password_hash"])
    
    db.close()


def test_jwt_token_creation_and_decoding(integration_db):
    """Test JWT token creation and decoding"""
    db = integration_db()
    
    # Create user
    user_data = {
        "email": "jwt@example.com",
        "username": "jwtuser",
        "password_hash": get_password_hash("password123")
    }
    user = create_user(user_data, db)
    
    # Create token
    token = create_access_token(data={"sub": user["id"]})
    assert token is not None
    
    # Decode token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload is not None
    assert payload["sub"] == user["id"]
    
    db.close()


def test_complete_auth_flow(integration_db):
    """Test complete authentication flow from signup to login"""
    db = integration_db()
    
    # Step 1: Signup (create user)
    password = "mypassword123"
    user_data = {
        "email": "flow@example.com",
        "username": "flowuser",
        "password_hash": get_password_hash(password)
    }
    user = create_user(user_data, db)
    user_id = user["id"]
    
    # Step 2: Login (verify credentials)
    retrieved_user = get_user_by_email("flow@example.com", db)
    assert retrieved_user is not None
    assert verify_password(password, retrieved_user["password_hash"])
    
    # Step 3: Create JWT token
    token = create_access_token(data={"sub": user_id})
    
    # Step 4: Verify token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == user_id
    
    # Step 5: Get user by ID from token
    final_user = get_user_by_id(payload["sub"], db)
    assert final_user["email"] == "flow@example.com"
    assert final_user["username"] == "flowuser"
    
    db.close()


def test_duplicate_email_prevention(integration_db):
    """Test that duplicate emails are prevented by database constraints"""
    db = integration_db()
    
    user_data = {
        "email": "duplicate@example.com",
        "username": "user1",
        "password_hash": get_password_hash("password123")
    }
    create_user(user_data, db)
    
    # Try to create another user with same email
    user_data2 = {
        "email": "duplicate@example.com",
        "username": "user2",
        "password_hash": get_password_hash("password456")
    }
    
    # This should raise an IntegrityError
    with pytest.raises(Exception):  # SQLAlchemy will raise IntegrityError
        create_user(user_data2, db)
        db.commit()
    
    db.close()
