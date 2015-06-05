/**
 * 使用装饰器模式创建的用来显示spinner的按钮
 * Created by meathill on 15/6/5.
 */
'use strict';
(function ($) {
  $.fn.spinner = function (roll) {
    roll = roll === null ? true : roll;
    return this.each(function (i) {
      if (this.tagName.toLowerCase() === 'a') {
        $(this).toggleClass('disabled', roll);
      } else if (this.tagName.toLowerCase() === 'button') {
        $(this).prop('disabled', roll);
      } else {
        return true;
      }

      $(this).find('i').toggle(!roll);
      if (roll) {
        $(this).prepend(tp.component.spinner);
      } else {
        $(this).find('.fa-spin').remove();
      }
    });
  };
}(jQuery));