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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ({

/***/ 7:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjZiNTBlMWVhMmQzYzJlN2E2MDg/NzI0OSIsIndlYnBhY2s6Ly8vLi9zcmMvbG9jYWwvY2Fyb3VzZWwvY2Fyb3VzZWxfb3JpZ2luYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDaEVBLG9EQUFvRDtBQUVwRCxJQUFJLFFBQVEsR0FBRztJQUNYLElBQUksTUFBTSxHQUFPLENBQUMsQ0FBQyxzRkFBc0YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDN0csT0FBTyxHQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQ3JDLEtBQUssR0FBb0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFDeEQsWUFBWSxHQUFjLEVBQUUsRUFDNUIsUUFBWSxDQUFDO0lBRWpCLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0QsSUFBSSxDQUFDO1FBQ0QsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsRUFBRSxVQUFTLE1BQVU7WUFDekQs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QzNFLENBQUM7QUFDTCxDQUFDO0FBRUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7SUFDdEQsUUFBUSxFQUFFLENBQUM7QUFDZixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJidWlsZC9wdWJsaWMvY2Fyb3VzZWwvY2Fyb3VzZWxfb3JpZ2luYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA3KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAyNmI1MGUxZWEyZDNjMmU3YTYwOCIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2luZGV4LmQudHNcIiAvPlxuXG52YXIgYXV0b3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzOmFueSA9ICQoJzxjYW52YXMgc3R5bGU9XCJwb3NpdGlvbjogZml4ZWQ7IHotaW5kZXg6IDEwMDE7dG9wOiAxMHB4OyByaWdodDogMTBweDsgb3BhY2l0eTogMC45XCI+JykuZ2V0KDApLFxuICAgICAgICBjb250ZXh0OmFueSA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICB2aWRlbzpIVE1MVmlkZW9FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKSxcbiAgICAgICAgZmlzdF9wb3Nfb2xkOm51bWJlcltdW10gPSBbXSxcbiAgICAgICAgZGV0ZWN0b3I6YW55O1xuIFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBjb21wYXRpYmlsaXR5LmdldFVzZXJNZWRpYSh7dmlkZW86IHRydWV9LCBmdW5jdGlvbihzdHJlYW06YW55KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZpZGVvLnNyYyA9IGNvbXBhdGliaWxpdHkuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB2aWRlby5zcmMgPSBzdHJlYW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wYXRpYmlsaXR5LnJlcXVlc3RBbmltYXRpb25GcmFtZShwbGF5KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yOmFueSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJXZWJSVEMgbm90IGF2YWlsYWJsZVwiKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBwbGF5KCkge1xuICAgICAgICBjb21wYXRpYmlsaXR5LnJlcXVlc3RBbmltYXRpb25GcmFtZShwbGF5KTtcbiAgICAgICAgaWYgKHZpZGVvLnBhdXNlZCkgdmlkZW8ucGxheSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHZpZGVvLnJlYWR5U3RhdGUgPT09IHZpZGVvLkhBVkVfRU5PVUdIX0RBVEEgJiYgdmlkZW8udmlkZW9XaWR0aCA+IDApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyogUHJlcGFyZSB0aGUgZGV0ZWN0b3Igb25jZSB0aGUgdmlkZW8gZGltZW5zaW9ucyBhcmUga25vd246ICovXG4gICAgICAgICAgICBpZiAoIWRldGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gfn4oODAgKiB2aWRlby52aWRlb1dpZHRoIC8gdmlkZW8udmlkZW9IZWlnaHQpO1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSA4MDtcbiAgICAgICAgICAgICAgICBkZXRlY3RvciA9IG5ldyBvYmplY3RkZXRlY3QuZGV0ZWN0b3Iod2lkdGgsIGhlaWdodCwgMS4xLCBvYmplY3RkZXRlY3QuaGFuZGZpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIC8qIERyYXcgdmlkZW8gb3ZlcmxheTogKi9cbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IH5+KDEwMCAqIHZpZGVvLnZpZGVvV2lkdGggLyB2aWRlby52aWRlb0hlaWdodCk7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gMTAwO1xuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodmlkZW8sIDAsIDAsIGNhbnZhcy5jbGllbnRXaWR0aCwgY2FudmFzLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjb29yZHMgPSBkZXRlY3Rvci5kZXRlY3QodmlkZW8sIDEpO1xuICAgICAgICAgICAgaWYgKGNvb3Jkc1swXSkge1xuICAgICAgICAgICAgICAgIHZhciBjb29yZCA9IGNvb3Jkc1swXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvKiBSZXNjYWxlIGNvb3JkaW5hdGVzIGZyb20gZGV0ZWN0b3IgdG8gdmlkZW8gY29vcmRpbmF0ZSBzcGFjZTogKi9cbiAgICAgICAgICAgICAgICBjb29yZFswXSAqPSB2aWRlby52aWRlb1dpZHRoIC8gZGV0ZWN0b3IuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgICAgIGNvb3JkWzFdICo9IHZpZGVvLnZpZGVvSGVpZ2h0IC8gZGV0ZWN0b3IuY2FudmFzLmhlaWdodDtcbiAgICAgICAgICAgICAgICBjb29yZFsyXSAqPSB2aWRlby52aWRlb1dpZHRoIC8gZGV0ZWN0b3IuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgICAgIGNvb3JkWzNdICo9IHZpZGVvLnZpZGVvSGVpZ2h0IC8gZGV0ZWN0b3IuY2FudmFzLmhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8qIEZpbmQgY29vcmRpbmF0ZXMgd2l0aCBtYXhpbXVtIGNvbmZpZGVuY2U6ICovXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkID0gY29vcmRzWzBdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb29yZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb29yZHNbaV1bNF0gPiBjb29yZFs0XSkgY29vcmQgPSBjb29yZHNbaV07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyogU2Nyb2xsIHdpbmRvdzogKi9cbiAgICAgICAgICAgICAgICB2YXIgZmlzdF9wb3MgPSBbY29vcmRbMF0gKyBjb29yZFsyXSAvIDIsIGNvb3JkWzFdICsgY29vcmRbM10gLyAyXTtcbiAgICAgICAgICAgICAgICBsZXQgb2xkUG9zOm51bWJlcltdID0gZ2V0TGFzdEZpc3RQb3MoZmlzdF9wb3Nfb2xkKTtcbiAgICAgICAgICAgICAgICBpZiAob2xkUG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkeCA9IChmaXN0X3Bvc1swXSAtIG9sZFBvc1swXSkgLyB2aWRlby52aWRlb1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gKGZpc3RfcG9zWzFdIC0gb2xkUG9zWzFdKSAvIHZpZGVvLnZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeShkeCAqIDIwMCwgZHkgKiAyMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmaXN0X3Bvc19vbGQudW5zaGlmdChmaXN0X3Bvcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyogRHJhdyBjb29yZGluYXRlcyBvbiB2aWRlbyBvdmVybGF5OiAqL1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAnMic7XG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgwLCAyNTUsIDI1NSwgMC41KSc7XG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgY29vcmRbMF0gLyB2aWRlby52aWRlb1dpZHRoICogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjb29yZFsxXSAvIHZpZGVvLnZpZGVvSGVpZ2h0ICogY2FudmFzLmNsaWVudEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgY29vcmRbMl0gLyB2aWRlby52aWRlb1dpZHRoICogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjb29yZFszXSAvIHZpZGVvLnZpZGVvSGVpZ2h0ICogY2FudmFzLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRMYXN0RmlzdFBvcyhwb3M6bnVtYmVyW11bXSk6bnVtYmVyW10ge1xuICAgICAgIGxldCBlbmQ6bnVtYmVyID0gMTA7XG5cbiAgICAgICBpZiAoIXBvc1tlbmRdKSByZXR1cm4gbnVsbDtcblxuICAgICAgIGxldCBzdW1YOm51bWJlciA9IDA7XG4gICAgICAgbGV0IHN1bVk6bnVtYmVyID0gMDtcbiAgICAgICBsZXQgbWludXNMZW5ndGg6bnVtYmVyID0gMztcbiAgICAgICBsZXQgaTpudW1iZXIgPSBlbmQgLSBtaW51c0xlbmd0aCArIDE7XG5cbiAgICAgICBmb3IgKDtpIDw9IGVuZDsgaSsrKSB7XG4gICAgICAgICAgIHN1bVggKz0gcG9zW2ldWzBdO1xuICAgICAgICAgICBzdW1ZICs9IHBvc1tpXVsxXTtcbiAgICAgICB9XG5cbiAgICAgICByZXR1cm4gW01hdGgucm91bmQoc3VtWCAvIG1pbnVzTGVuZ3RoKSwgTWF0aC5yb3VuZChzdW1ZIC8gbWludXNMZW5ndGgpXTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaW5rJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKTp2b2lkIHtcbiAgICBhdXRvcGxheSgpO1xufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi9zb3VyY2UtbWFwLWxvYWRlciEuL3NyYy9sb2NhbC9jYXJvdXNlbC9jYXJvdXNlbF9vcmlnaW5hbC50cyJdLCJzb3VyY2VSb290IjoiIn0=