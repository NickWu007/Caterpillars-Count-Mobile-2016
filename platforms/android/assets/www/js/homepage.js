/**
 * Created by skuroda on 11/6/15.
 */
$(document).ready(function(){
    // Consider change to the devel site url.
    var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";
    var $list_length = $(".survey_item").length; //computes number of items in the survey list

    document.addEventListener("deviceready", onDeviceReady, false);
    //Return to start screen if android back button is pressed
    function onDeviceReady(){
        document.addEventListener("backbutton", function(e){
            e.preventDefault();
            window.location.assign("StartScreen.html");
        }, false);
        
    } 
    $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};