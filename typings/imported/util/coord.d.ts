interface Coordinate {
    x:number
    y:number
}

interface Dimension {
    width:number
    height:number
}

interface CoordinateDelta {
    dx:number
    dy:number
}

interface CoordDimen extends Coordinate, Dimension {}

interface CoordDouble {
    x1:number
    x2:number
    y1:number
    y2:number
}

/**
 * The only difference is that all coordinates: x, y, width, and height are between 0 and 1
 *              x/y - represent what percentage they are right/down from the screen
 *              width/height - represent percent size of screen
 */
interface PercentCoordDimen extends Coordinate, Dimension {}