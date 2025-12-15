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

# ==============================
# 基础配置
# ==============================
# 从环境变量中获取数据库连接字符串
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://root:rYVmAg7E5l3nX4I61619pfbzz@cgk1.clusters.zeabur.com:28888/zeabur")
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 创建数据库引擎和会话
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# 初始化 FastAPI 应用
app = FastAPI(title="Production API")

# 配置 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# 数据库模型
# ==============================
# ==============================

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

# 创建表
Base.metadata.create_all(engine)

# ==============================
# JWT 工具
# ==============================
def create_token(phone: str, role: str):
    payload = {
        "sub": phone,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ==============================
# 依赖
# ==============================
# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 获取当前用户
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

# ==============================
# 注册接口
# ==============================
class RegisterForm(BaseModel):
    phone: str
    password: str
    username: str

@app.post("/api/register")
def register(data: RegisterForm, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.phone == data.phone).first()
    if exists:
        raise HTTPException(status_code=400, detail="该手机号已注册")

    password_hash = pwd_context.hash(data.password)

    user = User(
        phone=data.phone,
        username=data.username,
        password_hash=password_hash,
        role="user",
    )
    db.add(user)
    db.commit()

    token = create_token(user.phone, user.role)

    return {
        "token": token,
        "role": user.role,
        "user": user.username,
    }

# ==============================
# 管理员接口：查看所有订单
# ==============================
@app.get("/api/admin/orders")
def list_all_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    orders = db.query(Order).all()

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
            "created_at": o.created_at,
            "user_phone": o.user_phone,
        }
        for o in orders
    ]

# ==============================
# 登录接口
# ==============================
class LoginForm(BaseModel):
    phone: str
    password: str
    total_amount: float

@app.post("/api/login")
def login(data: LoginForm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(400, "账号或密码错误")

    # ==============================
# 订单 Pydantic 模型（前端下单用）
# ==============================
class OrderItemIn(BaseModel):
    id: str
    name: str
    price: float
    qty: int
    image: str

class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    total_amount: float

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

