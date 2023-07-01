import { Injectable } from '@angular/core';
// import { io } from 'socket.io-client';
import RecordRTC from 'recordrtc';

@Injectable({
  providedIn: 'root'
})
export class AudioServiceService {

  // private socket: any;
  private recorder: RecordRTC;

  constructor() { }

  public startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // getUserMedia is supported
      console.log("supported media devices");
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.recorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm'
        });
        this.recorder.startRecording();
      }).catch((error) => {
        console.log(error);
      });
    } else {
      // getUserMedia is not supported
      console.log("not supported media devices");
    }

  }

  public stopRecording() {
    this.recorder.stopRecording((audioURL) => {
      return this.recorder.getBlob();
    });
  }
}
