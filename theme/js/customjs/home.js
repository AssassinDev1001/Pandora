/**
 * created : 2018-07-28
 * author : HWK
 * description : Home .js
 */

$(document).ready(function(){
  $("#id_warnning").attr("style","display:none;");
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
});

$("#id_login").click(function () {
   login();
});

function login () {
  var strEmail = $("#email").val();
  var strPassword = $("#password").val();
  var remember = document.getElementById("id_remember").checked;
  if(strEmail == "" || strEmail == null || strEmail == "E-mail")
  {
    $("#id_warnning").attr("style","display:show;");
    return;
  }
  else{
    $("#id_warnning").attr("style","display:none;");
  }
  if(strPassword == "" || strPassword == null ||strPassword == "Password")
  {
    $("#id_warnning").attr("style","display:show;");
    return;
  }
  else{
    $("#id_warnning").attr("style","display:none;");
  }
  $("#gallery").show();
  $.post("/login",
    {
      email:strEmail,
      password:strPassword,
      remember:remember
    },
    function(result)
    {
      $("#gallery").hide();
      var aryResult = JSON.parse(result);
      if(aryResult.status == "success"){
        window.location.href = "/postArticle";
      }
      else{
        $("#id_warnning").text(aryResult.msg);
        $("#id_warnning").attr("style" , "display:show;");
      }
    });
}

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
