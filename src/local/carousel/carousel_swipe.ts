/// <reference path="../../../typings/index.d.ts" />

import {$id} from '../util/domSelector';
import {loadCamera} from '../util/camera';
import {generateRGBA} from '../util/color';
import {arrayToCoordDimen} from '../util/coord';
import {CanvasZone} from '../modules/CanvasZone';
import {TaskBucketKeeper} from '../modules/TaskBucketKeeper';
import {Scanner} from "../modules/Scanner";
import {TaskTracker} from '../modules/TaskTracker';
import {TaskFormula} from '../modules/TaskFormula';
import * as _ from 'lodash';

var started:boolean = false;

window._debug = true;

const canvasRestraints:CoordDimen = {
    x: 0,
    y: 0,
    width: 133,
    height: 100
};

var pageCarousel:any;

const pageData:PageData = {
    bucket: null,
    video: null,
    canvas: {
        context: null,
        $elem: null,
        $video: null
    },
    history: [],
    detector: null,
    doDetect: false,
    confidenceCnt: 0,
    options: {
        historyLength: 10,
        minConfidence: .3,
        relatedBoxDistance: 25,
        zoneDistance: .75, // where the start/end trigger zones should start from the right & left edges
        taskColorIndex: 0,
    },
    adjustConfidence: function (posMatch:boolean):void {
        this.confidenceCnt += posMatch ? 1 : -1;
    
        // reset to size restraints
        this.confidenceCnt = Math.min(Math.max(this.confidenceCnt, 0), this.options.historyLength)
    },
    resizeHistoryIndex: function (index:number):void {
        // reset to size restraints
        if (this.history[index].length > this.options.historyLength)
            this.history[index].length = this.options.historyLength;
    }
}

var $scrollable:HTMLElement;

window.onload = function () {
    startCarousel();
    //startCamera();

    $id('stopButton').addEventListener('click', toggleTracker);
    $scrollable = $id('scrollContent');
}

function startCarousel () {
    pageCarousel = $("ul");

    pageCarousel.itemslide({

    });

    $(window).resize(function () {
        pageCarousel.reload();
    });
}

function startCamera () {
    
    let $video = <HTMLVideoElement>$id('videoStream');
    pageData.video = {
        $elem: $video,
        width: 0,
        height: 0,
        ratio: 0,
        stream: null
    }

    // Init canvas here as well with CanvasZone
    let $canvas = pageData.canvas.$elem = <HTMLCanvasElement>$id('trackerCanvas');
    pageData.canvas.context = $canvas.getContext('2d');

    /* Draw video overlay: */
    $canvas.width = canvasRestraints.width;
    $canvas.height = canvasRestraints.height;
    
    pageData.history = [];

    loadCamera(pageData.video.$elem).then(function (stream:MediaStream) {
        pageData.video.stream = stream;

        if (pageData.video.ratio) startTracker(pageData);
    });

    $video.addEventListener('loadeddata', function() {
        pageData.video.width = $video.videoWidth;
        pageData.video.height = $video.videoHeight;
        pageData.video.ratio = $video.videoWidth / $video.videoHeight;

        pageData.bucket = new TaskBucketKeeper({
            x: 0,
            y: 0,
            width: canvasRestraints.width,
            height: canvasRestraints.height
        }, { zoneGoalDistanceX: pageData.options.zoneDistance });

        defineTaskBucketZones(pageData.bucket, $canvas, pageData.canvas.context, this);

        if (pageData.video.stream) startTracker(pageData);
    }, false);

    started = true;
}

/**
 * Business Logic - defines bucket watch trigger zones
 */
