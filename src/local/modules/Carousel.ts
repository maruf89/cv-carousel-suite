/**
 * This is a wrapper around another carousel 
 */
export default class Carousel implements ICarousel {
    private _carousel:ICarousel;
    private _canCall:boolean = true;
    
    private _options:any = {
        countdownBeforeReady: 1000,
    }

    constructor(carousel:ICarousel) {
        this._carousel = carousel;
    }

    public next():void {
        if (this._canCall) {
            this._next();
        }
    }

    public previous():void {
        if (this._canCall) {
            this._previous();
        }
    }

    private _callAction():void {
        let that = this;
        this._canCall = false;

        setTimeout(function () {
            that._canCall = true;
        }, this._options.countdownBeforeReady);
    }

    private _next():void {
        this._callAction();
        this._carousel.next();
    }

    private _previous():void {
        this._callAction();
        this._carousel.previous();
    }
}
