import { Component } from '@angular/core';
import { AudioServiceService } from 'src/app/_services/audio-service.service';

@Component({
  selector: 'app-audio-in',
  templateUrl: './audio-in.component.html',
  styleUrls: ['./audio-in.component.css']
})
export class AudioInComponent {

  constructor(private audioService: AudioServiceService) {}

  public startRecording() {
    this.audioService.startRecording();
  }

  public stopRecording() {
    const audioFile = this.audioService.stopRecording();
    console.log(audioFile);
  }

}
