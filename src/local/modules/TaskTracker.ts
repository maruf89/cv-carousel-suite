/// <reference path="../../../typings/index.d.ts" />

import * as _ from 'lodash';

import {generateRGBA} from '../util/color';
import {coordDimenToCenterCoord} from '../util/coord';
import Util from '../util/misc';

export class TaskTracker {
    public decayAmt:number = 0;
    public lastInstructions:TrackInstruction;
    public data:any;

    private _options:TaskTrackerOptions = {
        scannerConstructor: null,
        relatedDistThresh: {
            x: 25,
            y: 0
        },
        initialLife: 5,
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
        this._plantSeed(startCoord);
        
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

    private _plantSeed(startCoord:Coordinate):void {
        this._history.push(startCoord);
        this.lastInstructions = new TrackInstruction(startCoord, "persisting");
    }

    public getInstructionsForCoord(centerCoord:Coordinate):TrackInstruction {
        var j = 'dog';
        this.lastInstructions = new TrackInstruction(centerCoord);

        // Check if we've reached our next goal zone
        if (this._history.length && this._triggerScanner.matchesRule(centerCoord)) {
            // if so, tell the folks upstairs to find the next end zone or finish.
            this._setNextTrigger();

            this.lastInstructions.setTriggered();
        } else {
            let isTowardsGoal:boolean = this._triggerScanner.isCloserToTarget(centerCoord, this._history[0]);
            
            this.lastInstructions.applyMatches(this.isNearNeighbor(centerCoord), isTowardsGoal);
        }

        return this.lastInstructions;
    }

    /**
     * Is this coordinate within our last states vicinity?
     * 
     * @param centerCoord:Coordinate - this is the data, use it to determine if it furthers us to the goal zone
     * @returns whether we're claiming this coordinate
     */
    public isNearNeighbor(centerCoord:Coordinate):boolean {
        // fetch most recent coordinates to compare against
        let prevCoord:Coordinate = this._history[0];

        // this is the max distance that the coordinates could match from
        let distThresh:Coordinate = this._options.relatedDistThresh;

        // whether this is a neighboring center coordinate
        return (Math.abs(centerCoord.x - prevCoord.x) <= distThresh.x) &&
               (Math.abs(centerCoord.y - prevCoord.y) <= distThresh.y);

    }

    public getLastCoordinate():Coordinate {
        return this._history[0];
    }

    /**
     * Whether to cut this tracker off
     * 
     * @returns whether to deref this
     */
    public derefTracker(cycleCount:number):boolean {
        let dereference:boolean = false;

        if (!this.lastInstructions) {
            this.lastInstructions = new TrackInstruction(this.getLastCoordinate(), "decaying");
        }

        if (this.lastInstructions.alreadyApplied(cycleCount)) {
            throw new Error('This cycle count has already been called');
        }
        
        switch (this.lastInstructions.state) {
            case "growing":
            case "triggered":
                this.growNutrients(this.lastInstructions.growth, this.lastInstructions.coord);
                break;
            case "persisting":
                // do nothing...
                break;
            case "decaying":
                dereference = this.decay();
                break;
            case "finished":
                // finished, woo!
        }
        
        return dereference
    }

    /**
     * Ensures the growth of this tracker - "2 steps forward…"
     * @param coord
     * @returns number - current confidence
     */
    public growNutrients(growth:number, coordCenter:Coordinate):number {
        this._history.unshift(coordCenter);

        // reset the decay no start
        // (assume it will decay so that's why -1 and not 0)
        this.decayAmt = -1;

        // and build confidence, your journey will be long and hard young padawan…
        // (add additional 1 to make up for it's removal in #decay)
        return this._confidence += growth;
    }

    /**
     * The tracker undergoes decay and if it decays too much it loses confidence, thus the will
     * to live and should thus die - "…1 step back"
     * 
     * @returns boolean - whether it should be dereferenced (false = do not remove)
     */
    public decay():boolean {
        this.decayAmt++

        // if it hasn't decayed enough continue…
        if (this.decayAmt < this._options.initialLife) return false;
        else {
            // reset decay
            this.decayAmt = 0;

            // and subtract confidence
            this._confidence--;
        }

        // and if return whether we still have any confidence…
        return this._confidence <= 0 || this._completed;
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
            this._trackerCompleted();
            return;
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
        this.lastInstructions.state = "finished";
    }

    public isCompleted():boolean {
        return this._completed;
    }

    public getConfidence():number {
        return this._confidence;
    }
}

export class TrackInstruction {
    /**
     * These are weights applied to matches tracker's life for each match
     */
    private static WEIGHT_MULTIPLIER:number = 1;

    public static WEIGHT_TRIGGERED:number = 5;
    public static WEIGHT_NEIGHBOR_VICINITY:number = 1;
    public static WEIGHT_TOWARDS_GOAL:number = 3;

    public coord:Coordinate;
    public growth:number = 0;
    public state:TrackerState;

    private _alreadyApplied:boolean = false;
    private _cycleNum:number;
    private _isNeighbor:boolean = false;
    private _towardsGoal:boolean = false;

    constructor(coord:Coordinate, startingState?:TrackerState) {
        this.coord = coord;

        if (startingState) this.state = startingState;
    }

    public setTriggered():void {
        this.growth += TrackInstruction.WEIGHT_TRIGGERED;
        this.state = "triggered";
    }

    public applyMatches(isNeighbor:boolean, towardsGoal:boolean):void {
        if (this._isNeighbor = isNeighbor) {
            this.growth += TrackInstruction.WEIGHT_NEIGHBOR_VICINITY;
        }

        if (this._towardsGoal = towardsGoal) {
            this.growth += TrackInstruction.WEIGHT_TOWARDS_GOAL;
            this.state = "growing"
        }

        if (this.growth) {
            this.growth *= TrackInstruction.WEIGHT_MULTIPLIER;
            this.state = this.state || "persisting";
        }
        
        // default to decay
        this.state = this.state || "decaying";
    }

    public isGrowing():boolean {
        return this.state === "growing";
    }

    public alreadyApplied(cycleCount:number):boolean {
        if (this._alreadyApplied && this._cycleNum === cycleCount) {
            return true;
        }

        this._cycleNum = cycleCount;
        this._alreadyApplied = true;
    }
}