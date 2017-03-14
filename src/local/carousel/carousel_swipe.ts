/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../typings/globals/dat-gui/index.d.ts" />

import '../../thirdparty/compatibility';
import '../../thirdparty/js-objectdetect/objectdetect.js';
import '../../thirdparty/js-objectdetect/objectdetect.handfist.js';
import '../../thirdparty/jquery.js';
import '../../thirdparty/itemslide/itemslide.js';
import * as dat from '../../../node_modules/dat.gui/build/dat.gui'

import {$id} from '../util/domSelector';
import {TaskFormula} from '../modules/TaskFormula';
import {Scanner} from "../modules/Scanner";
import DetectorPlayer from '../modules/DetectorPlayer';
import Carousel from '../modules/Carousel';
import * as _ from 'lodash';

window._debug = true;

var pageCarousel:ICarousel;
var Player:DetectorPlayer;

/**
 * Since we're only tracking movements on the x-axis we set what % of one
 * half of the screen we want to fill up (1 = 50% of screen size)
 */
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

const bucketKeeperOptions:TaskBucketKeeperOptions = {
    completedTrackerAfterLife: 45
};

const trackerFormulaOptions:any = {
    xAxisDrawPosition: .5
};

window.onload = function () {
    let uiCarousel:any = jQuery('#scrollContent');

    uiCarousel.itemslide({});

    jQuery(window).resize(function () {
        uiCarousel.reload();
    });

    pageCarousel = new Carousel(uiCarousel);

    // bind toggle button
    $id('stopButton').addEventListener('click', toggleTracker);

    createOptionsInterface();
}

function createOptionsInterface() {
    var gui:gui = new dat.GUI();
    let trackOptions = gui.addFolder('Tracking Options');
    trackOptions.add(detectorPlayerOptions.trackingOptions, 'initialLife', 5, 500);
    let relDist = trackOptions.addFolder('related distance thres')
    relDist.add(detectorPlayerOptions.trackingOptions.relatedDistThresh, 'x', 1, 30);
    relDist.add(detectorPlayerOptions.trackingOptions.relatedDistThresh, 'y', 1, 30);
}

function loadTracker () {
    Player = new DetectorPlayer(
        <HTMLVideoElement>$id('videoStream'),
        <HTMLCanvasElement>$id('trackerCanvas'),
        detectorPlayerOptions
    );

    Player.initCamera(bucketKeeperOptions).then(function (bucket:TaskBucketKeeper):void {
        defineTrackFormulas(bucket, Player.canvas, Player.context, Player.video);

        Player.toggleTracking();
    });
}

/**
 * Business Logic - defines the tasks that we want to watch for
 */
function defineTrackFormulas(bucket:TaskBucketKeeper, $canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, $video:HTMLVideoElement):void {
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

    let formula:TaskFormula = new TaskFormula({
        trigger: leftSide,
        followTriggers: [rightSide],
        restraints: detectorPlayerOptions.canvasRestraints,
        name: 'Left TOO Right',
        onComplete: function (formula:TaskFormula, tracker:TaskTracker) {
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
        onComplete: function (formula:TaskFormula, tracker:TaskTracker) {
            console.log('scroll left');
            log(formula, tracker);
            pageCarousel.previous();
        }
    });

    formula.drawTriggerZone(context);
    bucket.addNewFormula(formula);

    function log(formula:TaskFormula, tracker:TaskTracker):void {
        //console.warn(`${formula.toString()} - ${tracker.historyToString()}`);
    }
}

function toggleTracker():void {
    if (!Player) {
        return loadTracker();
    }

    Player.toggleTracking();
}