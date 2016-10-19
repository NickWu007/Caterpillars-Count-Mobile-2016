/**
 * Created by palmour on 9/20/16
*/
var db;
var survey_result;
var $list_length;
var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
    
    document.addEventListener("backbutton", function(e){
        db.close();
        e.preventDefault();
        window.location.assign("homepage.html");
    }, false);

    db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBSuccessCB(){
        //alert("DB open OK");

    }
    renderSurvey();
}

function renderSurvey(){
    db.transaction(function(tx){
        tx.executeSql('select * from SURVEY', [], function(tx, rs){
            if(rs.rows.length>0) {
                survey_result=rs.rows;
            } else {
                // alert("survey database empty");
                $list_length = 0;
                $(".survey_list").html("");
                numSurveys();
            }
        });

    }, function(error){
        alert("Transaction error: "+error.message);
    }, function(){
        //alert("successfully retrieved pending surveys");
        var list_content="";
        $list_length=survey_result.length;
        for(var i=0; i<survey_result.length; i++){
            var row = survey_result.item(i);
            var new_list_item;
            if(row.errorCode==0){
                if(row.siteID===-1){
                    var circle_text;
                    if(row.circle === -1){circle_text="Unknown";}
                    else{circle_text = row.circle}
                     new_list_item= '<li class="survey_item_Pending" id="'+row.timeStart+'"><h5>Click Here to Complete this Survey</h5><h5>Circle: '+circle_text+
                    '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+
                    '<br><div class="survey_delete text-center white-text" id="'+row.timeStart+'"> Delete this Survey</div></li><hr>';
                }else{
                    new_list_item= '<li class="survey_item" id="'+row.timeStart+'"><h5>Site: '+row.siteID+'</h5><h5>Circle: '+row.circle+
                    '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+
                    '<br><div class="survey_delete text-center white-text" id="'+row.timeStart+'"> Delete this Survey</div></li><hr>';
                }

            }else{
                new_list_item='<li class="survey_item_error" id="'+row.timeStart+'"">';
                if(row.errorCode===400){
                    new_list_item+='<h4>400 Error---Bad Request</h4>';
                }else if(row.errorCode===401){
                    new_list_item+='<h4>401 Error---Unauthorized User</h4>';
                }else if(row.errorCode===500){
                    new_list_item+='<h4>500 Error---Internal Server Error</h4>';
                }else{

                }

                new_list_item+='<h5>Site: '+row.siteID+'</h5><h5>Circle: '+row.circle+
                '</h5><h5>UserID: '+row.userID+'</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+
                '<br><div class="survey_delete text-center white-text" id="'+row.timeStart+'"> Delete this Survey</div></li><hr>';
            }
            

            list_content += new_list_item;
        }

        $(".survey_list").html(list_content);
        numSurveys();
        $(".survey_item_error").click(function(){
           alert("This survey encontered Error when uploading. Please try again");
        });
    
        $(".survey_item_Pending").click(function(){
            var time=$(this).attr('id');
            alert("Will retrive survey created at:"+time);
            window.location.assign("survey.html?time="+time);
        });

        $(".survey_delete").click(function(e){
            var time=$(this).attr('id');
            if (confirm("Are you sure you wanted to delete this survey") == true) {
                deleteSurvey(time);
            }
            e.stopPropagation();
        });
    });
}

$(document).ready(function(){
    numSurveys();

    var $submitButton = $(".upload-button");
    $submitButton.click(function(e) {
        e.preventDefault();
        var ask = window.confirm("Ready to upload?");
        if (ask) {
            for (var i = 0; i< survey_result.length; i++){
                var survey = survey_result.item(i);
                if(survey.siteID>-1){
                    //siteID==-1 mean incomplete survey
                    submitSurveyToServer(i, survey);
                    
                }
               
            }
        renderSurvey();
    }else{
        window.alert("Upload unsuccessful");
    }  
    renderSurvey(); 
   });

});

function numSurveys(){
    $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count
}

function deleteSurvey(timeStart){
    if(timeStart==null||timeStart==""||timeStart===undefined){
        alert("Did not fetch correct Parameter to delete a row");
    }else{
        db.transaction(function(tx){
            tx.executeSql("DELETE from SURVEY where timeStart=?", [timeStart]);
        },  function(error){
            alert("Transaction error: "+error.message);
        }, function(){
            alert("Successfully delete this survey");
            
        });
    }
    renderSurvey();
    
}

function recordErrorCode(survey, errorCode) {
    db.transaction(function (tx) {
        var query = "UPDATE SURVEY SET errorCode = ? WHERE siteID = ? AND timeStart = ?";

        tx.executeSql(query, [errorCode, survey.siteID, survey.timeStart], function (tx, res) {
        },
        function (tx, error) {
            alert('UPDATE error: ' + error.message);
        });
    }, function (error) {
        alert('transaction error: ' + error.message);
    }, function () {
        // alert("update survey " + survey.siteID + "with error status: " + errorCode);
    });
}

function submitSurveyToServer(i, survey) {
    // Use /api/submission_full.php to test fail scenario  
    var xhr = $.ajax({
        url: DOMAIN + "/api/submission_full.php",
        type : "POST",
        crossDomain: true,
        dataType: 'json',
        data: JSON.stringify({
            "type" : "survey",
            "siteID" : survey.siteID,
            "userID" : survey.userID,
            "password" : survey.password,
            //survey
            "circle" : survey.circle,
            "survey" :  survey.survey,
            "timeStart" :  survey.timeStart,
            "temperatureMin" : survey.temperatureMin,
            "temperatureMax" : survey.temperatureMax,
            "siteNotes" :  survey.siteNotes,
            "plantSpecies" : survey.plantSpecies,
            "herbivory" : survey.herbivory,
            "surveyType" :  survey.surveyType,
            "leafCount" : parseInt(survey.leafCount),
            "source" : "Mobile"
        }),
        success: function(response, textStatus, jqXHR){
            alert("Survey #" + i + " is submitted successfully.");
            deleteSurvey(survey.timeStart);
        },
        error : function(xhr, status){
            navigator.notification.alert("Unexpected error submitting survey #" + i + " with error status: " + xhr.status + ".");
        },
        complete: function(xhr, textStatus) {
            if (xhr.status >= 400) {
                recordErrorCode(survey, xhr.status);
            }
        } 
    });
}
