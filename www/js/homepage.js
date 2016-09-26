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
        
        db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
        );
        function DBSuccessCB(){
            alert("DB open OK");
        }

        db.transaction(function(tx){
        tx.executeSql('SELECT name from USER_INFO',[], function(tx, rs){
            alert("#lines in db:"+rs.rows.length);
            if(rs.rows.length > 0){
                alert("show user info");
                $(".user-info").html("<h4>Logged in as " + rs.rows.item(0).name + "</h4>");
            }
        });    
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
            console.log("Transaction OK.");
        });
    closeDB();
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};