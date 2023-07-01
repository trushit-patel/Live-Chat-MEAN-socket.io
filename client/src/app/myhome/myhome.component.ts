
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { Router } from '@angular/router';
import { UserService, AuthenticationService } from "./../_services";
import { Socket } from "socket.io-client";
import { ChatService } from "../_services/chat.service";
import { StatusService } from "../_services/status.service";

@Component({
  selector: 'app-myhome',
  templateUrl: './myhome.component.html',
  styleUrls: ['./myhome.component.css']
})
export class MyhomeComponent implements OnInit, OnDestroy {

  currentUser: any;
  currentUserSubscription: Subscription;
  users: any;
  allUsers: any;
  socket: any;
  recieverUsername: any;
  chatHistoryLoaded = new Map();
  // chatHistory: any;

  constructor(private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private chatService: ChatService,
    private statusService: StatusService,
    private renderer: Renderer2,
    private elementRef: ElementRef) {

    this.currentUserSubscription = this.authenticationService.currentUser.subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser) {
        if (this.authenticationService.socket) this.socket = this.authenticationService.socket;
        else {
          this.authenticationService.createSocket(this.currentUser);
          this.socket = this.authenticationService.socket;
        }
      }
    });

    this.socket.on('404', (data) => {
      console.log(data);
    });

    this.socket.on('client-msg', (data) => {
      this.appendMsg(true, data, false, data.sender);
      if (data.sender != this.recieverUsername) {
        this.increaseMsgCount(data.sender);
      }
      this.updateLastMessage({ message: data.message, timestamp: Date.now() }, false, data.sender);
      this.prependDiv(data.sender);
    });

    this.socket.on('file', (data) => {
      // file: {payload: buffer, mimeType: file.type , fileName: file.name}
      if (data.sender != this.recieverUsername) {
        this.increaseMsgCount(data.sender);
      }
      // const link = this.generateBlobLink(data.file);
      //message : {sender: string, recipient: string, timestamp: Date, message: object} <-- MESSAGE CAN BE STRING OR FILE BUFFER
      this.appendMsg(false, { sender: data.sender, reciever: this.recieverUsername, timestamp: data.timestamp, message: data.file }, false, data.sender);
      this.updateLastMessage({ message: "sent a file", timestamp: Date.now() }, false, data.sender);
      this.prependDiv(data.sender);
    });

    this.socket.on('user-status-change', (data) => {
      try {
        const statusElement = this.elementRef.nativeElement.querySelector(`#${data.user.username}-status`);
        this.renderer.setStyle(statusElement, 'color', data.online ? 'chartreuse' : 'red');
      } catch (err) { }
    });

  }

  ngOnInit() {
    this.loadAllUsers();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  confirmDelete(): void {
    if (confirm('Are you sure you want to delete you account?')) {
      this.deleteUser(this.currentUser._id);
    }
  }

  startChat(username: string) {
    this.recieverUsername = username;
    if (!this.chatHistoryLoaded.get(this.recieverUsername)) {
      this.loadChatHistory();
      this.chatHistoryLoaded.set(this.recieverUsername, true);
    }
    let counterEl = this.elementRef.nativeElement.querySelector(`#msg-count-${username}`);
    counterEl.innerText = "";
  }

  sendMessage() {
    const textInput = this.elementRef.nativeElement.querySelector(`#text-input-${this.recieverUsername}`);
    if (textInput.value != "") {
      this.socket.emit('client-msg', { message: String(textInput.value), reciever: String(this.recieverUsername), timestamp: Date.now() });
      this.appendMsg(true, { sender: this.currentUser.username, reciever: this.recieverUsername, timestamp: Date.now(), message: textInput.value }, true, this.recieverUsername);
      this.updateLastMessage({ message: textInput.value, timestamp: Date.now() }, true, this.recieverUsername);
      textInput.value = "";
    }
  }

  readFile(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const fileObj = { payload: buffer, mimeType: file.type, fileName: file.name }
      this.socket.emit('file', { file: fileObj, reciever: String(this.recieverUsername), timestamp: Date.now() });

      // const link = this.generateBlobLink(fileObj);
      this.appendMsg(false, { sender: this.currentUser.username, reciever: this.recieverUsername, timestamp: Date.now(), message: fileObj }, true, this.recieverUsername);
      this.updateLastMessage({ message: "sent a file", timestamp: Date.now() }, true, this.recieverUsername);
    };
  }

  private deleteUser(id: number) {
    this.userService
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.users = this.users.filter((user) => user._id !== id);
      });
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  private loadChatHistory() {
    this.chatService.getChats(String(this.recieverUsername)).subscribe((response) => {
      response.chats.forEach((ch) => {
        this.appendMsg(true, ch, ch.sender == this.currentUser.username, this.recieverUsername);
      });
    })
  }

  async getLastChat(username: string) {
    this.chatService.getLastChat(String(username)).subscribe((response) => {
      if (response.chats.at(-1)) this.updateLastMessage(response.chats.at(-1),
        response.chats.at(-1).sender == this.currentUser.username,
        username);
    });
  }

  // private loadAllUsers() {
  //   this.userService
  //     .getAllUsersExceptOne()
  //     .pipe(first())
  //     .subscribe((users) => {
  //       this.allUsers = users;
  //     });
  // }

  private loadAllUsers() {
    this.statusService
      .getUserWithStatusExceptMe()
      .pipe(first())
      .subscribe((users) => {
        this.allUsers = new Set(Object.values(users));
      });
  }

  private updateLastMessage(chatObj: any, myMsg: boolean, username) {
    this.elementRef.nativeElement.querySelector(`#last-msg-${String(username)}`).innerText = myMsg ? `you: ${String(chatObj.message).trim()}` : String(chatObj.message).trim();
    this.elementRef.nativeElement.querySelector(`#last-msg-time-${String(username)}`).innerText = this.getTime(chatObj.timestamp);
  }

  private appendText(chatBubble, text: String) {
    this.renderer.appendChild(chatBubble, this.renderer.createText(text.trim()));
  }

  private increaseMsgCount(username: string) {
    let counterEl = this.elementRef.nativeElement.querySelector(`#msg-count-${username}`);
    if (counterEl.innerText == "") {
      counterEl.innerText = 1;
    } else {
      counterEl.innerText = parseInt(counterEl.innerText) + 1;
    }
  }

  private getTime(dateTime) {
    const dateObj = new Date(dateTime);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private appendMsg(isText: boolean, message: any, myMsg: boolean, username) {
    //message : {sender: string, recipient: string, timestamp: Date, message: object} <-- MESSAGE CAN BE STRING OR FILE BUFFER

    const mainDiv = this.renderer.createElement('div');
    this.renderer.addClass(mainDiv, 'row');
    this.renderer.addClass(mainDiv, 'no-gutters');

    const childDiv = this.renderer.createElement('div');
    this.renderer.addClass(childDiv, 'col-md-10');

    const chatBubble = this.renderer.createElement('div');
    this.renderer.addClass(chatBubble, 'chat-bubble');

    const timeStamp = this.renderer.createElement('div');
    this.renderer.addClass(timeStamp, 'timestamp');
    this.renderer.appendChild(timeStamp, this.renderer.createText(this.getTime(message.timestamp)));

    if (myMsg) {
      this.renderer.addClass(mainDiv, 'd-flex');
      this.renderer.addClass(mainDiv, 'justify-content-end');
      this.renderer.addClass(chatBubble, 'chat-bubble--right');
      this.renderer.addClass(timeStamp, 'right');
    }
    else {
      this.renderer.addClass(chatBubble, 'chat-bubble--left');
      this.renderer.addClass(timeStamp, 'left');
    }
    // this.renderer.appendChild(chatBubble, this.renderer.createText(text.trim()));

    if (isText) this.appendText(chatBubble, String(message.message));
    else this.appendFile(chatBubble, message.message);

    this.renderer.appendChild(childDiv, chatBubble);
    this.renderer.appendChild(childDiv, timeStamp);
    this.renderer.appendChild(mainDiv, childDiv);

    const chatCanavs = this.elementRef.nativeElement.querySelector(`#canvas-${username}`);
    this.renderer.appendChild(this.elementRef.nativeElement.querySelector(`#canvas-${username}`), mainDiv);
    chatCanavs.scrollTop = chatCanavs.scrollHeight - chatCanavs.clientHeight;
  }

  private appendFile(chatBubble: any, fileObj: any) {

    let fileElement = null;

    if (fileObj.mimeType.startsWith('image/')) {

      fileElement = this.generateBlobImg(fileObj);
      this.renderer.setStyle(fileElement, 'min-width', '200px');
      this.renderer.setStyle(fileElement, 'max-width', '509px');
      this.renderer.setStyle(fileElement, 'max-height', '100%');
      this.renderer.setStyle(fileElement, 'border-radius', '12px');

    } else {
      fileElement = this.generateBlobLink(fileObj);

      const downloadIcon = this.renderer.createElement('span');
      this.renderer.addClass(downloadIcon, 'material-symbols-outlined');
      this.renderer.setProperty(downloadIcon, 'textContent', 'download');
      this.renderer.setStyle(downloadIcon, 'border-radius', '50%');
      this.renderer.setStyle(downloadIcon, 'background', 'white');
      this.renderer.setStyle(downloadIcon, 'padding', '6px');
      // this.renderer.setStyle(downloadIcon, 'margin-right', '9px');
      // this.renderer.setStyle(downloadIcon, 'margin-left', '-8px');
      this.renderer.setStyle(downloadIcon, 'margin-right', '-8px');
      this.renderer.setStyle(downloadIcon, 'margin-left', '4px');

      this.renderer.appendChild(fileElement, downloadIcon);

      const fileNameSpan = this.renderer.createElement('span');
      this.renderer.setProperty(fileNameSpan, 'textContent', fileObj.fileName);

      this.renderer.setStyle(chatBubble, 'display', 'flex');
      this.renderer.setStyle(chatBubble, 'height', '46px');
      this.renderer.setStyle(chatBubble, 'align-items', 'center');
      this.renderer.appendChild(chatBubble, fileNameSpan);
    }


    this.renderer.appendChild(chatBubble, fileElement);
  }

  private generateBlobLink(file: any) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([new Uint8Array(file.payload)], { type: file.mimeType }));
    link.download = file.fileName;
    return link;
  }

  private generateBlobImg(file: any) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(new Blob([new Uint8Array(file.payload)], { type: file.mimeType }));
    img.alt = file.fileName;
    return img;
  }

  private prependDiv(username: string) {
    const allUserDrawers = this.elementRef.nativeElement.querySelector(`#allUserDrawers`);
    const divToMove = this.elementRef.nativeElement.querySelector(`#${username}-drawer`);

    if (allUserDrawers && divToMove) {
      allUserDrawers.prepend(divToMove);
    }
  }

}
