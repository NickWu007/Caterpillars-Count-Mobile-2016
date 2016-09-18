/**
 * Created by skuroda on 11/6/15.
 */
$(document).ready(function(){
    // Consider change to the devel site url.
    var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";

    document.addEventListener("deviceready", onDeviceReady, false);
    //Return to start screen if android back button is pressed
    function onDeviceReady(){
        document.addEventListener("backbutton", function(e){
            e.preventDefault();
            window.location.assign("StartScreen.html");
        }, false);
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};
