/**
 * Created by skuroda on 12/6/15.
 */

$(document).ready(function() {

    document.addEventListener("deviceready", onDeviceReady, false);
    //Exit app if android back button is pressed on start screen
    function onDeviceReady() {
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            navigator.app.exitApp();
        }, false);
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};