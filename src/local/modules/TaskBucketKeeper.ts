/// <reference path="../../../typings/index.d.ts" />

import * as _ from 'lodash';
import {Scanner} from "./Scanner";
import {TaskTracker} from './TaskTracker';
import {coordDimenToCenterCoord} from '../util/coord';

export class TaskBucketKeeper implements task_bucket_keeper {
    private _formulas:task_formula[] = [];
    private _formulaLen:number = 0;
    private _trackerBucket:task_tracker[] = [];

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
    
    constructor(canvasDimensions:CoordDimen) {
        this.updateTrackerDimens(canvasDimensions);
    }

    public addNewFormula(formula:task_formula):void {
        this._formulas.push(formula);
        this._formulaLen++;
    }

    public trackCoordinate(coord:CoordDimen, trackerCreator:(coord:CoordDimen, formula:task_formula) => task_tracker):task_tracker|null {
        let matchedTracker:task_tracker = null;
        let that = this;
        let centerCoord:Coordinate = coordDimenToCenterCoord(coord);

        let bucketLen:number = this._trackerBucket.length;
        let j:number = bucketLen - 1;

        // iterate over the existing trackers to see if we have one
        for (;j >= 0; j--) {
            let tracker:task_tracker = this._trackerBucket[j];

            // quit tracking if they're completed
            if (tracker.isCompleted()) {
                this._trackerBucket.splice(j, 1);
                continue;
            }

            if (tracker.matchesTrackerTrajectory(centerCoord)) {
                matchedTracker = tracker
                break;
            } 
        }

        // if it didn't match any existing trackers, see if it matches a new starting point
        if (!matchedTracker) {
            _.some(this._formulas, function doesMatchScanner (formula:task_formula) {
                if (formula.testForNewTask(centerCoord)) {
                    matchedTracker = trackerCreator(coord, formula);

                    console.debug(centerCoord);
                    console.debug('creating tracker - scanner name:' + formula.getName());
                    that._trackerBucket.push(matchedTracker);
                    return true;
                } 

                return false;
            })
        }

        if (matchedTracker) {
            let trackerConfidence:number = matchedTracker.growNutrients(centerCoord);

            // if (window._debug && trackerConfidence > this._confidenceRoof) {
            //     console.log(`Raising confidenceRoof to ${trackerConfidence}`);
            // }
            
            // this._confidenceRoof = Math.max(trackerConfidence, this._confidenceRoof);
        }

        return matchedTracker;
    }

    public decay():void {
        var len:number = this._trackerBucket.length;

        // check if we have anything to decay
        if (!len) return;

        for (let j:number = len - 1; j >= 0; j--) {
            // Rot the tracker and see if it dies
            if (this._trackerBucket[j].decay()) {
                // if so, remove it from the bucket
                this._trackerBucket.splice(j, 1);
            }
        }
    }

    public decayAndGetDecaying():task_tracker[] {
        var len:number = this._trackerBucket.length;

        // check if we have anything to decay
        if (!len) return null;

        let decaying:task_tracker[] = [];

        for (let j:number = len - 1; j >= 0; j--) {
            // Rot the tracker and see if it dies
            if (this._trackerBucket[j].decay()) {
                // if so, remove it from the bucket
                this._trackerBucket.splice(j, 1);
            } else {
                decaying.push(this._trackerBucket[j]);
            }
        }

        return decaying;
    }

    public getTrackerConfidencePercent(tracker:task_tracker):number {
        let confidence = tracker.getConfidence();

        return Math.max(confidence / this._confidenceRoof, .5);
    }

    public drawTriggerZones():void {
        for (let i = 0; i < this._formulaLen; i++) {
            let formula:task_formula = this._formulas[i];
            if (formula.canvasZone) {
                formula.canvasZone.drawZone();
            }
        }
    }

    public updateTrackerDimens(dimens:CoordDimen):void {
        this.trackDimens = dimens || this.trackDimens
    }
}