# =========================================
# FastAPI 后端成品版（与当前前端结构 100% 对应）
# 技术栈：FastAPI + JWT + PostgreSQL + SQLAlchemy
# 目标：直接部署 Zeabur，无需你再改一行
# =========================================

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
import os
import uuid

# =============================
# 基础配置
# =============================

DATABASE_URL = os.environ.get("DATABASE_URL")  # Zeabur 自动注入
SECRET_KEY = os.environ.get("SECRET_KEY", "CHANGE_ME")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = FastAPI(title="Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================
# 数据库模型
# =============================

class User(Base):
    __tablename__ = "users"
    phone = Column(String, primary_key=True)
    username = Column(String)
    password_hash = Column(String)
    role = Column(String, default="user")


class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
    user_phone = Column(String, ForeignKey("users.phone"))
    total_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String, primary_key=True)
    order_id = Column(String, ForeignKey("orders.id"))
    name = Column(String)
    price = Column(Float)
    qty = Column(Integer)
    image = Column(String)

    order = relationship("Order", back_populates="items")


Base.metadata.create_all(engine)

# =============================
# JWT 工具
# =============================


def create_token(phone: str, role: str):
    payload = {
        "sub": phone,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# =============================
# 依赖
# =============================


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Header(None), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(401, "未登录")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Token 无效或过期")

    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(401)
    return user


# =============================
# Pydantic 模型（对应前端）
# =============================

class LoginForm(BaseModel):
    phone: str
    password: str


class OrderItemIn(BaseModel):
    id: str
    name: str
    price: float
    qty: int
    image: str


class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    total_amount: float


# =============================
# 接口定义（与前端完全对齐）
# =============================

@app.post("/api/login")
def login(data: LoginForm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(400, "账号或密码错误")

    token = create_token(user.phone, user.role)
    return {
        "token": token,
        "role": user.role,
        "user": user.username,
    }


@app.get("/api/user/profile")
def profile(user: User = Depends(get_current_user)):
    return {
        "username": user.username,
        "role": user.role,
        "phone": user.phone,
    }


@app.post("/api/orders")
def create_order(
    data: OrderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = Order(
        id=str(uuid.uuid4()),
        user_phone=user.phone,
        total_amount=data.total_amount,
    )
    db.add(order)

    for i in data.items:
        db.add(
            OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                name=i.name,
                price=i.price,
                qty=i.qty,
                image=i.image,
            )
        )

    db.commit()
    return {"id": order.id, "status": "paid"}


@app.get("/api/orders")
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        orders = db.query(Order).all()
    else:
        orders = db.query(Order).filter(Order.user_phone == user.phone).all()

    return [
        {
            "id": o.id,
            "total_amount": o.total_amount,
            "items": [
                {
                    "name": i.name,
                    "price": i.price,
                    "qty": i.qty,
                    "image": i.image,
                }
                for i in o.items
            ],
        }
        for o in orders
    ]


@app.get("/")
def root():
    return {"status": "ok"}

# =============================
# 启动命令（Zeabur）
# uvicorn main:app --host 0.0.0.0 --port $PORT
# =============================