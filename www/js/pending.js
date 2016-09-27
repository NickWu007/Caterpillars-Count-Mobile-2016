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

    var survey_list = $("#survey_list");
    var survey_result;
    db.transaction(function(tx){
        tx.executeSql("Select distinct site, circle, survey, time, id from SURVEY", [], function(tx, rs){
            survey_result = rs.rows;
            //alert();
        });
    }, function(error){
        alert("Transaction error: "+error.message);
    }, function(){
        var list_content;
        for(var j=0; j<survey_result.length; j++){

            var row=survey_result.item(i);
            var new_list_item = "<li><h5>Site: "+ row.siteID+"</h5><h5>Circle: "+row.circle+
            "</h5><h5>Survey: "+row.survey+"</h5><h5>Time: "+row.timeSubmit+"</h5><h5>id: "+
            row.surveyID+"</h5></li>";

            list_content += new_list_item;
        }
        $("#survey_list").html(list_content);
    }
    );
        
}

/*var retrievePendingSurveys = function(){
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
    for(var i=0; survey_result.length; i++){
        var stored_survey = document.createElement("survey");
        stored_survey.text = survey_result[i].
        survey_list.append(stored_survey);
    }
}; */

