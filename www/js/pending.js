/**
 * Created by palmour on 9/20/16
*/
var db;
var survey_result;
var survey;
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
            if(row.errorCode===0){
                if(row.siteID===-1){
                    var circle_text;
                    if(row.circle === -1){circle_text="Unknown";}
                    else{circle_text = row.circle;}
                     new_list_item= '<li class="survey_item_Pending" id="'+row.timeStart+'"><h5>Click Here to Complete this Survey</h5><h5>Circle: '+circle_text+
                    '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+
                    '<br><div class="survey_delete text-center white-text" id="'+row.timeStart+'"> Delete this Survey</div></li><hr>';
                }else{
                    new_list_item= '<li class="survey_item" id="'+row.timeStart+'"><h5>Site: '+row.siteID+'</h5><h5>Circle: '+row.circle+
                    '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+
                    "</h5><img src='" + row.leafImageURI + "' id='arthropod-photo' height = '200' width ='200'>" + 
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
                "<img src='" + row.leafImageURI + "' id='arthropod-photo' height = '200' width ='200'>" + 
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
            if (confirm("Are you sure you wanted to delete this survey") === true) {
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
                survey = survey_result.item(i);
                if(survey.siteID>-1){
                    //siteID==-1 mean incomplete survey
                    submitSurveyToServer(i, survey);
                    
                }
               
            }
    }else{
        window.alert("Upload unsuccessful");
    }  
   });
});

function numSurveys(){
    $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count
}

function deleteSurvey(timeStart){
    if(timeStart===null||timeStart===""||timeStart===undefined){
        alert("Did not fetch correct Parameter to delete a row");
    }else{
        db.transaction(function(tx){
            tx.executeSql("DELETE from SURVEY where timeStart=?", [timeStart]);
        },  function(error){
            alert("Transaction error: "+error.message);
        }, function(){
            alert("Successfully delete this survey");
            renderSurvey();
        });
    }
    
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
        success: function(result){
            alert("Survey #" + i + " is submitted successfully.");
            uploadPhoto(survey.leafImageURI, "leaf-photo", result.surveyID);
            // submitArthropodsToServer(result, survey);
            // deleteSurvey(survey.timeStart);
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

//Submits arthropod info to server for each saved order/
//Calls uploadPhoto with orderPhoto (if a photo was taken)
//upon each successful arthropod submission upload
var submitArthropodsToServer = function(result, survey){
    
    $.ajax({
        url: DOMAIN + "/api/submission_full.php",
        type: "POST",
        crossDomain: true,
        dataType: 'json',
        data: JSON.stringify({
            "type": "order",
            "surveyID": result.surveyID,
            "userID": stored_user_info.userId,
            "password": stored_user_info.password,
            //order
            "orderArthropod": $("h4", this).text(),
            "orderLength": survey.length,
            "orderNotes": survey.notes,
            "orderCount": survey.count,
            //Caterpillar features
            "hairyOrSpiny": survey.hairyOrSpiny,
            "leafRoll": survey.leafRoll,
            "silkTent": survey.silkTent
        }),
        success: function (arthropodResult) {
            //navigator.notification.alert("arthropod info submitted");
            //If arthropod successfully submitted to database, attempt photo upload
            //Upload arthropod photo if one exists
            if (survey.arthropodImageURI !== null && asurvey.rthropodImageURI !== undefined) {
                //navigator.notification.alert("Uploading order photo");
                uploadPhoto(survey.arthropodImageURI, "arthropod-photo", arthropodResult.orderID);
            }
            // else {
            //     //Increment number of arthropods submitted here when no photo to upload
            //     //to prevent duplicate success alerts
            //     numberOfArthropodsSubmitted++;
            //     if (numberOfArthropodsSubmitted == numberOfArthropodsToSubmit) {
            //         var successMessage = confirm("Successfully submitted survey data!\n\n" +
            //             "Clear form fields?");
            //         if (successMessage === true) {
            //             clearFields();
            //         }
            //     }
            // }
        },
        error: function () {
            navigator.notification.alert("Unexpected error submitting " + $("h4", this).text() + " data.");
        }
    });
};

//databaseID = surveyID if leaf photo, orderID if arthropod photo
//Form is cleared if final arthropod photo is successfully uploaded
//Uploads photo using FileTransfer plugin.
function uploadPhoto(photoURI, photoType, databaseID){
    // !! Assumes variable fileURL contains a valid URL to a text file on the device,
    //    for example, cdvfile://localhost/persistent/path/to/file.txt

    var leafSuccess = function (r) {
        //navigator.notification.alert("leaf photo uploaded");
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
        cosole.log("survey.timeStart = " + survey.timeStart);
        deleteSurvey(survey.timeStart);
    };

    var fail = function (error) {
        navigator.notification.alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
    };

    var arthropodSuccess = function(r){
        //navigator.notification.alert("order photo uploaded");

        //Increment number of arthropods submitted
        //here when there is a photo to upload
        //to prevent duplicate success alerts
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);

        //If this was the last order photo to submit, clear form, submission succeeded
        // if(numberOfArthropodsSubmitted == numberOfArthropodsToSubmit) {
        //     navigator.notification.alert("Successfully submitted survey data!");
        //     clearFields();

        // }
    };

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = photoURI.substr(photoURI.lastIndexOf('/') + 1);
    options.mimeType="image/jpeg";
    options.chunkedMode = false;
    options.headers = {
        Connection: "close"
    };

    // var params = {};
    // params.fullpath = imageURI;
    // params.name = options.fileName;
    
    // options.params = params;

    var ft = new FileTransfer();
    //If uploading leaf photo
    if(photoType.localeCompare("leaf-photo") === 0) {
        options.fileName = "survey_" + databaseID + "_leaf_photo.jpg";
        ft.upload(photoURI, encodeURI(DOMAIN + "/api/uploads.php?surveyID=" + databaseID), leafSuccess, fail, options);
    }
    //Uploading arthropod photo
    else if(photoType.localeCompare("arthropod-photo") === 0){
        options.fileName = "order_" + databaseID + "_arthropod_photo.jpg";
        ft.upload(photoURI, encodeURI(DOMAIN + "/api/uploads.php?orderID=" + databaseID), arthropodSuccess, fail, options);
    }
}