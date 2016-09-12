/**
 * Created by skuroda on 11/6/15.
 */
$(document).ready(function(){
    var DOMAIN = "http://master-caterpillars.vipapps.unc.edu";

    document.addEventListener("deviceready", onDeviceReady, false);
    //Return to start screen if android back button is pressed
    function onDeviceReady(){
        document.addEventListener("backbutton", function(e){
            e.preventDefault();
            window.location.assign("StartScreen.html");
        }, false);
    }

    var $submitButton = $(".register-button");
    $submitButton.click(function () {
        var $form = $(".form");
        var $email = $(".email");
        var $firstName = $(".first-name");
        var $lastName = $(".last-name");
        var $password = $(".password");
        var $confirmPassword = $(".password-confirm");
        var $error = $(".error");
        //First name not entered
        if (!$firstName.val()) {
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $firstName.css("border", "1px solid red");
            $error.text("Please enter your first name.");
            return;
        }
        //Last name not entered
        if (!$lastName.val()) {
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $lastName.css("border", "1px solid red");
            $error.text("Please enter your last name.");
            return;
        }
        //Email address not entered
        if (!$email.val()) {
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $email.css("border", "1px solid red");
            $error.text("Please enter an email address.");
            return;
        }
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //Value entered into email field is not an email address based on regex check
        if(!$email.val().match(re)){
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $email.css("border", "1px solid red");
            $error.text("Please enter a valid email address.");
            return;
        }
        //No password entered
        if (!$password.val()) {
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $password.css("border", "1px solid red");
            $error.text("Please enter a password.");
            return;
        }
        //Password confirmation not filled
        if(!$confirmPassword.val()){
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $confirmPassword.css("border", "1px solid red");
            $error.text("Please confirm your password.");
            return;
        }
        //Password confirmation doesn't match password
        if($confirmPassword.val().localeCompare($password.val()) != 0){
            $(".error").text();
            $form.find("input").css("border", "");
            $form.find("input").css("border-bottom", "thin solid gray");
            $confirmPassword.css("border", "1px solid red");
            $error.text("Passwords do not match.");
            return;
        }

        var inputData = {
            email: $email.val(),
            password: $password.val(),
            name: $firstName.val() + " " + $lastName.val()
        };

        $.ajax(DOMAIN+"/api/users.php",
            {type: "POST",
            dataType: "json",
            data: JSON.stringify(inputData),
            success: function(data, xhr, status){
                alert("A confirmation email has been sent to \n"+data.email+
                    "\n\nPlease follow the instructions therein\n" +
                    "to activate your Caterpillars Count!\n" +
                    "account. You will not be able to log in \n" +
                    "before doing so.\n" +
                    "\nBe sure to check your spam folder if\n" +
                    "you do not see an email from us in your\n" +
                    "inbox.")
                window.location.replace("login.html");
            },
            error: function(xhr,status){
                if (xhr.status == 409) {
                    $(".error").remove();
                    $form.find("input").css("border", "");
                    $email.css("border", "1px solid red");
                    $form.prepend("<p class = 'error'>The email address has been registered with another account. \n\
Please log in or use a different email.</p>");
                }
            }
        });
    });
});
//Handles device rotation
window.shouldRotateToOrientation = function() {
    return true;
};
