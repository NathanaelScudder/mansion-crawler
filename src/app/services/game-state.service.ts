import { Injectable } from '@angular/core';
import { ControlEvent } from '../data/control-event';
import { Item } from '../data/item';
import { Location } from '../data/location';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private static gameBoard:Location[][]; // To hold the Locations that make up the game board
  private static userPositionX:number; // The user's current X position on the board
  private static userPositionY:number; // The user's current Y position on the board
  public static gameText:string = `<h5>Press Start to play</h5>`; // The text currently being displayed to the game-view-port
  private static currentFacing:GameStateService.Facing; // The current facing of the user
  private static hasStartedGame:boolean = false; // Whether the game has been started

  // Constants for setting up the board
  private static FRONT_DOOR_Y:number = 3;
  private static FRONT_DOOR_X:number = 2;
  private static STARTING_Y:number = 0;
  private static STARTING_X:number = 2;
  private static MAP_LENGTH:number = 3;
  private static MAP_WIDTH:number = 5;

  // Debugging constant
  private static IS_CHEATING:boolean = false;

  // Constants for setting up the items
  private static SEARCHABLE_AREAS:any;
  private static MAXIMUM_NUMBER_OF_SEARCHABLE_AREAS:number = 9;
  private static ITEMS:Item.ItemType[];

  private static lootedItems:any; // To hold whether each specified item has been found or not

  constructor() { }

  /**
   * Getter for GameStateService.hasStartedGame.
   * @returns Whether the game has been started.
   */
  public static getHasStartedGame():boolean
  {
    return GameStateService.hasStartedGame;
  }

  /**
   * Performs a game action, according to the given action command.
   * @param action The action command to perform.
   */
  public static processAction(action:ControlEvent.Action):void
  {
    // Reset the text being displayed
    GameStateService.clearGameText();

    // Determine and execute the given action (if any)
    switch(action)
    {
      case ControlEvent.Action.NO_ACTION:
        GameStateService.updateGameText(`<h5>Could not perform action</h5>`)
        break;
      case ControlEvent.Action.MOVE_FORWARD:
        GameStateService.moveForward();
        break;
      case ControlEvent.Action.TURN_LEFT:
        GameStateService.turnLeft();
        break;
      case ControlEvent.Action.TURN_RIGHT:
        GameStateService.turnRight();
        break;
      case ControlEvent.Action.TURN_AROUND:
        GameStateService.turnAround();
        break;
      case ControlEvent.Action.SEARCH_ROOM:
        GameStateService.searchRoom();
        break;
      case ControlEvent.Action.PICK_UP_ITEM:
        GameStateService.pickupItem();
        break;
      case ControlEvent.Action.START_GAME:
        GameStateService.start();
        break;
      case ControlEvent.Action.RESTART_GAME:
        GameStateService.reset();
        break;
      default:
        console.log(`Invalid Action: ${action}`);
    }

    // Then, update the user as to their current context
    GameStateService.updateContext();
  }

  /**
   * Starts the game by initializing the board and lootables
   */
  private static start():void
  {
    // Set the current position and facing, then start the game with the opening text
    GameStateService.userPositionX = GameStateService.STARTING_X;
    GameStateService.userPositionY = GameStateService.STARTING_Y;
    GameStateService.currentFacing = GameStateService.Facing.SOUTH;
    GameStateService.hasStartedGame = true;

    GameStateService.clearGameText();
    GameStateService.updateGameText(
      `
      <p>You awake to find yourself in a dark room, illuminated slightly by moonlight from a nearby window.</p>
      <h5>Use the controls to find a way to leave the mansion!</h5>
      <h1>Welcome to Mansion Crawler</h1>
      `
    );
    
    // Initialize the board and lootables
    GameStateService.initBoard();
    GameStateService.initLootables();
    
    if(GameStateService.IS_CHEATING)
    {
      console.log(GameStateService.gameBoard);
    }
  }

  /**
   * Turns the current facing of the user to the left.
   */
  private static turnLeft():void
  {
    // Get the current facing, then set the facing to the left of its current position
    let facing:GameStateService.Facing = GameStateService.currentFacing;
    
    switch(facing)
    {
      case GameStateService.Facing.NORTH:
        GameStateService.currentFacing = GameStateService.Facing.WEST;
        break;
      case GameStateService.Facing.WEST:
        GameStateService.currentFacing = GameStateService.Facing.SOUTH;
        break;
      case GameStateService.Facing.EAST:
        GameStateService.currentFacing = GameStateService.Facing.NORTH;
        break;
      case GameStateService.Facing.SOUTH:
        GameStateService.currentFacing = GameStateService.Facing.EAST;
        break;
      default:
        console.log(`Invalid Current Facing: ${facing}`);
        return;
    }

    GameStateService.updateGameText(`<h3>YOU TURNED LEFT</h3>`);
  }

  /**
   * Turns the current facing of the user to the right.
   */
  private static turnRight():void
  {
    // Get the current facing, then set the facing to the right of its current position
    let facing:GameStateService.Facing = GameStateService.currentFacing;

    switch(facing)
    {
      case GameStateService.Facing.NORTH:
        GameStateService.currentFacing = GameStateService.Facing.EAST;
        break;
      case GameStateService.Facing.WEST:
        GameStateService.currentFacing = GameStateService.Facing.NORTH;
        break;
      case GameStateService.Facing.EAST:
        GameStateService.currentFacing = GameStateService.Facing.SOUTH;
        break;
      case GameStateService.Facing.SOUTH:
        GameStateService.currentFacing = GameStateService.Facing.WEST;
        break;
      default:
        console.log(`Invalid Current Facing: ${facing}`);
        return;
    }

    GameStateService.updateGameText(`<h3>YOU TURNED RIGHT</h3>`);
  }

  /**
   * Turns the current facing of the user around.
   */
  private static turnAround():void
  {
    // Get the current facing, then set the facing to its opposite direction
    let facing:GameStateService.Facing = GameStateService.currentFacing;

    switch(facing)
    {
      case GameStateService.Facing.NORTH:
        GameStateService.currentFacing = GameStateService.Facing.SOUTH;
        break;
      case GameStateService.Facing.WEST:
        GameStateService.currentFacing = GameStateService.Facing.EAST;
        break;
      case GameStateService.Facing.EAST:
        GameStateService.currentFacing = GameStateService.Facing.WEST;
        break;
      case GameStateService.Facing.SOUTH:
        GameStateService.currentFacing = GameStateService.Facing.NORTH;
        break;
      default:
        console.log(`Invalid Current Facing: ${facing}`);
        return;
    }

    GameStateService.updateGameText(`<h3>YOU TURNED AROUND</h3>`);
  }

  /**
   * Performs the Search Room action, according to the user's current position. Reveals an item to be picked up (if any in the room)
   */
  private static searchRoom():void
  {
    GameStateService.updateGameText(`<h3>YOU SEARCHED THE ROOM</h3>`);

    // Get the location and whether the room has been searched already
    let currentLocation:Location = GameStateService.getCurrentLocation();
    let hasNotBeenPreviouslySearched:boolean = currentLocation.search();

    // If there is nothing to search the room, state as much
    if(!currentLocation.hasSearchableArea())
    {
      GameStateService.updateGameText(`<p>You do not see anything in the room to search.</p>`);
    }
    // Else if the room has not been previously searched, and does not contain an item, state as much
    else if(hasNotBeenPreviouslySearched && (!currentLocation.hasItem()))
    {
      GameStateService.updateGameText(`<p>You searched the ${currentLocation.getSearchableLabel()}, but found nothing.</p>`);
    }
    // Else if the room has been previously searched, and does not contains an item, state as much
    else if((!hasNotBeenPreviouslySearched) && (!currentLocation.hasItem()))
    {
      GameStateService.updateGameText(`<p>You searched the ${currentLocation.getSearchableLabel()} again, but still found nothing.</p>`);
    }
    // Else if the room has not been previously searched, and contains an item, state as much
    // This allows the item to be picked up on subsequent Pick Up Item actions
    else if(hasNotBeenPreviouslySearched && currentLocation.hasItem())
    {
      GameStateService.updateGameText(`<p>You searched the ${currentLocation.getSearchableLabel()}.<br> 
                                        You found a ${GameStateService.getItemTypeString(currentLocation.getItem())}.</p>`);
    }
    // Else if the room has been previously searched, and contains a already found item, state as much
    else if((!hasNotBeenPreviouslySearched) && currentLocation.hasItem() && (!currentLocation.getHasBeenLooted()))
    {
      GameStateService.updateGameText(`<p>You searched the ${currentLocation.getSearchableLabel()}.<br> 
                                        This is where you found the ${GameStateService.getItemTypeString(currentLocation.getItem())}.</p>`);
    }
    // Else if the room has been previously searched, and contains a already found and looted item, state as much
    else if((!hasNotBeenPreviouslySearched) && currentLocation.hasItem() && currentLocation.getHasBeenLooted())
    {
      GameStateService.updateGameText(`<p>You searched the ${currentLocation.getSearchableLabel()}.<br> 
                                        This is where you picked up the ${GameStateService.getItemTypeString(currentLocation.getItem())}.</p>`);
    }
  }

  /**
   * Performs the Pick Up Item action, according to the user's current position.
   */
  private static pickupItem():void
  {
    GameStateService.updateGameText(`<h3>YOU PICKED UP AN ITEM</h3>`);

    // Get the current location
    let currentLocation:Location = GameStateService.getCurrentLocation();

    // If there is no searchable location in this room, state as much
    if(!currentLocation.hasSearchableArea())
    {
      GameStateService.updateGameText(`<p>There is nothing in this room.</p>`);
    }
    // Else if the room has not been searched, state that as a requirement to pick up an item
    else if(!currentLocation.getHasBeenSearched())
    {
      GameStateService.updateGameText(`<p>You have to at least search the room first, before there is an item to pick up.</p>`);
    }
    // Else if the current location has no item, state as much
    else if(!currentLocation.hasItem())
    {
      GameStateService.updateGameText(`<p>There is no item in this room to pick up.</p>`);
    }
    // Else if the current location has already been looted, state as much
    else if(currentLocation.getHasBeenLooted())
    {
      GameStateService.updateGameText(`<p>You have already picked up the ${GameStateService.getItemTypeString(currentLocation.getItem())} in this room.</p>`);
    }
    // Otherwise, loot the current location and add the item to the user's looted items
    else
    {
      let lootedItem:Item.ItemType = currentLocation.loot();
      GameStateService.lootedItems[lootedItem] = true;

      if(GameStateService.IS_CHEATING)
      {
        console.log(GameStateService.lootedItems);
      }

      GameStateService.updateGameText(`<p>You picked up the ${GameStateService.getItemTypeString(currentLocation.getItem())}.</p>`);
    }
  }

  /**
   * Moves the user forward on the game board in their currently facing direction
   */
  private static moveForward():void
  {
    GameStateService.updateGameText(`<h3>YOU MOVED FORWARD</h3>`);
    GameStateService.moveTo(GameStateService.getForwardXPos(), GameStateService.getForwardYPos());
  }

  /**
   * Restarts the game upon confirmation from a popup
   */
  private static reset()
  {
    if(confirm("Are you sure you wish to reset the game? This cannot be undone!"))
    {
      GameStateService.start();
    }
  }

  /**
   * Initializes the game board's locations and placements
   */
  private static initBoard()
  {
    // Setup locations for each of the map's 13 locations, and 2 blockers
    let louge:Location = new Location(Location.LocationType.Louge);
    let grandHall:Location = new Location(Location.LocationType['Grand Hall']);
    let foyer:Location = new Location(Location.LocationType.Foyer);
    let diningRoom:Location = new Location(Location.LocationType['Dining Room']);
    let kitchen:Location = new Location(Location.LocationType.Kitchen);
    let supplyRoom:Location = new Location(Location.LocationType['Supply Room']);
    let staffQuarters:Location = new Location(Location.LocationType['Staff Quarters']);
    let westWingHallway:Location = new Location(Location.LocationType['West Wing Hallway']);
    let eastWingHallway:Location = new Location(Location.LocationType['East Wing Hallway']);
    let guestLodging:Location = new Location(Location.LocationType['Guest Lodging']);
    let study:Location = new Location(Location.LocationType.Study);
    let masterBedroom:Location = new Location(Location.LocationType['Master Bedroom']);
    let ballroom:Location = new Location(Location.LocationType.Ballroom);
    let blocker:Location = new Location(Location.LocationType.BLOCKED);

    // Arrange the board
    GameStateService.gameBoard =
      [
        [kitchen, diningRoom, louge, study, masterBedroom],
        [supplyRoom, blocker, grandHall, blocker, ballroom],
        [staffQuarters, westWingHallway, foyer, eastWingHallway, guestLodging]
      ];
    
    // Set the starting location as having been visited
    GameStateService.gameBoard[GameStateService.STARTING_Y][GameStateService.STARTING_X].visit();
  }

  /**
   * Initalizes and distributes items on the map
   */
  private static initLootables():void
  {
    // Get the location number for each of the rooms that can hold lootables
    let grandHall:number = Location.LocationType['Grand Hall'];
    let foyer:number = Location.LocationType.Foyer;
    let diningRoom:number = Location.LocationType['Dining Room'];
    let kitchen:number = Location.LocationType.Kitchen;
    let supplyRoom:number = Location.LocationType['Supply Room'];
    let staffQuarters:number = Location.LocationType['Staff Quarters'];
    let westWingHallway:number = Location.LocationType['West Wing Hallway'];
    let eastWingHallway:number = Location.LocationType['East Wing Hallway'];
    let guestLodging:number = Location.LocationType['Guest Lodging'];
    let study:number = Location.LocationType.Study;
    let masterBedroom:number = Location.LocationType['Master Bedroom'];
    let ballroom:number = Location.LocationType.Ballroom;

    // Associate each of the locations with one or more searchable areas
    GameStateService.SEARCHABLE_AREAS = new Object()
    
    GameStateService.SEARCHABLE_AREAS[grandHall] = ["stack of boxes on the floor", "supply cabinet against the wall"];
    GameStateService.SEARCHABLE_AREAS[foyer] = ["mound of assorted items in the corner", "rack full of old coats"];
    GameStateService.SEARCHABLE_AREAS[diningRoom] = ["collection of various items scattered on the table"];
    GameStateService.SEARCHABLE_AREAS[kitchen] = ["stack of food baskets", "couple of old cooking pots", "rack of cupboards"];
    GameStateService.SEARCHABLE_AREAS[supplyRoom] = ["stack of crates against the wall", "myriad set of items scattered on the floor", "series of supply cabinets"];
    GameStateService.SEARCHABLE_AREAS[staffQuarters] = ["drawer near each of the beds", "set of dressers"];
    GameStateService.SEARCHABLE_AREAS[westWingHallway] = ["stack of boxes on the floor", "supply cabinet against the wall"];
    GameStateService.SEARCHABLE_AREAS[eastWingHallway] = ["stack of boxes on the floor", "supply cabinet against the wall"];
    GameStateService.SEARCHABLE_AREAS[guestLodging] = ["drawer near each of the beds", "set of dressers"];
    GameStateService.SEARCHABLE_AREAS[study] = ["mound of assorted items in the corner"];
    GameStateService.SEARCHABLE_AREAS[masterBedroom] = ["wardrobe against the wall", "collection of assorted items on the nightstand"];
    GameStateService.SEARCHABLE_AREAS[ballroom] = ["mound of assorted items in the corner", "costume closet against the wall"];

    // Initalize the items and whether they have been looted
    GameStateService.ITEMS = [Item.ItemType.Flashlight, Item.ItemType.Batterypack, Item.ItemType.Key];
    GameStateService.lootedItems = new Object();

    for(var i = 0; i < GameStateService.ITEMS.length; i++)
    {
      GameStateService.lootedItems[GameStateService.ITEMS[i]] = false;
    }

    // Then distribute them
    GameStateService.distributeItems();
  }

  /**
   * Distributes items to the lootable locations
   */
  private static distributeItems():void
  { 
    // Determine a random number of searchable areas to generate, but at least enough for to fit all items 
    let numberOfSearchableAreasToDistribute:number = GameStateService.getRndInteger(GameStateService.ITEMS.length, GameStateService.MAXIMUM_NUMBER_OF_SEARCHABLE_AREAS);
    var searchableLocations:Array<number[]> = [];
    var randX:number, randY:number;

    // Distribute searchable areas 
    for (var i = 0; i < numberOfSearchableAreasToDistribute; i++)
    {
      // Loop until the current searchable area has been distributed
      while (true)
      {
        // Randomly determine a room
        randX = GameStateService.getRndInteger(0, GameStateService.MAP_WIDTH);
        randY = GameStateService.getRndInteger(0, GameStateService.MAP_LENGTH);
        
        // If the room is valid--
        if(GameStateService.isValidLocation(randX, randY))
        {
          let currentLocation:Location = GameStateService.gameBoard[randY][randX];

          // and does not already have a searchable area, and can contain one, set a searchable area for this location
          if((!currentLocation.hasSearchableArea()) &&
             GameStateService.SEARCHABLE_AREAS[currentLocation.getLocationType()] !== undefined)
          {
            let searchableLabel:string = GameStateService.getSearchableLabelFor(currentLocation);
            currentLocation.addSearchable(searchableLabel, Item.ItemType.NO_ITEM);
            searchableLocations.push([randX, randY]);
            break;
          }
        }
      }
    }
    
    // Distribute the items
    for (var i = 0; i < GameStateService.ITEMS.length; i++)
    {
      // Randomly select one of the rooms that now contain a searchable location
      let selectedSearchableIndex:number = GameStateService.getRndInteger(0, searchableLocations.length);
      let posX:number = searchableLocations[selectedSearchableIndex][0];
      let posY:number = searchableLocations[selectedSearchableIndex][1];

      // Remove that room from future consideration for item distribution
      let index:number = 0;
      searchableLocations = searchableLocations.filter((element) =>{
        return selectedSearchableIndex != index++;
      });

      // Then, add the current item to that searchable location
      let currentLocation:Location = GameStateService.gameBoard[posY][posX];
      currentLocation.addSearchable(currentLocation.getSearchableLabel(), GameStateService.ITEMS[i]);

      if(GameStateService.IS_CHEATING)
      {
        console.log(`Assigned item '${GameStateService.getItemTypeString(GameStateService.ITEMS[i])}' to location '${Location.LocationType[currentLocation.getLocationType()]}'`);
      }
    }
  }

  /**
   * Moves the user to the specified position on the board (if valid).
   * @param posX The X coordinate to move to on the game board.
   * @param posY The Y coordinate to move to on the game board.
   */
  private static moveTo(posX:number, posY:number):void
  {
    // If the user has moved to the front door, resolve that action
    if(posY == GameStateService.FRONT_DOOR_Y && posX == GameStateService.FRONT_DOOR_X)
    {
      GameStateService.resolveFrontDoor();
    }
    // Else if the user has moved to an invalid location, state as much
    else if(!this.isValidLocation(posX, posY))
    {
      GameStateService.updateGameText(`<p>You bumped into a wall.</p>`);
    }
    // Otherwise, move the user to the specified position, and mark that location as visited
    else
    {
      GameStateService.userPositionX = posX;
      GameStateService.userPositionY = posY;
      GameStateService.gameBoard[posY][posX].visit();

      GameStateService.updateGameText(`<p>You open and go through the door.</p>`);
    }
  }

  /**
   * Resolves the game context of when the user attempts to access the front door.
   */
  private static resolveFrontDoor():void
  {
    // Get whether the user has looted any of the three items
    let hasLootedKey:boolean = GameStateService.lootedItems[Item.ItemType.Key];
    let hasLootedFlashlight:boolean = GameStateService.lootedItems[Item.ItemType.Flashlight];
    let hasLootedBatterypack:boolean = GameStateService.lootedItems[Item.ItemType.Batterypack];

    // If the user is trying to open the door without the key, state that the door is locked
    if(!hasLootedKey)
    {
      GameStateService.updateGameText(`<p>The front door is locked and will not budge.</p>`);
      return;
    }
    // Else if the user has the key, but not the flashlight, state that they have game overed
    else if(hasLootedKey && (!hasLootedFlashlight))
    {
      GameStateService.updateGameText(
        `
        <p>You open the front door and step through the threshold, only to be met by total darkness.
        <br>The front door suddenly slams shut, condemning you to walk in eternal darkness.
        </p>
        <h1>GAME OVER</h1>
        `);
    }
    // Else if the user has the key and the flashlight, but not the batterypack, state that they have game overed
    else if(hasLootedKey && hasLootedFlashlight && (!hasLootedBatterypack))
    {
      GameStateService.updateGameText(
        `
        <p>You open the front door and step through the threshold, only to be met by total darkness.
        <br>You attempt to use the flightlight to illuminate your surroundings; however, the flashlight is missing its batterypack.
        <br>The front door suddenly slams shut, condemning you to walk in eternal darkness.
        </p>
        <h1>GAME OVER</h1>
        `);
    }
    // Else if the user has all three items, state that they have won
    else if(hasLootedKey && hasLootedFlashlight && hasLootedBatterypack)
    {
      GameStateService.updateGameText(
        `
        <p>You open the front door and step through the threshold, only to be met by total darkness.
        <br>You attempt to use the flightlight to illuminate your surroundings, which reveals a path moving forward.
        <br>You move across the path only to suddenly awake in your room, realizing it was all a dream.
        </p>
        <h1>!!!YOU WIN!!!</h1>
        `);
    }

    // Set so that the user must start the game over
    GameStateService.hasStartedGame = false;
  }

  /**
   * Updates the game text according to the user's current position.
   */
  private static updateContext():void
  {
    // If the game has not started yet, simply prompt the user to select the start option
    if(!GameStateService.getHasStartedGame())
    {
      GameStateService.updateGameText(`<h5>Select Start to play</h5>`);
      return;
    }

    // Get the user's current and forward position
    let updateText:string = `<p>You are in the ${GameStateService.getCurrentLocationString()}, facing `;
    let forwardXPos:number = GameStateService.getForwardXPos();
    let forwardYPos:number = GameStateService.getForwardYPos();

    // If the position in front of the user is valid (a door, but not the front door), state as much
    if(GameStateService.isValidLocation(forwardXPos, forwardYPos))
    {
      let forwardLocation = GameStateService.gameBoard[forwardYPos][forwardXPos];

      // Also, include the room the door goes to, if the user has already been to that room
      if(forwardLocation.getHasBeenVisited())
      {
        updateText += `the door to the ${Location.LocationType[forwardLocation.getLocationType()]}.`
      }
      else
      {
        updateText += `an unknown door.`
      }
    }
    // Else if the position in front of the user is the front door, state as much
    else if(forwardXPos == GameStateService.FRONT_DOOR_X && forwardYPos == GameStateService.FRONT_DOOR_Y)
    {
      updateText += `the mansion's front door.`
    }
    // Otherwise, state that there is a wall in front of the user
    else
    {
      updateText += `a wall.`
    }

    GameStateService.updateGameText(updateText + `</p>`);

    // If there is a searchable location in the current room, state as much
    let currentLocation:Location = GameStateService.getCurrentLocation();
    if(currentLocation.getSearchableLabel() != "")
    {
      GameStateService.updateGameText(`<p>In the room, you can see a ${currentLocation.getSearchableLabel()}.</p>`);
    }
  }

  /**
   * Updates the current game text with the specifid string at the front.
   * @param update The string to add to the game text.
   */
  private static updateGameText(update:string):void
  {
    GameStateService.gameText = update + GameStateService.gameText;
  }

  /**
   * Sets the game text to an empty string.
   */
  private static clearGameText():void
  {
    GameStateService.gameText = ``;
  }

  /**
   * Returns a Location object for the user's current position in the game board.
   * @returns The user's current Location.
   */
  private static getCurrentLocation():Location
  {
    return GameStateService.gameBoard[GameStateService.userPositionY][GameStateService.userPositionX];
  }

  /**
   * Returns a string representation for the user's current position (the name of the room).
   * @returns A string representation of the current location's type.
   */
  private static getCurrentLocationString():string
  {
    return Location.LocationType[GameStateService.getCurrentLocation().getLocationType()];
  }

  /**
   * Returns whether the specified position in a valid position on the game board,
   * which is true if the location is within the mansion, and not a blocker.
   * @param posX The X positon to check.
   * @param posY The Y position to check.
   * @returns Whether the specified location in the mansion is valid.
   */
  private static isValidLocation(posX:number, posY:number):boolean
  {
    return posY < GameStateService.gameBoard.length && posY >= 0 &&
            posX < GameStateService.gameBoard[posY].length && posX >= 0 &&
            (!GameStateService.gameBoard[posY][posX].isBlocked());
  }

  /**
   * Returns the X coordinate immediately in front of the user, which depends on their facing.
   * @returns The X coordinate immediately in front of the user.
   */
  private static getForwardXPos():number
  {
    // Get the current facing
    let facing:GameStateService.Facing = GameStateService.currentFacing;

    // Determine the X coordinate of the forward position, according to the current facing
    switch(facing)
    {
      case GameStateService.Facing.WEST:
        return GameStateService.userPositionX - 1;
      case GameStateService.Facing.EAST:
        return GameStateService.userPositionX + 1;
      case GameStateService.Facing.NORTH:
      case GameStateService.Facing.SOUTH:
        return GameStateService.userPositionX;
      default:
        console.log(`Invalid Current Facing: ${facing}`)
        return 0;
    }
  }

  /**
   * Returns the Y coordinate immediately in front of the user, which depends on their facing.
   * @returns The Y coordinate immediately in front of the user.
   */
  private static getForwardYPos():number
  {
    // Get the current facing
    let facing:GameStateService.Facing = GameStateService.currentFacing;

    // Determine the Y coordinate of the forward position, according to the current facing
    switch(facing)
    {
      case GameStateService.Facing.NORTH:
        return GameStateService.userPositionY - 1;
      case GameStateService.Facing.SOUTH:
        return GameStateService.userPositionY + 1;
      case GameStateService.Facing.WEST:
      case GameStateService.Facing.EAST:
        return GameStateService.userPositionY;
      default:
        console.log(`Invalid Current Facing: ${facing}`);
        return 0;
    }
  }

  // Adapted from https://www.w3schools.com/js/js_random.asp
  /**
   * Returns a random integer between within the range [min, max).
   * @param min The minimum value of the randomly generated integer (inclusive).
   * @param max The maximum value of the randomly generated integer (exclusive).
   * @returns A random integer between within the range [min, max).
   */
  private static getRndInteger(min:number, max:number):number 
  {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  /**
   * Randomly select and return a valid searchable area label for the specified location.
   * @param location The location to get a searchable area label for.
   * @returns A randomly selected valid searchable area label for the specified location.
   */
  private static getSearchableLabelFor(location:Location):string
  {
    let locationType:number = location.getLocationType();
    let possibleSearchableLabels:string[] = GameStateService.SEARCHABLE_AREAS[locationType];
    let selectedLabelIndex:number = GameStateService.getRndInteger(0, possibleSearchableLabels.length);
    return possibleSearchableLabels[selectedLabelIndex];
  }

  /**
   * Returns the string representation of the specified item.
   * @param itemType The item to get the string representation of.
   * @returns The string representation of the specified item.
   */
  private static getItemTypeString(item:Item.ItemType):string
  {
    return Item.ItemType[item];
  }
}

export namespace GameStateService
{
  // Used in keeping track of the user's current facing.
  export enum Facing
  {
      NORTH = 0,
      WEST = 1,
      EAST = 2,
      SOUTH = 3
  }
}
