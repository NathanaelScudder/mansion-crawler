export class ControlEvent 
{
    private action:ControlEvent.Action; // Holds the action emitted

    /**
     * Constructor for ControlEvent objects.
     * @param action The acton emitted.
     */
    constructor(action:ControlEvent.Action)
    {
        this.action = action;
    }

    /**
     * Getter for action.
     * @returns The action emitted by this ControlEvent.
     */
    public getAction():ControlEvent.Action
    {
        return this.action;
    }
}

export namespace ControlEvent
{
    // Used to differentiate the different actions
    export enum Action
    {
        TURN_LEFT = 0,
        TURN_RIGHT = 1,
        TURN_AROUND = 2,
        MOVE_FORWARD = 3,
        SEARCH_ROOM = 4,
        PICK_UP_ITEM = 5,
        START_GAME = 6,
        RESTART_GAME = 7,
        NO_ACTION = 8
    }
}