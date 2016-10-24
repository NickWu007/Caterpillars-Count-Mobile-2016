/**
 * Created by skuroda on 12/6/15.
 */

document.addEventListener("deviceready", onDeviceReady, false);

function  closeDB(){
    db.close(function(){
        alert("DB closed");
    }, function(error){
        alert("DB Closing Error:"+error.message);
    });
}

function onDeviceReady() {

	

    //Exit app if android back button is pressed on start screen
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
        // alert("DB open ok, Create Table etc");
    }

    var db = window.sqlitePlugin.openDatabase({name: 'app.db', location: 'default'},
        DBsuccess(),
        function(error){
            alert("Error Open Database:"+JSON.stringify(error));
        }
    );

    // Create DB schemas.
    db.transaction(function(tx){
		tx.executeSql("DROP table if EXISTS USER_INFO");
        tx.executeSql("CREATE TABLE IF NOT EXISTS USER_INFO (name, password, userId)");
		tx.executeSql("INSERT INTO USER_INFO VALUES(?, ?, ? )",['leq94@live.unc.edu','leq941116','215']);
        //
        //refresh survey table each time it is started
        //
        tx.executeSql("DROP TABLE IF EXISTS SURVEY");
		tx.executeSql("DROP TABLE IF EXISTS ARTHROPODS");
        tx.executeSql("CREATE TABLE IF NOT EXISTS SURVEY(type, siteID, userID, password, circle, survey, timeStart, temperatureMin, temperatureMax, siteNotes, plantSpecies, herbivory, surveyType, leafCount, source,leafImageURI,errorCode)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS ARTHROPODS(surveyType, length, notes, count, hairOrSpinyVal, leafRollVal, silkTentVal,ArthropodsImageURI,timeStart)");
        //tx.executeSql("DROP TABLE IF EXISTS SITE");
        tx.executeSql("CREATE TABLE IF NOT EXISTS SITE (siteId, siteName, userId, circle, state)");
		/*
        tx.executeSql("INSERT INTO SURVEY VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",   
                         	['survey',  
                         	8892356,  
                         	215,  
                        	'leq941116',  
                        	6,  
                        	'A',  
                      	    "2016-10-23 23:08:41",  
                       	    30,  
                        	39,  
                       	    'note',  
                         	'plantSpecies',  
                         	'2',  
                       	    'Visual',  
                       	    5,  
                        	"Mobile",   
							'', 
							0]);
		tx.executeSql("INSERT INTO SURVEY VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",   
                         	['survey',  
                         	8892356,  
                         	159,  
                        	12345,  
                        	6,  
                        	'A',  
                      	    "2016-10-23 22:08:41",  
                       	    30,  
                        	39,  
                       	    '$(".notes").val()',  
                         	'plantSpecies',  
                         	'2',  
                       	    'surveyType',  
                       	    5,  
                        	"Mobile",   
							'', 
							0]);
        tx.executeSql("INSERT INTO SURVEY VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",   
                         	['survey',  
                         	-1,  
                         	159,  
                        	12345,  
                        	6,  
                        	'A',  
                      	    "2016-10-23 21:08:41",  
                       	    30,  
                        	39,  
                       	    '$(".notes").val()',  
                         	'plantSpecies',  
                         	'2',  
                       	    'Visual',  
                       	    5,  
                        	"Mobile",   
							'', 
							0]);*/
							
        
    }, function(error){
        alert("Transaction Error: "+error.message);
    }, function(){
        // alert("Transaction OK, database initialized successfully.");
    });
    closeDB();
}

$(document).ready(function() { 
    window.addEventListener("online", createButtons);
    window.addEventListener("offline", createButtons);
	createButtons();
});

//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};

function createButtons(){

   var online = navigator.onLine;
    var register_button = "<a href = 'register.html'>"+
                            "<div class='header-footer footer text-center green-text'>"+
                                "<div class = 'button'><h4>Register</h4></div>"+
                            "</div>"+
                          "</a>";

    var login_button = "<a href='login.html'>"+
                            "<div class='header-footer footer text-center green-text'>"+
                                "<div class = 'button'><h4>Login</h4></div>"+
                            "</div>"+
                        "</a>";

    var amode_button = "<a href='homepage-anon.html'>"+
                            "<div class='header-footer footer text-center green-text'>"+
                                "<div class = 'button'><h4>Anonymous Mode</h4></div>"+
                            "</div>"+
                        "</a>"; 

    if (online) {
        $("#top_button").html(register_button);
        $("#bottom_button").html(login_buton);
    } else {
        $("#top_button").html(amode_button);
        $("#bottom_button").html(login_button);
    }
}
