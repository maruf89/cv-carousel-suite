/// <reference path="../../../typings/index.d.ts" />

import * as _ from 'lodash';
import {Scanner} from "./Scanner";
import {TaskTracker} from './TaskTracker';
import {coordDimenToCenterCoord} from '../util/coord';

export class TaskBucketKeeper implements task_bucket_keeper {
    private _scanners:task_formula[] = [];
    private _trackerBucket:task_tracker[] = [];

    /**
     * This represents the up to date dimensions of the detecting page
     */
    public trackDimens:CoordDimen = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }
    
    constructor(canvasDimensions:CoordDimen, options?:TaskBucketOptions) {
        this.trackDimens = canvasDimensions || this.trackDimens;

        let that = this;
        setInterval(function () {
            console.log(`Tracker Bucket Len: ${that._trackerBucket.length}`);
        }, 1000);
    }

    public addNewFormula(formula:task_formula):void {
        this._scanners.push(formula);
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
            _.some(this._scanners, function doesMatchScanner (formula:task_formula) {
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
            matchedTracker.growNutrients(centerCoord);
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
}