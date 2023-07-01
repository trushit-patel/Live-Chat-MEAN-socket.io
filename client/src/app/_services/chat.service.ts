import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from './../myConfig'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  // getChats(recieverUsername: string): Observable<Chat[]> {
  //   return this.http.get<ChatResponse>(`${config.baseApiUrl}/chats/${recieverUsername}`)
  //     .pipe(
  //       map(response => response.chats)
  //     );
  // }

    getChats(receiverUsername: string): Observable<ChatResponse> {
      return this.http.get<ChatResponse>(`${config.baseApiUrl}/chats/${receiverUsername}`);
    }

    getLastChat(receiverUsername: string): Observable<ChatResponse> {
      return this.http.get<ChatResponse>(`${config.baseApiUrl}/chats/${receiverUsername}`);
    }

  }

  interface ChatResponse {
    success: boolean;
    chats: Chat[];
  }

  interface Chat {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
    __v: number;
  }
