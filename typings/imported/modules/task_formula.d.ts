interface task_formula extends scanner {
    canvasZone?:canvas_zone

    testForNewTask:(coord:Coordinate) => boolean
    getFollowTriggers:() => ScannerDimen[]
    getCallback:() => (formula:task_formula, tracker:task_tracker) => void
    drawTriggerZone:(context:CanvasRenderingContext2D) => void
}

interface TaskFormulaOptions {
    trigger:ScannerDimen
    followTriggers:ScannerDimen[]
    name:string
    restraints:CoordDimen
    onComplete:(formula:task_formula, tracker:task_tracker) => void
}