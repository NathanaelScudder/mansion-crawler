import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ControlEvent } from 'src/app/data/control-event';

@Component({
  selector: 'app-button-controller',
  templateUrl: './button-controller.component.html',
  styleUrls: ['./button-controller.component.css']
})
export class ButtonControllerComponent {
  @Output() onControl = new EventEmitter<ControlEvent>();
  @Input() hasHandInteractionsEnabled:boolean = false; // Take in as input whether hand interactions are enabled
  @Input() hasStartedGame:boolean = false; // Take in as input whether the game has been started
  
  constructor() {
  }

  ngOnInit(): void{
  }

  /**
   * Emit the action associated with the given button number
   * @param action The number associated with the button pressed.
   */
  invokeAction(action:number)
  {
    this.onControl.emit(new ControlEvent(action));
  }
}
