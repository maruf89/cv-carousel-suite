import {Promise} from 'bluebird';

function promisifyEventListener(el:HTMLElement, actionType:string):Promise<HTMLElement> {
    return new Promise(function (resolve, reject) {
        el.addEventListener(actionType, function () {
            return resolve(el);
        });
    });
}

function extendOptions(extendObj:any, defaults:any):any {
    for (let prop in defaults) {
        switch (typeof extendObj[prop]) {
            case "undefined":
                extendObj[prop] = defaults[prop];
                break;
            case "object":
                if (!Array.isArray(extendObj[prop]))
                    extendObj[prop] = extendOptions(extendObj[prop], defaults[prop])
                break;
        }
    }

    return extendObj;
}

export default {
    promisifyEventListener: promisifyEventListener,
    extendOptions: extendOptions,
}