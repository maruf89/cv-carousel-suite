/// <reference path="../../../typings/index.d.ts" />

export class Scanner {
    protected _restraints:Dimension;
    protected _trigger:ScannerDimen; // the dimens a coord must match to trigger a spawn
    protected _coordDouble:CoordDouble;
    
    protected _data:any = {
        xRule: null,
        isXStart: null,
        isXEnd: null,
        measureX: null,

        yRule: null,
        isYStart: null,
        isYEnd: null,
        measureY: null
    };

    constructor(trigger:ScannerDimen, restraints:Dimension) {
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

    public setDimens(dimens:Dimension):void {
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

        this._determineRuleXY();
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

    /**
     * Some quick variable setup that can be precalculated for {@link #isCloserToTarget} to run
     */
    private _determineRuleXY():void {
        var xRule:number;
        var yRule:number;

        let coordADifX:number;
        let coordADifY:number;
        let coordADif:number;

        let coordBDifX:number;
        let coordBDifY:number;
        let coordBDif:number;
        
        this._data.xRule = null;
        this._data.isXStart = this._coordDouble.x1 === 0;
        this._data.isXEnd = this._coordDouble.x2 === this._restraints.width;
        this._data.measureX = !(this._data.isXStart && this._data.isXEnd);

        if (this._data.measureX) {
            if (this._data.isXStart) this._data.xRule = this._coordDouble.x2;
            else if (this._data.isXEnd) this._data.xRule = this._coordDouble.x1;
            else this._data.xRule = (this._coordDouble.x1 + this._coordDouble.x2) / 2;
        }
        
        this._data.yRule = null;
        this._data.isYStart = this._coordDouble.y1 === 0;
        this._data.isYEnd = this._coordDouble.y2 === this._restraints.height;
        this._data.measureY = !(this._data.isYStart && this._data.isYEnd);

        if (this._data.measureY) {
            if (this._data.isYStart && !this._data.isYEnd) this._data.yRule = this._coordDouble.y2;
            else if (this._data.isYEnd && !this._data.isYStart) this._data.yRule = this._coordDouble.y1;
            else this._data.yRule = (this._coordDouble.y1 + this._coordDouble.y2) / 2;
        }
    }

    /**
     * This returns whether coordA is closer to this scanner's destination point.
     * 
     * (Depends on variables from {@link #_determineRuleXY} to be precalculated.)
     * 
     * @param coordA
     * @param coordB 
     */
    public isCloserToTarget(coordA:Coordinate, coordB:Coordinate):boolean {
        let coordADifX:number = 1;
        let coordADifY:number = 1;
        let coordADif:number;

        let coordBDifX:number = 1;
        let coordBDifY:number = 1;
        let coordBDif:number;
        
        if (this._data.measureX) {
            coordADifX = this._data.xRule - coordA.x;
            coordBDifX = this._data.xRule - coordB.x;
        }

        if (this._data.measureY) {
            coordADifY = this._data.yRule - coordA.y;
            coordBDifY = this._data.yRule - coordB.y;
        }
        
        coordADif = Math.sqrt(coordADifX * coordADifX + coordADifY * coordADifY);
        coordBDif = Math.sqrt(coordBDifX * coordBDifX + coordBDifY * coordBDifY);
        
        return coordADif < coordBDif;
    }
}

let test = new Scanner({x: 0.75, y: 0, width: 0.25, height: 1, name: "rightSide"}, { width: 100, height: 100 });
let prevCoord = { x:31.673539430528677, y:34.42788602459079 };
let center = { x:108.43073394495414, y:66.39179248935346 };

console.log(test.isCloserToTarget(prevCoord, center));