interface detector_player {
    video:HTMLVideoElement
    canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D
    updateCanvasRestraints:(canvasRestraints:CoordDimen) => void
    initCamera:() => Promise<task_bucket_keeper>
    startTracking:() => void
    stopTracking:() => void
    toggleTracking:() => void
}

interface DetectorPlayerOptions {
    canvasRestraints:CoordDimen
    trackingOptions?:TaskTrackerOptions
    drawDetectors?:boolean
    log?:boolean
}