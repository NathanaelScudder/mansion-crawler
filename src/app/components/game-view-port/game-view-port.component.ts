import { Component } from '@angular/core';
import { GameStateService } from 'src/app/services/game-state.service';

@Component({
  selector: 'app-game-view-port',
  templateUrl: './game-view-port.component.html',
  styleUrls: ['./game-view-port.component.css']
})
export class GameViewPortComponent {
  constructor() {
  }

  ngOnInit(): void{
  }

  /**
   * Retrieve the current game text, for display in the view port.
   */
  get getGameText():string
  {
    return GameStateService.gameText;
  }
}
