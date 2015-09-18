/**
 * 给Handlebars添加一些常用helper
 * Created by meathill on 14/11/15.
 */
'use strict';
(function (h) {
  var slice = Array.prototype.slice
    , pop = Array.prototype.pop
    , counter = {};
  // 从后面给的值中挑出一个
  h.registerHelper('pick', function (value, array) {
    value = parseInt(value);
    var options = arguments[arguments.length - 1];
    options.hash.start = options.hash.start || 0;
    if (options.hash.key && array === options) {
      array = options.data.root[options.hash.key];
    }
    array = _.isArray(array) || _.isObject(array) ? array : slice.call(arguments, 1, -1);
    return array[value - options.hash.start];
  });

  h.registerHelper('pick_with', function (value, array, options) {
    value = parseInt(value);
    array = _.isArray(array) ? array : slice.call(arguments, 1, -1);
    options = pop.call(arguments);
    if (_.isObject(array[0])) { // 对象
      var key = options.hash.key || 'id';
      for (var i = 0, len = array.length, result; i < len; i++) {
        if (array[i][key] == value) {
          result = array[i];
          break;
        }
      }
      return result ? options.fn(result) : '';
    }
    return options.fn(array[value + options.hash.offset]);
  });

  // substring
  h.registerHelper('substring', function (value, start, length) {
    return value ? value.substr(start, length) : '';
  });

  // text-collapse，使用时需要{{{}}}
  h.registerHelper('text-collapse', function (value, length) {
    if (!value) {
      return '';
    }
    if (value.length < length) {
      return value;
    }
    return '<abbr title="' + value + '">' + value.substr(0, length) + '...</abbr>';
  });

  // 取扩展名
  h.registerHelper('ext', function (value) {
    return value ? value.substr(value.lastIndexOf('.') + 1) : '';
  });

  // 除100，用于币值转换
  h.registerHelper('d100', function (value) {
    return (value / 100).toFixed(2);
  });

  // 换算简单的数字
  h.registerHelper('short_n', function (value) {
    if (_.isNaN(value)) {
      return value;
    }
    var units = ['万', '亿']
      , str = value
      , count = 0;
    while (value / 10000 >= 1) {
      value /= 10000;
      str = (value % 1 === 0 ? value : ((value * 100 >> 0) / 100)) + units[count];
      count++;
    }
    return str;
  });

  //千位分割并保留到小数点后两位
  h.registerHelper('readable_n', function (value) {
    value = _.isNumber(value) ? value.toFixed(2) : Number(value).toFixed(2);
    value = value.replace('.', ',');
    var reg = /(\d)(\d{3},)/;
    while(reg.test(value)){
      value = value.replace(reg, '$1,$2');
    }
    value = value.replace(/,(\d\d)$/, '.$1');
    return value.replace(/^\./, '0.');
  });

  // 用来生成可读时间
  h.registerHelper('moment', function (value) {
    value = value ? moment(value).calendar() : '';
    return /invalid/i.test(value) ? '' : value;
  });
  h.registerHelper('from-now', function (value) {
    return value ? moment(value).fromNow() : '';
  });
  h.registerHelper('to_date', function (value, plus) {
    return value ? moment(value).add(plus, 'days').format(moment.DATE_FORMAT) : '';
  });

  // 等于
  h.registerHelper('equal', function (value, target, options) {
    if (value == target) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // 大于
  h.registerHelper('greater', function (value, target, options) {
    if (value > target) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // 包含
  h.registerHelper('in', function (value, array, options) {
    if (!_.isArray(array)) {
      options = pop.call(arguments);
      array = slice.call(arguments, 1);
    }
    if (array.indexOf(value) !== -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  // raw
  h.registerHelper('raw-helper', function (options) {
    return options.fn();
  });

  // 输出json数组
  h.registerHelper('json', function (value) {
    return JSON.stringify(value);
  });

  // inject
  h.registerHelper('inject', function (target, key) {
    var context = h.$context;
    target = context.getValue(target);
    return target instanceof Backbone.Model ? target.get(key) : target[key];
  });

  // 输出排序值
  h.registerHelper('counter', function (key) {
    key = key || '_';
    counter[key] = counter[key] || 1;
    return counter[key]++;
  });
  h.registerHelper('counter-reset', function (key) {
    key = key || '_';
    counter[key] = 1;
    return '';
  });
}(Handlebars));
