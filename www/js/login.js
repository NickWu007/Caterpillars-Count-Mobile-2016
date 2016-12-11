/**
 * Created by skuroda on 10/27/15.
 */
var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";
var db;
var stored_user_info;
var rememberMeChecked;
var use_data;

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

    stored_user_info = null;
    // If there's a stored user info, pre-populate it to login fileds.
    db.transaction(function(tx){
        tx.executeSql('select name, password, userId from USER_INFO', [], function(tx, rs){
            // alert("# of entries: " + rs.rows.length);
            if (rs.rows.length > 0) stored_user_info=rs.rows.item(0);
        });
        tx.executeSql('select * from SETTING', [], function(tx, rs){
                if (rs.rows.length > 0) {
                    use_data = rs.rows.item(0).useData;
                    //alert("use data:"+use_data);
                }else{
                    use_data='NONE'
                }
            });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function() {
            if (stored_user_info !== null) {
                //alert("successfully retrieved cached user info.");
                var $email = $($('.email')[0]);
                $email.val(stored_user_info.name);
                $email.css("backgroundColor", "yellow");
                var $pw;
                var showPasswordCheckboxIsChecked = document.getElementById("show-password").checked;
                if(showPasswordCheckboxIsChecked){
                    $pw = $("#visible-password");
                } else {
                    $pw = $("#hidden-password");
                }
                $pw.val(stored_user_info.password);
                $pw.css("backgroundColor", "yellow");
        }
    });
}


