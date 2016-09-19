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
    $(".pending-button").click(function(){
        $(".background").toggle();
        var $pending_button_content = $(".pending-button").text();
        if($pending_button_content==="Show Pending Surveys"){
            $(".pending-button").html("Hide Pending Surveys");
        }
        else{$(".pending-button").html("Show Pending Surveys");}
    }); 
    //hides and shows pending surveys
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};

