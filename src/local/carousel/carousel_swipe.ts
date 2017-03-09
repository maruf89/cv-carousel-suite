/// <reference path="../../../typings/index.d.ts" />

import '../../thirdparty/compatibility';
import '../../thirdparty/js-objectdetect/objectdetect.js';
import '../../thirdparty/js-objectdetect/objectdetect.handfist.js';
import '../../thirdparty/jquery.js';
import '../../thirdparty/itemslide/itemslide.js';

import {$id} from '../util/domSelector';
import {CanvasZone} from '../modules/CanvasZone';
import {TaskFormula} from '../modules/TaskFormula';
import {Scanner} from "../modules/Scanner";
import DetectorPlayer from '../modules/DetectorPlayer';
import Carousel from '../modules/Carousel';
import * as _ from 'lodash';

window._debug = true;

var pageCarousel:ICarousel;
var Player:detector_player;

const X_AXIS_DRAW_POSITION:number = .5;

const detectorPlayerOptions:DetectorPlayerOptions = {
    trackingOptions: {
        initialLife: 50,
        relatedDistThresh: {
            x: 15,
            y: 15
        },
        scannerConstructor: Scanner
    },

    drawDetectors: true,

    canvasRestraints: {
        x: 0,
        y: 0,
        width: 133,
        height: 100
    }
}

window.onload = function () {
    let uiCarousel:any = jQuery('#scrollContent');

    uiCarousel.itemslide({});

    jQuery(window).resize(function () {
        uiCarousel.reload();
    });

    pageCarousel = new Carousel(uiCarousel);

    // bind toggle button
    $id('stopButton').addEventListener('click', toggleTracker);
}

function loadTracker () {
    Player = new DetectorPlayer(
        <HTMLVideoElement>$id('videoStream'),
        <HTMLCanvasElement>$id('trackerCanvas'),
        detectorPlayerOptions
    );

    Player.initCamera().then(function (bucket:task_bucket_keeper) {
        defineTaskBucketZones(bucket, Player.canvas, Player.context, Player.video);

        Player.toggleTracking();
    });
}

/**
 * Business Logic - defines bucket watch trigger zones
 */
function defineTaskBucketZones(bucket:task_bucket_keeper, $canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, $video:HTMLVideoElement):void {
    let halvedDistance:number = X_AXIS_DRAW_POSITION / 2; // split field in half

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
        restraints: detectorPlayerOptions.canvasRestraints,
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
        restraints: detectorPlayerOptions.canvasRestraints,
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

function toggleTracker():void {
    if (!Player) {
        return loadTracker();
    }

    Player.toggleTracking();
}