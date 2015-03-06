/**
 * 给Handlebars添加一些常用helper
 * Created by meathill on 14/11/15.
 */
'use strict';
(function (h) {
  // 从后面给的值中挑出一个
  h.registerHelper('pick', function (value, options, params) {
    value = parseInt(value);
    options = _.isArray(options) ? options : Array.prototype.slice.call(arguments, 1, -1);
    if (_.isArray(options) && _.isObject(options[0])) {
      var key = params.hash.key || 'id'
        , label = params.hash.label || 'label';
      for (var i = 0, len = options.length, result; i < len; i++) {
        if (options[i][key] == value) {
          result = options[i];
          break;
        }
      }
      return result ? result[label] : '';
    }
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

  // 除100，用于币值转换
  h.registerHelper('d100', function (value) {
    return (value / 100).toFixed(2);
  });

  h.registerHelper('moment', function (value) {
    return value ? moment(value).calendar() : '';
  });
}(Handlebars));
