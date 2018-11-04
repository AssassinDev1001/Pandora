/**
 * created : 2018-07-28
 * author : HWK
 * description : register.js
 */

$(document).ready(function()
{
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

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "positionClass": "toast-top-right",
    "onclick": null,
    "showDuration": "10000",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "2000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  //register.
  $("#id_register").click(function () {

    if (grecaptcha === undefined) {
      alert('Recaptcha not defined');
      return;
    }

    var response = grecaptcha.getResponse();

    if (!response) {
      alert('Coud not get recaptcha response');
      return;
    }

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          alert(this.responseText);
        }
      }
    }

    var strName = $("#id_name").val();
    var strEmail = $("#id_email").val();
    var strPass = $("#id_pass").val();
    var strConfirm = $("#id_confirm").val();
    var strSecretQ  = $("#id_secretQ").val();
    var strSecreA = $("#id_secretA").val();
    if(isInvalid(strName) || isInvalid(strEmail) ||
      isInvalid(strPass) || isInvalid(strConfirm) ||
      isInvalid(strSecretQ) || isInvalid(strSecreA))
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("All values are required.");
      return;
    }
    if(isInvalidUsername(strName) == 'NOT_STRING')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Type of Name is wrong.");
      return;
    }
    if(isInvalidUsername(strName) == 'TOO_SHORT')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Length of Name is short.");
      return;
    }
    if(isInvalidUsername(strName) == 'TOO_LONG')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Length of Name is long.");
      return;
    }
    if(isInvalidUsername(strName) == 'INVALID_CHARS')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Value of Name is not value.");
      return;
    }

    if(isInvalidEmail(strEmail) == 'NOT_STRING')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Type of Email is wrong.");
      return;
    }
    if(isInvalidEmail(strEmail) == 'TOO_LONG')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Length of Email is long.");
      return;
    }
    if(isInvalidEmail(strEmail) == 'NO_@')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Email has to include @.");
      return;
    }
    if(isInvalidEmail(strEmail) == 'NOT_A_VALID_EMAIL')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Email is invalide.");
      return;
    }
    if(isInvalidPassword(strPass) == 'NOT_STRING')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Type of Password is wrong.");
      return;
    }

    if(isInvalidPassword(strPass) == 'TOO_LONG')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Length of Password is too long.");
      return;
    }
    if(isInvalidPassword(strPass) == 'TOO_SHORT')
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Length of Password is short.");
      return;
    }

    if(strPass  != strConfirm)
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("Password has to be same value with Confirm Password.");
      return;
    }
    if(!document.getElementById("agree1").checked)
    {
      $('.all_require').attr("style", "display:show;");
      $('.all_require').text("You have to click checkbox.");
      return;
    }
    $('.all_require').attr("style", "display:none;");
    $("#overlay").height($(window).height()+'px');
    window.onresize = function(event)
    {
      $("#overlay").height($(window).height()+'px');
    }
    $("#gallery").show();
    $.post("/register",
      {
        username:strName,
        email:strEmail,
        password:strPass,
        secret_question:strSecretQ,
        secret_answer:strSecreA,
        confirm:strConfirm
      },
      function(result)
      {
        $("#gallery").hide();
        var aryResult = JSON.parse(result);
        if(aryResult.status == "success")
        {
          $('#form_register').attr("style" , "display:none;");
          $('.field_verify').attr("style" , "display:show;");
          $('#form_verify').attr("style" , "display:show;");
        }
        else
        {
          $('.all_require').attr("style", "display:show;");
          $('.all_require').text(aryResult.msg);
          return;
        }
      });
  });

  //verify.
  $("#btn_verify").click(function () {
    var strverifycode = $("#id_verifycode").val();
    var username = $("#id_name").val();
    var email = $("#id_email").val();
    if(strverifycode == "" || strverifycode == null){
      toastr['warning']("You have to input verify code.");
      return;
    }
    if(username == "" || username == null){
      toastr['warning']("You have to input username.");
      return;
    }
    if(email == "" || email == null){
      toastr['warning']("You have to input email.");
      return;
    }
    $("#gallery").show();
    $.post("/sendVerify",
      {
        verifycode:strverifycode,
        username:username,
        email:email
      },
      function(result)
      {
        $("#gallery").hide();
        var aryResult = JSON.parse(result);
        if(aryResult.status == "success")
        {
          window.location.href = "/";
        }
        else
        {
          $('.all_require').attr("style", "display:show;");
          $('.all_require').text(aryResult.msg);
          return;
        }
      });
  });
});

