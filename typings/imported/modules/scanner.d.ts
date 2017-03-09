interface scanner {
    matchesRule:(coord:Coordinate) => boolean
    setDimens:(dimens:CoordDimen) => void
    getRule:() => ScannerDimen
    getName:() => string
}

interface ScannerDimen extends PercentCoordDimen {
    name?:string
}