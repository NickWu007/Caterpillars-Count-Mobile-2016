/**
 * Created by palmour on 9/20/16
*/
var db;
var survey_result;
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
    
    document.addEventListener("backbutton", function(e){
        db.close();
        e.preventDefault();
        window.location.assign("StartScreen.html");
    }, false);

    db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBSuccessCB(){
        alert("DB open OK");

    }

    db.transaction(function(tx){
        //tx.executeSql('INSERT INTO SURVEY VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
        //['survey', 'BBS-27-041-11', 'palmour', 'shadow', "2", 'A', '2016-Sep-27 1:03PM', "60","70", ' ', ' ', ' ',' ', ' ', 'Mobile']);
        tx.executeSql('select distinct siteID, circle, survey, timeStart from SURVEY', [], function(tx, rs){
            if(rs.rows.length>0) {survey_result=rs.rows;}
            else{alert("survey database empty");}
        });

    }, function(error){
        alert("Transaction error: "+error.message);
    }, function(){
        alert("successfully retrieved pending surveys");
        var list_content="";
        for(var i=0; i<survey_result.length; i++){
            var row = survey_result.item(i);
            var new_list_item = '<li class="survey_item"><h5>Site: '+row.siteID+'</h5><h5>Circle: '+row.circle+
            '</h5><h5>Survey: '+row.survey+'</h5><h5>Time: '+row.timeStart+'<h5>id: </h5>'+
            '<div class="survey_delete text-center white-text"> Delete this Survey</div></li><hr>';

            list_content += new_list_item;
        }

        $(".survey_list").html(list_content);
        numSurveys();
    });
}

$(document).ready(function(){
    numSurveys();
    
});

function numSurveys(){
    var $list_length = $(".survey_item").length; //computes number of items in the survey list
    $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count
}
