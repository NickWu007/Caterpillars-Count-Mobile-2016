/**
 * Created by palmour on 9/20/16
*/
$(document).ready(function(){

    document.addEventListener("deviceready", onDeviceReady, false);
    var $list_length = $(".survey_item").length; //computes number of items in the survey list
        $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count

    function  closeDB(){
        db.close(function(){
            alert("DB closed");
        }, function(error){
            alert("DB Closing Error:"+error.message);
        });
    }
    
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

        var first_time=true;
        db.transaction(function(tx){
            tx.executeSQL('select distinct site, circle, survey, time, id from SURVEY', [], function(tx, rs){
                resultset = rs.rows;
                alert("Rows retrieved: "+resultset.length);
            });
        }, function(errror){
            alert("Transaction Error" + error.message);
        }, function(){
            alert("Successfully retrieved pending surveys");

            var new_list_item;

            for(var i=0; i<resultset.length; i++){
                var row = resultset.item(i);

                new_list_item = "<li class=\"survey_item\"><h5>Site: "+row.site+"</h5><h5>Circle: " +
                    row.circle+"</h5><h5>Survey: "+row.survey+"</h5><h5>Time: "+row.time+"</h5><h5>id: "+
                    row.id+"</h5>";
                $(".survey_list ul").append(new_list_item);
            }
        }
        );
    }

});