export function generateRainbowHex(i:number, frequency:number):string {
    let red:number   = Math.sin(frequency*i + 0) * 127 + 128;
    let green:number = Math.sin(frequency*i + 2) * 127 + 128;
    let blue:number  = Math.sin(frequency*i + 4) * 127 + 128;

    return RGB2Color(red,green,blue);
}

export function generateRGBA(opacity:number = 1, i:number, frequency:number):string {
    let red:number   = Math.floor(Math.sin(frequency*i + 0) * 127 + 128);
    let green:number = Math.floor(Math.sin(frequency*i + 2) * 127 + 128);
    let blue:number  = Math.floor(Math.sin(frequency*i + 4) * 127 + 128);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

export function RGB2Color(r:number ,g:number ,b:number):string {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n:number):string {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}