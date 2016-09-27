/**
 * Created by palmour on 9/20/16
*/
var DOMAIN = "http://develop-caterpillars.vipapps.unc.edu";
var db;

document.addEventListener("deviceready", onDeviceReady, false);
    
function onDeviceReady() {
    alert("ondeviceready fired");
    document.addEventListener("backbutton", function (e) {
        db.close;
        e.preventDefault();
        window.location.assign("homepage.html");
    }, false);

    db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBSuccessCB(){
        alert("DB open OK");
    }

    function  closeDB(){
        db.close(function(){
            alert("DB closed");
        }, function(error){
            alert("DB Closing Error:"+error.message);
        });
    }

    var firsttime = true;
    db.transaction(function(tx){
        tx.executeSql("CREATE TABLE IF NOT EXISTS SURVEY (siteID, circle, survey, timeSubmit, surveyID)");
        tx.executeSql('SELECT count(*) AS NUM from SURVEY', [], function(tx, rs){
            alert("#lines in db: "+rs.rows.item(0).NUM);
            if(parseInt(rs.rows.item(0).NUM)>0){
                firsttime=false;
            }

            if(firsttime){
                db.transaction(function(tx){
                    tx.execute("INSERT INTO SURVEY VALUES (?,?,?,?,?)", ['BBS-27-041-11', "2", 'A', '2016-Sep-27 1:03PM',
                    'd23fa24da322']);
                }, function(error){
                    alert("Transaction Error: "+error.message);
                });
            }
        });
    }, function(error){
        alert("Transaction error: "+error.message);
    }, function(){
        console.log("Transaction OK. Database initialized sucessfully.");
    });
    closeDB();

    var survey_list = $("#survey_list");
    var survey_result;

    db.transaction(function(tx){
        tx.executeSql("Select distinct siteID, circle, survey, timeSubmit, surveyID from SURVEY", [], function(tx, rs){
            survey_result = rs.rows;
            //alert();
        });
    }, function(error){
        alert("Transaction error: "+error.message);
    }, function(){
        var list_content;
        for(var j=0; j<survey_result.length; j++){

            var row=survey_result.item(i);
            var new_list_item = '<li class= "survey_item"><h5>Site: '+ row.siteID+'</h5><h5>Circle: '+row.circle+
            '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeSubmit+'</h5><h5>id: '+
            row.surveyID+'</h5></li>';

            list_content += new_list_item;
        }
        $("#survey_list").html(list_content);
      });      
    } 

$(document).ready(function(){
    
    alert("document ready fired");
    var $list_length = $(".survey_item").length; //computes number of items in the survey list
        $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count 
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

