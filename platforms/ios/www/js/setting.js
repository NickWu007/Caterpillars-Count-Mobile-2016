var db;
var site = "https://www.inaturalist.org";
var app_id = 'f288a4e448fb2157ca940efcd471b5148fbb26f5de7dea47593fd863f978ddcb';
var app_secret = '7ff165db65f1477b5b91a7d0b625a725f44a9eee929224c19f792fcfc37a4351';
var username = 'caterpillarscount';
var password = 'catcount!';
var access_token;

document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed
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
        // alert("DB open OK");
    }

    var $logoffButton = $(".logoff");
    $logoffButton.click(function (e) {
        // When manually clicks to log off, deletes stored login info.
        
        // alert("manually clicks to log off");
        // alert("before sql xact.");
        db.transaction(function(tx){
            tx.executeSql('delete from USER_INFO');
        }, function(error){
            alert("Transaction Error: " + error.message);
        }, function() {
            alert("user deleted from database.");
            window.location.assign("StartScreen.html");
        });
        // alert("after sql xact.");
    });

    $('.iNat-login').click(function() {
        
        $.ajax({
            url: site + "/oauth/token",
            type : "POST",
            contentType: 'application/x-www-form-urlencoded',
            data: {
                "client_id" : app_id,
                "client_secret" : app_secret,
                "grant_type" : "password",
                "username" : username,
                "password" : password
            },
            success: function(response){
                alert("login successfully.");
                // var res_obj = JSON.parse(response);
                alert("access_token: " + response.access_token);
                access_token = response.access_token;
            },
            error : function(xhr, status){
                navigator.notification.alert("Unexpected error submitting survey: " + xhr.status);
                alert(xhr.responseText);
            }

        });
    });
}
