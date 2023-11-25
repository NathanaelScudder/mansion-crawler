import { Injectable } from '@angular/core';
import { ControlEvent } from '../data/control-event';
import { PredictionEvent } from '../data/prediction-event';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class GestureService {

  constructor() { }

  /**
   * Determine and return the action associated with the given gesture.
   * @param gesture The gesture to determine the action for.
   * @returns The action assocaited with the given gesture.
   */
  public static getGestureAction(gesture: PredictionEvent):ControlEvent.Action
  {
    let gestureString:string = gesture.getPrediction(); // Get the string representation of the gesture

    // If the game has not started, and the specified gesture is not to start the game, return a NO_ACTION
    if((!GameStateService.getHasStartedGame()) && (gestureString != PredictionEvent.GESTURE_OPEN_AND_CLOSED_HANDS))
    {
        return ControlEvent.Action.NO_ACTION;
    }
    // Else if the game has not started, and the gesture IS to start the game, return a START_GAME action
    else if((!GameStateService.getHasStartedGame()) && (gestureString == PredictionEvent.GESTURE_OPEN_AND_CLOSED_HANDS))
    {
        return ControlEvent.Action.START_GAME;
    }

    // Otherwise, simply map the action according to the gesture, then return it
    var action:ControlEvent.Action = ControlEvent.Action.NO_ACTION;

    switch(gestureString)
    {
      case PredictionEvent.GESTURE_OPEN_AND_CLOSED_HANDS:
        action = ControlEvent.Action.RESTART_GAME;
        break;
      case PredictionEvent.GESTURE_OPEN_HAND:
        action = ControlEvent.Action.TURN_LEFT;
        break;
      case PredictionEvent.GESTURE_CLOSED_HAND:
        action = ControlEvent.Action.TURN_RIGHT;
        break;
      case PredictionEvent.GESTURE_TWO_CLOSED_HANDS:
      case PredictionEvent.GESTURE_TWO_OPEN_HANDS:
        action = ControlEvent.Action.TURN_AROUND;
        break;
      case PredictionEvent.GESTURE_POINTING_AND_CLOSED:
        action = ControlEvent.Action.PICK_UP_ITEM;
        break;
      case PredictionEvent.GESTURE_POINTING_AND_OPEN:
        action = ControlEvent.Action.SEARCH_ROOM;
        break;
      case PredictionEvent.GESTURE_POINTING_HAND:
        action = ControlEvent.Action.MOVE_FORWARD;
        break;
      case PredictionEvent.GESTURE_NONE:
      default:
        break;
    }

    return action;  
  }

}
