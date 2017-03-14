declare class TaskTracker {
    decayAmt:number
    lastInstructions:TrackInstructions
    data:any
    
    getLastCoordinate:() => Coordinate
    getInstructionsForCoord:(centerCoord:Coordinate) => TrackInstructions
    isNearNeighbor:(coord:Coordinate) => boolean
    appliedInstructions:() => void
    growNutrients:(growth:number, coordCenter:Coordinate) => number
    decay:() => boolean
    isCompleted:() => boolean
    getConfidence:() => number
}

interface TaskTrackerOptions {
    // A constructor for a scanner class to determine following trigger points
    scannerConstructor: new (rule:ScannerDimen, trackerDimens:CoordDimen) => Scanner

    /**
     * an int representing how many px away a trackment must away from
     * this trackers last known position to be disqualified as part of
     * this tracker chain - computes both it's x & y values
     * 
     * TODO: change from an absolute px value to a relative value
     */
    relatedDistThresh?:Coordinate

    /**
     * An integer representing how long a tracker survives
     * 
     * If 10 frames pass before this tracker is engaged again
     * it will need to have > 10 confidence to not be garbage collected
     */
    initialLife?:number

    // to allow storing misc data
    data?:any
}

interface TrackingOptions {
    /**
     * where the start/end trigger zones should start from the right & left edges
     */
    xAxisDistance:number

    // internal usage
    _taskColorIndex?:number
}

type TrackerState = "growing" | "persisting" | "decaying" | "triggered" | "finished";

declare class TrackInstructions {
    coord:Coordinate
    growth:number
    state:TrackerState
    alreadyApplied:boolean

    applyMatches:(isNeighbor:boolean, towardsGoal:boolean) => void
    isGrowing:() => boolean
}