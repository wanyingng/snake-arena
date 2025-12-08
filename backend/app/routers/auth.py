from fastapi import APIRouter, Depends, HTTPException, status
from app.models import LoginRequest, SignupRequest, AuthResponse, User
from app.database import get_user_by_email, create_user
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user = get_user_by_email(request.email)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"user": user, "token": access_token}

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )
    
    user_data = {
        "username": request.username,
        "email": request.email,
        "password_hash": get_password_hash(request.password)
    }
    
    created_user = create_user(user_data)
    access_token = create_access_token(data={"sub": created_user["email"]})
    
    return {"user": created_user, "token": access_token}

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"description": "Logout successful"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
