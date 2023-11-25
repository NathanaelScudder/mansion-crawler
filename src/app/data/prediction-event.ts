export class PredictionEvent {
    // Constants for the different gestures that can be returned
    public static GESTURE_OPEN_AND_CLOSED_HANDS:string = "Open & Closed";
    public static GESTURE_POINTING_HAND:string = "Hand Pointing";
    public static GESTURE_POINTING_AND_OPEN:string = "Pointing & Open";
    public static GESTURE_POINTING_AND_CLOSED:string = "Pointing & Closed";
    public static GESTURE_OPEN_HAND:string = "Open Hand";
    public static GESTURE_TWO_OPEN_HANDS:string = "Two Open Hands";
    public static GESTURE_CLOSED_HAND:string = "Closed Hand";
    public static GESTURE_TWO_CLOSED_HANDS:string = "Two Closed Hands";
    public static GESTURE_NONE:string = "None";
    
    private prediction: string = "None";

    constructor(prediction:string){
        this.prediction = prediction;
    }

    /**
     * Getter for this.prediction
     * @returns The string representation of this prediction.
     */
    public getPrediction(){
        return this.prediction;
    }
}
