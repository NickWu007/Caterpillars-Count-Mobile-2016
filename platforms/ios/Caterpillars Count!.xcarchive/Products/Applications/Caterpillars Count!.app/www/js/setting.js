var db;

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
}