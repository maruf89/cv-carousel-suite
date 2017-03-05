var HIDDEN_CLASS = 'hidden'

export function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

export function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

export function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className=el.className.replace(reg, ' ')
    }
}

export function selectorMatches(el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1
    }

    return f.call(el, selector)
}

export function $delegate(el, selector, method, callback) {
    if (typeof method === 'function' && typeof callback === "undefined") {
        callback = method
        method = "click"
    }

    el.addEventListener(method, function (e) {
        if (e.target && selectorMatches(e.target, selector)) {
            callback(e)
        }
    });
}

export function $closest(el, selector) {
    var parent
    while (parent = el.parentElement) {
        if (selectorMatches(parent, selector)) {
            return parent
        }
    }
}

export function hide(el) {
    addClass(el, HIDDEN_CLASS)
}

export function show(el) {
    removeClass(el, HIDDEN_CLASS)
}

export function animate(elem, style, unit, from, to, time, prop) {
    if (!elem) {
        return;
    }
    var start = new Date().getTime(),
        timer = setInterval(function () {
            var step = Math.min(1, (new Date().getTime() - start) / time);
            if (prop) {
                elem[style] = (from + step * (to - from))+unit;
            } else {
                elem.style[style] = (from + step * (to - from))+unit;
            }
            if (step === 1) {
                clearInterval(timer);
            }
        }, 1000 / 60);
    if (prop) {
          elem[style] = from+unit;
    } else {
          elem.style[style] = from+unit;
    }
}