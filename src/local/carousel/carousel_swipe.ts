/// <reference path="../../../typings/index.d.ts" />

import {$id} from '../util/domSelector';
import {CanvasZone} from '../modules/CanvasZone';
import {TaskFormula} from '../modules/TaskFormula';
import DetectorPlayer from '../modules/DetectorPlayer';
import * as _ from 'lodash';

window._debug = true;

var pageCarousel:any;
var Player:detector_player;

const trackerOptions:any = {
    zoneDistanceX: .75, // where the start/end trigger zones should start from the right & left edges
}

const canvasRestraints:CoordDimen = {
    x: 0,
    y: 0,
    width: 133,
    height: 100
};

window.onload = function () {
    startCarousel();

    $id('stopButton').addEventListener('click', toggleTracker);
}

function startCarousel () {
    pageCarousel = $("ul");

    pageCarousel.itemslide({});

    $(window).resize(function () {
        pageCarousel.reload();
    });
}

function startCamera () {
    Player = new DetectorPlayer(<HTMLVideoElement>$id('videoStream'), <HTMLCanvasElement>$id('trackerCanvas'), canvasRestraints);

    Player.initCamera().then(function (bucket:task_bucket_keeper) {
        defineTaskBucketZones(bucket, Player.canvas, Player.context, Player.video);

        Player.toggleTracking();
    });
}

/**
 * Business Logic - defines bucket watch trigger zones
 */
function defineTaskBucketZones(bucket:task_bucket_keeper, $canvas:HTMLCanvasElement, context:CanvasRenderingContext2D, $video:HTMLVideoElement):void {
    let halvedDistance:number = trackerOptions.zoneDistanceX / 2; // split field in half

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

function toggleTracker():void {
    if (!Player) {
        return startCamera();
    }

    Player.toggleTracking();
}