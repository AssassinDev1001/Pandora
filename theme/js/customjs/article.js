$(document).ready(function () {
  var title= $("#id_title").val();
  var kind = $("#id_kind").val();
  var content = $("#id_content").val();
  var nid = $("#id_no").val();
  $("#txt_title").val(title);
  $("#sel_kind").val(kind);
  $(".note-editable").html(content);

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

  ComponentsEditors.init();
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


  $("#btn_send").click(function () {
    var strTitle = $("#txt_title").val();
    var strKind  = $("#sel_kind").val();
    var strContent = $(".note-editable").html();
    if(strTitle == "" || strTitle == null){
      toastr['warning']("You have to input title.");
      return;
    }
    $("#gallery").show();
    $.post("/create",
      {
        Title:strTitle,
        Kind:strKind,
        Content:strContent
      },
      function(result){
      $("#gallery").hide();
      if(result.status == "success"){
        toastr['success']("Successfully to input  data.");
      }else {
        toastr['error']("Failed to input  data.");
      }
      })
  });

  $("#btn_clear").click(function () {
    toastr['success']("Successfully  Clear.");
    $(".note-editable").html("");
    $("#txt_title").val("");
  })
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