$(document).ready(function(){
    var $submitButton = $(".login-button");
    $submitButton.click(function (e) {
        e.preventDefault();

        //Use hiddenpw variable to make sure that css is consistent when toggling password visibility
        var $pw, $hiddenpw, $rememberme;
        var showPasswordCheckboxIsChecked = document.getElementById("show-password").checked;
        rememberMeChecked = document.getElementById("remember-me").checked;
        if(showPasswordCheckboxIsChecked){
            $pw = $("#visible-password");
            $hiddenpw = $("#hidden-password");
        }else{
            $pw = $("#hidden-password");
            $hiddenpw = $("#visible-password");
        }

        var $email = $('.email');
        //One of the fields is blank
        if (!$email.val() || !$pw.val()) {
            $(".error").remove();
            //Add error styling
            $pw.css("border", "1px solid red");
            $hiddenpw.css("border", "1px solid red");
            $email.css("border", "1px solid red");
            $email.before("<p class = 'error'>Please fill in both fields before submitting!</p>");
            return;
        }
        
        // Check if offline. If so, use offline login logic
        // Offline log in logic, faking for now.
        online=isOnline();
        // alert("is online:"+online);
        if (!online) {
            if((stored_user_info===null)||(stored_user_info.name!=$email.val())||(stored_user_info.password!=$pw.val())){
                  alert("No internet access. Cannot log in.");
              }
              else{
                  db.close();
                  window.location.assign("homepage.html?userID="+ stored_user_info.userId + "&password=" + $pw.val());
                  return;
              }
        }

        //Attempt login
        var json_obj = {email: $email.val(), password: $pw.val()};
        $.ajax(DOMAIN +"/api/login.php",
            {type: "POST",
                dataType: "json",
                crossDomain: true,
                data: JSON.stringify(json_obj),
                success: function (data, status, xhr) {
                    console.log("success");
                    console.log(data);
                    // If successfully logged in, display main survey page with userID 
                    // and password as (hidden) url parameters. Also store the login info
                    // for future login.
                    if (data.privilegeLevel >= 0) {
                        // alert("before sql xact.");
                        db.transaction(function(tx){
                            
                            tx.executeSql('delete from USER_INFO');
                            if(rememberMeChecked){
                                tx.executeSql('INSERT INTO USER_INFO VALUES (?,?,?)', [json_obj.email, json_obj.password, data.userID], function(tx, resultSet) {
                                    // alert('resultSet.insertId: ' + resultSet.insertId);
                                    // alert('resultSet.rowsAffected: ' + resultSet.rowsAffected);
                                }, function(tx, error) {
                                    alert('INSERT error: ' + error.message);
                                });
                                tx.executeSql('SELECT * FROM SETTING', [], function(tx, resultSet) {
                                    if (resultSet.rows.length == 0) {
                                        tx.executeSql('INSERT INTO SETTING VALUES (?,?,?,?)', [data.userID, "default", "default", ""], function(tx, resultSet) {
                                            // alert('resultSet.insertId: ' + resultSet.insertId);
                                            // alert('resultSet.rowsAffected: ' + resultSet.rowsAffected);
                                        }, function(tx, error) {
                                            alert('INSERT error: ' + error.message);
                                        });
                                    }
                                }, function(tx, error) {
                                    alert('SELECT error: ' + error.message);
                                });
                            }
                            else{
                                window.location.assign("homepage.html?userID="+json_obj.email+"&password="+json_obj.password);
                            }
                            
                        }, function(error){
                            alert("Transaction Error: " + error.message);
                        }, function() {
                            // if(rememberMeChecked){alert("new user added into database.");}
                            // else{alert("new user logged in. User info not cached.")}
                            window.location.assign("homepage.html?userID="+data.userID+"&password="+json_obj.password);
                        });
                        // alert("after sql xact.");
                    }
                   
                    if (data.validPw === 0) {
                        $pw.val("");
                        $(".error").remove();
                        //Reset email field styling
                        $email.css("border", "none");
                        $email.css("border-bottom", "thin solid gray");
                        //Set error styling
                        $pw.css("border", "1px solid red");
                        $hiddenpw.css("border", "1px solid red");
                        $email.before("<p class = 'error'> Password not correct!</p>");
                    }
                    if (data.active === 0) {
                        //$pw.val("");
                        //$email.val("");
                        $(".error").remove();
                        //$email.css("border", "1px solid red");
                        $email.before("<p class = 'error'>User not activated! Please check your email for an activation email.</p>");
                    }
                    if (data.validUser === 0) {
                        $pw.val("");
                        $email.val("");
                        $(".error").remove();
                        //$email.css("border", "1px solid red");
                        $email.before("<p class = 'error'>User has been marked invalid. Please contact an administrator.</p>");
                    }
                    //If return value for validUser (or any field) is null
                    if(!data.validUser){
                        $pw.val("");
                        $email.val("");
                        $(".error").remove();
                        //Reset password field styling
                        $pw.css("border", "none");
                        $pw.css("border-bottom", "thin solid gray");
                        $hiddenpw.css("border", "none");
                        $hiddenpw.css("border-bottom", "thin solid gray");
                        $email.css("border", "1px solid red");
                        $email.before("<p class = 'error'>User not found!</p>");
                    }
                },
                error: function (xhr, status) {
                    if (xhr.status == 404) {
                        $pw.val("");
                        $email.val("");
                        $(".error").remove();
                        //Reset password field styling
                        $pw.css("border", "none");
                        $pw.css("border-bottom", "thin solid gray");
                        $hiddenpw.css("border", "none");
                        $hiddenpw.css("border-bottom", "thin solid gray");

                        $email.css("border", "1px solid red");
                        $email.before("<p class = 'error'>User not found!</p>");
                    }  
                    //else if (xhr.status == 403) {
                    //    $pw.val("");
                    //    $email.val("");
                    //    $(".error").remove();
                    //    $email.css("border", "1px solid red");
                    //    $email.after("<p class = 'error'>User is not an administrator!</p>");
                    //}
                }
        });   
    });

    var $amodeButton = $(".amode-button");
    $amodeButton.click(function(e){
        window.location.assign("homepage-anon.html");
    });
});

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

//Displays password reset dialog
var showPasswordResetDialog = function(){
    $("#password-reset").dialog({
        modal: true,
        buttons: {
            "Reset password": function() {
                var resetDialog = this;
                resetPassword(resetDialog);
            },
            Cancel: function(){
                $( this ).dialog( "close" );
            }
        }
    });
};

//Send http request to reset password.
//Displays same message even if the email
//address is not associated with any user account
var resetPassword = function(resetDialog){
    var resetEmail = $("#reset-email");
    var inputData = {
        email: resetEmail.val(),
        recover: 1
    };
    $.ajax(DOMAIN + "/api/users.php",
        {type: "POST",
        dataType: "json",
        data: JSON.stringify(inputData),
        crossdomain: true,
        success: function(){
            $(resetDialog).dialog( "close" );
            $("#password-reset-confirmation").dialog({
                modal: true,
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });
        },
        error: function(){
            $(resetDialog).dialog( "close" );
            $("#password-reset-confirmation").dialog({
                modal: true,
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });
        }
    });

};
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