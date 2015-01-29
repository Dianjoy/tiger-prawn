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
  h.registerHelper('substring', function (value, start, length) {
    return value.substr(start, length);
  });
  // 取扩展名
  h.registerHelper('ext', function (value) {
    return value.substr(value.lastIndexOf('.') + 1);
  });

  h.registerHelper('pick_in', function (context, options) {
    var key = options.fn();
    if (_.isObject(context[0])) {
      var value = _.find(context, function (item) {
        return item.id == key;
      });
      return value.label;
    }
    return context[key];
  });
}(Handlebars));
