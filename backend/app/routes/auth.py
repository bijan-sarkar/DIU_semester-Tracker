from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserOut, Token
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="A student account with this email already exists.")

    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        student_id=user_in.student_id,
        current_semester=user_in.current_semester or "Level 1 Term 1",
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(new_user))

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/demo-login", response_model=Token)
async def demo_login(db: AsyncSession = Depends(get_db)):
    """Provides a 1-click Demo DIU CSE Student account with pre-enrolled courses."""
    demo_email = "demo.student@diu.edu.bd"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalars().first()

    if not user:
        user = User(
            email=demo_email,
            full_name="Tanvir Ahmed (DIU CSE Demo)",
            student_id="231-15-4521",
            current_semester="Level 2 Term 1",
            hashed_password=get_password_hash("diu123456"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.patch("/profile", response_model=UserOut)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.student_id is not None:
        current_user.student_id = user_update.student_id
    if user_update.current_semester is not None:
        current_user.current_semester = user_update.current_semester

    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)
