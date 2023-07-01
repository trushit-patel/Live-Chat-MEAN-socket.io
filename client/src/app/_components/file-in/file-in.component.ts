import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-file-in',
  templateUrl: './file-in.component.html',
  styleUrls: ['./file-in.component.css']
})
export class FileInComponent {

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  readFile(event: any) {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const buffer = reader.result;
      console.log(buffer);
    };
  }
}
