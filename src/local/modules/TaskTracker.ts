/// <reference path="../../../typings/index.d.ts" />

import * as _ from 'lodash';

import {generateRGBA} from '../util/color';
import {coordDimenToCenterCoord} from '../util/coord';
import Util from '../util/misc';

export class TaskTracker {

    public decayAmt:number = 0;
    public data:any;

    private _options:TaskTrackerOptions = {
        scannerConstructor: null,
        relatedDistThresh: {
            x: 25,
            y: 0
        },
        initialLife: 25,
    }

    // how confident we are that we'll make it to the end
    private _confidence:number = 0;

    // history of our past coordinates
    private _history:Coordinate[] = [];

    // will hold reference to scanner which will tell us if we've reached the goal zone
    private _triggerScanner:Scanner;
    private _targetRule:ScannerDimen;

    private _formula:TaskFormula;

    // future goals
    private _nextTasks:ScannerDimen[];

    // the dimensions of the screen we're comparing against
    private _trackerDimens:CoordDimen;
    private _completed:boolean = false;
    
    constructor(
        startCoord:Coordinate,
        formula:TaskFormula,
        trackerDimens:CoordDimen,
        options:TaskTrackerOptions
    ) {
        this._checkHasNeededArgs(options, true);
        
        // plant the seed…
        this.growNutrients(startCoord);

        // start our archive
        this._history.push(startCoord);
        this._formula = formula;
        this._nextTasks = formula.getFollowTriggers();
        this._trackerDimens = trackerDimens;
        
        // Fuse any options we passed along with the defaults
        this._options = Util.extendOptions(options, this._options);
        if (!options.relatedDistThresh.x) options.relatedDistThresh.x = trackerDimens.width;
        if (!options.relatedDistThresh.y) options.relatedDistThresh.y = trackerDimens.height;

        this.data = options.data || {};

        // Set sights on our first goal zone! Where are we sailing?
        this._setNextTrigger();
    }

    /**
     * Does this coordinate match up with where we should be going?
     * 
     * @param centerCoord:Coordinate - this is the data, use it to determine if it furthers us to the goal zone
     * @returns whether we're claiming this coordinate
     */
    public matchesTrackerTrajectory (centerCoord:Coordinate):boolean {
        // Check if we've reached our next goal zone
        if (this._triggerScanner.matchesRule(centerCoord)) {
            // if so, tell the folks upstairs to find the next end zone or finish.
            this._setNextTrigger();
            return true;
        }

        // we haven't reached our goal, check whether this data could match up

        // fetch most recent coordinates to compare against
        let prevCoord:Coordinate = this._history[0];

        // this is the max distance that the coordinates could match from
        let distThresh:Coordinate = this._options.relatedDistThresh;

        // whether this is a neighboring center coordinate
        let withinTrajectory:boolean =  this._triggerScanner.isCloserToTarget(centerCoord, prevCoord) &&
                                        (Math.abs(centerCoord.x - prevCoord.x) <= distThresh.x) &&
                                        (Math.abs(centerCoord.y - prevCoord.y) <= distThresh.y);

        return withinTrajectory;
    }

    public getLastCoordinate():Coordinate {
        return this._history[0];
    }

    /**
     * Ensures the growth of this tracker - "2 steps forward…"
     * @param coord
     * @returns number - current confidence
     */
    public growNutrients(coord:Coordinate):number {
        // add the last center coord to the stack
        this._history.unshift(coord);

        // reset the decay no start
        // (assume it will decay so that's why -1 and not 0)
        this.decayAmt = -1;

        // and build confidence, your journey will be long and hard young padawan…
        return ++this._confidence;
    }

    /**
     * The tracker undergoes decay and if it decays too much it loses confidence, thus the will
     * to live and should thus die - "…1 step back"
     * 
     * @returns boolean - whether it should be referenced
     */
    public decay():boolean {
        this.decayAmt++

        // if it hasn't decayed enough continue…
        if (this.decayAmt < this._options.initialLife) return false;
        
        // otherwise subtract confidence
        this._confidence--;

        // and if return whether we still have any confidence…
        return this._confidence > 0 || this._completed;
    }

    public historyToString():string {
        return JSON.stringify(this._history);
    }

    /**
     * Throw if invalid arguments passed in
     * 
     * @param options
     * @param throwIfError 
     */
    private _checkHasNeededArgs(options:TaskTrackerOptions, throwIfError:boolean):boolean {
        let invalid:boolean = !options || typeof options.scannerConstructor !== 'function';

        if (invalid && throwIfError) {
            throw new Error('Missing required options arguments for TaskTracker');
        }

        return !invalid;
    }

    /**
     * We have reached the first/next goal zone. Hooray! Now what?
     */
    private _setNextTrigger():void {
        // have we reached the end?
        if (!this._nextTasks.length) {
            // If so then we're done. We'll call the boss & GO HOME!
            return this._trackerCompleted()
        }

        // Otherwise we'll create a scanner for the next goal zone
        this._triggerScanner = new this._options.scannerConstructor(this._nextTasks.shift(), this._trackerDimens);
        this._targetRule = this._triggerScanner.getRule();
    }

    /**
     * This tracker has reached it's final goal, what should happen?
     */
    private _trackerCompleted():void {
        this._completed = true;
        this._formula.getCallback()(this._formula, this);
    }

    public isCompleted():boolean {
        return this._completed;
    }

    public getConfidence():number {
        return this._confidence;
    }
}