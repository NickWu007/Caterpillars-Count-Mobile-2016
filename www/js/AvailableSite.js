var db;
var DOMAIN = "http://develop-caterpillars.vipapps.unc.edu";
document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed
function onDeviceReady(){
    db=window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBSuccessCB(){
        //alert("DB open OK");
            //retrive site data from server
        retrieveSiteList();
        //retrive sites with permission
        
    };

    retriveSitePermission();
 


/*
    db.transaction(function(tx){
        tx.executeSql('select distinct name, password, userId from USER', [], function(tx, rs){
            if (rs.rows.length > 0) stored_user_info=rs.rows.item(0);
        });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function() {
            alert("successfully retrieved cached user info.");

    });*/
};


var retrieveSiteList = function(){
        //alert("begin ajax");
	$.ajax({
		url: DOMAIN + "/api/sites.php",
		type : "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify({
			"action" : "getAllSiteState"
		}),
		success: function(siteResult){
        //alert("API ok");
			populateSiteList(siteResult);
		},
		error : function(){
			navigator.notification.alert("Unexpected error retrieving site list.");
		}
	});
};

//Populates the site dropdown list
var populateSiteList = function(siteResult){
        //alert(siteResult.length+" sites get");
        var siteList = document.getElementById("site");
	for(var i = 0; i < siteResult.length; i++){
		var siteOption = document.createElement("option");
		siteOption.text = siteResult[i].siteName+"("+siteResult[i].siteState+")";
		siteOption.value = siteResult[i].siteID;
		siteList.add(siteOption);
	}
};
var permission_list;
//get permission for this user, also populate the list
var retriveSitePermission = function(){
       //alert("12");
       
       db.transaction(function(tx){
               //alert("14");
               //!!!###!!! remember that this will require specific userId
            tx.executeSql('select siteId, siteName, circle, state from SITE', [], function(tx, rs){
                permission_list=rs.rows;    
            });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
                //alert("11:"+permission_list.length);
                if(permission_list.length>0){
                var insertlist=" ";
                for(var i=0; i<permission_list.length; i++){
                        insertlist+="<hr><li class='survey_item'><h5>Site: "+permission_list.item(i).siteName+"</h5><h5>State: "+permission_list.item(i).state+"</h5><h5>Circle#: "+permission_list.item(i).circle+"</h5></li> "
                }
                $("#permissionList").html(insertlist);
                //"<li class='survey_item1'><h5>Site: "++"</h5><h5>Site Id: "++"</h5></li> "
                }else{
                        $("#permissionList").html("<li class='survey_item'><h5>You Do Not Have Any Site Permission</h5><h5>Please contact Site Manager for detail</h5></li>");
                }
        });
};


$(document).ready(function(){
    var $newsite = $(".newsite");
    $newsite.click(function() {
                var password=window.prompt("Please enter passward for site selected");
                var siteID = $("#site option:selected").val();
                //validate site password
                $.ajax({
		url: DOMAIN + "/api/sites.php",
		type : "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify({
			"action": "checkSitePassword",
			"siteID": siteID,
			"sitePasswordCheck": password
		}),
		success: function(passwordCheckResult){
			//navigator.notification.alert(passwordCheckResult.validSitePassword);
			//If site password is correct, submit survey
			if(passwordCheckResult.validSitePassword == 1){
				//navigator.notification.alert("Site password correct");
				pushSitetoDB(siteID);
			}
			else{
				navigator.notification.alert("Site password is incorrect.");
			}
		},
		error : function(){
			navigator.notification.alert("Unexpected error checking site password.");
		}
	});
    });

    $("#reset").click(function(){
        db.transaction(function(tx){
        tx.executeSql('DROP TABLE IF EXISTS SITE' );
        tx.executeSql('CREATE TABLE IF NOT EXISTS SITE (siteId, siteName, userId, circle, state)' );
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function() {
            alert("successfully Cleared all the information in Table SITE");
            retriveSitePermission();

    });
    });
});
//CREATE TABLE IF NOT EXISTS SITE (siteId, siteName, userId, circle, state)
function pushSitetoDB(siteID){
        //get # of circle of specific site
        $.ajax({
		url: DOMAIN + "/api/sites.php",
		type : "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify({
			"action" : "getOneByID",
			"siteID" : siteID
		}),
		success: function(circleResult){
			//circleCountRetrieved = true;

                        db.transaction(function(tx){
                                tx.executeSql('select siteName from SITE where siteID=?', [siteID], function(tx, rs){
                                        if (rs.rows.length == 0){
                                                tx.executeSql("INSERT INTO SITE VALUES (?, ?, ?, ?, ?)", [siteID, circleResult.siteName,0, circleResult.numCircles, circleResult.siteState]);
                                                retriveSitePermission();
                                        }else{
                                                alert("The site has already been added");
                                        }
                                });
                        }, function(error){
                                alert("Transaction Error: "+error.message);
                        }, function() {
                                alert("Site "+circleResult.siteName+"successfully added");

                        });
		},
		error : function(){
			navigator.notification.alert("Unexpected error retrieving number of circles.");
		}
	});

}