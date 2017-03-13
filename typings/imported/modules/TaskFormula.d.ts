declare class TaskFormula extends Scanner {
    canvasZone?:CanvasZone

    /**
     * Returns whether the passed in coordinates triggers a new TaskTracker
     */
    testForNewTask:(coord:Coordinate) => boolean

    /**
     * a simple getter
     */
    getFollowTriggers:() => ScannerDimen[]
    getCallback:() => (formula:TaskFormula, tracker:TaskTracker) => void

    /**
     * Given a canvas will draw where the trigger zones are.
     * Useful for debugging
     */
    drawTriggerZone:(context:CanvasRenderingContext2D) => void
}

interface TaskFormulaOptions {
    /**
     * the dimension that a trackment must fall within to trigger a new TaskTracker
     */
    trigger:ScannerDimen

    /**
     * Any number of follow up drop zones to watch for when the trigger/previous trigger gets reached
     */
    followTriggers:ScannerDimen[]

    /**
     * Name to differentiate this formula from any others
     */
    name:string

    /**
     * The restraints of the incoming detector/detected image
     */
    restraints:CoordDimen

    /**
     * Once the trigger and all of it's follow triggers have been reached, this gets called
     */
    onComplete:(formula:TaskFormula, tracker:TaskTracker) => void
}