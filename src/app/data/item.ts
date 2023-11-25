export class Item
{
    private itemType:Item.ItemType; // Holds the type of this item

    /**
     * Constructor for Item objects.
     * @param itemType The type of this item.
     */
    constructor(itemType:Item.ItemType)
    {
        this.itemType = itemType;
    }

    /**
     * Getter for itemType.
     * @returns The type of this item.
     */
    public getItemType():Item.ItemType
    {
        return this.itemType;
    }
}

export namespace Item
{
    // Used to differentiate item types
    export enum ItemType
    {
        Flashlight = 0,
        Batterypack = 1,
        Key = 2,
        NO_ITEM = 3
    }
}