$(function () {
  $('.morris-data').each(function () {
    var data = JSON.parse(this.innerHTML);
    data.element = $(this).data('target');
    new Morris.Line(data);
  });
});