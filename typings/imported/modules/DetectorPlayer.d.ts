declare class DetectorPlayer {
    video:HTMLVideoElement
    canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D
    updateCanvasRestraints:(canvasRestraints:CoordDimen) => void
    initCamera:() => Promise<TaskBucketKeeper>
    startTracking:() => void
    stopTracking:() => void
    toggleTracking:() => void
}

interface DetectorPlayerOptions {
    canvasRestraints:CoordDimen
    trackingOptions?:TaskTrackerOptions
    drawDetectors?:boolean // whether to draw detectors on the canvas
    log?:boolean
}