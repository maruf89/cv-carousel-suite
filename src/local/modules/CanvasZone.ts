/// <reference path="../../../typings/index.d.ts" />

export class CanvasZone implements canvas_zone {
    public $elem:HTMLCanvasElement
    public context:CanvasRenderingContext2D

    public $video:HTMLVideoElement
    private _zoneDistanceX:number // a decimal between 0 and 1 - if canvas is split up into fields left/right defines where the start/end zones are defined
    private _leftZone:CoordDimen
    private _rightZone:CoordDimen

    constructor(canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, video:HTMLVideoElement, zoneDistanceX:number) {
        this.$elem = canvas;
        this.context = context;
        this.$video = video;
        this._zoneDistanceX = zoneDistanceX;
    }

    public drawZones() {
        let halvedDistance:number = this._zoneDistanceX / 2; // split field in half
        let zoneWidth:number = halvedDistance *  this.$elem.clientWidth;

        this._leftZone = {
            x: 0,
            y: 0,
            width: zoneWidth,
            height:  this.$elem.clientHeight
        };

        this._rightZone = {
            x:  this.$elem.clientWidth - zoneWidth,
            y: 0,
            width: zoneWidth,
            height:  this.$elem.clientHeight
        };

        this.drawSingleZone(this._leftZone, "rgba(242,12,54,.25)");
        this.drawSingleZone(this._rightZone, "rgba(44,122,4,.25)");
    }

    private drawSingleZone(zone:CoordDimen, color:string):void {
        /* Draw coordinates on video overlay: */
        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.fillStyle = color;
        this.context.fillRect(
            zone.x,
            zone.y,
            zone.width,
            zone.height);
        this.context.stroke();
    }
}