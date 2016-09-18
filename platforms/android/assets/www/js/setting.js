document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed

var db;
function onDeviceReady(){
    alert("device ready");
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
        alert("DB open ready");

   };
        alert('begin select');
        db.transaction(function(tx){
            tx.executeSql("Select upper('Test string') as us", [], function(tx, rs){
                alert("Get Upper String:"+rs.rows.item(0).us);
            });
            tx.executeSql('SELECT count(*) AS NUM from USER',[], function(tx, rs){
                alert("#rows in USER table:"+rs.rows.item(0).NUM);
            });

            tx.executeSql('SELECT name from USER where userId=?',[1], function(tx, rs){
                alert("First User name:"+rs.rows.item(0).name);
            });
        }, function(error){
                alert("Transaction Error: "+error.message);
        }, function(){
                alert("Transaction OK");
        });
   
    
};

$(document).ready(function(){
    alert("doc ready");
    
});