function defineTaskBucketZones(bucket:task_bucket_keeper, $canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, $video:HTMLVideoElement):void {
    let halvedDistance:number = pageData.options.zoneDistance / 2; // split field in half

    let leftSide:ScannerDimen = {
        x: 0,
        y: 0,
        width: halvedDistance,
        height:  1,
        name: "leftSide"
    };

    let rightSide:ScannerDimen = {
        x: 1 - halvedDistance,
        y: 0,
        width: halvedDistance,
        height:  1,
        name: "rightSide"
    };

    let formula:task_formula = new TaskFormula({
        trigger: leftSide,
        followTriggers: [rightSide],
        restraints: canvasRestraints,
        name: 'Left TOO Right',
        onComplete: function (formula:task_formula, tracker:task_tracker) {
            log(formula, tracker);
            pageCarousel.next();
        }
    });

    formula.drawTriggerZone(context);
    bucket.addNewFormula(formula);

    formula = new TaskFormula({
        trigger: rightSide,
        followTriggers: [leftSide],
        restraints: canvasRestraints,
        name: 'Right -> 2 -> Left',
        onComplete: function (formula:task_formula, tracker:task_tracker) {
            console.log('scroll left');
            log(formula, tracker);
            pageCarousel.previous();
        }
    });

    formula.drawTriggerZone(context);
    bucket.addNewFormula(formula);

    function log(formula:task_formula, tracker:task_tracker):void {
        console.warn(`${formula.toString()} - ${tracker.historyToString()}`);
    }
}

function startTracker(data:PageData):void {
    let closure = function () {
        play(data, closure);
    };

    data.doDetect = true;
    compatibility.requestAnimationFrame(closure);
}

function play(data:PageData, closure:Function):void {
    if (!data.doDetect) return;
    
    compatibility.requestAnimationFrame(closure);

    if (data.video.$elem.paused) data.video.$elem.play();
    
    /* Prepare the detector once the video dimensions are known: */
    if (!data.detector) {
        var width = canvasRestraints.width;
        var height = canvasRestraints.height;
        data.detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
    }

    data.canvas.context.drawImage(data.video.$elem, 0, 0, data.canvas.$elem.clientWidth, data.canvas.$elem.clientHeight);

    // draws the start trigger points
    data.bucket.drawTriggerZones();
    
    var coords:number[][] = data.detector.detect(data.video.$elem, 1);
    
    for (let i = 0, length = coords.length; i < length; i++) {
        let tracker:task_tracker = data.bucket.trackCoordinate(arrayToCoordDimen(coords[i]), createTaskTracker);

        if (tracker) {
            drawTracker(tracker, data);
        }
    }

    let decaying:task_tracker[] = data.bucket.decayAndGetDecaying();
    if (decaying) {
        _.each(decaying, function (tracker:task_tracker) {
            drawTracker(tracker, pageData);
        })
    }
}

function createTaskTracker(startCoords:CoordDimen, formula:task_formula):task_tracker {
    let tracker:task_tracker =  new TaskTracker(startCoords, formula, canvasRestraints, {
        scannerConstructor: Scanner
    });

    tracker.data.trackerColor = generateRGBA(pageData.bucket.getTrackerConfidencePercent(tracker), pageData.options.taskColorIndex++, 1);
    tracker.data.isNew = 25;
    console.log(`Creating new formula: ${formula.toString()}`);

    return tracker;
}

function drawTracker(tracker:task_tracker, data:PageData):void {
    let sizeRadius:number = 10;
    let coord:Coordinate = tracker.getLastCoordinate();

    /* Draw coordinates on video overlay: */
    data.canvas.context.beginPath();
    data.canvas.context.lineWidth = 2;

    if (typeof tracker.data.isNew === 'number' && --tracker.data.isNew <= 0) {
        data.canvas.context.fillStyle = tracker.data.trackerColor
        data.canvas.context.fillRect(
            (coord.x - sizeRadius),
            (coord.y - sizeRadius),
            (sizeRadius * 2),
            (sizeRadius * 2)
        );
    }
    
    data.canvas.context.stroke();
}

function toggleTracker():void {
    if (!started) {
        return startCamera();
    }

    let isEnabled = !pageData.doDetect;
    pageData.doDetect = isEnabled;
    isEnabled && startTracker(pageData) || (pageData.video.stream.getTracks()[0].stop());

    $id('stopButton').innerText = isEnabled ? 'Stop Tracking' : 'Start Tracking';
}