import { Component, OnInit, Query } from '@angular/core';
import { PredictionEvent } from '../data/prediction-event';
import { ControlEvent } from '../data/control-event';
import { GameStateService } from '../services/game-state.service';
import { EnableEvent } from '../data/enable-event';
import { GestureService } from '../services/gesture-service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  hasEnabledHandInteractions:boolean = false; // To hold whether hand interactions have been enabled
  constructor() { }

  ngOnInit(): void {
  }

  // Getter for whether the game has begun (used to enable the buttons)
  get hasStartedGame():boolean
  {
    return GameStateService.getHasStartedGame();
  }

  // Receiver for enable hand interaction events
  setHandInteractions(event: EnableEvent):void
  {
    this.hasEnabledHandInteractions = event.getIsEnabled();
  }

  // Receiver for hand gesture prediction events
  prediction(event: PredictionEvent):void 
  {
    GameStateService.processAction(GestureService.getGestureAction(event));
  }

  // Receiver for button action events
  invokeAction(event: ControlEvent):void
  {
    GameStateService.processAction(event.getAction());
  }

}
