$(document).ready(function(){
    var $nav = $(".newsite");
    $nav.click(function() {
                   window.prompt("Please enter site name","");
                   window.prompt("Please enter location", "");
    }
 )
 var $submitButton = $(".delete1");
  $submitButton.click(function() {
     var ask = window.confirm("Ready to delete?");
         if (ask) {
                window.alert("This post was successfully Deleted.");
                var element = document.getElementsByClassName("survey_item1");
                for(var i=0; i<element.length; i++) { 
                        element[i].style.display='none';
                }
                    
         }else{
                window.alert("Delete unsuccessfully");
        
         }   
   }
  )

  var $submitButton = $(".delete2");
  $submitButton.click(function() {
     var ask = window.confirm("Ready to delete?");
         if (ask) {
                window.alert("This post was successfully Deleted.");
                var element = document.getElementsByClassName("survey_item2");
                for(var i=0; i<element.length; i++) { 
                        element[i].style.display='none';
                }
                    
         }else{
                window.alert("Delete unsuccessfully");
        
         }   
   }
  )
});