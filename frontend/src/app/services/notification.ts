import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn:'root'
})
export class NotificationService{


private api =
'http://127.0.0.1:8000/notifications';


constructor(
private http:HttpClient
){}



getAllNotifications(){

return this.http.get<any[]>(
this.api + "/"
);

}



markAsRead(id:number){

return this.http.put(
`${this.api}/${id}/read`,
{}
);

}


}