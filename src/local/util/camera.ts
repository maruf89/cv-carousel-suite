import {Promise} from 'bluebird';

export function loadCamera(video:HTMLVideoElement) {
    return new Promise(function (resolve, reject) {
        try {
            compatibility.getUserMedia({video: true}, function(stream:any) {
                try {
                    video.src = compatibility.URL.createObjectURL(stream);
                } catch (error) {
                    video.src = stream;
                }
                resolve(stream);
            }, function (error:any) {
                reject();
            });
        } catch (error) {
            reject();
        }
    })
}