/**
 * Created by qiujuan on 2015/2/2.
 */
$(function(){
  var _width = screen.width;
  if(_width < 750){
    $("#navbar-side").css({
      "position": "absolute",
      "left": "-200px"
    });
    $("#content").css({
      "margin-left": "0px"
    });
  }
  $("#navbar").click( function(){
    $("#navbar-side").css({
      "position": "absolute",
      "left": "0px"
    });
    $("#content").css({
      "margin-left": "200px"
    });
  });
});

