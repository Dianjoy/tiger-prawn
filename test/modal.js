/**
 * Created by 路佳 on 2015/3/3.
 */

$('#modal').on('shown.bs.modal', function () {
  $(this).modal({
    backdrop: 'static',
    keyboard: false
  });
});