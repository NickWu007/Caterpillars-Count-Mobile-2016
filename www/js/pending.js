/**
 * Created by palmour on 9/20/16
*/
var db;
var DOMAIN = "http://develop-caterpillars.vipapps.unc.edu";
document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(function(){

    
    var $list_length = $(".survey_item").length; //computes number of items in the survey list
        $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count

    function  closeDB(){
        db.close(function(){
            alert("DB closed");
        }, function(error){
            alert("DB Closing Error:"+error.message);
        });
    }
});
    
function onDeviceReady() {
    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
        closeDB();
        navigator.app.exitApp();
    }, false);

    window.sqlitePlugin.echoTest(function(){
        console.log("echo test ok");
    });

    window.sqlitePlugin.selfTest(function(){
        console.log("self test ok");
    });

    function DBsuccess(){
        alert("DB open ok, Create Table etc");
    }

    var resultset;
    var db = window.sqlitePlugin.openDatabase({name: 'app.db', location: 'default'},
        DBsuccess(),
        function(error){
            alert("Error Open Database:"+JSON.stringify(error));
        }
    );
        
}

var retrievePendingSurveys = function(){
    $.ajax({
        url : DOMAIN + "/api/surveys.php", //name probably not correct. verify when testing.
        type: "POST",
        crossDomain: true,
        dataType: 'json',
        data: JSON.stringify({
            "action" :"getAllSiteState" //parameters probably incorrect. verify.
        }), 
        success: function(survey_result){
            populateSurveyList(site_result);
        }, 
        error : function(){
            navigator.notification.alert("Unexpected error retrieving pending surveys.");
        }
    });
};

var populateSurveyList = function(survey_result){
    var survey_list = document.getElementById("survey_list");
};

