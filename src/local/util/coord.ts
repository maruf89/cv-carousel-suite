
export function arrayToCoordDimen(array:number[]):CoordDimen {
    return {
        x: array[0],
        y: array[1],
        width: array[2],
        height: array[3]
    };
}

export function coordDimenToCenterCoord(coordDimen:CoordDimen):Coordinate {
    return {
        x: coordDimen.x + coordDimen.width / 2,
        y: coordDimen.y + coordDimen.height / 2
    }
}