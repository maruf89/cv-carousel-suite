/// <reference path="../../../typings/index.d.ts" />

import {Scanner} from './Scanner';

export class TaskFormula extends Scanner implements task_formula {
    private _followTriggers:ScannerDimen[];

    // inherited from Scanner
    //
    // protected _restraints:CoordDimen;
    // protected _trigger:ScannerDimen;
    // protected _restrainsAsXYCoordinates:CoordDouble;
    
    constructor(taskTrigger:ScannerDimen, followTriggers:ScannerDimen[], restraints:CoordDimen, name:string) {
        super(taskTrigger, restraints);
        
        this._followTriggers = followTriggers;

        if (window._debug) {
            let endScanner:Scanner = new Scanner(followTriggers[followTriggers.length - 1], restraints);
            console.log('formula start & finish');
            console.log(`start ${JSON.stringify(this._restrainsAsXYCoordinates)} -- end ${JSON.stringify(endScanner._restrainsAsXYCoordinates)}`)
        }
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
}