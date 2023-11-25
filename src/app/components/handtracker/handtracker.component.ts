import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as handTrack from 'handtrackjs';
import { PredictionEvent } from 'src/app/data/prediction-event';
import { EnableEvent } from 'src/app/data/enable-event';

@Component({
  selector: 'app-handtracker',
  templateUrl: './handtracker.component.html',
  styleUrls: ['./handtracker.component.css']
})
export class HandtrackerComponent implements OnInit {
  @Output() onPrediction = new EventEmitter<PredictionEvent>();
  @Output() onEnable = new EventEmitter<EnableEvent>();
  @ViewChild('htvideo') video: ElementRef;
  
  /* 
  SAMPLERATE determines the rate at which detection occurs (in milliseconds)
  500, or one half second is about right, but feel free to experiment with faster
  or slower rates
  */
  private static SAMPLERATE: number = 500;
  private static PROGRESS_PER_SAMPLE:number = 25;
  
  detectedGesture:string = "None";
  width:string = "400";
  height:string = "400";

  // Labels for the button, depending on whether hand interactions are enabled
  private static ENABLE_INTERACTIONS_LABEL:string = "Enable Hand Controls";
  private static DISABLE_INTERACTIONS_LABEL:string = "Disable Hand Controls";
  activateHandIterationsLabel:string = HandtrackerComponent.ENABLE_INTERACTIONS_LABEL;
  isUsingHandIterations:boolean = false;

  handInteractionProgress:number = 0; // Holds the progress towards emitted the current hand interation action

  private model: any = null;
  private runInterval: any = null;

  //handTracker model
  private modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 3, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.4, // confidence threshold for predictions.
  };

  constructor() {
  }
  
  ngOnInit():void {
  }

  ngOnDestroy():void 
  {
    this.model.dispose();
  }

  /**
   * Returns the current progress towards emitting the currently predicted gesture.
   * @returns The current progress towards emitting the currently predicted gesture.
   */
  get handInteractionProgressString():String
  {
    return this.handInteractionProgress + "%";
  }

  /**
   * Initializes the hand interactions model.
   */
  async initHandInterations():Promise<void>
  {
    this.model = await handTrack.load(this.modelParams);
    console.log("loaded");
  }

  /**
   * Start the video for tracking hand interaction gestures.
   */
  async startVideo():Promise<void>
  {
    await handTrack.startVideo(this.video.nativeElement);
  }

  /**
   * Toggle the current hand interactions mode (from enabled to disabled or disabled to enabled).
   * Emits the new mode as an EnableEvent.
   */
  async toggleDetection():Promise<void>
  {
    if(this.isUsingHandIterations)
    {
      this.stopDetection();
    }
    else
    {
      await this.initHandInterations();
      await this.startDetection();
    }

    this.onEnable.emit(new EnableEvent(this.isUsingHandIterations));
  }

  /**
   * Starts detection of hand interactions.
   */
  async startDetection():Promise<void>
  {
    this.isUsingHandIterations = true;
    this.activateHandIterationsLabel = HandtrackerComponent.DISABLE_INTERACTIONS_LABEL;
    this.detectedGesture = "None";
    
    await this.startVideo();

    //The default size set in the library is 20px. Change here or use styling
    //to hide if video is not desired in UI.
    this.video.nativeElement.style.height = "200px";

    console.log("starting predictions");
    this.runInterval = setInterval(()=>{
        this.runDetection();
    }, HandtrackerComponent.SAMPLERATE);
  }

  /**
   * Stops detection of hand interactions.
   */
  stopDetection():void
  {
    this.isUsingHandIterations = false;
    this.activateHandIterationsLabel = HandtrackerComponent.ENABLE_INTERACTIONS_LABEL;
    this.handInteractionProgress = 0;

    console.log("stopping predictions");
    clearInterval(this.runInterval);
    handTrack.stopVideo(this.video.nativeElement);
  }

  /*
    runDetection demonstrates how to capture predictions from the handTrack library.
    It is not feature complete! Feel free to change/modify/delete whatever you need
    to meet your desired set of interactions
  */
  runDetection():void
  {
    if (this.model != null){
        let predictions = this.model.detect(this.video.nativeElement).then((predictions: any) => {
            if (predictions.length <= 0) return;
            
            let openhands = 0;
            let closedhands = 0;
            let pointing = 0;
            let previousDetection = this.detectedGesture;

            for(let p of predictions)
            {
                //uncomment to view label and position data
                //console.log(p.label + " at X: " + p.bbox[0] + ", Y: " + p.bbox[1] + " at X: " + p.bbox[2] + ", Y: " + p.bbox[3]);
                
                if(p.label == 'open') openhands++;
                if(p.label == 'closed') closedhands++;
                if(p.label == 'point') pointing++;
                
            }

            if(openhands == 1 && pointing == 1) 
              this.detectedGesture = PredictionEvent.GESTURE_POINTING_AND_OPEN;
            else if(closedhands == 1 && pointing == 1) 
              this.detectedGesture = PredictionEvent.GESTURE_POINTING_AND_CLOSED;
            else if(closedhands == 1 && openhands == 1) 
              this.detectedGesture = PredictionEvent.GESTURE_OPEN_AND_CLOSED_HANDS;

            else if (openhands > 1) 
              this.detectedGesture = PredictionEvent.GESTURE_TWO_OPEN_HANDS;
            else if(openhands == 1) 
              this.detectedGesture = PredictionEvent.GESTURE_OPEN_HAND;
        
            else if (closedhands > 1) 
              this.detectedGesture = PredictionEvent.GESTURE_TWO_CLOSED_HANDS;
            else if(closedhands == 1)
              this.detectedGesture = PredictionEvent.GESTURE_CLOSED_HAND;
            
            else if (pointing == 1) 
              this.detectedGesture = PredictionEvent.GESTURE_POINTING_HAND;

            else
                this.detectedGesture = PredictionEvent.GESTURE_NONE;
            
            // If the current gesture is the same as the previous, increase the current hand interaction progress
            if(previousDetection == this.detectedGesture && 
               this.detectedGesture != PredictionEvent.GESTURE_NONE)
            {
              // If the progress is at 100%, emit the PredictionEvent and reset the progress
              if(this.handInteractionProgress == 100)
              {
                this.handInteractionProgress = 0;
                this.onPrediction.emit(new PredictionEvent(this.detectedGesture))
              }
              else
              {
                this.handInteractionProgress += HandtrackerComponent.PROGRESS_PER_SAMPLE;
              }
            }
            else
            {
              this.handInteractionProgress = 0;
            }
        }, (err: any) => {
            console.log("ERROR")
            console.log(err)
        });
    }else{
        console.log("no model")
    }
  }
}
