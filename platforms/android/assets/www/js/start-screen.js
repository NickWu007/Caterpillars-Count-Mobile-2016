/**
 * Created by skuroda on 12/6/15.
 */

$(document).ready(function() {

    document.addEventListener("deviceready", onDeviceReady, false);
    //Exit app if android back button is pressed on start screen


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

        var db = window.sqlitePlugin.openDatabase({name: 'app.db', location: 'default'},
            DBsuccess(),
            function(error){
                alert("Error Open Database:"+JSON.stringify(error));
            }
        );
        var firsttime=true;
        db.transaction(function(tx){
            tx.executeSql("CREATE TABLE IF NOT EXISTS USER (name, password, currentUser, userId)");
            tx.executeSql("CREATE TABLE IF NOT EXISTS SURVEY(type, siteID, userID, password, circle, survey, timeStart, temperatureMin, temperatureMax, siteNotes, plantSpecies, herbivory, surveyType, leafCount, source)");
            //tx.executeSql("DROP TABLE IF EXISTS SITE");
            tx.executeSql("CREATE TABLE IF NOT EXISTS SITE (siteId, siteName, userId, circle, state)");
            tx.executeSql('SELECT count(*) AS NUM from USER',[], function(tx, rs){
                alert("#lines in db:"+rs.rows.item(0).NUM);
                if(parseInt(rs.rows.item(0).NUM)>0){
                    firsttime=false;
                }
                    
                if(firsttime){
                    db.transaction(function(tx){
                        tx.executeSql("INSERT INTO USER VALUES (?,?,?,?)", ['junaowu@live.unc.edu','Wja673581429','TRUE',"421"]);
                    }  , function(error){
                        alert("Transaction Error: "+error.message);
                    });
                }
            });    
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
            console.log("Transaction OK, database initialized successfully.");
        });
        closeDB();
    }
});

//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};