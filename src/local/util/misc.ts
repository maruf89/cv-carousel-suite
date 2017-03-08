import {Promise} from 'bluebird';

function promisifyEventListener(el:HTMLElement, actionType:string):Promise<HTMLElement> {
    return new Promise(function (resolve, reject) {
        el.addEventListener(actionType, function () {
            return resolve(el);
        });
    });
}

export default {
    promisifyEventListener: promisifyEventListener
}