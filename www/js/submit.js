
$(document).ready(function(){
  var $submitButton = $(".submit-button");
  $submitButton.click(function() {
     var ask = window.confirm("You are offline right now, ready to store it?");
         if (ask) {
                window.alert("This post was successfully stored.");
                    
                window.location = "homepage.html";
                    
         }else{
                window.alert("Not store the data");
        
         }   
   }
)
}); 