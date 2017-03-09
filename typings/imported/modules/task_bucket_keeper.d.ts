interface task_bucket_keeper {
    addNewFormula:(formula:task_formula) => void
    trackCoordinate:(coord:CoordDimen, trackerCreator:(coord:CoordDimen, formula:task_formula) => task_tracker) => task_tracker|null
    decay:() => void
    decayAndGetDecaying:() => task_tracker[]
    getTrackerConfidencePercent:(tracker:task_tracker) => number
    drawTriggerZones:() => void
    updateTrackerDimens:(dimens:CoordDimen) => void
}