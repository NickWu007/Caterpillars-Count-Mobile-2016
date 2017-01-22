var db;
var site = "https://www.inaturalist.org";
var ccsite="http://develop-caterpillars.vipapps.unc.edu/";
//var app_id = 'f288a4e448fb2157ca940efcd471b5148fbb26f5de7dea47593fd863f978ddcb';
//var app_secret = '7ff165db65f1477b5b91a7d0b625a725f44a9eee929224c19f792fcfc37a4351';
var username = 'caterpillarscount';
var password = 'catcount!';
var access_token;
var userID;
var use_data;
var use_inat;

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
        DBsuccess(), 
        function(error){alert("Error Open Database:"+JSON.stringify(error));}
    );
    function DBsuccess(){
        // alert("DB open ok, Create Table etc");
    }

    db.transaction(function(tx){
        tx.executeSql('select * from SETTING', [], function(tx, rs){
            if (rs.rows.length > 0) {
                userID = rs.rows.item(0).userID;
                use_data = rs.rows.item(0).useData;
                $('.data-perference option[value="' + use_data + '"]').prop("selected", true);
                use_inat = rs.rows.item(0).useINat;
                $('.iNaturalist option[value="' + use_inat + '"]').prop("selected", true);
            }
        });
        }, function(error){
            alert("Transaction Error: "+error.message);
        }, function() {
            // alert("finish pre-fill");
    });
    
    var $logoffButton = $(".logoff");
    $logoffButton.click(function (e) {
        // When manually clicks to log off, deletes stored login info.

        db.transaction(function(tx){
            tx.executeSql('delete from USER_INFO');
            tx.executeSql('delete from SETTING');
        }, function(error){
            alert("Transaction Error: " + error.message);
        }, function() {
            alert("user deleted from database.");
            window.location.assign("StartScreen.html");
        });
    });

    $('.data-perference').change(function() {
        use_data = $('.data-perference option:selected').val();
        updateSettings();
        if(use_data=='Yes'){
            alert("Now, the App will use Cellular Data (4G/3G/2G) to submit survey.");
        }else{
            alert("Now, the App will only use WIFI to submit survey. Otherwise, surveys will be stored locally and you can upload them later.");
        }
    });

    $('.iNaturalist').change(function() {
        if ($(this).val() == "Yes") {
            retriveLogin();
            //iNar_login(); #now moved into retriveLogin()
        }

        use_inat = $('.iNaturalist option:selected').val();
        updateSettings();
    });

    function retriveLogin(){
        $.ajax({
            url: ccsite + "/api/iNaturalist.php",
            type : "POST",
            dataType: 'json',
            data: JSON.stringify({
                "action" : "getiNaturalistLogin"
            }),
            success: function(response){
                iNar_login(response['7'],response['11']);
            },
            error : function(xhr, status){
                alert("Cannot retrive iNaturelist Login:"+xhr.responseText);
            }
        });
    }

    function updateSettings() {
        if (userID !== null && userID !== undefined) {
            db.transaction(function(tx){
                tx.executeSql('update SETTING set useData = ?, useINat = ?, iNar_token = ? where userID = ?', [use_data, use_inat, access_token, userID], 
                    function(tx, resultSet) {
                        // alert('resultSet.rowsAffected: ' + resultSet.rowsAffected);
                    }, function(tx, error) {
                        alert('UPDATE error: ' + error.message);
                });
            }, function(error){
                alert("Transaction Error: " + error.message);
            }, function() {
                // alert("user settings updated.");
            });
        }
    }

    function iNar_login(app_id, app_secret) {
        $.ajax({
            url: site + "/oauth/token",
            type : "POST",
            contentType: 'application/x-www-form-urlencoded',
            data: {
                "client_id" : app_id,
                "client_secret" : app_secret,
                "grant_type" : "password",
                "username" : username,
                "password" : password
            },
            success: function(response){
                alert("Signin to iNaturalist successful");
                access_token = response.access_token;
                updateSettings();
            },
            error : function(xhr, status){
                navigator.notification.alert("Unexpected error submitting survey: " + xhr.status);
                alert(xhr.responseText);
            }
        });
    }

    $('.iNat-login').click(iNar_login);
}
