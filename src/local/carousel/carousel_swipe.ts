/// <reference path="../../../typings/index.d.ts" />

import {$id} from '../util/domSelector';
import {loadCamera} from '../util/camera';
import {generateRandomRGBA} from '../util/color';
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

const pageData:PageData = {
    bucket: null,
    video: null,
    canvas: null,
    history: [],
    detector: null,
    doDetect: false,
    confidenceCnt: 0,
    options: {
        historyLength: 10,
        minConfidence: .3,
        relatedBoxDistance: 25,
        zoneDistance: .5
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
    let carousel = $("ul");

    carousel.itemslide({

    });

    $(window).resize(function () {
        carousel.reload();
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
        defineTaskBucketZones(pageData.bucket);

        // Init canvas here as well with CanvasZone
        let $canvas = <HTMLCanvasElement>$id('trackerCanvas');

        /* Draw video overlay: */
        $canvas.width = canvasRestraints.width;
        $canvas.height = canvasRestraints.height;
        pageData.canvas = new CanvasZone($canvas, <CanvasRenderingContext2D>$canvas.getContext('2d'), this, pageData.options.zoneDistance);

        if (pageData.video.stream) startTracker(pageData);
    }, false);

    started = true;
}

/**
 * Business Logic - defines bucket watch trigger zones
 * @param bucket 
 */
function defineTaskBucketZones(bucket:task_bucket_keeper):void {
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

    bucket.addNewFormula(new TaskFormula(leftSide, [rightSide], canvasRestraints, 'Left TOO Right'));
    bucket.addNewFormula(new TaskFormula(rightSide, [leftSide], canvasRestraints, 'Right -> 2 -> Left'));
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
        var width = ~~(100 * data.video.ratio);
        var height = 100;
        data.detector = new objectdetect.detector(width, height, 1.1, objectdetect.eye);
    }

    data.canvas.context.drawImage(data.video.$elem, 0, 0, data.canvas.$elem.clientWidth, data.canvas.$elem.clientHeight);

    data.canvas.drawZones();
    
    var coords:number[][] = data.detector.detect(data.video.$elem, 1);
    
    for (let i = 0, length = coords.length; i < length; i++) {
        let tracker:task_tracker = data.bucket.trackCoordinate(arrayToCoordDimen(coords[i]), createTaskTracker);

        if (tracker) {
            drawTracker(tracker, data);
        }
    }

    data.bucket.decay();
}

function createTaskTracker(startCoords:CoordDimen, formula:task_formula):task_tracker {
    let tracker:task_tracker =  new TaskTracker(startCoords, formula, canvasRestraints, {
        scannerConstructor: Scanner,
        onComplete: taskOnComplete
    });

    tracker.data.trackerColor = '#9ce0e0'; //generateRandomRGBA(.85, Math.random() * 256, 1);
    console.log(`Creating new formula: ${formula.toString()}`);

    return tracker;
}

function taskOnComplete(formula:task_formula, tracker:task_tracker):void {
    console.warn(`${formula.toString()} - ${tracker.historyToString()}`)
}

function drawTracker(tracker:task_tracker, data:PageData):void {
    let sizeRadius:number = 10;
    let coord:Coordinate = tracker.getLastCoordinate();

    /* Draw coordinates on video overlay: */
    data.canvas.context.beginPath();
    data.canvas.context.lineWidth = 2;
    data.canvas.context.fillStyle = tracker.data.trackerColor
    data.canvas.context.fillRect(
        (coord.x - sizeRadius),
        (coord.y - sizeRadius),
        (sizeRadius * 2),
        (sizeRadius * 2)
    );
    data.canvas.context.stroke();
}

function drawCanvasTrackings(index:number, incomingCoords:number[], data:PageData):void {
    var coord:number[] = incomingCoords;
    data.history[index] = data.history[index] || [];

    /* Rescale coordinates from detector to video coordinate space: */
    let scaleX:number = data.video.width / data.canvas.$elem.width;
    let scaleY:number = data.video.height / data.canvas.$elem.height;
    coord[0] *= scaleX;
    coord[1] *= scaleY;
    coord[2] *= scaleX;
    coord[3] *= scaleY;
    
    // add to all positions
    let newCoord:Coordinate = calculateCenter(coord);
    let newCoordOrNull:Coordinate|null = relatedCoordinateOrNull(newCoord, data.history[index], data.options);

    // only add if not null
    if (newCoordOrNull) data.history[index].unshift(newCoordOrNull);

    data.adjustConfidence(!!newCoordOrNull);
    data.resizeHistoryIndex(index);

    let delta:CoordinateDelta = calculatePositionDelta(data.history[index], data.options);
    console.debug(delta);
    if (delta) {
        // var dx = (fist_pos[0] - oldPos[0]) / data.video.videoWidth,
        //         dy = (fist_pos[1] - oldPos[1]) / data.video.videoHeight;
        
        $scrollable.style.transform = `translate3d(${delta.dx * 200}, 0px, 0px)`;
    } else return;
    
    /* Draw coordinates on video overlay: */
    data.canvas.context.beginPath();
    data.canvas.context.lineWidth = 2;
    data.canvas.context.fillStyle = generateRandomRGBA(.5, index * 4, .4);
    data.canvas.context.fillRect(
        coord[0] / data.video.width * data.canvas.$elem.clientWidth,
        coord[1] / data.video.height * data.canvas.$elem.clientHeight,
        coord[2] / data.video.width * data.canvas.$elem.clientWidth,
        coord[3] / data.video.height * data.canvas.$elem.clientHeight);
    data.canvas.context.stroke();
}

function calculateCenter(coord:number[]):Coordinate {
    return {
        x: coord[0] + coord[2] / 2, // X coord + half of width
        y: coord[1] + coord[3] / 2
    };
}

function relatedCoordinateOrNull(coord:Coordinate, coordHistory:Coordinate[], options:TrackingOptions):Coordinate|null {
    let hasNone:boolean = true;
    
    if (_.some(coordHistory, function (coordI:Coordinate) {
        // check if we have anything in the history in the first place
        hasNone = hasNone && !coordI;

        return coordI &&
            Math.abs(coordI.x - coord.x) <= options.relatedBoxDistance &&
            Math.abs(coordI.y - coord.y) <= options.relatedBoxDistance;
    })) {
        return coord;
    }
    
    // if we have an empty history, return the first coord
    return hasNone ? coord : null;
}

function calculatePositionDelta(coords:Coordinate[], options:TrackingOptions):CoordinateDelta {
    let len:number = coords.length;
    
    if (len < options.historyLength * options.minConfidence) return null;

    let middle:number = Math.floor(len / 2);
    let startCoords:Coordinate[] = coords.slice(0, middle);
    let endCoords:Coordinate[] = coords.slice(middle);

    let start:Coordinate = addUp(startCoords, middle);
    let end:Coordinate = addUp(endCoords, len - middle);

    function addUp(crds:Coordinate[], crdLen:number):Coordinate {
        let sumX:number = 0;
        let sumY:number = 0;
        let index = crdLen - 1;

        while (index >= 0) {
            let coord:Coordinate = crds[index--];
            sumX += coord.x;
            sumY += coord.y;
        }

        return {
            x: Math.round(sumX / crdLen),
            y: Math.round(sumY / crdLen)
        };
    }

    // let delta:CoordinateDelta = _.reduce(coords, function (obj:CoordinateDelta, next:Coordinate) {
        

    //     return obj;

    // }, { dx:null, dy:null });

    return {
        dx: end.x - start.x,
        dy: end.y - start.y
    };
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