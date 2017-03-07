/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ({

/***/ 16:
/***/ (function(module, exports) {

/// <reference path="../../../typings/index.d.ts" />
var autoplay = function () {
    var canvas = $('<canvas style="position: fixed; z-index: 1001;top: 10px; right: 10px; opacity: 0.9">').get(0), context = canvas.getContext('2d'), video = document.createElement('video'), fist_pos_old = [], detector;
    document.getElementsByTagName('body')[0].appendChild(canvas);
    try {
        compatibility.getUserMedia({ video: true }, function (stream) {
            try {
                video.src = compatibility.URL.createObjectURL(stream);
            }
            catch (error) {
                video.src = stream;
            }
            compatibility.requestAnimationFrame(play);
        }, function (error) {
            console.log("WebRTC not available");
        });
    }
    catch (error) {
        console.log(error);
    }
    function play() {
        compatibility.requestAnimationFrame(play);
        if (video.paused)
            video.play();
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            /* Prepare the detector once the video dimensions are known: */
            if (!detector) {
                var width = ~~(80 * video.videoWidth / video.videoHeight);
                var height = 80;
                detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
            }
            /* Draw video overlay: */
            canvas.width = ~~(100 * video.videoWidth / video.videoHeight);
            canvas.height = 100;
            context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);
            var coords = detector.detect(video, 1);
            if (coords[0]) {
                var coord = coords[0];
                /* Rescale coordinates from detector to video coordinate space: */
                coord[0] *= video.videoWidth / detector.canvas.width;
                coord[1] *= video.videoHeight / detector.canvas.height;
                coord[2] *= video.videoWidth / detector.canvas.width;
                coord[3] *= video.videoHeight / detector.canvas.height;
                /* Find coordinates with maximum confidence: */
                var coord = coords[0];
                for (var i = coords.length - 1; i >= 0; --i)
                    if (coords[i][4] > coord[4])
                        coord = coords[i];
                /* Scroll window: */
                var fist_pos = [coord[0] + coord[2] / 2, coord[1] + coord[3] / 2];
                var oldPos = getLastFistPos(fist_pos_old);
                if (oldPos) {
                    var dx = (fist_pos[0] - oldPos[0]) / video.videoWidth, dy = (fist_pos[1] - oldPos[1]) / video.videoHeight;
                    window.scrollBy(dx * 200, dy * 200);
                }
                fist_pos_old.unshift(fist_pos);
                /* Draw coordinates on video overlay: */
                context.beginPath();
                context.lineWidth = '2';
                context.fillStyle = 'rgba(0, 255, 255, 0.5)';
                context.fillRect(coord[0] / video.videoWidth * canvas.clientWidth, coord[1] / video.videoHeight * canvas.clientHeight, coord[2] / video.videoWidth * canvas.clientWidth, coord[3] / video.videoHeight * canvas.clientHeight);
                context.stroke();
            }
            ;
        }
    }
    function getLastFistPos(pos) {
        var end = 10;
        if (!pos[end])
            return null;
        var sumX = 0;
        var sumY = 0;
        var minusLength = 3;
        var i = end - minusLength + 1;
        for (; i <= end; i++) {
            sumX += pos[i][0];
            sumY += pos[i][1];
        }
        return [Math.round(sumX / minusLength), Math.round(sumY / minusLength)];
    }
};
document.getElementById('link').addEventListener('click', function () {
    autoplay();
});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNWFmNmM4NzE5MzAxNDAwZDI5OGY/YmNhMyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9jYWwvY2Fyb3VzZWwvY2Fyb3VzZWxfb3JpZ2luYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDaEVBLG9EQUFvRDtBQUVwRCxJQUFJLFFBQVEsR0FBRztJQUNYLElBQUksTUFBTSxHQUFPLENBQUMsQ0FBQyxzRkFBc0YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDN0csT0FBTyxHQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQ3JDLEtBQUssR0FBb0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFDeEQsWUFBWSxHQUFjLEVBQUUsRUFDNUIsUUFBWSxDQUFDO0lBRWpCLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0QsSUFBSSxDQUFDO1FBQ0QsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsRUFBRSxVQUFTLE1BQVU7WUFDekQs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QzNFLENBQUM7QUFDTCxDQUFDO0FBRUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7SUFDdEQsUUFBUSxFQUFFLENBQUM7QUFDZixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJidWlsZC9wdWJsaWMvY2Fyb3VzZWwvY2Fyb3VzZWxfb3JpZ2luYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxNik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNWFmNmM4NzE5MzAxNDAwZDI5OGYiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIgLz5cblxudmFyIGF1dG9wbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhczphbnkgPSAkKCc8Y2FudmFzIHN0eWxlPVwicG9zaXRpb246IGZpeGVkOyB6LWluZGV4OiAxMDAxO3RvcDogMTBweDsgcmlnaHQ6IDEwcHg7IG9wYWNpdHk6IDAuOVwiPicpLmdldCgwKSxcbiAgICAgICAgY29udGV4dDphbnkgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgdmlkZW86SFRNTFZpZGVvRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyksXG4gICAgICAgIGZpc3RfcG9zX29sZDpudW1iZXJbXVtdID0gW10sXG4gICAgICAgIGRldGVjdG9yOmFueTtcbiBcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgICAgY29tcGF0aWJpbGl0eS5nZXRVc2VyTWVkaWEoe3ZpZGVvOiB0cnVlfSwgZnVuY3Rpb24oc3RyZWFtOmFueSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2aWRlby5zcmMgPSBjb21wYXRpYmlsaXR5LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gc3RyZWFtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcGF0aWJpbGl0eS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGxheSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcjphbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV2ViUlRDIG5vdCBhdmFpbGFibGVcIik7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgICAgY29tcGF0aWJpbGl0eS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGxheSk7XG4gICAgICAgIGlmICh2aWRlby5wYXVzZWQpIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh2aWRlby5yZWFkeVN0YXRlID09PSB2aWRlby5IQVZFX0VOT1VHSF9EQVRBICYmIHZpZGVvLnZpZGVvV2lkdGggPiAwKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIFByZXBhcmUgdGhlIGRldGVjdG9yIG9uY2UgdGhlIHZpZGVvIGRpbWVuc2lvbnMgYXJlIGtub3duOiAqL1xuICAgICAgICAgICAgaWYgKCFkZXRlY3Rvcikge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IH5+KDgwICogdmlkZW8udmlkZW9XaWR0aCAvIHZpZGVvLnZpZGVvSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gODA7XG4gICAgICAgICAgICAgICAgZGV0ZWN0b3IgPSBuZXcgb2JqZWN0ZGV0ZWN0LmRldGVjdG9yKHdpZHRoLCBoZWlnaHQsIDEuMSwgb2JqZWN0ZGV0ZWN0LmhhbmRmaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICAgICAvKiBEcmF3IHZpZGVvIG92ZXJsYXk6ICovXG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB+figxMDAgKiB2aWRlby52aWRlb1dpZHRoIC8gdmlkZW8udmlkZW9IZWlnaHQpO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHZpZGVvLCAwLCAwLCBjYW52YXMuY2xpZW50V2lkdGgsIGNhbnZhcy5jbGllbnRIZWlnaHQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY29vcmRzID0gZGV0ZWN0b3IuZGV0ZWN0KHZpZGVvLCAxKTtcbiAgICAgICAgICAgIGlmIChjb29yZHNbMF0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmQgPSBjb29yZHNbMF07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyogUmVzY2FsZSBjb29yZGluYXRlcyBmcm9tIGRldGVjdG9yIHRvIHZpZGVvIGNvb3JkaW5hdGUgc3BhY2U6ICovXG4gICAgICAgICAgICAgICAgY29vcmRbMF0gKj0gdmlkZW8udmlkZW9XaWR0aCAvIGRldGVjdG9yLmNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb29yZFsxXSAqPSB2aWRlby52aWRlb0hlaWdodCAvIGRldGVjdG9yLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgY29vcmRbMl0gKj0gdmlkZW8udmlkZW9XaWR0aCAvIGRldGVjdG9yLmNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgICAgICBjb29yZFszXSAqPSB2aWRlby52aWRlb0hlaWdodCAvIGRldGVjdG9yLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvKiBGaW5kIGNvb3JkaW5hdGVzIHdpdGggbWF4aW11bSBjb25maWRlbmNlOiAqL1xuICAgICAgICAgICAgICAgIHZhciBjb29yZCA9IGNvb3Jkc1swXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY29vcmRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29vcmRzW2ldWzRdID4gY29vcmRbNF0pIGNvb3JkID0gY29vcmRzW2ldO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8qIFNjcm9sbCB3aW5kb3c6ICovXG4gICAgICAgICAgICAgICAgdmFyIGZpc3RfcG9zID0gW2Nvb3JkWzBdICsgY29vcmRbMl0gLyAyLCBjb29yZFsxXSArIGNvb3JkWzNdIC8gMl07XG4gICAgICAgICAgICAgICAgbGV0IG9sZFBvczpudW1iZXJbXSA9IGdldExhc3RGaXN0UG9zKGZpc3RfcG9zX29sZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFBvcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSAoZmlzdF9wb3NbMF0gLSBvbGRQb3NbMF0pIC8gdmlkZW8udmlkZW9XaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IChmaXN0X3Bvc1sxXSAtIG9sZFBvc1sxXSkgLyB2aWRlby52aWRlb0hlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoZHggKiAyMDAsIGR5ICogMjAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZmlzdF9wb3Nfb2xkLnVuc2hpZnQoZmlzdF9wb3MpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8qIERyYXcgY29vcmRpbmF0ZXMgb24gdmlkZW8gb3ZlcmxheTogKi9cbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gJzInO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMCwgMjU1LCAyNTUsIDAuNSknO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgIGNvb3JkWzBdIC8gdmlkZW8udmlkZW9XaWR0aCAqIGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29vcmRbMV0gLyB2aWRlby52aWRlb0hlaWdodCAqIGNhbnZhcy5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGNvb3JkWzJdIC8gdmlkZW8udmlkZW9XaWR0aCAqIGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29vcmRbM10gLyB2aWRlby52aWRlb0hlaWdodCAqIGNhbnZhcy5jbGllbnRIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TGFzdEZpc3RQb3MocG9zOm51bWJlcltdW10pOm51bWJlcltdIHtcbiAgICAgICBsZXQgZW5kOm51bWJlciA9IDEwO1xuXG4gICAgICAgaWYgKCFwb3NbZW5kXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICBsZXQgc3VtWDpudW1iZXIgPSAwO1xuICAgICAgIGxldCBzdW1ZOm51bWJlciA9IDA7XG4gICAgICAgbGV0IG1pbnVzTGVuZ3RoOm51bWJlciA9IDM7XG4gICAgICAgbGV0IGk6bnVtYmVyID0gZW5kIC0gbWludXNMZW5ndGggKyAxO1xuXG4gICAgICAgZm9yICg7aSA8PSBlbmQ7IGkrKykge1xuICAgICAgICAgICBzdW1YICs9IHBvc1tpXVswXTtcbiAgICAgICAgICAgc3VtWSArPSBwb3NbaV1bMV07XG4gICAgICAgfVxuXG4gICAgICAgcmV0dXJuIFtNYXRoLnJvdW5kKHN1bVggLyBtaW51c0xlbmd0aCksIE1hdGgucm91bmQoc3VtWSAvIG1pbnVzTGVuZ3RoKV07XG4gICAgfVxufVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGluaycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCk6dm9pZCB7XG4gICAgYXV0b3BsYXkoKTtcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vc291cmNlLW1hcC1sb2FkZXIhLi9zcmMvbG9jYWwvY2Fyb3VzZWwvY2Fyb3VzZWxfb3JpZ2luYWwudHMiXSwic291cmNlUm9vdCI6IiJ9