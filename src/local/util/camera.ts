import {Promise} from 'bluebird';

export function LoadCamera(video:HTMLVideoElement):Promise<MediaStream> {
    return new Promise(function (resolve, reject) {
        try {
            compatibility.getUserMedia({video: true}, function(stream:MediaStream) {
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