/// <reference path="../../../typings/index.d.ts" />

import {Scanner} from './Scanner';
import {CanvasZone} from './CanvasZone';

export class TaskFormula extends Scanner {
    public canvasZone:CanvasZone;
    
    private _followTriggers:ScannerDimen[];
    private _onCompleteCallback:(formula:TaskFormula, tracker:TaskTracker) => void;

    // inherited from Scanner
    //
    // protected _restraints:CoordDimen;
    // protected _trigger:ScannerDimen;
    // protected _restrainsAsXYCoordinates:CoordDouble;
    
    constructor(options:TaskFormulaOptions) {
        super(options.trigger, options.restraints);
        
        this._followTriggers = options.followTriggers;
        this._onCompleteCallback = options.onComplete;
    }

    public testForNewTask(centerCoord:Coordinate):boolean {
        if (this.matchesRule(centerCoord)) {
            return true;
        }

        return false;
    }

    public getFollowTriggers():ScannerDimen[] {
        return this._followTriggers.slice(0);
    }

    public toString():string {
        let last:ScannerDimen = this._followTriggers[this._followTriggers.length - 1];
        return `trigger: "${this._trigger.name}" | end: "${last.name}"`;
    }

    public getCallback():(formula:TaskFormula, tracker:TaskTracker) => void {
        return this._onCompleteCallback;
    }

    public drawTriggerZone(context:CanvasRenderingContext2D):void {
        this.canvasZone = new CanvasZone(context, this.getCoordinates());
    }
}