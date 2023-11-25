export class EnableEvent {
    private isEnabled:boolean; // Holds whether hand interactions controls were enabled.

    /**
     * Constructor for EnableEvent objects.
     * @param isEnabled Whether hand interactions were enabled.
     */
    constructor(isEnabled:boolean){
        this.isEnabled = isEnabled;
    }

    /**
     * Getter for isEnabled.
     * @returns Whether hand interactions were enabled.
     */
    public getIsEnabled(){
        return this.isEnabled;
    }
}
