import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { Router } from '@angular/router';
import { User } from "../_models";
import { UserService, AuthenticationService } from "../_services";
import { Socket } from "socket.io-client";

@Component({
  templateUrl: "home.component.html",
  styleUrls: ["home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: any;
  currentUserSubscription: Subscription;
  users: any;

  socket: any;
  recieverUsername: any;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.currentUserSubscription =
      this.authenticationService.currentUser.subscribe((user) => {
        this.currentUser = user;

        if (this.currentUser) {
          if(this.authenticationService.socket){
            this.socket = this.authenticationService.socket;
          }else{
            this.authenticationService.createSocket(this.currentUser);
            this.socket = this.authenticationService.socket;
          }
        }

      });

      this.socket.on('404',(data) =>{
        console.log(data);
      });

      this.socket.on('client-msg',(data) =>{
        this.appendMsg(data.message,true,data.sender);
      });

      this.socket.on('updated-user-list',(data) =>{
        this.users = data;
      });
  }

  ngOnInit() {
    // this.loadAllUsers();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  deleteUser(id: number) {
    this.userService
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.users = this.users.filter((user) => user._id !== id);
      });
      this.authenticationService.logout();
      this.router.navigate(['/login']);
  }

  sendMessage() {
    const text = this.elementRef.nativeElement.querySelector('#text-msg').value;
    if(text != ""){
      this.socket.emit('client-msg', { message: String(text), reciever: this.recieverUsername });
      this.appendMsg(text,false,this.recieverUsername);
      this.elementRef.nativeElement.querySelector('#text-msg').value = "";
    }
  }

  startChat(username){
    //this.renderer.removeClass(this.elementRef.nativeElement.querySelector(`#outer-${username}`),'no-display');
    // this.elementRef.nativeElement.querySelector(`#outer-${username}`).classList.remove('no-display');
    // document.getElementById(`outer-${username}`).classList.remove('no-display');
    this.recieverUsername = String(username);
    // this.renderer.addClass(this.elementRef.nativeElement.querySelector(`#outer-${this.recieverUsername?.toString()}`),'no-display');
  }

  private appendMsg(text,senderMsg: boolean,username){
    const li = this.renderer.createElement('li');
    this.renderer.addClass(li, 'chat-text');
    if(!senderMsg)this.renderer.addClass(li,'my-text');
    this.renderer.appendChild(li, document.createTextNode(String(text).trim()) );
    this.renderer.appendChild(this.elementRef.nativeElement.querySelector(`#chat-canvas-${username}`), li);
  }

  // private loadAllUsers() {
  //   // this.userService
  //   //   .getAll()
  //   //   .pipe(first())
  //   //   .subscribe((users) => {
  //   //     this.users = users;
  //   //   });

  // }
}
