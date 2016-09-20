/**
 * Created by palmour on 9/20/16
*/
$(document).ready(function(){

    var $list_length = $(".survey_item").length; //computes number of items in the survey list
    $(".survey-count").html("Total Stored Survey: " + $list_length); //updates survey-count
});