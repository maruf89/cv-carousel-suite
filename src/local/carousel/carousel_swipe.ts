/// <reference path="../../../typings/index.d.ts" />

import {$id} from '../util/domSelector';
import {loadCamera} from '../util/camera';

interface pageData {
    video:HTMLVideoElement
    stream:MediaStream
    canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D
    positions:number[][]
    detector:any
    doDetect:boolean
}

var pageData:pageData = {
    video: null,
    stream: null,
    canvas: null,
    context: null,
    positions: [],
    detector: null,
    doDetect: false
}

window.onload = function () {
    startCarousel();
    startCamera();

    $id('stopButton').addEventListener('click', toggleTracker);
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
    pageData.canvas = <HTMLCanvasElement>$id('trackerCanvas');
    pageData.context = <CanvasRenderingContext2D>pageData.canvas.getContext('2d');
    pageData.video = <HTMLVideoElement>$id('videoStream');
    pageData.positions = [];

    loadCamera(pageData.video).then(function (stream:MediaStream) {
        pageData.stream = stream;
        startTracker(pageData);
    });
}

function startTracker(data:pageData):void {
    let closure = function () {
        play(data, closure);
    };

    data.doDetect = true;
    compatibility.requestAnimationFrame(closure);
}

function play(data:pageData, closure:Function):void {
    if (!data.doDetect) return;
    
    compatibility.requestAnimationFrame(closure);

    let video:HTMLVideoElement = data.video;
    let detector:any = data.detector;
    let canvas:HTMLCanvasElement = data.canvas;
    let context:CanvasRenderingContext2D = data.context;

    if (video.paused) video.play();
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        
        /* Prepare the detector once the video dimensions are known: */
        if (!detector) {
            var width = ~~(80 * video.videoWidth / video.videoHeight);
            var height = 80;
            detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
        }
    
        /* Draw video overlay: */
        canvas.width = ~~(100 * video.videoWidth / video.videoHeight);
        canvas.height = 100;
        context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);
        
        var coords = detector.detect(video, 1);
        if (coords[0]) {
            var coord = coords[0];
            
            /* Rescale coordinates from detector to video coordinate space: */
            coord[0] *= video.videoWidth / detector.canvas.width;
            coord[1] *= video.videoHeight / detector.canvas.height;
            coord[2] *= video.videoWidth / detector.canvas.width;
            coord[3] *= video.videoHeight / detector.canvas.height;
        
            /* Find coordinates with maximum confidence: */
            var coord = coords[0];
            for (var i = coords.length - 1; i >= 0; --i)
                if (coords[i][4] > coord[4]) coord = coords[i];
            
            /* Scroll window: */
            var fist_pos = [coord[0] + coord[2] / 2, coord[1] + coord[3] / 2];
            let oldPos:number[] = getLastFistPos(data.positions);
            if (oldPos) {
                var dx = (fist_pos[0] - oldPos[0]) / video.videoWidth,
                        dy = (fist_pos[1] - oldPos[1]) / video.videoHeight;
                
                    window.scrollBy(dx * 200, dy * 200);
            }
            
            data.positions.unshift(fist_pos);
            
            /* Draw coordinates on video overlay: */
            context.beginPath();
            context.lineWidth = 2;
            context.fillStyle = 'rgba(0, 255, 255, 0.5)';
            context.fillRect(
                coord[0] / video.videoWidth * canvas.clientWidth,
                coord[1] / video.videoHeight * canvas.clientHeight,
                coord[2] / video.videoWidth * canvas.clientWidth,
                coord[3] / video.videoHeight * canvas.clientHeight);
            context.stroke();
        };
    }
}

function getLastFistPos(pos:number[][]):number[] {
    let end:number = 10;

    if (!pos[end]) return null;

    let sumX:number = 0;
    let sumY:number = 0;
    let minusLength:number = 3;
    let i:number = end - minusLength + 1;

    for (;i <= end; i++) {
        sumX += pos[i][0];
        sumY += pos[i][1];
    }

    return [Math.round(sumX / minusLength), Math.round(sumY / minusLength)];
}

function toggleTracker() {
    let isEnabled = !pageData.doDetect;
    pageData.doDetect = isEnabled;
    isEnabled && startTracker(pageData) || (pageData.stream.getTracks()[0].stop());

    $id('stopButton').innerText = isEnabled ? 'Stop Tracking' : 'Start Tracking';
}