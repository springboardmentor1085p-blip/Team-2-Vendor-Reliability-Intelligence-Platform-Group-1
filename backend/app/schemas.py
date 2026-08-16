from pydantic import BaseModel
from datetime import date
from datetime import datetime

class PurchaseOrderCreate(BaseModel):
    vendor_name: str
    target_date: date
    status: str

class NotificationCreate(BaseModel):
    user_id: int
    purchase_order_id: int
    title: str
    message: str
    
class NotificationPreferenceCreate(BaseModel):
    user_id: int
    email_notifications: bool
    system_notifications: bool

class ContractCreate(BaseModel):
    vendor_name: str
    expiry_date: date

class TrendPoint(BaseModel): 
    month: str 
    total_orders: int 
    delivered_orders: int

class AuditLogResponse(BaseModel): 
    id: int 
    purchase_order_id: int 
    action: str 
    old_status: str | None = None 
    new_status: str 
    changed_by: str 
    changed_at: datetime