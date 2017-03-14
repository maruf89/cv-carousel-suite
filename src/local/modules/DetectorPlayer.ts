
import {TaskBucketKeeper} from '../modules/TaskBucketKeeper';
import {Scanner} from "../modules/Scanner";
import {TaskTracker} from '../modules/TaskTracker';

import Util from '../util/misc';
import {arrayToCoordDimen} from '../util/coord';
import {generateRGBA} from '../util/color';
import {LoadCamera} from '../util/camera';

import {Promise} from 'bluebird';
import * as _ from 'lodash';

export default class DetectorPlayer {

    public video:HTMLVideoElement;
    public canvas:HTMLCanvasElement;
    public context:CanvasRenderingContext2D;

    private _ready:boolean = false;
    private _doRun:boolean = false;
    private _isRunning:boolean = false;
    private _bucket:TaskBucketKeeper;
    private _canvasRestraints:CoordDimen;
    private _loopClosure:() => void
    private _detector:any;

    private _taskColorIndex = 0;

    private _video:any = {
        width: 0,
        height: 0,
        stream: null
    };

    // default extendable values
    private _options:DetectorPlayerOptions = {
        canvasRestraints: null,

        drawDetectors: true,
        log: true,

        trackingOptions: {
            initialLife: 25,
            scannerConstructor: Scanner,
            relatedDistThresh: {
                x: 15,
                y: 15
            },
        },

    }
    
    constructor(video:HTMLVideoElement, canvas:HTMLCanvasElement, options:DetectorPlayerOptions) {
        this.video = video;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        if (options) {
            this._options = Util.extendOptions(options, this._options);
        }

        this.updateCanvasRestraints(options.canvasRestraints);
    }

    public updateCanvasRestraints(canvasRestraints:CoordDimen):void {
        this.canvas.width = canvasRestraints.width;
        this.canvas.height = canvasRestraints.height;
        this._canvasRestraints = canvasRestraints;
    }

    public initCamera(bucketKeeperOptions:TaskBucketKeeperOptions):Promise<TaskBucketKeeper> {
        var that = this;

        return Promise.all([
            Util.promisifyEventListener(this.video, 'loadeddata'),
            LoadCamera(this.video)
        ]).then(function (args):DetectorPlayer {
            let video = that.video;

            that._video.stream = args[0];
            that._video.width = video.videoWidth;
            that._video.height = video.videoHeight;
            that._video.ratio = video.videoWidth / video.videoHeight;

            let bucket:TaskBucketKeeper = new TaskBucketKeeper({
                x: 0,
                y: 0,
                width: that.canvas.width,
                height: that.canvas.height
            }, bucketKeeperOptions);

            that._bucket = bucket;

            that._ready = true;

            return Promise.resolve(bucket);
        });
    }

    public startTracking():void {
        this._loopClosure = this._play.bind(this);
        this._doRun = true;
        this._isRunning = true;

        compatibility.requestAnimationFrame(this._loopClosure);
    }

    private _play():void {
        if (!this._doRun) {
            this._isRunning = false;
            this._loopClosure = null;
            return;
        }
        
        compatibility.requestAnimationFrame(this._loopClosure);

        if (this.video.paused) this.video.play();
        
        /* Prepare the detector once the video dimensions are known: */
        if (!this._detector) {
            var width = this.canvas.width;
            var height = this.canvas.height;
            this._detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
        }

        this.context.drawImage(this.video, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // draws the start trigger points
        this._bucket.newCycle();
        
        var detectedCoords:number[][] = this._detector.detect(this.video, 1);
        
        let createTrackerFn:(startCoords:CoordDimen, formula:TaskFormula) => TaskTracker = this._createTaskTracker.bind(this);
        
        for (let i = 0, length = detectedCoords.length; i < length; i++) {
            /**
             * TODO convert to receive array of trackers, each with their own drawing instructions
             */
            this._bucket.trackCoordinate(arrayToCoordDimen(detectedCoords[i]), createTrackerFn);
        }

        this._processTrackers(this._bucket.cycleAndRetrieve());
    }

    /**
     * The function that creates the tracker.
     * It passes any merged variables passed into this detector from this._options.trackingOptions
     * 
     * @param startCoords
     * @param formula 
     */
    private _createTaskTracker(startCoords:Coordinate, formula:TaskFormula):TaskTracker {
        let tracker:TaskTracker =  new TaskTracker(
            startCoords,
            formula,
            this._canvasRestraints,
            this._options.trackingOptions
        );

        tracker.data.trackerColor = generateRGBA(this._bucket.getTrackerConfidencePercent(tracker), this._taskColorIndex++, 1);
        tracker.data.isNew = 25;

        if (this._options.log) {
            console.log(`Creating new formula: ${formula.toString()}`);
        }

        return tracker;
    }

    private _processTrackers(trackers:TaskTracker[]):void {
        if (this._options.drawDetectors) {
            for (let i:number = 0, len:number = trackers.length; i < len; i++) {
                let tracker:TaskTracker = trackers[i];
                
                this._drawTracker(tracker);
            }
            return;
        } else {

        }
    }

    private _drawTracker(tracker:TaskTracker):void {
        let sizeRadius:number = 10;
        let coord:Coordinate = tracker.getLastCoordinate();

        /* Draw coordinates on video overlay: */
        this.context.beginPath();
        this.context.lineWidth = 2;

        if (typeof tracker.data.isNew === 'number' && --tracker.data.isNew >= 0) {
            this.context.fillStyle = tracker.data.trackerColor
            this.context.fillRect(
                (coord.x - sizeRadius),
                (coord.y - sizeRadius),
                (sizeRadius * 2),
                (sizeRadius * 2)
            );
        }
        
        this.context.stroke();
    }

    public stopTracking():void {
        this._doRun = false;
        
        try {
            this._video.stream.getTracks()[0].stop();
        } catch (ignore) {}
        
    }

    public toggleTracking():void {
        if (!this._ready) {
            throw new Error('DetectorPlayer must be instantiated first by calling #initCamera()')
        }
        
        return this._isRunning ? this.stopTracking() : this.startTracking();
    }
}