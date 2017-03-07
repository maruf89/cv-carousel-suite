export function $ (selector:string, el:Element):Element {
    return (el || document).querySelector(selector)
}

export function $$ (selector:string, el:Element):NodeListOf<Element> {
    return (el || document).querySelectorAll(selector)
}

export function $class (selector:string, el:Element):NodeListOf<Element> {
    return (el || document).getElementsByClassName(selector)
}

export function $id (selector:string):HTMLElement {
    return document.getElementById(selector)
}