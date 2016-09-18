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
    };
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

        var db=window.sqlitePlugin.openDatabase(
            {name: 'app.db',
            location: 'default'
            },
            DBsuccess(),
            function(error){
                alert("Error Open Database:"+JSON.stringify(error));
            }
        );
         if(db==null){
                alert("db is null");
        }
            db.transaction(function(tx){
                tx.executeSql("CREATE TABLE IF NOT EXISTS USER (name, password, currentUser, userId)");
                tx.executeSql("INSERT INTO USER VALUES (?,?,?,?)", ['First_User','ABCDEFG','TRUE',1]);
                tx.executeSql("INSERT INTO USER VALUES (?,?,?,?)", ['Second_User','1234567','FALSE',2]);
                
            }, function(error){
                alert("Transaction Error: "+error.message);
            }, function(){
                alert("Transaction OK");
            });
        function DBsuccess(){
            alert("DB open ok, Create Table etc");
        };
        closeDB();
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};