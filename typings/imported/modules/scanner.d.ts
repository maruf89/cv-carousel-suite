declare class Scanner {
    matchesRule:(coord:Coordinate) => boolean
    setDimens:(dimens:CoordDimen) => void
    getRule:() => ScannerDimen
    getName:() => string
    isCloserToTarget:(coordA:Coordinate, coordB:Coordinate) => boolean
}

interface ScannerDimen extends PercentCoordDimen {
    name?:string
}