/**
 * Recaptcha.
 * *
 * */
function sendAjaxRequest() {

  ajax.open('POST', 'validate-recaptcha.php', true);
  ajax.send('recaptcha=' + response);
}

function isInvalid(val)
{
	if(val == "" || val == null || val.length == 0){
		return true;
	}
	return false;
}

function isInvalidUsername(input)
{
	if (typeof input !== 'string') return 'NOT_STRING';
    if (input.length === 0) return 'NOT_PROVIDED';
    if (input.length < 3) return 'TOO_SHORT';
    if (input.length > 50) return 'TOO_LONG';
    if (!/^[a-z0-9_\-]*$/i.test(input)) return 'INVALID_CHARS';
    if (input === '__proto__') return 'INVALID_CHARS';
    return false;
}

function isInvalidEmail(email)
{
	if (typeof email !== 'string') return 'NOT_STRING';
    if (email.length > 100) return 'TOO_LONG';
    if (email.indexOf('@') === -1) return 'NO_@'; // no @ sign
    if (!/^[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}$/i.test(email)) return 'NOT_A_VALID_EMAIL'; // contains whitespace
    return false;
}

function isInvalidPassword(password)
{
	if (typeof password !== 'string') return 'NOT_STRING';
    if (password.length === 0) return 'NOT_PROVIDED';
    if (password.length < 7) return 'TOO_SHORT';
    if (password.length > 200) return 'TOO_LONG';
    return false;
}

//get hover event.
$("#choose_human").hover(function () {
  $("#about_human").attr("style","display:block;");
  $("#about_elf").attr("style","display:none;");
  $("#about_cvergi").attr("style","display:none;");
  $("#about_miriny").attr("style","display:none;");
  $("#about_enkidu").attr("style","display:none;");
  $("#about_krolli").attr("style","display:none;");
});

$("#choose_elf").hover(function () {
  $("#about_human").attr("style","display:none;");
  $("#about_elf").attr("style","display:block;");
  $("#about_cvergi").attr("style","display:none;");
  $("#about_miriny").attr("style","display:none;");
  $("#about_enkidu").attr("style","display:none;");
  $("#about_krolli").attr("style","display:none;");
});
$("#choose_cvergi").hover(function () {
  $("#about_human").attr("style","display:none;");
  $("#about_elf").attr("style","display:none;");
  $("#about_cvergi").attr("style","display:block;");
  $("#about_miriny").attr("style","display:none;");
  $("#about_enkidu").attr("style","display:none;");
  $("#about_krolli").attr("style","display:none;");
});
$("#choose_miriny").hover(function () {
  $("#about_human").attr("style","display:none;");
  $("#about_elf").attr("style","display:none;");
  $("#about_cvergi").attr("style","display:none;");
  $("#about_miriny").attr("style","display:block;");
  $("#about_enkidu").attr("style","display:none;");
  $("#about_krolli").attr("style","display:none;");
});
$("#choose_enkidu").hover(function () {
  $("#about_human").attr("style","display:none;");
  $("#about_elf").attr("style","display:none;");
  $("#about_cvergi").attr("style","display:none;");
  $("#about_miriny").attr("style","display:none;");
  $("#about_enkidu").attr("style","display:block;");
  $("#about_krolli").attr("style","display:none;");
});$("#choose_krolli").hover(function () {
  $("#about_human").attr("style","display:none;");
  $("#about_elf").attr("style","display:none;");
  $("#about_cvergi").attr("style","display:none;");
  $("#about_miriny").attr("style","display:none;");
  $("#about_enkidu").attr("style","display:none;");
  $("#about_krolli").attr("style","display:block;");
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