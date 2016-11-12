$(document).ready(function(){
  var $submitButton = $(".upload-button");
  $submitButton.click(function() {
     var ask = window.confirm("Ready to upload?");
         if (ask) {
                window.alert("This post was successfully uploaded.");
                var element = document.getElementsByClassName("survey_item");
                for(var i=0; i<element.length; i++) { 
                        element[i].style.display='none';
                }
                    
         }else{
                window.alert("Upload unsuccessfully");
        
         }   
   }
)
}); 