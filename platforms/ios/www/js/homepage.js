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
                else{
                    user_name = QueryString.userID;
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

//retrieves userID from page URI in case USER_INFO is empty
var QueryString = function(){
    var query_string = {}
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i=0;i<vars.length;i++){
        var pair = vars[i].split('=');
        if(typeof query_string[pair[0]]=== "undefined"){
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        }
        else if(typeof query_string[pair[0]]==="string"){
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
        }
        else{
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();