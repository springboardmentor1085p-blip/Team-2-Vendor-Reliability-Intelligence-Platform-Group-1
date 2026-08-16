from fastapi import APIRouter

router=APIRouter(prefix="/preferences")

data={
    "email":True,
    "push":True,
    "sms":False
}

@router.get("/")
def get_preferences():
    return data

@router.put("/")
def update_preferences(pref:dict):
    global data
    data=pref
    return {
        "message":"Preferences Updated",
        "data":data
    }