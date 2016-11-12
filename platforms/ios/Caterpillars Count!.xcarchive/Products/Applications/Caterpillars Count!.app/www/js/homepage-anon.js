/**
 * Created by skuroda on 11/6/15.
 */
var db;

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
        
        //we may not need to open db at this page. 
        /*db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
        ); */
        function DBSuccessCB(){
            alert("DB open OK");
        }

        alert("User in anonymous mode. Not logged in.");
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};