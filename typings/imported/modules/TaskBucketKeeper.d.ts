declare class TaskBucketKeeper {
    addNewFormula:(formula:TaskFormula) => void
    trackCoordinate:(coord:CoordDimen, trackerCreator:(coord:Coordinate, formula:TaskFormula) => TaskTracker) => void
    cycleAndRetrieve:() => TaskTracker[]
    getTrackerConfidencePercent:(tracker:TaskTracker) => number
    drawTriggerZones:() => void
    updateTrackerDimens:(dimens:CoordDimen) => void
}

interface TaskBucketKeeperOptions {
    completedTrackerAfterLife:number
}