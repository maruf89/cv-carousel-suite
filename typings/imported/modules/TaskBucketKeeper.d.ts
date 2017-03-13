declare class TaskBucketKeeper {
    addNewFormula:(formula:TaskFormula) => void
    trackCoordinate:(coord:CoordDimen, trackerCreator:(coord:Coordinate, formula:TaskFormula) => TaskTracker) => TaskTracker|null
    decay:() => void
    decayAndGetDecaying:() => TaskTracker[]
    getTrackerConfidencePercent:(tracker:TaskTracker) => number
    drawTriggerZones:() => void
    updateTrackerDimens:(dimens:CoordDimen) => void
}