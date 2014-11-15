/**
 * 给Handlebars添加一些常用helper
 * Created by meathill on 14/11/15.
 */
(function (h) {
  h.registerHelper('ifs', function (value1, value2, options) {
    if (value1 && value2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
}(Handlebars));