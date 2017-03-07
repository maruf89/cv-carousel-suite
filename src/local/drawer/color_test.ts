import {$, $id} from '../util/domSelector';
import {generateRainbowHex, generateRGBA} from '../util/color';

import * as _ from 'lodash';

interface ColorTestOpts {
    width:number
    height:number
    count:number
    frequency:number
    waterfallInterval:number
}

class ColorTest {
    private _canvas:HTMLCanvasElement;
    private _context:CanvasRenderingContext2D
    private _interval:number;
    private _drawWaterfall:boolean = false;
    private _opts:ColorTestOpts;
    private _data:any = {};
    
    constructor(canvas:HTMLCanvasElement, opts:ColorTestOpts) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._opts = opts;
        
        this._setCanvasDimens();
        this._buildSquares()

        this._bindWaterfall();
    }

    private _setCanvasDimens() {
        this._data.canvasWidth = this._canvas.clientWidth;
        this._data.canvasHeight = this._canvas.clientHeight;
    }

    private _buildSquares(offset?:number):void {
        let cursor:CoordDimen = {
            x: -this._opts.width,
            y: -this._opts.height,
            width: this._opts.width,
            height: this._opts.height
        };

        for (let i:number = 0; i < this._opts.count; i++) {
            if (this._incrementCurser(cursor)) {
                let colorOffset:number = i + (offset || 0);
                let randomRGBA:string = generateRGBA(.5, colorOffset, this._opts.frequency);
                if (i == 202) console.log(randomRGBA);
                this._drawSquare(cursor, randomRGBA);
            }
        }
    }

    private _drawSquare(cursor:CoordDimen, color:string):void {
        this._context.beginPath();
        this._context.lineWidth = 2;
        this._context.fillStyle = color;
        this._context.fillRect(
            cursor.x,
            cursor.y,
            cursor.width,
            cursor.height
        );
        
        this._context.stroke();
    }

    /**
     * Moves the x and y coordinates up and resets x and increments y when it reaches
     * the end of the screen
     */
    private _incrementCurser(cursor:CoordDimen):CoordDimen {
        cursor.x += cursor.width;

        if (cursor.x + cursor.width > this._data.canvasWidth) {
            cursor.x = 0;
            cursor.y += cursor.height;
        }
        
        return cursor;
    }

    private _bindWaterfall():void {
        let that = this;

        let callback:EventListener = function (ev:any):void {
            that._canvas.removeEventListener('click', callback);
            that._drawWaterfall = true;

            that._data.waterfallIndex = 0;
            that._data.waterfallLimit = 2000;

            requestAnimationFrame(that._startWaterfall.bind(that));

            that._canvas.addEventListener('click', that.stopWaterfall.bind(that));
        }

        this._canvas.addEventListener('click', callback);
    }

    private _startWaterfall():void {
        if (this._drawWaterfall) {
            requestAnimationFrame(this._startWaterfall.bind(this));
            this._wipeBoard();
            this._buildSquares(++this._data.waterfallIndex);
        }

        if (this._data.waterfallLimit > 0 && this._data.waterfallIndex >= this._data.waterfallLimit) {
            this.stopWaterfall();
        }
    }

    private _wipeBoard():void {
        this._context.clearRect(0, 0, this._data.canvasWidth, this._data.canvasHeight);
    }

    public stopWaterfall():void {
        this._drawWaterfall = false;
        window.clearInterval(this._interval);
        this._bindWaterfall();
    }
}

window.onload = function () {
    
    let index:number = 1;
    var $elem:HTMLCanvasElement

    while ($elem = <HTMLCanvasElement>$id(`canvas${index++}`)) {
        let $parent:HTMLElement = $elem.parentElement;
        let frequency:number = +$elem.dataset.frequency;

        let $label:HTMLLabelElement = document.createElement('label');
        $label.innerText = `Frequency: ${frequency}`;
        $label.className = 'label-elem';
        $parent.insertBefore($label, $elem);

        new ColorTest($elem, {
            width: 15,
            height: 5,
            count: 4000,
            frequency: frequency,
            waterfallInterval: 1000 / 60
        });
    }
}