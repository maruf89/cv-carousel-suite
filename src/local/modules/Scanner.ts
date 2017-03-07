/// <reference path="../../../typings/index.d.ts" />

export class Scanner implements scanner {
    protected _restraints:CoordDimen;
    protected _trigger:ScannerDimen; // the dimens a coord must match to trigger a spawn
    protected _coordDouble:CoordDouble;

    constructor(trigger:ScannerDimen, restraints:CoordDimen) {
        this._trigger = trigger;

        this.setDimens(restraints);
    }

    /**
     * Returns whether a coordinate matches this scan zone
     * 
     * @param coord
     */
    public matchesRule(coord:Coordinate):boolean {       
        let coordDouble:CoordDouble = this._coordDouble;

        let doesMatch:boolean =  coord.x > coordDouble.x1 && coord.x < coordDouble.x2 &&
                                 coord.y > coordDouble.y1 && coord.y < coordDouble.y2;

        if (doesMatch && window._debug) {
            console.log('matched rule:');
            console.log(`coordDouble.x1 (${coordDouble.x1}) < coord.x (${coord.x}) < coordDouble.x2 (${coordDouble.x2}) ||| ` +
                        `coordDouble.y1 (${coordDouble.y1}) < coord.y (${coord.y}) < coordDouble.y2 (${coordDouble.y2})`)
        }

        return doesMatch;
    }

    public setDimens(dimens:CoordDimen):void {
        this._restraints = dimens;
        let rule:ScannerDimen = this._trigger;

        let startX:number = rule.x ? rule.x * dimens.width : 0;
        let startY:number = rule.y ? rule.y * dimens.height : 0;

        this._coordDouble = {
            x1: startX,
            x2: rule.width ? startX + rule.width * dimens.width : dimens.width,
            y1: startY,
            y2: rule.height ? startY + rule.height * dimens.height : dimens.height
        }
    }

    public getRule():ScannerDimen {
        return this._trigger;
    }

    protected getCoordinates():CoordDouble {
        return this._coordDouble;
    }

    public getName():string {
        return this._trigger.name;
    }
}
