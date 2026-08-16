from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.message import Message
from schemas.message import MessageCreate

router = APIRouter()


@router.post("/send")
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db)
):

    new_message = Message(
        sender_id=message.sender_id,
        receiver_id=message.receiver_id,
        message=message.message
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "message": "Message Sent Successfully",
        "data": new_message
    }


@router.get("/")
def get_all_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).all()
    return messages

@router.get("/{user_id}")
def get_user_messages(
    user_id: int,
    db: Session = Depends(get_db)
):

    messages = db.query(Message).filter(
        (Message.sender_id == user_id) |
        (Message.receiver_id == user_id)
    ).all()

    return messages
@router.put("/read/{message_id}")
def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = db.query(Message).filter(
        Message.id == message_id
    ).first()

    if not message:
        return {
            "message": "Message Not Found"
        }

    message.is_read = True

    db.commit()

    db.refresh(message)

    return {
        "message": "Message Marked As Read",
        "data": message
    }
@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = db.query(Message).filter(
        Message.id == message_id
    ).first()

    if not message:
        return {
            "message": "Message Not Found"
        }

    db.delete(message)

    db.commit()

    return {
        "message": "Message Deleted Successfully"
    }
