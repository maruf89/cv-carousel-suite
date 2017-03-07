/// <reference path="../../../typings/index.d.ts" />


import {generateRGBA} from '../util/color';

export class CanvasZone {
    static drawZoneIndex:number = 11;
    
    private _context:CanvasRenderingContext2D;
    private _coordDouble:CoordDouble;
    private _zoneIndex:number;

    constructor(context:CanvasRenderingContext2D, coordDouble:CoordDouble) {
        this._context = context;
        this._coordDouble = coordDouble;
        this._zoneIndex = ++CanvasZone.drawZoneIndex;

        this.drawZone();
    }

    public drawZone():void {
        /* Draw coordinates on video overlay: */
        this._context.beginPath();
        this._context.fillStyle = generateRGBA(.25, this._zoneIndex, 1);
        this._context.fillRect(
            this._coordDouble.x1,
            this._coordDouble.y1,
            this._coordDouble.x2 - this._coordDouble.x1,
            this._coordDouble.y2 - this._coordDouble.y1
        );
    }
}