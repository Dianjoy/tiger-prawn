/**
 * 给Handlebars添加一些常用helper
 * Created by meathill on 14/11/15.
 */
(function (h) {
  // 从后面给的值中挑出一个
  h.registerHelper('pick', function (value) {
    var options = Array.prototype.slice.call(arguments, 1, -1);
    return options[value];
  });
  // substring
  h.registerHelper('substring', function (value, start, end) {
    return value.substr(start, end);
  });
}(Handlebars));
