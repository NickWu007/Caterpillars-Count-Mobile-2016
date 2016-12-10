var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";
var INATURALIST_DOMAIN = "http://www.inaturalist.org";

var leafPhotoTaken = false;

//Tracks whether a photo was taken for the arthropod submission
//Reset after each arthropod is saved
var arthropodPhotoTaken = false;

//Track whether circle count for selected site has been retrieved.
var circleCountRetrieved = false;
var anon=false;
var temperature;
var time;
var date;
var dateTime;
var siteID;
var sitePassword;
var surveyType;
var circle;
var survey;
var plantSpecies;
var leafCount;
var herbivoryValue;
var selectedOrderText;
var length;
var count;
var notes;
var hairyOrSpinyVal;
var leafRollVal;
var silkTentVal;
var leafImageURI;
var ArthropodsImageURI;
var numberOfArthropodsToSubmit;
var numberOfArthropodsSubmitted;
//Tracks which screen is currently being displayed
var onArthropodPage = false;
var timeStart;
var edit= false;
var inat_token;
var use_data;
var longitude;
var latitude;

var temperatures = {
	"<30" : {min : - 10, max : 30},
	"30-39": {min : 30, max : 39},
	"40-49": {min : 40, max : 49},
	"50-59": {min : 50, max : 59},
	"60-69": {min : 60, max : 69},
	"70-79": {min : 70, max : 79},
	"80-89": {min : 80, max : 89},
	"90-99": {min : 90, max : 99},
	"100-109": {min : 100, max : 109 },
	">109": {min : 110, max : 130}
};

