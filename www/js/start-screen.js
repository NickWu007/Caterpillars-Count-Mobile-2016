/**
 * Created by skuroda on 12/6/15.
 */
var use_data;
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
		//tx.executeSql("DROP table if EXISTS USER_INFO");
        tx.executeSql("CREATE TABLE IF NOT EXISTS USER_INFO (name, password, userId)");
        //
        //refresh survey table each time it is started
        //
        //tx.executeSql("DROP TABLE IF EXISTS SURVEY");
		//tx.executeSql("DROP TABLE IF EXISTS ARTHROPODS");
        tx.executeSql("CREATE TABLE IF NOT EXISTS SURVEY(type, siteID, userID, password, circle, survey, timeStart, temperatureMin, temperatureMax, siteNotes, plantSpecies, herbivory, surveyType, leafCount, source,leafImageURI,errorCode)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS ARTHROPODS(surveyType, length, notes, count, hairOrSpinyVal, leafRollVal, silkTentVal,ArthropodsImageURI,timeStart)");
        //tx.executeSql("DROP TABLE IF EXISTS SITE");
        tx.executeSql("CREATE TABLE IF NOT EXISTS SITE (siteId, siteName, userId, circle, state)");
        // tx.executeSql("DROP TABLE IF EXISTS SETTING");
        tx.executeSql("CREATE TABLE IF NOT EXISTS SETTING (userID, useData, useINat, iNar_token)");

        tx.executeSql('select * from SETTING', [], function(tx, rs){
            if (rs.rows.length > 0) {
                use_data = rs.rows.item(0).useData;
                //alert("use data:"+use_data);
            }else{
                use_data='NONE';
            }
        });
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
        createButtons();
    });

    //closeDB();

}

$(document).ready(function() { 
    // window.addEventListener("online", createButtons);
    // window.addEventListener("offline", createButtons);
	 
    setInterval(createButtons, 1000);
});

//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};

function createButtons(){
   var networkState = navigator.connection.type;

   var online = isOnline();
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
    // alert(online);
    if (online) {
        $("#top_button").html(register_button);
        $("#bottom_button").html(login_buton);
    } else {
        $("#top_button").html(amode_button);
        $("#bottom_button").html(login_button);
    }
}

function isOnline(){
        var networkState = navigator.connection.type;
        // alert(networkState);
        if(use_data=='Yes'){
            if(networkState==Connection.UNKNOWN||networkState==Connection.NONE){
                return false;
            }else{
                return true;
            }
        }else{
            if(networkState==Connection.UNKNOWN||networkState==Connection.NONE
                ||networkState==Connection.CELL||networkState==Connection.CELL_2G
                ||networkState==Connection.CELL_3G||networkState==Connection.CELL_4G){
                return false;
            }else{
                return true;
            }
        }
};