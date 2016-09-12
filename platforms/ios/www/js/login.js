/**
 * Created by skuroda on 10/27/15.
 */
var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";


document.addEventListener("deviceready", onDeviceReady, false);
//Return to start screen if android back button is pressed
function onDeviceReady(){
    document.addEventListener("backbutton", function(e){
        e.preventDefault();
        window.location.assign("StartScreen.html");
    }, false);
}


$(document).ready(function(){

    var $submitButton = $(".login-button");
    $submitButton.click(function (e) {
        e.preventDefault();

        if (!navigator.onLine) {
            window.location.assign("homepage.html?userID=421&password=Wja673581429");
            return;
        }

        //Use hiddenpw variable to make sure that css is consistent when toggling password visibility
        var $pw, $hiddenpw;
        var showPasswordCheckboxIsChecked = document.getElementById("show-password").checked;
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
                    //If successfully logged in, display main survey page with userID and password as (hidden) url parameters.
                    if (data.privilegeLevel >= 0 ) {
                        window.location.assign("homepage.html?userID="+data.userID+"&password="+json_obj.password);
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