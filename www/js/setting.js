document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed

var db;
var tablehead;
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
        alert("DB open OK");

   };
      var dbtable=$("#dbtable");   
      var resultset;
      db.transaction(function(tx){
            tx.executeSql("Select upper('Test string') as us", [], function(tx, rs){
                alert("Get Upper String:"+rs.rows.item(0).us);
            });
            tx.executeSql('SELECT count(*) AS NUM from USER',[], function(tx, rs){
                alert("#rows in USER table:"+rs.rows.item(0).NUM);
            });

            tx.executeSql('SELECT name from USER where userId=?',["1"], function(tx, rs){
                alert("First User name:"+rs.rows.item(0).name);
            });
            tx.executeSql('Select distinct name, password, currentUser, userId from USER', [], function(tx, rs){
                resultset=rs.rows;
                alert("#rows retrived:"+resultset.length);
            });
        }, function(error){
                alert("Transaction Error: "+error.message);
        }, function(){
                tablehead="<tr><th>name</th><th>password</th><th>current?</th><th>userId</th></tr>";
                var table=tablehead;
                for(var i=0; i<resultset.length; i++){
                    //alert("i="+i);
                    var row=resultset.item(i);
                    
                    table+="<tr><td>"+row.name+"</td><td>"+row.password+"</td><td>"+row.currentUser+"</td><td>"+row.userId+"</td></tr>";
                };
                $("#dbtable").html(table);
      });

      




};

$(document).ready(function(){
    function refresh(){
        var resultset;
        db.transaction(function(tx){
            tx.executeSql('Select distinct name, password, currentUser, userId from USER', [], function(tx, rs){
                resultset=rs.rows;
            });
        }, function(error){
                alert("Transaction Error: "+error.message);
        }, function(){
                tablehead="<tr><th>name</th><th>password</th><th>current?</th><th>userId</th></tr>";
                var table=tablehead;
                for(var i=0; i<resultset.length; i++){
                    var row=resultset.item(i);
                    
                    table+="<tr><td>"+row.name+"</td><td>"+row.password+"</td><td>"+row.currentUser+"</td><td>"+row.userId+"</td></tr>";
                };
                $("#dbtable").html(table);
      });

    };

    $("#refresh").click(function(){
        alert("c");
        refresh();
    });

    $("#adddb").click(function(){
        alert("clicked");
        db.transaction(function(tx){
            tx.executeSql('Insert into USER VALUES (?,?,?,?)', [$(".s1").val(),$(".s2").val(),$(".s3").val(),$(".s4").val()]);
        }, function(error){
                alert("Transaction Error: "+error.message);
        }, function(){
                refresh();
      });
    });
    
});