from fastapi import FastAPI
from database.database import Base, engine
from api.messaging import router as messaging_router
from models.user import User
from models.message import Message
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.notifications import router as notification_router
from services.websocket import manager
from api.analytics import router as analytics_router
from routes.purchase_orders import router as purchase_order_router
from models.procurement import Procurement
from routes.procurements import router as procurement_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Procurement Messaging API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analytics_router)
app.include_router(notification_router)
app.include_router(purchase_order_router)
app.include_router(procurement_router)
app.include_router(
    messaging_router,
    prefix="/messages",
    tags=["Messaging"]
)


@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:

            data = await websocket.receive_text()

            await manager.broadcast(data)

    except WebSocketDisconnect:

        manager.disconnect(websocket)