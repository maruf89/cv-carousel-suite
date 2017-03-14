/// <reference path="../../../typings/index.d.ts" />

import * as _ from 'lodash';
import {Scanner} from "./Scanner";
import {TaskTracker, TrackInstruction} from './TaskTracker';
import {coordDimenToCenterCoord} from '../util/coord';
import Util from '../util/misc';

export class TaskBucketKeeper {
    private _formulas:TaskFormula[] = [];
    private _formulaLen:number = 0;
    private _trackerBucket:TaskTracker[] = [];

    // get's rebuild every cycle
    private _cycleInstructions:TrackInstruction[];
    private _cycleCount:number = 0;

    private _options:TaskBucketKeeperOptions = {
        completedTrackerAfterLife: 15
    }

    // holds all of the task trackers that have finished and are on their way out...
    private _finishedBucket:TaskTracker[] = [];

    // an starting reference restraint that will increment
    // as a certain tasks' confidence goes above this starting amount
    private _confidenceRoof:number = 20;

    /**
     * This represents the up to date dimensions of the detecting page
     */
    public trackDimens:CoordDimen = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }
    
    constructor(canvasDimensions:CoordDimen, options:TaskBucketKeeperOptions) {
        this.updateTrackerDimens(canvasDimensions);

        // Fuse any options we passed along with the defaults
        this._options = Util.extendOptions(options, this._options);
    }

    public addNewFormula(formula:TaskFormula):void {
        this._formulas.push(formula);
        this._formulaLen++;
    }

    public newCycle():void {
        // clear the active cycle;
        this._cycleInstructions = [];

        this.drawTriggerZones();
        this._cycleCount++;
    }

    /**
     * Returns an array of matched coordinates each with their own DNA (instructions for drawing)
     * 
     * @param coord 
     * @param trackerCreator 
     */
    public trackCoordinate(coord:CoordDimen, trackerCreator:(coord:Coordinate, formula:TaskFormula) => TaskTracker):void {
        let trackInstructions:TrackInstruction[] = [];
        let that = this;
        let centerCoord:Coordinate = coordDimenToCenterCoord(coord);

        let bucketLen:number = this._trackerBucket.length;
        let j:number = bucketLen - 1;

        // iterate over the existing trackers to see if we have one
        // starting from the end so we can splice if needed without messing up loop iteration
        for (;j >= 0; j--) {
            let tracker:TaskTracker = this._trackerBucket[j];

            // quit tracking if they're completed
            if (tracker.isCompleted()) {
                this._moveToFinished(tracker, j);
                continue;
            }

            trackInstructions.push(tracker.getInstructionsForCoord(centerCoord));
        }

        // if it didn't match any existing trackers, see if it matches a new starting point
        if (!trackInstructions.length) {
            _.some(this._formulas, function (formula:TaskFormula):boolean {
                if (formula.testForNewTask(centerCoord)) {
                    let thisTracker:TaskTracker = trackerCreator(centerCoord, formula);

                    trackInstructions.push(thisTracker.lastInstructions);
                    that._trackerBucket.push(thisTracker);
                    return true;
                }
            });
        }

        this._cycleInstructions = trackInstructions;
    }

    /**
     * Moveds a tracker from cycling array to an expired array from where it will be removed eventually
     */
    private _moveToFinished(tracker:TaskTracker, index:number):void {
        // remove from current
        this._trackerBucket.splice(index, 1);

        // add to nirvana people array
        this._finishedBucket.push(tracker);

        tracker.data._bucket = {
            afterLife: this._options.completedTrackerAfterLife
        };
    }

    public cycleAndRetrieve():TaskTracker[] {
        let returnTrackers:TaskTracker[] = this._cycleFinished();
        
        var len:number = this._trackerBucket.length;

        // check if we have anything from the living to cycle
        if (!len) return returnTrackers;

        for (let j:number = len - 1; j >= 0; j--) {
            let tracker:TaskTracker = this._trackerBucket[j];

            // Cycle the tracker and see if it dies
            if (tracker.derefTracker(this._cycleCount)) {
                // if so, remove it from the bucket
                this._trackerBucket.splice(j, 1);
            } else {
                returnTrackers.push(tracker);
            }
        }

        return returnTrackers;
    }

    /**
     * Returns the tracks that are finishing off and auto weeds out the long finished
     */
    private _cycleFinished():TaskTracker[] {
        let j:number = this._finishedBucket.length - 1;
        let finished:TaskTracker[] = [];

        for (; j >= 0; j--) {
            let finishing:TaskTracker = this._finishedBucket[j];

            if (--finishing.data._bucket.afterLife < 0) {
                this._finishedBucket.splice(j, 1);
            } else {
                finished.push(finishing);
            }
        }

        return finished;
    }

    public getTrackerConfidencePercent(tracker:TaskTracker):number {
        let confidence = tracker.getConfidence();

        return Math.max(confidence / this._confidenceRoof, .5);
    }

    public drawTriggerZones():void {
        for (let i = 0; i < this._formulaLen; i++) {
            let formula:TaskFormula = this._formulas[i];
            if (formula.canvasZone) {
                formula.canvasZone.drawZone();
            }
        }
    }

    public updateTrackerDimens(dimens:CoordDimen):void {
        this.trackDimens = dimens || this.trackDimens
    }
}