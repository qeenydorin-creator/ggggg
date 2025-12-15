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
import uvicorn  # 用于启动后端应用时指定端口

# ==============================
# 基础配置（Zeabur）
# ==============================
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL 未设置（请在 Zeabur 环境变量中配置）")

SECRET_KEY = os.environ.get("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
WEB_PORT = os.getenv("WEB_PORT", "8080")  # 获取环境变量设置端口，默认 8080

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==============================
# 数据库初始化
# ==============================
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==============================
# FastAPI 初始化
# ==============================
app = FastAPI(title="Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 前端部署后可改成指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# 数据库模型
# ==============================
class User(Base):
    __tablename__ = "users"

    phone = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)
    user_phone = Column(String, ForeignKey("users.phone"))
    total_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True)
    order_id = Column(String, ForeignKey("orders.id"))
    name = Column(String)
    price = Column(Float)
    qty = Column(Integer)
    image = Column(String)

    order = relationship("Order", back_populates="items")


Base.metadata.create_all(bind=engine)

# ==============================
# JWT 工具
# ==============================
def create_token(phone: str, role: str) -> str:
    payload = {
        "sub": phone,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ==============================
# 依赖
# ==============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="未登录")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user

# ==============================
# Pydantic 模型
# ==============================
class RegisterForm(BaseModel):
    phone: str
    password: str
    username: str


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

# ==============================
# 认证接口
# ==============================
@app.post("/api/register")
def register(data: RegisterForm, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="手机号已注册")

    user = User(
        phone=data.phone,
        username=data.username,
        password_hash=pwd_context.hash(data.password),
        role="user",
    )
    db.add(user)
    db.commit()

    token = create_token(user.phone, user.role)
    return {"token": token, "role": user.role, "user": user.username}


@app.post("/api/login")
def login(data: LoginForm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="账号或密码错误")

    token = create_token(user.phone, user.role)
    return {"token": token, "role": user.role, "user": user.username}


@app.get("/api/user/profile")
def profile(user: User = Depends(get_current_user)):
    return {
        "phone": user.phone,
        "username": user.username,
        "role": user.role,
    }

# ==============================
# 订单接口
# ==============================
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

    for item in data.items:
        db.add(
            OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                name=item.name,
                price=item.price,
                qty=item.qty,
                image=item.image,
            )
        )

    db.commit()
    return {"id": order.id, "status": "paid"}


@app.get("/api/orders")
def list_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role == "admin":
        orders = db.query(Order).all()
    else:
        orders = db.query(Order).filter(Order.user_phone == user.phone).all()

    return [
        {
            "id": o.id,
            "total_amount": o.total_amount,
            "created_at": o.created_at,
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


@app.get("/api/admin/orders")
def admin_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    orders = db.query(Order).all()
    return [
        {
            "id": o.id,
            "user_phone": o.user_phone,
            "total_amount": o.total_amount,
            "created_at": o.created_at,
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
