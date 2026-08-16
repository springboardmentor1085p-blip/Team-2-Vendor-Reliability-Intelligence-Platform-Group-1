import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.css'
})
export class NotificationCenter implements OnInit {


  notifications:any[]=[];

  lastNotificationId:number = 0;


  constructor(
    private notificationService:NotificationService,
    private router:Router,
    private cdr:ChangeDetectorRef
  ){}



  ngOnInit():void{


    if("Notification" in window){

      Notification.requestPermission();

    }


    // Load existing notifications first

    this.notificationService
    .getAllNotifications()
    .subscribe({

      next:(data:any[])=>{

        data.sort((a,b)=>b.id-a.id);

        this.notifications=data;


        // Ignore old notifications

        this.notificationService.getAllNotifications().subscribe(data => {

  if (data.length > 0) {
    this.lastNotificationId = data[0].id;
  }

  this.loadNotifications();

});


        this.cdr.detectChanges();

      }

    });



    // Check new notifications every 5 seconds

    interval(5000).subscribe(()=>{

      this.loadNotifications();

    });


  }





  loadNotifications(){


    this.notificationService
    .getAllNotifications()
    .subscribe({

      next:(data:any[])=>{


        data.sort((a,b)=>b.id-a.id);


        this.notifications=data;



        if(data.length>0){


          let latest=data[0];



          if(latest.id > this.lastNotificationId){


            this.lastNotificationId=latest.id;



            if(Notification.permission==="granted"){


              new Notification(
                latest.title,
                {
                  body:latest.message
                }
              );


            }


          }


        }



        this.cdr.detectChanges();


      },

      error:(err)=>{

        console.log(err);

      }


    });


  }





openOrder(notification: any): void { console.log('Clicked Notification =', notification); this.notificationService .markAsRead(notification.id) .subscribe(() => { this.loadNotifications(); }); if (notification.purchase_order_id) { this.router.navigate([ '/purchase-order', notification.purchase_order_id ]); } else { alert('No Purchase Order linked'); } }



  viewAllNotifications(){


    this.router.navigate([

      '/all-notifications'

    ]);


  }




  get unreadCount(){


    return this.notifications.filter(

      x=>!x.is_read

    ).length;


  }



}