//Dropdown plugin data for herbivory list
var ddData = [
	{
		value: 0,
		selected: false,
		imageSrc: "pictures/none.png"
	},
	{

		value: 1,
		selected: false,
		imageSrc: "pictures/trace.png"
	},
	{
		value: 2,
		selected: false,
		imageSrc: "pictures/light.png"
	},
	{
		value: 3,
		selected: false,
		imageSrc: "pictures/moderate.png"
	},
	{
		value: 4,
		selected: false,
		imageSrc: "pictures/heavy.png"
	}
];
var db;
var stored_user_info;
document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed
function onDeviceReady(){

	// onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onSuccess = function(position) {
    	longitude = position.coords.longitude;
    	latitude = position.coords.latitude;
        // alert('Latitude: '          + position.coords.latitude          + '\n' +
        //       'Longitude: '         + position.coords.longitude         + '\n' +
        //       'Altitude: '          + position.coords.altitude          + '\n' +
        //       'Accuracy: '          + position.coords.accuracy          + '\n' +
        //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
        //       'Heading: '           + position.coords.heading           + '\n' +
        //       'Speed: '             + position.coords.speed             + '\n' +
        //       'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

	db = window.sqlitePlugin.openDatabase(
        {name: 'app.db', location: 'default'}, 
        DBSuccessCB(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBSuccessCB(){
        // alert("DB open OK");
            //retrive site data from server
        //retrive sites with permission
        
    }
    stored_user_info = null;

    db.transaction(function(tx){
        tx.executeSql('SELECT name, password, userId from USER_INFO',[], function(tx, rs){
        if(rs.rows.length > 0){
            stored_user_info = rs.rows.item(0);
        }
        });    

        tx.executeSql('SELECT * from SETTING',[], function(tx, rs){
        	if(rs.rows.length > 0){
               if (rs.rows.item(0).useINat == "Yes") {
               	inat_token = rs.rows.item(0).iNar_token;
               } else {
               	inat_token = null;
               }

               // alert(inat_token);
        	}
        }); 
	    tx.executeSql('select * from SETTING', [], function(tx, rs){
                if (rs.rows.length > 0) {
                    use_data = rs.rows.item(0).useData;
                    //alert("use data:"+use_data);
                }else{
                    use_data='NONE';
                }
        });
    }, function(error){
        alert("Transaction Error: "+error.message);
    }, function(){
        console.log("Transaction OK.");
    });

	//alert("begin wait");
	


	document.addEventListener("backbutton", function(e){
		e.preventDefault();
		//If displaying arthropod screen, return to main select screen
		if(onArthropodPage){
			returnToMainSelectScreen();
		}
		//Otherwise ask if the user wants to exit the app
	}, false);

	timeStart=getURLParameter("time");
	//alert(timeStart);
	if(getURLParameter("anonmyous")==="true"){
		anon=true;
		$('#go-back').prop("href", "homepage-anon.html");
		populateCircleList(12);
		var siteList = document.getElementById("site");

        var siteOption = document.createElement("option");
		siteOption.text = "Unknown Site";
		siteOption.value = -1;
		siteList.add(siteOption);
		$("#site option:selected").val(-1);
		stored_user_info={};
		stored_user_info.userId="";
        stored_user_info.password="";
	}else{
		setTimeout(retrieveSiteList(),800);
	}
	if(!(timeStart===null)){
		edit=true;
		var retrivedRow;
		var stored_arthropods = null;
		db.transaction(function(tx){
			tx.executeSql('select distinct type, siteID, userID, password, circle, survey, timeStart, '  +
			'temperatureMin, temperatureMax, siteNotes, plantSpecies, herbivory, surveyType, leafCount,' +
			'source,' +
			'leafImageURI '+ 'from SURVEY where timeStart=?', [timeStart], function(tx, rs){
            	if(rs.rows.length>0) {retrivedRow=rs.rows.item(0);}
            	else{alert("Did not get indicated survey");}
        	});

			tx.executeSql('select * from ARTHROPODS where timeStart=?', [timeStart], function(tx, rs){
            	if(rs.rows.length>0) {
            		stored_arthropods=rs.rows;
            	}
        	});
    	}, function(error){
        	alert("Transaction error: "+error.message);
    	}, function(){
			populateCircleList(12);
			var temp_range=retrivedRow.temperatureMin+'-'+retrivedRow.temperatureMax;
			if(retrivedRow.temperatureMax==30){
				temp_range='<30';
			}else if(retrivedRow.temperatureMax==130){
				temp_range='>109';
			}
			$("#temperature").val(temp_range);
			$("#circle").val(retrivedRow.circle);
			var dateString=timeStart.split(' ')[0];
			var timeString=timeStart.split(' ')[1];
			$("#date").val(dateString);
			$("#time").val(timeString);
			$(".plant-species").val(retrivedRow.plantSpecies);
			$("#survey").val(retrivedRow.survey);
			$(".notes").val(retrivedRow.siteNotes);
			$(".survey-type").val(retrivedRow.surveyType);
			$(".leaf-count").val(retrivedRow.leafCount);
			//alert(retrivedRow.herbivory);
			$("#herbivory-select").ddslick('select', {index: retrivedRow.herbivory });
			if(retrivedRow.leafImageURI!=''){
				$("#leaf-capture").html("<img onclick = 'leafCapture()' id='leaf-photo' height = '200' width ='200'>");
				$("#leaf-photo").prop("src", retrivedRow.leafImageURI);
				leafImageURI = retrivedRow.leafImageURI;
			}

			if (stored_arthropods != null) {
				for (var i = 0; i < stored_arthropods.length; i++) {
					var arthropod = stored_arthropods.item(i);

					var arthropodInputHtml;
					// If user took photo, use that photo instead of stock image
					var orderVal = $("option:contains('" + arthropod.surveyType +"')").val();
					if(arthropod.ArthropodsImageURI != null && arthropod.ArthropodsImageURI != undefined){
						arthropodInputHtml = "<div class='arthropod-input'>" +
								"<span class='glyphicon glyphicon-remove' onclick='function(){$(this).parent().remove();}'></span>" +
								"<h4>" + arthropod.surveyType + "</h4>" +
								"<div><img class = 'saved-arthropod-image' src='" + arthropod.ArthropodsImageURI +  "' height='50' width='50'></div>" +
								"<div>" +
								"<div>Length: <span class='arthropod-length'>" + arthropod.length + "</span></div>" +
								"<div>Count: <span class='arthropod-count'>" + arthropod.count + "</span></div>" +
								"<div>Notes: <span class='arthropod-notes'>" + arthropod.notes + "</span></div>";
					}
					// Else use default image
					else{
						arthropodInputHtml = "<div class='arthropod-input'>" +
								"<span class='glyphicon glyphicon-remove' onclick='$(this).parent().remove();'></span>" +
								"<h4>" + arthropod.surveyType + "</h4>" +
								"<div><img src='pictures/" + orderVal + ".png' height='50' width='50'></div>" +
								"<div>" +
								"<div>Length: <span class='arthropod-length'>" + arthropod.length + "</span></div>" +
								"<div>Count: <span class='arthropod-count'>" + arthropod.count + "</span></div>" +
								"<div>Notes: <span class='arthropod-notes'>" + arthropod.notes + "</span></div>";
					}

					// If order is not caterpillar, close divs
					if(orderVal!== "caterpillar") {
						$(".arthropod-order-information").append(
								arthropodInputHtml +
								"</div>" +
								"</div>"
						);
					}
					else{//Else add caterpillar extras then close divs.
						$(".arthropod-order-information").append(
								arthropodInputHtml +
								"<div>Hairy or spiny: <span class='hairy-or-spiny'>" + Boolean(arthropod.hairyOrSpinyVal) + "</span></div>" +
								"<div>Leaf roll: <span class='leaf-roll'>" + Boolean(arthropod.leafRollVal) + "</span></div>" +
								"<div>Silk tent: <span class='silk-tent'>" + Boolean(arthropod.silkTentVal) + "</span></div>" +
								"</div>" +
								"</div>"
						);
					}
				}	
			}		
	});		
	}else{
		setTime();
	}
}

function setTime(){
		//Set initial value of time and date fields
		setDateAndTime();
		//Updates time every second
		window.setInterval(setDateAndTime, 1000);
}

//Function called if the user confirms to exit the app
function onConfirmQuit(button){
	if(button == "1"){
		navigator.app.exitApp();
	}
}


$( document ).ready(function() {
	$('#herbivory-select').ddslick({
		data: ddData,
		width: 300,
		imagePosition: "left",
		selectText: "Please select an herbivory score.",
		onSelected: function (data) {
			//Sets value of herbivory-select to herbivory score
			$("#herbivory-select").val(data.selectedIndex);
		}
	});
	//Populate site list on page load
});


var site_list;
//Gets the list of all sites
var retrieveSiteList = function(){
	//alert("2");
	    db.transaction(function(tx){
            tx.executeSql('select siteId, siteName, circle, state from SITE', [], function(tx, rs){
                site_list=rs.rows;    
            });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
                if(site_list.length>0){
					var siteList = document.getElementById("site");
					var siteOption;
                	for(var i=0; i<site_list.length; i++){
                        siteOption = document.createElement("option");
						siteOption.text = site_list.item(i).siteName+"("+site_list.item(i).state+")";
						siteOption.value = site_list.item(i).siteId;
						siteList.add(siteOption);
                	}
                	siteOption = document.createElement("option");
					siteOption.text = "Unknown Site";
					siteOption.value = -1;
					siteList.add(siteOption);
                }else{
                    alert("You do not have permission for any Site.");
                }
        });
};

//Retrieves the circle count for the newly selected site
var retrieveCircleCount = function(){
	//alert("1");
	var editmode;
	if(edit){
		editmode=$("#circle").val();
	}
	var circleNum;
	var siteID = $("#site option:selected").val();
	if(siteID==-1){
		populateCircleList(12);
		return;
	}
	//Clear circle list to prevent circles from different site from being selected.
	clearCircleList();
	document.getElementById("circle").selectedIndex = 0;
	db.transaction(function(tx){
            tx.executeSql('select circle from SITE where siteId=?', [siteID], function(tx, rs){
                circleNum=rs.rows.item(0).circle;    
            });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function(){
                	
			populateCircleList(circleNum);
			if (circle > 0) {
				$("#circle").val(circle);
			}
			if(edit){
				if(editmode<circleNum){
					$("#circle").val(editmode);
				}else{
					alert("The circle you already choose does not match this site, Please select again");
				}
			}

        });
	circleCountRetrieved=true;
};

//Populates circle list with number of circles from newly selected site
var populateCircleList = function(numCircles){
	var circleList = document.getElementById("circle");
	for (var i = 1; i <= numCircles; i++) {
		var circleOption = document.createElement("option");
		circleOption.value = i;
		circleOption.text = i;
		circleList.add(circleOption);
	}
};

//Clears circle list before populating with circles from newly selected site
var clearCircleList = function(){
	var circleList = document.getElementById("circle");
	//Make sure to not remove default option
	while(circleList.length > 1){
		circleList.remove(circleList.length-1);
	}
};

//Toggles visiblity of password
var togglePassword = function(){
	var showPasswordCheckboxIsChecked = document.getElementById("show-password").checked;
	var visiblePassword = document.getElementById("visible-password");
	var hiddenPassword = document.getElementById("hidden-password");
	//Display visible password field after copying value from hidden password field
	if(showPasswordCheckboxIsChecked){
		visiblePassword.value = hiddenPassword.value;
		visiblePassword.style.display = "inline-block";
		hiddenPassword.style.display = "none";
	}
	//Display hidden password field after copying value from visible password field
	else{
		hiddenPassword.value = visiblePassword.value;
		hiddenPassword.style.display = "inline-block";
		visiblePassword.style.display = "none";
	}
};

//Function called when an arthropod photo is successfully taken
//Replaces capture "button" with the photo that was taken
var onSuccessArthropod = function(imageData) {
	console.log('success');
	if (imageData.indexOf("assets-library") !== -1) {
		imageData = imageData.replace("assets-library://", "cdvfile://localhost/assets-library/");
	}
	$("#arthropod-capture").html("<img onclick='arthropodCapture()' id='arthropod-photo' height = '200' width ='200'>");
	$("#arthropod-photo").attr("src", imageData);
	console.log(imageData);
	arthropodPhotoTaken = true;
	ArthropodsImageURI = imageData;
};

//Function called when a leaf photo is successfully taken
//Replaces capture "button" with the photo that was taken
var onSuccessLeaf = function(imageData) {
	console.log('success');
	if (imageData.indexOf("assets-library") !== -1) {
		imageData = imageData.replace("assets-library://", "cdvfile://localhost/assets-library/");
	}
	$("#leaf-capture").html("<img onclick = 'leafCapture()' id='leaf-photo' height = '200' width ='200'>");
	$("#leaf-photo").attr("src", imageData);
	console.log(imageData);
	leafPhotoTaken = true;
	leafImageURI = imageData;
};

//Function called when arthropod capture button is clicked
var arthropodCapture = function(){
	navigator.camera.getPicture(onSuccessArthropod, onFail, {
		quality: 50,
		sourceType: Camera.PictureSourceType.CAMERA,
		destinationType: Camera.DestinationType.NATIVE_URI,
		saveToPhotoAlbum: true
	});
};

//Function called when leaf capture button is clicked
var leafCapture = function(){

	navigator.camera.getPicture(onSuccessLeaf, onFail, {
		quality: 50,
		sourceType: Camera.PictureSourceType.CAMERA,
		destinationType: Camera.DestinationType.NATIVE_URI,
		saveToPhotoAlbum: true
	});


};

//Function called when camera is closed without taking a picture
var onFail = function(message) {
	//navigator.notification.alert('Failed because: ' + message);
};

//Sets date and time input fields to the present values.
var setDateAndTime = function(){
	var dateObject = new Date();
	var month = dateObject.getMonth() + 1;//Month is 0-indexed
	if(month < 10){
		month = "0"+month;//Concatenate 0 when value is single digit
	}
	var date = dateObject.getDate();
	if(date < 10){
		date = "0"+date;//Concatenate 0 when value is single digit
	}
	var year = dateObject.getFullYear();
	var dateString = year+"-"+month+"-"+date;

	var hours = dateObject.getHours();
	if(hours < 10){
		hours = "0"+hours;//Concatenate 0 when value is single digit
	}
	var minutes = dateObject.getMinutes();
	if(minutes < 10){
		minutes = "0"+minutes;//Concatenate 0 when value is single digit
	}
	var seconds = dateObject.getSeconds();
	if(seconds < 10){
		seconds = "0"+seconds;//Concatenate 0 when value is single digit
	}
	var timeString = hours+":"+minutes+":"+seconds;
	$("#date").val(dateString);
	$("#time").val(timeString);
};

//Hides main select screen and displays arthropod selection screen
var showArthropodSelectScreen = function( ) {
	onArthropodPage = true;
	$(".main-select-screen").css("display", "none");
	$(".arthropod-order-select-screen").css("display", "initial");
	$(".back-button").css("display", "initial");
};

//Function called when returning to main screen from arthopod selection screen
//Resets any input fields that may have been set
//and restores original html.
var returnToMainSelectScreen = function( ) {
	onArthropodPage = false;
	//Restore inner html of capture button
	$("#arthropod-capture").html("<div class='capture white-text' onclick='arthropodCapture()'><div class = 'capture-text'>CAPTURE</div></div>");

	//Reset input fields
	$("[name='Length']").val("");
	$("[name='Count']").val("");
	$("[name='Notes']").val("");
	document.getElementById("hairyOrSpiny").checked = false;
	document.getElementById("notHairyOrSpiny").checked = false;
	document.getElementById("leafRoll").checked = false;
	document.getElementById("notLeafRoll").checked = false;
	document.getElementById("silkTent").checked =false;
	document.getElementById("notSilkTent").checked =false;
	$(".order-selection").val('default');

	$(".main-select-screen").css("display", "initial");
	$(".arthropod-order-select-screen").css("display", "none");
	$(".back-button").css("display", "none");
	$(".caterpillar-checklist").css("display","none");
};
//Function to save arthropod data. Checks for valid values before saving
var saveArthropod = function( ) {

	var selectedOrder = $(".order-selection").val( );
	 selectedOrderText = $(".order-selection option:selected").text();
	//if ( selectedOrder === "trueBugs" || selectedOrder === "other" || selectedOrder === "unidentified" ) {
	if (selectedOrder === "other" || selectedOrder === "unidentified" ) {
		selectedOrder = "empty";
	}

	 length = $("[name='Length']").val( );
	 count = $("[name='Count']").val( );
	 notes = $("[name='Notes']").val( );

	 var hairyOrSpiny = $('input[name="hairyOrSpiny"]:checked');
	 var leafRoll = $('input[name="leafRoll"]:checked');
	 var silkTent = $('input[name="silkTent"]:checked');

	 hairyOrSpinyVal = parseInt(hairyOrSpiny.val());
	 leafRollVal = parseInt(leafRoll.val());
	 silkTentVal = parseInt(silkTent.val());

	var imageSrc;
	if(arthropodPhotoTaken){
		imageSrc = document.getElementById("arthropod-photo").src;
	}

	var lengthIntVal = parseInt(length);
	var countIntVal = parseInt(count);

	if ( selectedOrder === null || selectedOrder === 'default') {
		navigator.notification.alert("Please select an order");
	} else if ( length === "" || lengthIntVal <= 0 || lengthIntVal > 300 ) {
		navigator.notification.alert("Please enter a valid length.");
	} else if ( count === "" || countIntVal <= 0 || countIntVal > 1000) {
		navigator.notification.alert("Please enter a valid count.");
	} else if ( selectedOrder === "empty" && !notes) {//Require notes for unidentified or unknown
		navigator.notification.alert("Please describe the arthropod.");
	} else if ( selectedOrder === "caterpillar" && hairyOrSpiny.length <= 0) {//Require selection for radio buttons
		navigator.notification.alert("Please specify whether the caterpillar was excessively hairy or spiny.");
	} else if ( selectedOrder === "caterpillar" && leafRoll.length <= 0) {//Require selection for radio buttons
		navigator.notification.alert("Please specify whether the caterpillar was found within a rolled up leaf.");
	} else if ( selectedOrder === "caterpillar" && silkTent.length <= 0) {//Require selection for radio buttons
		navigator.notification.alert("Please specify whether the caterpillar was in a large silk tent covering multiple leaves or twigs.");
	} else {

		returnToMainSelectScreen( );
		var arthropodInputHtml;
		//If user took photo, use that photo instead of stock image
		if(arthropodPhotoTaken){
			arthropodInputHtml = "<div class='arthropod-input'>"
					+ "<span class='glyphicon glyphicon-remove' onclick='function(){$(this).parent().remove();}'></span>"
					+ "<h4>" + selectedOrderText + "</h4>"
					+ "<div><img class = 'saved-arthropod-image' src='" + imageSrc +  "' height='50' width='50'></div>"
					+ "<div>"
					+ "<div>Length: <span class='arthropod-length'>" + length + "</span></div>"
					+ "<div>Count: <span class='arthropod-count'>" + count + "</span></div>"
					+ "<div>Notes: <span class='arthropod-notes'>" + notes + "</span></div>";
			arthropodPhotoTaken = false;
		}
		//Else use default image
		else{
			arthropodInputHtml = "<div class='arthropod-input'>"
					+ "<span class='glyphicon glyphicon-remove' onclick='$(this).parent().remove();'></span>"
					+ "<h4>" + selectedOrderText + "</h4>"
					+ "<div><img src='pictures/" + selectedOrder + ".png' height='50' width='50'></div>"
					+ "<div>"
					+ "<div>Length: <span class='arthropod-length'>" + length + "</span></div>"
					+ "<div>Count: <span class='arthropod-count'>" + count + "</span></div>"
					+ "<div>Notes: <span class='arthropod-notes'>" + notes + "</span></div>";
		}
		//If order is not caterpillar, close divs
		if(selectedOrder !== "caterpillar") {
			$(".arthropod-order-information").append(
					arthropodInputHtml
					+ "</div>"
					+ "</div>"
			);
		}
		else{//Else add caterpillar extras then close divs.
			$(".arthropod-order-information").append(
					arthropodInputHtml
					+ "<div>Hairy or spiny: <span class='hairy-or-spiny'>" + Boolean(hairyOrSpinyVal) + "</span></div>"
					+ "<div>Leaf roll: <span class='leaf-roll'>" + Boolean(leafRollVal) + "</span></div>"
					+ "<div>Silk tent: <span class='silk-tent'>" + Boolean(silkTentVal) + "</span></div>"
					+ "</div>"
					+ "</div>"
			);
		}
		//Original arthropod save
		//$(".arthropod-order-information").append(
		//		"<div class='arthropod-input'>"
		//		+ "<h4>" + $(".order-selection option:selected").text() + "</h4>"
		//		+ "<div><img src='pictures/" + selectedOrder + ".png' height='50' width='50'></div>"
		//		+ "<div>"
		//		+ "<div>Length: <span class='arthropod-length'>" + length + "</span></div>"
		//		+ "<div>Count: <span class='arthropod-count'>" + count + "</span></div>"
		//		+ "<div>Notes: <span class='arthropod-notes'>" + notes + "</span></div>"
		//		+ "</div>"
		//		+ "</div>"
		//);

	}
	//Check that date and time have been entered
	time = document.getElementById("time").value;
	if(!time){
		navigator.notification.alert("Please enter a time.");
		return;
	}
	date = document.getElementById("date").value;
	if(!date){
		navigator.notification.alert("Please enter a date.");
		return;
	}

	dateTime = date + " " + time;//Default seconds value to 00
	// submitArthropodsToDB(dateTime,selectedOrder,length,count,notes);
};


function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


var submit = function( ) {
	//Check that a temperature has been selected
	temperature = $("#temperature option:selected").val();
	if(temperature.localeCompare("default") === 0){
		navigator.notification.alert("Please select a temperature range");
		return;
	}

	//Check that date and time have been entered
	time = document.getElementById("time").value;
	if(!time){
		navigator.notification.alert("Please enter a time.");
		return;
	}
	date = document.getElementById("date").value;
	if(!date){
		navigator.notification.alert("Please enter a date.");
		return;
	}

	dateTime = date + " " + time;//Default seconds value to 00
	
	siteID = $("#site option:selected").val();
	
	if(siteID.localeCompare("default") === 0){
		navigator.notification.alert("Please select a site");
		return;
	}

	surveyType = $(".survey-type option:selected").val();
	if(surveyType.localeCompare("default")===0){
		navigator.notification.alert("Please select a survey type.");
		return;
	}

	circle = $("#circle option:selected").val();
	if(circle.localeCompare("default")===0){
		navigator.notification.alert("Please select a circle.");
		return;
	}

	survey = $("#survey option:selected").val();
	if(survey.localeCompare("default")===0){
		navigator.notification.alert("Please select a survey.");
		return;
	}

	//Trims leading and trailing white space from plant species field input
	plantSpecies = $.trim($(".plant-species").val());
	if(plantSpecies.length <= 0){
		navigator.notification.alert("Please enter a plant species.");
		return;
	}
	//Truncate plantSpecies that are more than 100 characters
	else if(plantSpecies.length > 100){
		plantSpecies = plantSpecies.substring(0, 100);
	}

	leafCount = $(".leaf-count").val();
	if ( leafCount === "" || leafCount < 0 || leafCount > 200){
		navigator.notification.alert("Please enter a leaf count between 0 and 200");
		return;
	}

	switch ($("#herbivory-select").val()){
		case "0":
			herbivoryValue = 0;
			break;
		case "1":
			herbivoryValue = 1;
			break;
		case "2":
			herbivoryValue = 2;
			break;
		case "3":
			herbivoryValue = 3;
			break;
		case "4":
			herbivoryValue = 4;
			break;
		default :
			navigator.notification.alert("Please select an herbivory score.");
			return;
	}

	//if(!leafPhotoTaken){
	//	navigator.notification.alert("Please take a leaf photo.");
	//	return;
	//}
	//else{
	//	leafImageURI = $("#leaf-photo").prop("src");
	//}
	//Check validity of site password
	//Attempt to submit survey if password is valid
	//navigator.notification.alert("SiteID: " + siteID +
	//	"\nSite password: " +sitePassword);
	//var online = navigator.onLine;
	var online=isOnline();
	// alert("is online "+online);
	if(online == false||anon== true){
        //last field for error handler 0 is default
		//alert("I am here");
		db.transaction(function(tx){
						tx.executeSql("DELETE from SURVEY where timeStart=?", [timeStart]);
                        tx.executeSql("INSERT INTO SURVEY VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", 
                        	['survey',
                        	siteID,
                        	stored_user_info.userId,
                        	stored_user_info.password,
                        	circle,
                        	survey,
                        	dateTime,
                        	temperatures[temperature].min,
                        	temperatures[temperature].max,
                        	$(".notes").val(),
                        	plantSpecies,
                        	herbivoryValue,
                        	surveyType,
                        	parseInt(leafCount),
                        	"Mobile",
							leafImageURI,
							0]);

						var arthropodInputs = $(".arthropod-input");
						numberOfArthropodsToSubmit = arthropodInputs.length;
						numberOfArthropodsSubmitted = 0;
						if(numberOfArthropodsToSubmit > 0) {
							arthropodInputs.each(function () {

							//Get values of caterpillar checklist
							var hairyOrSpiny, leafRoll, silkTent;
							if ($(".hairy-or-spiny", this).text().localeCompare("true") === 0) {
								hairyOrSpiny = 1;
							}
							else {
								hairyOrSpiny = 0;
							}
							if ($(".leaf-roll", this).text().localeCompare("true") === 0) {
								leafRoll = 1;
							}
							else {
								leafRoll = 0;
							}
							if ($(".silk-tent", this).text().localeCompare("true") === 0) {
								silkTent = 1;
							}
							else {
								silkTent = 0;
							}
							var arthropodImageURI = $(".saved-arthropod-image", this).prop("src");

			                tx.executeSql("INSERT INTO ARTHROPODS VALUES (?,?,?,?,?,?,?,?,?)", 
			                    [$("h4", this).text(),
			                    parseInt($(".arthropod-length", this).text()),
			                    $(".arthropod-notes", this).text(),
			                    parseInt($(".arthropod-count", this).text()),
			                    hairyOrSpiny,
			                    leafRoll,
			                    silkTent,
								arthropodImageURI,
								dateTime]);
			                
						});
				}
					}, function(error){
                        alert("Transaction Error: "+error.message);
                    }, function(){
						alert("This page was successfully stored");
						if(anon){
							window.location = "homepage-anon.html";
						}else{
							window.location = "homepage.html";
						}			

		});
			
	}else{
		submitSurveyToServer();	
	}
};

//Toggles whether the caterpillar checklist is visible on the arthropod select screen
//based on the selected order.
var caterpillarSelected = function(){
	var selectedOrder = $("#order-selection option:selected").val();
	if(selectedOrder.localeCompare("caterpillar") == 0){
		$(".caterpillar-checklist").css("display","inline-block");
	}
	else{
		$(".caterpillar-checklist").css("display","none");
	}
};

//Toggles whether leaf count can be edited based on survey type
var editableLeafCount = function(){
	var surveyType = $(".survey-type option:selected").val();
	var leafCount = $(".leaf-count");
	if(surveyType.localeCompare("Beat_Sheet") == 0){
		leafCount.prop("readOnly", false);
		leafCount.val(null);
	}
	else{
		leafCount.prop("readOnly", true);
		leafCount.val(50);
	}
};

//Displays appropriate tooltip based on which "?" button is clicked
var toolTip = function(toolTipLocation){
	if(toolTipLocation.localeCompare("site-info") === 0){
		$("#site-info-tooltip").dialog({
			modal: true,
			buttons: {
				"Got it!": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	} else if(toolTipLocation.localeCompare("order-info") === 0){
		$("#order-info-tooltip").dialog({
			modal: true,
			buttons: {
				"Got it!": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	} else if(toolTipLocation.localeCompare("plant-info") === 0){
		$("#plant-info-tooltip").dialog({
			modal: true,
			buttons: {
				"Got it!": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	}else if(toolTipLocation.localeCompare("leaf-photo") === 0){
		$("#leaf-photo-tooltip").dialog({
			width: "auto",
			modal: true,
			buttons: {
				"Got it!": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	}
};

//Submits basic survey info and leaf photo to server
//Calls submitArthropodsToServer if survey upload is successful
var submitSurveyToServer = function(){
	 $.ajax({
		url: DOMAIN + "/api/submission_full.php",
		type : "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify({
			"type" : "survey",
			"siteID" : siteID,
			"userID" : stored_user_info.userId,
			"password" : stored_user_info.password,
			//survey
			"circle" : circle,
			"survey" :  survey,
			"timeStart" :  dateTime,
			"temperatureMin" : temperatures[temperature].min,
			"temperatureMax" : temperatures[temperature].max,
			"siteNotes" :  $(".notes").val(),
			"plantSpecies" : plantSpecies,
			"herbivory" : herbivoryValue,
			"surveyType" :  surveyType,
			"leafCount" : parseInt(leafCount),
			"source" : "Mobile"
		}),
		success: function(result){
			//Upload leaf photo
			uploadPhoto(leafImageURI, "leaf-photo", result.surveyID);
			submitArthropodsToServer(result);
			if (edit) {
				db.transaction(function(tx){
		            tx.executeSql("DELETE from SURVEY where timeStart=?", [timeStart]);
		            tx.executeSql("DELETE from ARTHROPODS where timeStart=?", [timeStart]);
		        },  function(error){
		            alert("Transaction error: "+error.message);
		        }, function(){
		            //alert("Successfully delete this survey");
		        });
		        edit=false;
			}
		},
		error : function(xhr, status){
			navigator.notification.alert("Unexpected error submitting survey: " + xhr.status);
		}

	});
};

function slugify(text){
  return text
    .replace(/\s+/g, '+')           // Replace spaces with -
    .replace(/[^\w\+]+/g, '')       // Remove all non-word chars
    .replace(/\+\++/g, '+')         // Replace multiple - with single -
    .replace(/^\++/, '')             // Trim - from start of text
    .replace(/\++$/, '');            // Trim - from end of text
}

function trim_end(text, by) {
	if (text.indexOf(by) > -1) {
		return text.substring(0, text.indexOf(by));
	} else {
		return text;
	}
}

//Submits arthropod info to server for each saved order/
//Calls uploadPhoto with orderPhoto (if a photo was taken)
//upon each successful arthropod submission upload
var submitArthropodsToServer = function(result){
	var arthropodInputs = $(".arthropod-input");
	numberOfArthropodsToSubmit = arthropodInputs.length;
	numberOfArthropodsSubmitted = 0;
	if(numberOfArthropodsToSubmit > 0) {
		arthropodInputs.each(function () {

			//Get values of caterpillar checklist
			var hairyOrSpiny, leafRoll, silkTent;
			if ($(".hairy-or-spiny", this).text().localeCompare("true") === 0) {
				hairyOrSpiny = 1;
			}
			else {
				hairyOrSpiny = 0;
			}
			if ($(".leaf-roll", this).text().localeCompare("true") === 0) {
				leafRoll = 1;
			}
			else {
				leafRoll = 0;
			}
			if ($(".silk-tent", this).text().localeCompare("true") === 0) {
				silkTent = 1;
			}
			else {
				silkTent = 0;
			}

			var arthropodImageURI = $(".saved-arthropod-image", this).prop("src");
			//navigator.notification.alert("Arthropod image uri: " + arthropodImageURI);

			if (inat_token !== null && arthropodImageURI !== null && arthropodImageURI !== undefined) {
				var url = INATURALIST_DOMAIN + "/observations.json?";
				url += "observation[species_guess]="+slugify(trim_end($("h4", this).text(), '('));
				url += "&observation[id_please]=1";
				url += "&observation[observed_on_string]=" + date;
				url += "&observation[place_guess]= " + slugify(trim_end($("#site option:selected").text(), '('));
				url += "&observation[latitude]=" + latitude;
				url += "&observation[longitude]=" + longitude;
				if ($(".arthropod-notes", this).text().length > 0) 
					url += "&observation[description]=" + slugify($(".arthropod-notes", this).text());
				url += "&observation[observation_field_values_attributes][0][observation_field_id]=1289";
				url += "&observation[observation_field_values_attributes][0][value]="+$(".arthropod-length", this).text();
				url += "&observation[observation_field_values_attributes][1][observation_field_id]=5716";
				url += "&observation[observation_field_values_attributes][1][value]="+temperature;
				url += "&observation[observation_field_values_attributes][2][observation_field_id]=1194";
				url += "&observation[observation_field_values_attributes][2][value]="+$("#site option:selected").text();
				url += "&observation[observation_field_values_attributes][3][observation_field_id]=5715";
				url += "&observation[observation_field_values_attributes][3][value]="+circle;
				url += "&observation[observation_field_values_attributes][4][observation_field_id]=5714";
				url += "&observation[observation_field_values_attributes][4][value]="+survey;
				url += "&observation[observation_field_values_attributes][5][observation_field_id]=306";
				url += "&observation[observation_field_values_attributes][5][value]="+plantSpecies;
				url += "&observation[observation_field_values_attributes][6][observation_field_id]=5712";
				url += "&observation[observation_field_values_attributes][6][value]="+leafCount;
				url += "&observation[observation_field_values_attributes][7][observation_field_id]=5711";
				url += "&observation[observation_field_values_attributes][7][value]="+$("#herbivory-select").val();
				url += "&observation[observation_field_values_attributes][8][observation_field_id]=5748";
				url += "&observation[observation_field_values_attributes][8][value]="+$(".arthropod-count", this).text();
				url += "&observation[observation_field_values_attributes][9][observation_field_id]=5710";
				url += "&observation[observation_field_values_attributes][9][value]="+trim_end(stored_user_info.name, '@');

				// alert("url: " + url);
				$.ajax({
					url: url,
					type: "POST",
					crossDomain: true,
					contentType: 'application/x-www-form-urlencoded',
					data: {
						"access_token": inat_token,
					},
					success: function (obs_result) {
						// alert("Uploading order photo to iNaturalist");
						linkToProject(obs_result);
						uploadPhotoToiNat(obs_result, arthropodImageURI);
					},
					error: function(xhr, status){
					    alert("Unexpected error submitting observation: " + xhr.status);
					    alert(xhr.responseText);
					}
				});
			}

			$.ajax({
				url: DOMAIN + "/api/submission_full.php",
				type: "POST",
				crossDomain: true,
				dataType: 'json',
				data: JSON.stringify({
					"type": "order",
					"surveyID": result.surveyID,
					"userID": stored_user_info.userId,
					"password": stored_user_info.password,
					//order
					"orderArthropod": $("h4", this).text(),
					"orderLength": parseInt($(".arthropod-length", this).text()),
					"orderNotes": $(".arthropod-notes", this).text(),
					"orderCount": parseInt($(".arthropod-count", this).text()),
					//Caterpillar features
					"hairyOrSpiny": hairyOrSpiny,
					"leafRoll": leafRoll,
					"silkTent": silkTent
				}),
				success: function (arthropodResult) {
					//navigator.notification.alert("arthropod info submitted");
					//If arthropod successfully submitted to database, attempt photo upload
					//Upload arthropod photo if one exists
					if (arthropodImageURI !== null && arthropodImageURI !== undefined) {
						//navigator.notification.alert("Uploading order photo");
						uploadPhoto(arthropodImageURI, "arthropod-photo", arthropodResult.orderID);
					}
					else {
						//Increment number of arthropods submitted here when no photo to upload
						//to prevent duplicate success alerts
						numberOfArthropodsSubmitted++;
						if (numberOfArthropodsSubmitted == numberOfArthropodsToSubmit) {
							var successMessage = confirm("Successfully submitted survey data!\n\n" +
									"Clear form fields?");
							if (successMessage === true) {
								clearFields();
							}
						}
					}
				},
				error: function () {
					navigator.notification.alert("Unexpected error submitting " + $("h4", this).text() + " data.");
				}
			});
		});
	}
	else{
		navigator.notification.alert("Successfully submitted survey data!");
		clearFields();
	}

};

function linkToProject(obs_result) {
	$.ajax({
		url: INATURALIST_DOMAIN + "/project_observations",
		type: "POST",
		dataType: "text/html",
		crossDomain: true,
		contentType: 'application/x-www-form-urlencoded',
		data: {
			"access_token": inat_token,
			"project_observation[observation_id]": obs_result[0].id,
			"project_observation[project_id]" : 5443
		},
		success: function (obs_result) {
			alert("Successfully linked to CC Project");
		},
		error: function(xhr, status){
			// This always fails for some reason,
			// even if the observation is linked to the project.
			// alert("Unexpected error linking observation: " + xhr.status);
			// alert(xhr.responseText);
		}
	});
}

function uploadPhotoToiNat(obs_result, arthropodImageURI) {

	var success = function (r) {
		alert("New observation on iNaturalist uploaded.");
		//navigator.notification.alert("leaf photo uploaded");
		console.log("Code = " + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
	};

	var fail = function (error) {
		navigator.notification.alert("An error has occurred: Code = " + error.code);
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
	};

	var options = new FileUploadOptions();
    options.fileKey = "file";
    options.mimeType="image/jpeg";
    options.chunkedMode = false;
    options.headers = {
        Connection: "close",
        ContentType: "multipart/form-data",
    };

	var params = {
		"access_token": inat_token,
		"observation_photo[observation_id]": obs_result[0].id,
	};

	options.params = params;

	var ft = new FileTransfer();
	options.fileName = "bug_photo.jpg";
	ft.upload(arthropodImageURI, encodeURI(INATURALIST_DOMAIN + '/observation_photos'), success, fail, options);
}

//databaseID = surveyID if leaf photo, orderID if arthropod photo
//Form is cleared if final arthropod photo is successfully uploaded
//Uploads photo using FileTransfer plugin.
function uploadPhoto(photoURI, photoType, databaseID){
	// !! Assumes variable fileURL contains a valid URL to a text file on the device,
	//    for example, cdvfile://localhost/persistent/path/to/file.txt

	var leafSuccess = function (r) {
		//navigator.notification.alert("leaf photo uploaded");
		console.log("Code = " + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
	};

	var fail = function (error) {
		navigator.notification.alert("An error has occurred: Code = " + error.code);
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
	};

	var arthropodSuccess = function(r){
		//navigator.notification.alert("order photo uploaded");

		//Increment number of arthropods submitted
		//here when there is a photo to upload
		//to prevent duplicate success alerts
		numberOfArthropodsSubmitted++;
		console.log("Code = " + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);

		//If this was the last order photo to submit, clear form, submission succeeded
		if(numberOfArthropodsSubmitted == numberOfArthropodsToSubmit) {
			navigator.notification.alert("Successfully submitted survey data!");
			clearFields();

		}
	};

	var options = new FileUploadOptions();
    options.fileKey = "file";
    options.mimeType="image/jpeg";
    options.chunkedMode = false;
    options.headers = {
        Connection: "close"
    };

	//var params = {};
	//params.value1 = "test";
	//params.value2 = "param";
	//
	//options.params = params;

	var ft = new FileTransfer();
	//If uploading leaf photo
	if(photoType.localeCompare("leaf-photo") === 0) {
		options.fileName = "survey_" + databaseID + "_leaf_photo.jpg";
		ft.upload(photoURI, encodeURI(DOMAIN + "/api/uploads.php?surveyID=" + databaseID), leafSuccess, fail, options);
	}
	//Uploading arthropod photo
	else if(photoType.localeCompare("arthropod-photo") === 0){
		options.fileName = "order_" + databaseID + "_arthropod_photo.jpg";
		ft.upload(photoURI, encodeURI(DOMAIN + "/api/uploads.php?orderID=" + databaseID), arthropodSuccess, fail, options);
	}
}


//Clears fields following a successful survey submission
var clearFields = function(){
	$(".time-start").val("");
	$(".notes").val("");

	$(".plant-species").val("");
	//Clear leaf count only for beat sheet
	var surveyType = $(".survey-type option:selected").val();
	if(surveyType.localeCompare("Beat_Sheet") === 0) {
		$(".leaf-count").val("");
	}
	setDateAndTime();
	document.getElementById("circle").selectedIndex = 0;
	document.getElementById("survey").selectedIndex = 0;

	//Destroy then recreate dropdown to restore to default value
	$('#herbivory-select').ddslick('destroy');
	$('#herbivory-select').ddslick({
		data: ddData,
		width: 300,
		imagePosition: "left",
		selectText: "Please select an herbivory score.",
		onSelected: function (data) {
			//Sets value of herbivory-select to herbivory score
			$('#herbivory-select').val(data.selectedIndex);
		}
	});
	$("#leaf-capture").html("<div class='capture white-text' onclick='leafCapture()'><div class = 'capture-text'>CAPTURE</div></div>");

	$(".arthropod-input").each(function(){$(this).remove();});
};

function scanQRCode() {
	// alert("clicked qr scanner button.");
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			var qr_obj = JSON.parse(result.text);
			$("#site").val(qr_obj.siteID);
			if ($("#site").val() === null  || $("#site").val() === undefined) {
				$("#site").val(-1);
			}

			circle = qr_obj.circle;
			retrieveCircleCount();
			if ($("#circle").val() === null  || $("#circle").val() === undefined) {
				$("#circle").val(qr_obj.circle);
			}
			$("#survey").val(qr_obj.survey);

			if (qr_obj.plantSpecies !== null && qr_obj.plantSpecies !== undefined && qr_obj.plantSpecies !== "") {
				$(".plant-species").val(qr_obj.plantSpecies);
			}
		}, 
		function (error) {
			alert("Scanning failed: " + error);
		}
	);

}

//Handles device rotation
window.shouldRotateToOrientation = function() {
	return true;
};

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
