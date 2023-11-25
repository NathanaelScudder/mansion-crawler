import { Item } from "./item";

export class Location 
{
    private hasBeenVisited:boolean; // Holds whether the current location has been visited before
    private locationType:Location.LocationType; // Holds the type of the current location (its name)
    private searchableLabel:string; // Holds the label for this location's searchable area (if any)
    private item:Item.ItemType; // Holds the type of the item held at the current location (if any)
    private hasBeenSearched:boolean; // Holds whether this location has been searched before
    private hasBeenLooted:boolean; // Holds whether this location has been looted before.

    /**
     * Constructor for Location objects. 
     * @param locationType The type to set for this Location.
     */
    constructor(locationType:Location.LocationType)
    {
        this.locationType = locationType;
        this.hasBeenVisited = false;
        this.hasBeenSearched = false;
        this.hasBeenLooted = false;
        this.item = Item.ItemType.NO_ITEM;
        this.searchableLabel = "";
    }

    /**
     * Getter for hasBeenVisited.
     * @returns Whether this Location has been visited before.
     */
    public getHasBeenVisited():boolean
    {
        return this.hasBeenVisited;
    }

    /**
     * Getter for hasBeenSearched.
     * @returns Whether this location has been searched before.
     */
    public getHasBeenSearched():boolean
    {
        return this.hasBeenSearched;
    }

    /**
     * Getter for hasBeenLooted.
     * @returns Whether this location has been looted before.
     */
    public getHasBeenLooted():boolean
    {
        return this.hasBeenLooted;
    }
    
    /**
     * Getter for searchableLabel.
     * @returns The label for this location's searchable area (empty string if none).
     */
    public getSearchableLabel():string
    {
        return this.searchableLabel;
    }

    /**
     * Getter for locationType.
     * @returns The type of this location.
     */
    public getLocationType():Location.LocationType
    {
        return this.locationType;
    }

    /**
     * Getter for item.
     * @returns The item held at this location (NO_ITEM type if none)
     */
    public getItem():Item.ItemType
    {
        return this.item;
    }

    /**
     * Returns whether the location is of BLOCKED type.
     * @returns Whether this location is blocked.
     */
    public isBlocked():boolean
    {
        return this.locationType == Location.LocationType.BLOCKED;
    }

    /**
     * Returns whether the item is not of NO_ITEM type.
     * @returns Whether the location contains an item.
     */
    public hasItem():boolean
    {
        return this.item != Item.ItemType.NO_ITEM;
    }

    /**
     * Returns whether the searchable label is not an empty string.
     * @returns Whether this location contains a searchable area.
     */
    public hasSearchableArea():boolean
    {
        return this.searchableLabel != "";
    }

    /**
     * Add a searchable area and a possible item (can be NO_ITEM type) to this location.
     * @param searchableLabel The label of the searchable area to set for this location.
     * @param item The item to set for this location (can be NO_ITEM type).
     * @returns Whether adding the area was successfull. Fails if the location is of type BLOCKED.
     */
    public addSearchable(searchableLabel:string, item:Item.ItemType):boolean
    {
        // Fail to add the searchable area if this location is blocked.
        if(this.isBlocked())
        {
            return false;
        }

        this.searchableLabel = searchableLabel;
        this.item = item;

        return true;
    }

    /**
     * Mark this location as visited. Fails if already visited.
     * @returns Whether this location has not been visited before.
     */
    public visit():boolean
    {
        if(this.hasBeenVisited)
        {
            return false;
        }

        this.hasBeenVisited = true;
        return true;
    }

    /**
     * Mark this location has having been searched. Fails if already searched.
     * @returns Whether this location has not been searched before.
     */
    public search():boolean
    {
        if(this.hasBeenSearched)
        {
            return false;
        }

        this.hasBeenSearched = true;
        return true;
    }

    /**
     * Mark the current location as looted and return the location's item. Returns NO_ITEM type if already looted.
     * @returns The location's item. Returns NO_ITEM type if already looted.
     */
    public loot():Item.ItemType
    {
        if(this.hasBeenLooted)
        {
            return Item.ItemType.NO_ITEM;
        }

        this.hasBeenLooted = true;
        return this.item;
    }
}

export namespace Location
{
    // Used to differentiate the room types
    export enum LocationType
    {
        "Louge" = 0,
        "Grand Hall" = 1,
        "Foyer" = 2,
        "Dining Room" = 3,
        "Kitchen" = 4,
        "Supply Room" = 5,
        "Staff Quarters" = 6,
        "West Wing Hallway" = 7,
        "East Wing Hallway" = 8,
        "Guest Lodging" = 9,
        "Study" = 10,
        "Master Bedroom" = 11,
        "Ballroom" = 12,
        BLOCKED = 13
    }
}