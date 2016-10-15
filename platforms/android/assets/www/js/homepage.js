/**
 * Created by skuroda on 11/6/15.
 */
var db;
var user_name;

$(document).ready(function(){

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
            // alert("DB open OK");
        }

        db.transaction(function(tx){
            tx.executeSql('SELECT name from USER_INFO',[], function(tx, rs){
                // alert("#lines in db:"+rs.rows.length);
                if(rs.rows.length > 0){
                    user_name = rs.rows.item(0).name;
                }
            });    
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
            $('.user-info').html("Logged in as: " + user_name);
            console.log("Transaction OK.");
        });
    }
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};