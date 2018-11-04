/**
 * created : 2018-07-28
 * author : HWK
 * description : newpassword.js
 */

$(document).ready(function () {
  var B = document.body,
    H = document.documentElement,
    height

  if (typeof document.height !== 'undefined') {
    height = document.height // For webkit browsers
  } else {
    height = Math.max( B.scrollHeight, B.offsetHeight,H.clientHeight, H.scrollHeight, H.offsetHeight );
  }
  height = height + 100;
  var strHeight = height.toString() + "px";
  strHeight = "height:" + strHeight;
  document.getElementById('gallery').setAttribute("style", strHeight);
})
$("#a_newpass").click(function () {
  $("#id_w_confirm").attr("style","display:none;");
  var strNewPass =  $("#newpassword").val();
  var strConfirm = $("#confirm").val();
  var strEmail = $("#id_email").val();
  if(strNewPass == "" || strNewPass == null){
    $("#id_w_new").attr("style","display:show;");
    return;
  }
  else{
    $("#id_w_new").attr("style","display:none;");
  }

  if(strConfirm== "" || strConfirm== null){
    $("#id_w_confirm").attr("style","display:show;");
    return;
  }
  else{
    $("#id_w_confirm").attr("style","display:none;");
  }
  if(strNewPass != strConfirm){
    $("#id_w_confirm").text("New passowrd is different with confirm password.");
    $("#id_w_confirm").attr("style","display:show;");
    return;
  }

  $("#gallery").show();
  $.post("/newpassword",{
    newpassword:strNewPass,
    email:strEmail
  },
    function (result) {
    $("#gallery").hide();
      var aryResult = JSON.parse(result);
      if(aryResult.status == "success"){
        $("#id_w_confirm").text("updated successfully.");
        $("#warnning").attr("style","color:green;");
        $("#id_w_confirm").attr("style","display:show;");
        $("#a_newpass").attr("style", "display:none;");
      }
      else{
        $("#id_w_confirm").text("Failed to update. Try again please.");
        $("#id_w_confirm").attr("style","display:show;");
      }
    });
});

//set language.
$('#sel_language').change(function() {
  var val = $("#sel_language option:selected").text();
  var language = $("#sel_language").val();
  var current_url = window.location.href;
  var language_code = $("#sel_language").language_code;
  $("#id_formSetLanguage").find("[name='current_url']").val(current_url);
  $("#id_formSetLanguage").find("[name='language_code']").val(language);
  $("#id_formSetLanguage").submit();
});