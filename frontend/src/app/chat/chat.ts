import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat';
import { ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {

  messages: any[] = [];
  newMessage = '';

  socket!: WebSocket;
constructor(
  private chatService: ChatService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {

    this.loadMessages();

    this.socket = new WebSocket("ws://127.0.0.1:8000/ws");

    this.socket.onmessage = () => {
      this.loadMessages();
    };
    

  }

 loadMessages() {
  this.chatService.getMessages().subscribe({
    next: (response: any) => {
      this.messages = response;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
    }
  });
}

  sendMessage() {

    if (!this.newMessage.trim()) {
      return;
    }

    const data = {
      sender_id: 1,
      receiver_id: 2,
      message: this.newMessage
    };

    this.chatService.sendMessage(data).subscribe({
      next: () => {

  this.messages.push({
    sender_id: 1,
    receiver_id: 2,
    message: this.newMessage
  });

  this.socket.send(this.newMessage);

  this.newMessage = '';

},
      error: (err) => {
        console.error(err);
      }
    });

  }

}