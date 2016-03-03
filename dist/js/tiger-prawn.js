"use strict";
(function () {
(function (b) {
  var sync = b.sync;

  // add withCredential
  b.sync = function (method, model, options) {
    options = options || {};

    if ('success' in options) {
      var success = options.success;
      options.success = function (response) {
        b.trigger('backbone-sync', response);
        success.call(options.context, response);
      };
    }
    var error = options.error;
    options.error = function (response) {
      b.trigger('backbone-error', response);
      if (error) {
        error(response);
      }
    };


    if ('xhrField' in options) {
      options.xhrFields.withCredentials = true;
    } else {
      options.xhrFields = {
        withCredentials: true
      };
    }
    return sync(method, model, options);
  };

  // 修复Backbone在url()时的问题
  b.Model.prototype.isNew = function () {
    return !this.id;
  };
}(Backbone));;
(function (h) {
  function d100(value) {
    value = value || 0;
    return toReadableNumber(Math.round(value) / 100);
  }
  function round(value, length) {
    length = Math.pow(10, length);
    return Math.round(value * length) / length;
  }
  function sum() {
    var params = slice.call(arguments, 0, -1)
      , options = arguments[arguments.length - 1]
      , amount = _.reduce(params, function (memo, value) {
        if (value === '-') {
          this.isMinos = true;
        } else {
          memo += (this.isMinos ? -1 : 1) * value;
          this.isMinos = false;
        }
        return memo;
      }, 0, params);
    if (options.hash.d100) {
      amount = d100(amount);
    }
    return amount;
  }
  function toReadableNumber(value) {
    value = Number(value);
    value = (value % 1 != 0 ? round(value, 2) : value).toString();
    value = value.replace('.', ',');
    var reg = /(\d)(\d{3})(,|$)/;
    while(reg.test(value)){
      value = value.replace(reg, '$1,$2$3');
    }
    value = value.replace(/,(\d{1,2})$/, '.$1');
    return value.replace(/^\./, '0.');
  }

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
  h.registerHelper('d100', d100);
  // 取整
  h.registerHelper('round', round);
  // 加合
  h.registerHelper('sum', sum);

  // 换算简单的数字
  h.registerHelper('short_n', function (value) {
    if (_.isNaN(value)) {
      return value;
    }
    var units = ['万', '亿', '万亿']
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
  h.registerHelper('readable_n', toReadableNumber);
  // 百分比
  h.registerHelper('percent', function (value, total) {
    value = Number(value);
    if (!isNaN(total)) {
      value = value / total;
    }
    return Math.round(value * 10000) / 100;
  });

  // 用来生成可读时间
  /**
   * @param {object} options.hash
   * @param {boolean} options.hash.php
   */
  h.registerHelper('moment', function (value, options) {
    value = value ? moment(options.hash.php ? value * 1000 : value).calendar() : '';
    return /invalid/i.test(value) ? '' : value;
  });
  /**
   * @param {object} options.hash
   * @param {boolean} options.hash.php
   */
  h.registerHelper('from-now', function (value, options) {
    return value ? moment(options.hash.php ? value * 1000 : value).fromNow() : '';
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
;
(function ($) {
  $.fn.spinner = function (roll) {
    roll = roll === undefined ? true : roll;
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
}(jQuery));;
(function (m) {
  var DATE = m.DATE_FORMAT = 'YYYY-MM-DD' // 通用日期格式
    , TIME = m.TIME_FORMAT = 'HH:mm:ss'; // 通用时间格式
  m.DATETIME_FORMAT = m.defaultFormat = DATE + ' ' + TIME; // 通用格式

  /**
   * 生成常用的日期范围,通常是本月
   *
   * @param {string|number} start 开始日期
   * @param {string|number} end 结束日期
   * @param {boolean} [withToday] 是否包含今天
   * @returns {{start: (string), end: (string)}}
   */
  m.createRange = function (start, end, withToday) {
    start = start || moment().startOf('month').format(DATE);
    if (!end) {
      var today = (new Date()).getDate();
      end = withToday || today === 1 ? 0 : -1;
      end = moment().add(end, 'days').format(DATE);
    }
    return {
      start: start,
      end: end
    }
  };

  /**
   * 昨天,今天,明天
   * 默认今天
   * @param {string|number} date
   */
  m.createNearDates = function (date) {
    var current = date ? moment(date) : moment().add(-1, 'days')
      , today = moment().add(-1, 'days')
      , yesterday = current.clone().add(-1, 'days').format(DATE)
      , tomorrow = current.isSame(today) ? null : current.clone().add(1, 'days').format(DATE);
    return {
      date: current.format(DATE),
      yesterday: yesterday,
      tomorrow: tomorrow
    }
  }
}(moment));;
(function () {
  var data = {};

  // 兼容safari
  try {
    localStorage.setItem('tp', 1);
    localStorage.removeItem('tp');
  } catch (e) {
    localStorage.setItem = function (key, value) {
      data[key] = value;
    };
    localStorage.getItem = function (key) {
      return data[key];
    };
  }
}());;
(function (ns) {
  ns.Base = Backbone.Router.extend({
    $ranger: null,
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'dashboard(/:start/:end)': 'showDashboard',
      'my/profile/': 'showMyProfile'
    },
    showDashboard: function (start, end) {
      var range = moment.createRange(start, end)
        , Model = Backbone.Model.extend({
          url: tp.API + 'dashboard/',
          parse: function (response) {
            return response.data;
          }
        })
        , model = new Model(range);
      this.$body.load('page/dashboard' + this.$me.getUserRole() + '.hbs', model, {
        refresh: true,
        data: range,
        loader: tp.view.Dashboard
      });
      this.$body.setFramework('has-date-range dashboard dashboard-' + this.$me.getUserRole(), '欢迎你，' + this.$me.get('fullname'));
      this.$ranger.use(model);
      model.once('sync', this.$body.setLatestStat, this.$body);
    },
    showMyProfile: function () {
      this.$body.load('page/cp/profile.hbs', this.$me, {
        data: {
          full: true
        },
        refresh: true
      });
      this.$body.setFramework('me profile', '我的账户');
    },
    showUserPage: function (page) {
      if (page === 'logout') {
        return this.$me.destroy({
          success: function (model) {
            model.clear();
            location.hash = '#/user/login';
          }
        });
      }
      if (page === 'login' && this.$me.id) {
        this.navigate(tp.startPage || '#/dashboard');
        return;
      }
      tp.config.login.api = this.$me.url;
      this.$body.load(tp.path + 'page/' + page + '.hbs', tp.config.login, {
        isFull: true
      });
      this.$body.setFramework('login', '登录');
    }
  });
}(Nervenet.createNameSpace('tp.router')));;
(function (ns) {
  var defaults = {
    dataType: 'json',
    type: 'post',
    cache: false,
    xhrFields: {
      withCredentials: true
    }
  };
  var manager = {
    $body: null,
    $me: null,
    call: function (url, data, options) {
      options = _.defaults(options, {
        url: url,
        data: data
      }, defaults);
      var self = this
        , error = options.error || this.onError
        , success = options.success || this.onSuccess;
      options.success = function (response) {
        if (response.code === 0) {
          self.postHandle(response);
          success.call(options.context, response);
          self.trigger('complete:call', response);
        } else {
          error(response);
        }
      };
      options.error = function (xhr, status, err) {
        error.call(options.context, xhr, status, err);
      };
      return $.ajax(options);
    },
    fetch: function (url, handler, context) {
      return $.get(url, function (response) {
        handler.call(context, response);
      });
    },
    get: function (url, data, options) {
      options.method = 'get';
      this.call(url, data, options);
    },
    postHandle: function (response) {
      // 以后可以扩展成循环，现在先逐个添加好了
      if ('me' in response) {
        this.$me.set(response.me);
      }
    },
    onError: function (xhr, status, error) {
      console.log(xhr, status, error);
      if (status === 401) {
        this.$body.load('page/error.html');
      }
    },
    onProgress: function (loaded, total) {
      console.log(loaded / total);
    },
    onSuccess: function (response) {
      console.log('success', response);
    }
  };
  manager = _.extend(manager, Backbone.Events);
  ns.Manager = manager;
}(Nervenet.createNameSpace('tp.service')));

;
(function (ns) {var popup
    , editor;

  var Klass = Backbone.View.extend({
    $context: null,
    events: {
      'click .popup': 'popupButton_clickHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('#popup').remove().html());
      this.editor = Handlebars.compile(this.$('#editor-popup').remove().html());
    },
    postConstruct: function () {
      if (popup) {
        this.$context.inject(popup);
      }
    },
    popup: function (options) {
      var popup = $(this.template(options))
        , klass = Nervenet.parseNamespace(options.popup) || ns.Base;
      this.$el.append(popup);
      popup = this.$context.createInstance(klass, _.extend({
        el: popup
      }, options));
      return popup;
    },
    popupEditor: function (options) {
      var editor = options.el = $(this.editor(options));
      this.$el.append(editor);
      editor = EditorFactory.createEditor(this.$context, options);
      return editor;
    },
    popupButton_clickHandler: function (event) {
      var target = event.currentTarget
        , options = $(target).data();
      if (options.collectionId) {
        var collection = tp.model.ListCollection.getInstance(options);
        options.model = collection.get(options.id);
      }
      if (target.tagName.toLowerCase() === 'a') {
        options.content = target.href;
        options.isRemote = true;
      }
      if ('model' in options) {
        options.model = new tp.model.Model();
        options.model.urlRoot = tp.API + options.url;
        options.autoFetch = true;
      }
      options.title = options.title || target.title;
      this.popup(options);
      event.preventDefault();
    }
  });

  var EditorFactory = {
    createEditor: function (context, options) {
      var popup;
      switch (options.type) {
        case 'file':
          popup = context.createInstance(ns.FileEditor, options);
          break;

        case 'number':
        case 'range':
          popup = context.createInstance(ns.NumberEditor, options);
          break;

        case 'search':
          popup = context.createInstance(ns.SearchEditor, options);
          break;

        case 'select':
          popup = context.createInstance(ns.SelectEditor, options);
          break;

        case 'tags':
          popup = context.createInstance(ns.TagsEditor, options);
          break;

        case 'status':
          popup = context.createInstance(ns.SwitchEditor, options);
          break;

        case 'checkbox':
          popup = context.createInstance(ns.CheckboxEditor, options);
          break;

        case 'date':
        case 'time':
        case 'datetime':
          popup = context.createInstance(ns.DateTimeEditor, options);
          break;

        default:
          popup = context.createInstance(ns.Editor, options);
          break;
      }
      return popup;
    }
  };

  var manager = ns.Manager = new Klass({
    el: 'body'
  });
}(Nervenet.createNameSpace('tp.popup')));
;
(function (ns) {
  ns.decodeURLParam = function (str) {
    if (!str) {
      return {};
    }
    var params = str.split('&')
      , result = {};
    for (var i = 0, len = params.length; i < len; i++) {
      var arr = params[i].split('=');
      result[arr[0]] = decodeURIComponent(arr[1]);
    }
    return result;
  };
  ns.convertCurrency = function (currencyDigits) {
    var MAXIMUM_NUMBER = 99999999999.99;
    var CN_ZERO = '零';
    var CN_ONE = '壹';
    var CN_TWO = '贰';
    var CN_THREE = '叁';
    var CN_FOUR = '肆';
    var CN_FIVE = '伍';
    var CN_SIX = '陆';
    var CN_SEVEN = '柒';
    var CN_EIGHT = '捌';
    var CN_NINE = '玖';
    var CN_TEN = '拾';
    var CN_HUNDRED = '佰';
    var CN_THOUSAND = '仟';
    var CN_TEN_THOUSAND = '万';
    var CN_HUNDRED_MILLION = '亿';
    var CN_DOLLAR = '元';
    var CN_TEN_CENT = '角';
    var CN_CENT = '分';
    var CN_INTEGER = '整';

    var integral;
    var decimal;
    var outputCharacters;
    var parts;
    var digits, radices, bigRadices, decimals;
    var zeroCount;
    var i, p, d;
    var quotient, modulus;

    currencyDigits = currencyDigits.toString();
    if (currencyDigits == '') {
      alert('Empty input!');
      return '';
    }
    if (currencyDigits.match(/[^,.\d]/) != null) {
      alert('Invalid characters in the input string!');
      return '';
    }
    if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
      alert('Illegal format of digit number!');
      return '';
    }

    currencyDigits = currencyDigits.replace(/,/g, "");
    currencyDigits = currencyDigits.replace(/^0+/, "");
    if (Number(currencyDigits) > MAXIMUM_NUMBER) {
      alert('Too large a number to convert!');
      return '';
    }

    parts = currencyDigits.split('.');
    if (parts.length > 1) {
      integral = parts[0];
      decimal = parts[1];

      decimal = decimal.substr(0, 2);
    } else {
      integral = parts[0];
      decimal = '';
    }

    digits = [CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE];
    radices = ['', CN_TEN, CN_HUNDRED, CN_THOUSAND];
    bigRadices = ['', CN_TEN_THOUSAND, CN_HUNDRED_MILLION];
    decimals = [CN_TEN_CENT, CN_CENT];

    outputCharacters = '';

    if (Number(integral) > 0) {
      zeroCount = 0;
      for (i = 0; i < integral.length; i++) {
        p = integral.length - i - 1;
        d = integral.substr(i, 1);
        quotient = p / 4;
        modulus = p % 4;
        if (d == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0)
          {
            outputCharacters += digits[0];
          }
          zeroCount = 0;
          outputCharacters += digits[Number(d)] + radices[modulus];
        }
        if (modulus == 0 && zeroCount < 4) {
          outputCharacters += bigRadices[quotient];
        }
      }
      outputCharacters += CN_DOLLAR;
    }

    if (decimal != '') {
      for (i = 0; i < decimal.length; i++) {
        d = decimal.substr(i, 1);
        if (d != '0') {
          outputCharacters += digits[Number(d)] + decimals[i];
        }
      }
    }

    if (outputCharacters == '') {
      outputCharacters = CN_ZERO + CN_DOLLAR;
    }
    if (decimal == '') {
      outputCharacters += CN_INTEGER;
    }
    return outputCharacters;
  }
}(Nervenet.createNameSpace('tp.utils')));;
(function (ns) {
  ns.Error = {
    getAjaxMessage: function (xhr, status, error) {
      // 服务器错误
      if (xhr.statusCode().status === '500') {
        return {
          message: '服务器错误，请告知管理员',
          icon: 'close'
        }
      }
      if (xhr.status === 0) {
        return {
          message: '连接超时，请检查您的网络。',
          icon: 'close'
        }
      }
      var message = (xhr.responseJSON ? xhr.responseJSON.msg : null) || error || ''
        , icon = 'frown-o';
      if (status === 'error' && !xhr.responseText) { // 没有返回值，应该是某种服务器出错
        message = '请求服务器失败，请重试。若连续失败，请联系管理员。';
        icon = 'user-md';
      }
      return {
        message: message,
        icon: icon
      }
    }
  };
}(Nervenet.createNameSpace('tp')));;
(function (ns) {
  /**
   *
   * @param {Backbone.Model} model
   * @param {string} prop
   * @param {object} options
   * @param {string} options.commentName 备注的字段名
   */
  function callPopup(model, prop, options) {
    options.model = model;
    options.prop = prop;
    if (options.commentName) {
      options[options.commentName] = model.get(options.commentName);
    }
    tp.popup.Manager.popupEditor(options);
  }

  ns.editModelCommand = function (model, prop, options) {
    options = _.extend({}, options);
    options.value = model.get(prop);
    callPopup(model, prop, options);
  }
}(Nervenet.createNameSpace('tp.controller')));;
(function (ns) {
  ns.addModelCommand = function (options, context) {
    var collection = tp.model.ListCollection.getInstance(options)
      , model = new collection.model(null, options);
    options.isRemote = true;
    options.content = 'page/' + options.template;
    model.options = collection.options;
    model.urlRoot = collection.url;
    model.key = collection.key;
    if (options.name) {
      context.mapValue(options.name, model, true);
    }
    options.model = model;
    var popup = tp.popup.Manager.popup(options);
    popup.on('success', function () {
      collection.add(model, {
        immediately: true,
        prepend: true,
        merge: true
      });
      if (options.name) {
        context.removeValue(options.name);
      }
    });
  };
}(Nervenet.createNameSpace('tp.controller')));;
(function (ns) {
  ns.Model = Backbone.Model.extend({
    parse: function (response) {
      var key = this.key || (this.collection ? this.collection.key : 'data');
      if ('code' in response && 'msg' in response && key in response) {
        return response[key];
      }
      return response;
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var previous = this.previousAttributes();
      if (!_.isEmpty(previous)) {
        json.previous = previous;
      }
      return _.extend(json, this.options, this.collection ? this.collection.options : null);
    }
  })
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'auth/',
    defaults: {
      face: 'img/logo.png'
    },
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    fetch: function (options) {
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    /**
     *
     * @param response
     * @param {object} response.me
     * @param {number} response.me.balance
     * @param {number} response.me.amount
     * @returns {object}
     */
    parse: function (response) {
      var me = response.me;
      if ('balance' in me) {
        me.amount = me.balance + me.lock;
        me.money_percent = Math.round(me.balance / me.amount * 10000) / 100;
      }
      return me;
    },
    getUserRole: function () {
      return this.get('role');
    },
    id_changeHandler: function (model, id) {
      if (id) {
        this.$body.start(true);
        tp.notification.Manager.start();

        // 延迟10ms，避免事件顺序导致问题
        setTimeout(function () {
          var route;
          if (!Backbone.History.started) {
            route = Backbone.history.start({
              root: tp.BASE
            });
          }
          if (!route || /^#\/user\/\w+$/.test(location.hash)) {
            var from = localStorage.getItem(tp.PROJECT + '-from');
            from = /^#\/user\/log(in|out)$/.test(from) ? '' : from;
            location.hash = from || tp.startPage || '#/dashboard';
          }
        }, 10);
      } else {
        if (this.$body.isStart && location.hash !== '#/user/logout') {
          var login = tp.config.login;
          login.welcome = '登录已失效，请重新登录';
          login.api = this.url;
          tp.popup.Manager.popup(_.extend({
            title: '登录',
            content: 'page/login.hbs',
            confirm: '登录',
            cancel: '退出',
            isRemote: true
          }, login));
        } else {
          localStorage.setItem(tp.PROJECT + '-from', location.hash);
          location.hash = '#/user/login';
        }
      }
    },
    onError: function () {
      this.$body.start();
      localStorage.setItem(tp.PROJECT + '-from', location.hash);
      location.hash = '#/user/login';
      Backbone.history.start({
        root: tp.BASE
      });
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.ListCollection = Backbone.Collection.extend({
    cache: null,
    model: ns.Model,
    total: 0,
    pagesize: 10,
    isLoading: false,
    initialize: function(models, options) {
      this.key = options.key || 'data';
      this.save = tp.PROJECT + location.hash + '-pagesize';
      Backbone.Collection.prototype.initialize.call(this, models, options);
      if (_.isString(this.model)) { // 需要加载外部model类
        var klass = Nervenet.parseNamespace(this.model);
        if (klass) {
          this.model = klass;
        } else {
          var self = this;
          $.getScript(tp.component.Manager.getPath(this.model), function () {
            self.model = Nervenet.parseNamespace(self.model);
            if (self.cache) {
              if (self.cache.options.reset) {
                self.reset(self.cache.response, self.cache.options);
              } else {
                self.set(this.parse(self.cache.response), self.cache.options);
                self.trigger('sync');
              }
              this.cache = null;
            }
          });
        }
      }
      if (!options) {
        return;
      }
      if (options.url) {
        this.url = options.url;
      }
      var size = localStorage.getItem(this.save);
      this.pagesize = size || options.pagesize || this.pagesize;
    },
    fetch: function (options) {
      if (this.isLoading) {
        return;
      }
      options = options || {};
      if (options.data) {
        options.data.pagesize = this.pagesize;
      } else {
        options.data = {pagesize: this.pagesize};
      }
      Backbone.Collection.prototype.fetch.call(this, options);
      this.isLoading = true;
    },
    parse: function (response, options) {
      this.isLoading = false;
      if (_.isString(this.model)) { // model的类还没加载进来
        this.cache = {
          response: response,
          options: options
        };
        return null;
      }
      this.total = _.isArray(response) ? response.length : response.total;
      if (response.options) {
        this.options = response.options;
      }
      for (var key in _.omit(response, 'total', 'list', 'options', 'code', 'msg')) {
        if (response.hasOwnProperty(key) && (_.isArray(response[key]) || _.isObject(response[key]))) {
          this.trigger('data:' + key, response[key], this);
        }
      }
      return _.isArray(response) ? response : response.list;
    },
    getAmount: function (omits) {
      if (_.isString(omits)) {
        omits = omits.split(' ');
      }
      return this.reduce(function (amount, model) {
        var data = model.omit(omits);
        for ( var prop in data) {
          if (isNaN(data[prop])) {
            continue;
          }
          amount[prop] = (amount[prop] ? amount[prop] : 0) + Number(data[prop]);
        }
        return amount;
      }, {amount: true});
    },
    setPagesize: function (size) {
      this.pagesize = size;
      localStorage.setItem(this.save, size);
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  var proxy = ns.ProxyCollection = function (options) {
    var klass = options.collectionType
      , self = this;
    $.getScript(tp.component.Manager.getPath(klass), function () {
      klass = Nervenet.parseNamespace(klass);
      var real = self.real = new klass(this.models, options);
      self.delegateEvents(real);
      if (self.fetchOptions) {
        real.fetch(self.fetchOptions);
      }
    });
  };

  proxy.prototype = {
    events: {},
    fetchOptions: null,
    models: null,
    real: null,
    delegateEvents: function (real) {
      _.each(this.events, function (handler, event) {
        real.on(event, handler.method, handler.context);
      }, this);
      real.on('sync', this.onSync, this);
    },
    fetch: function (options) {
      if (this.real) {
        this.real.fetch(options);
      }
      this.fetchOptions = options;
    },
    on: function (type, method, context) {
      if (this.real) {
        return this.real.on(type, method, context);
      }
      this.events[type] = {
        method: method,
        context: context
      }
    },
    set: function (models, options) {
      if (this.real) {
        this.real.set(models, options);
      }
      this.models = models;
    },
    onSync: function () {
      this.length = this.real.length;
    }
  };

  _.each(['create', 'each', 'find', 'get', 'map', 'off', 'remove', 'reset', 'toJSON'], function (method) {
    proxy.prototype[method] = function () {
      return Collection.prototype[method].apply(this.real, arguments);
    };
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  var collections = {};

  var manager = ns.ListManager = {
    /**
     * 取得一个ListCollection实例
     * @param {{collectionType: string}} options
     * @returns Backbone.Collection | ns.ProxyCollection
     */
    getInstance: function (options) {
      var collection;
      if (options && options.collectionId && options.collectionId in collections) {
        collection = collections[options.collectionId];
        if (!collection.url && options.url) {
          collection.url = options.url;
        }
        return collection;
      }

      var params = _.extend({}, options);
      if (!params.model) {
        var init = _.chain(params)
          .pick('idAttribute', 'defaults')
          .mapObject(function (value, key) {
            if (key === 'defaults' && !_.isObject(value)) {
              return tp.utils.decodeURLParam(value);
            }
            return value;
          })
          .value();
        if (!_.isEmpty(init)) {
          params.model = ns.Model.extend(init);
        }
      }
      if (params.collectionType) {
        var klass = Nervenet.parseNamespace(params.collectionType);
        return klass ? new klass(null, params) : new ns.ProxyCollection(params);
      } else {
        collection = new ns.ListCollection(null, params);
      }
      if (params.collectionId) {
        collections[params.collectionId] = collection;
      }
      return collection;
    },
    destroyInstance: function (id) {
      if (id in collections) {
        delete collections[id];
      }
    }
  };

  // 为了兼容以前的写法
  _.extend(ns.ListCollection, manager);
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  var TIMEOUT = 60000
    , autoNext = false // 60s取一次
    , key = tp.PROJECT + '-notice-cache'
    , cache = null;

  ns.Notice = Backbone.Collection.extend({
    latest: 0,
    url: tp.API + 'notice/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
      this.fetch = _.bind(this.fetch, this);
    },
    fetch: function (options) {
      autoNext = true;
      var store = localStorage.getItem(key);
      if (store) {
        var noticeList = JSON.parse(store);
        if (Date.now() - noticeList.time < TIMEOUT) {
          this.set(noticeList.notice);
          this.trigger('sync');
          return;
        }

        noticeList.time = Date.now();
        localStorage.setItem(key, JSON.stringify(noticeList));
      }
      options = _.extend({
        data: {
          latest: this.latest
        },
        remove: false
      }, options);
      Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function (response) {
      this.latest = _.reduce(response.list, function (max, item) {
        return item.id > max ? item.id : max;
      }, this.latest);
      cache = response.list;
      return response.list;
    },
    stop: function () {
      autoNext = false;
      clearTimeout(TIMEOUT);
    },
    syncHandler: function (collection) {
      if (autoNext) {
        setTimeout(this.fetch, TIMEOUT);
      }
      if (collection) {
        localStorage.setItem(key, JSON.stringify({
          notice: cache,
          time: Date.now()
        }));
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.TableMemento = Backbone.Model.extend({
    RESERVED: ['keyword', 'order', 'seq', 'start', 'end', 'dateFormat'],
    tags: null,
    waiting: false,
    initialize: function () {
      this.key = tp.PROJECT + location.hash;
      var storage = localStorage.getItem(this.key);
      if (storage) {
        storage = _.defaults(this.toJSON(), JSON.parse(storage)); // 需要以当前的参数为主,存储的次之
        this.set(storage, {silent: true});
      }
      this.on('change', this.changeHandler, this);
    },
    _validate: function (attr, options) {
      if (!('validate' in options)) {
        options.validate = true;
      }
      return Backbone.Model.prototype._validate.call(this, attr, options);
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      return _.omit(json, function (value, key) {
        return /_label$/.test(key);
      });
    },
    validate: function (attr, options) {
      if (this.waiting || ('ignore' in options && !options.ignore)) {
        return '表格正在更新数据，请稍候。';
      }
    },
    getTags: function () {
      var tags = this.tags ? this.pick(this.tags) : this.omit(this.RESERVED);
      _.each(tags, function (value, key) {
        tags[key + '_label'] = this.get(key + '_label');
      }, this);
      return tags;
    },
    changeHandler: function () {
      localStorage.setItem(this.key, JSON.stringify(this.omit('page')));
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.DataSyncView = Backbone.View.extend({
    initialize: function () {
      this.submit = this.$('button.btn-primary');
    },
    displayProcessing: function () {
      this.$el.addClass('processing');
      this.submit.spinner();
    },
    displayResult: function (isSuccess, msg, icon) {
      msg = (icon ? '<i class="fa fa-' + icon + '"></i> ' : '') + msg;
      this.submit.spinner(false);
      this.$el.removeClass('processing');
      this.$('.alert-msg')
        .hide()
        .toggleClass('alert-danger', !isSuccess)
        .toggleClass('alert-success', isSuccess)
        .html(msg + ' (' + moment().format('HH:mm:ss') + ')')
        .slideDown();
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  ns.Panel = tp.view.DataSyncView.extend({
    fragment: '',
    events: {
      'click input': 'input_clickHandler',
      'click .mark-all-button': 'markAllButton_clickHandler',
      'change [name=check]': 'check_changeHandler',
      'animationend': 'animationEndHandler',
      'webkitAnimationEnd': 'animationEndHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.header = this.$('.dropdown-header');
      this.button = this.$('.dropdown-toggle');
      this.submit = this.$('.mark-all-button');

      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
    },
    refreshNumber: function () {
      var total = this.$('input:not(:checked)').length;
      if (this.label) {
        this.label.remove();
      }
      if (total !== 0) {
        this.label = $('<span>' + (total > 10 ? '10+' : total) + '</span>').appendTo(this.button);
        this.button.find('i').addClass('animated swing');
      }
    },
    animationEndHandler: function (event) {
      $(event.target).removeClass('animated swing');
    },
    check_changeHandler: function (event) {
      var id = event.target.value;
      this.collection.get(id).destroy();
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_removeHandler: function (model) {
      var item = this.$('#msg-' + model.id);
      this.refreshNumber();
      setTimeout(function () {
        item.fadeOut(function () {
          $(this).remove();
        });
      }, 3000);
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        this.header.after(this.fragment);
        this.refreshNumber();
        this.fragment = '';
      }
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    markAll_errorHandler: function (xhr, status, error) {
      this.displayResult(false, status, 'times');
    },
    markAll_successHandler: function (response) {
      this.$('.alarm').remove();
      this.label.remove();
      this.displayResult(true, response.msg, 'check');
      this.$('.alert').delay(3000).slideUp();
    },
    markAllButton_clickHandler: function (event) {
      var ids = [];
      this.collection.each(function (model) {
        ids.push(model.id);
      });
      this.collection.sync('delete', this, {
        url: this.collection.url + ids.join(','),
        success: this.markAll_successHandler,
        error: this.markAll_errorHandler,
        context: this
      });
      this.displayProcessing();
      event.stopPropagation();
    }
  });
}(Nervenet.createNameSpace('tp.notification')));;
(function (ns) {
  ns.Growl = Backbone.View.extend({
    count: 0,
    fragment: [],
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());

      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    collection_addHandler: function (model) {
      if (this.count < 3) {
        this.fragment.push(this.template(model.toJSON()));
      }
      this.count++;
    },
    collection_syncHandler: function () {
      if (this.fragment.length) {
        if (this.count > 3) {
          this.fragment[2] = this.template({number: this.count - 2});
        }
        this.$el.html(this.fragment.join(''));
        this.fragment = [];
      }
    }
  });
}(Nervenet.createNameSpace('tp.notification')));;
(function (ns) {
  var hidden
    , notification = 'Notification' in window ? Notification : new MockNotification();
  if ('hidden' in document) {
    hidden = 'hidden';
  } else if ('webkitHidden' in document) {
    hidden = 'webkitHidden';
  } else if ('mozHidden' in document) {
    hidden = 'mozHidden';
  } else if ('msHidden' in document) {
    hidden = 'msHidden';
  }

  function MockNotification() {
    console.log('no desktop notification');

    this.permission = '';
    this.requestPermission = function () {};
  }

  var Manager = Backbone.View.extend({
    count: 0,
    initialize: function () {
      if (notification.permission !== 'granted') {
        try {
          notification.requestPermission();
        } catch (e) {
          console.log('no browser notice');
        }
      }
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    createDesktopNotice: function () {
      if (document[hidden] && notification.permission === 'granted') {
        var notice = new notification('点乐自助平台通知', {
          icon: 'img/fav.png',
          body: '收到' + this.count + '条通知，请及时处理哟。'
        });
        notice.onclick = function () {
          window.focus();
          this.onclick = null;
        }
      }
    },
    start: function () {
      if (tp.NOTICE_KEY) {
        this.collection.fetch();
      }
    },
    stop: function () {
      this.collection.stop();
    },
    collection_addHandler: function () {
      this.count++;
    },
    collection_syncHandler: function () {
      if (this.count > 0) {
        this.createDesktopNotice(this.count);
        this.count = 0;
      }
    }
  });

  var collection = new tp.model.Notice();
  new ns.Panel({
    el: '.system-notice',
    collection: collection
  });
  new ns.Growl({
    el: '#growl',
    collection: collection
  });

  ns.Manager = new Manager({
    collection: collection
  });
}(Nervenet.createNameSpace('tp.notification')));;
(function (ns) {
  var history = 'history-recorder';

  function showErrorPopup(target, msgs) {
    if (msgs.length === 0) {
      return;
    }
    msgs = _.isArray(msgs) ? msgs : [msgs];
    var html = msgs.join('<br />');
    $(target)
      .popover({
        trigger: 'manual',
        title: '表单填写有误',
        content: html,
        html: true
      })
      .popover('show')
      .one('focus', function () {
        $(this)
          .off('.popover')
          .removeData('popover')
          .siblings('.popover').remove()
          .end().closest('.form-group').removeClass('error');
      })
      .closest('.form-group').addClass('error');
  }

  var smart = ns.SmartForm = tp.view.DataSyncView.extend({
    $context: null,
    $router: null,
    uploaders: null,
    events: {
      "blur input,textarea": "input_blurHandler",
      'focus input': 'input_focusHandler',
      'submit': 'submitHandler',
      'data': 'dataHandler',
      'click .collapsible legend': 'legend_clickHandler'
    },
    initialize: function () {
      this.submit = this.getSubmit();
      if (!this.model && this.$el.data('target')) {
        this.model = this.$context.getValue(this.$el.data('target'));
      }
      if (this.model instanceof Backbone.Model) {
        this.model.on('invalid', this.model_invalidHandler, this);
      }
      // 表单中有{{API}}
      var action = decodeURIComponent(this.$el.attr('action'));
      if (action.indexOf('{{API}}') != -1) {
        this.el.action = action.replace('{{API}}', tp.API);
      }
      this.initUploader();
    },
    remove: function () {
      if (this.model) {
        this.model.off(null, null, this);
      }
      _.each(this.uploaders, function (uploader) {
        uploader.off('data');
        if (uploader.remove) {
          uploader.remove();
        }
      });
      this.uploaders = null;
      Backbone.View.prototype.remove.call(this);
    },
    validate: function () {
      // 验证表单项是否合乎要求
      var elements = this.el.elements;
      if (this.$el.hasClass('uploading')) {
        alert('上传文件中，请稍候');
        return false;
      }
      // 验证两次输入的密码是否一致
      if ('newpassword' in elements && elements.newpassword.value !== elements.repassword.value) {
        showErrorPopup(elements.repassword, '两次密码不一致哟，麻烦检查下吧');
        return false;
      }
      //验证password是否有6位数
      if ('password' in elements && !/^[0-9a-zA-Z$!^#_@%&*.]{6,32}$/.test(elements.password.value)) {
        showErrorPopup(elements.password, '密码应为6~16个字符，请重新填写');
        return false;
      }

      return true;
    },
    checkInput: function (input) {
      // 验证必填项
      if (input.prop('required') && input.val() === '') {
        return '此项为必填项，您好像漏掉了哟';
      }
      // 验证内容
      var pattern = input.attr('pattern');
      if (pattern && input.val() !== '' && !new RegExp(pattern).test(input.val())) {
        return '填写格式有误，麻烦您检查并重新填写';
      }
      // 验证数值
      if (/number/i.test(input.attr('type')) && (input.attr('min') !== undefined || input.attr('max') !== undefined)) {
        var value = Number(input.val());
        if (isNaN(value)) {
          return '此项只能输入数字';
        }
        if (input.attr('min') !== undefined && value < input.attr('min')
          || input.attr('max') !== undefined && value > input.attr('max')) {
          return '数值超出规定范围';
        }
      }
      // 验证密码
      if (input.attr('type') === 'password' && !/^[0-9a-zA-Z$!^#_@%&*.]{6,32}$/.test(input.val())) {
        return '密码应为6~16个字符，包含字母、数字、特殊符号等';
      }

      return '';
    },
    getSubmit: function () {
      var selector = 'button:not([type=button]), input[type=submit]'
        , submit = this.$(selector);
      if (submit.length === 0) {
        var id = this.$el.attr('id');
        submit = $(selector).filter('[form=' + id + ']');
      }
      return submit;
    },
    getValue: function (element) {
      if (element.value) {
        return element.value;
      }
      var value = _.chain(element)
        .filter(function (item) { return item.checked; })
        .map(function (item) { return item.value; })
        .value();

      return value.join(',');
    },
    initUploader: function () {
      var self = this
        , collection = [];
      this.$('.uploader').each(function () {
        var options = $(this).data();
        var uploader = new meathill.SimpleUploader(this, options);
        uploader.on('start', self.uploader_startHandler, self);
        uploader.on('data', self.uploader_dataHandler, self);
        collection.push(uploader);
      });
      this.$('.fetcher').each(function () {
        var fetcher = new tp.component.FileFetcher({
          el: this,
          model: self.model
        });
        fetcher.on('start', self.uploader_startHandler, self);
        fetcher.on('data', self.uploader_dataHandler, self);
        collection.push(fetcher);
      });
      this.uploaders = collection;
    },
    useData: function (data) {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) {
          return;
        }
        if ('id' in data) {
          _.each(this.uploaders, function (uploader) {
            if (!(uploader instanceof meathill.SimpleUploader)) {
              return;
            }
            uploader.options.data = uploader.options.data || {};
            uploader.options.data.id = uploader.options.data.id || data.id;
          });
        }
        var value = data[key];
        if (_.isArray(value)) {
          this.$('[name="' + key +'[]"]').each(function () {
            this.checked = value.indexOf(this.value) !== -1;
          });
          continue;
        }
        this.$('[data-name=' + key + ']:not([type=radio])').val(value);
        var items = this.$('[name= ' + key + ']:not([type=radio])').val(value);
        try {
          items.length > 0 || this.$('[name=' + key + '][value=' + value + '], [name="' + key + '[]"][value=' + value + ']').prop('checked', true);
        } catch (e) {
          console.log('no such item');
        }
        if (items.attr('type') === 'hidden') {
          items.trigger('change');
        }
      }
    },
    input_blurHandler: function (event) {
      var target = $(event.currentTarget)
        , msg = this.checkInput(target);
      if (msg) {
        this.$('input').tooltip('destroy');
        target.tooltip({
          title: msg,
          placement: 'bottom',
          trigger: 'manual'
        }).tooltip('show');
      }
    },
    input_focusHandler: function (event) {
      $(event.currentTarget).tooltip('destroy');
    },
    legend_clickHandler: function (event) {
      $(event.currentTarget).toggleClass('collapsed');
    },
    model_invalidHandler: function (model, error) {
      this.displayResult(false, error, 'times');
      this.trigger('error', null, 1, {message: error});
    },
    submit_successHandler: function(response) {
      this.displayResult(true, response.msg, 'smile-o');
      this.$el.trigger('success', response);
      this.trigger('success', response);
    },
    submit_errorHandler: function(xhr, status, error) {
      error = tp.Error.getAjaxMessage(xhr, status, error);
      this.displayResult(false, error.message, error.icon);
      this.trigger('error', xhr, status, error);
    },
    uploader_dataHandler: function (data) {
      this.$el.removeClass('uploading');
      this.useData(data);
    },
    uploader_startHandler: function () {
      this.$el.addClass('uploading');
    },
    dataHandler: function (event, data) {
      this.useData(data);
    },
    submitHandler: function(event) {
      // 隐藏的表单不提交
      if (this.$el.is(':hidden')) {
        return;
      }

      var form = this.el,
          action = form.action;
      // 不需要提交的表单，或正在提交的表单
      if (this.$el.hasClass('fake') || this.$el.hasClass('loading')) {
        event.preventDefault();
        return false;
      }

      // 跳转类型
      if (action.indexOf('#/') !== -1) {
        action = action.substr(action.indexOf('#'));
        var getValue = this.getValue;
        action = action.replace(/\/:([\w\[\]]+)/g, function(str, key) {
          return '/' + getValue(form.elements[key]);
        });
        location.href = action;
        this.$el.trigger('success');
        this.trigger('success');
        event.preventDefault();
        return false;
      }

      // 防止多次提交
      this.displayProcessing();

      // ajax提交
      var isPass = this.validate();
      if (this.$el.hasClass('ajax') && isPass) {
        var data = this.$el.serialize();
        tp.service.Manager.call(action, data, {
          success: this.submit_successHandler,
          error: this.submit_errorHandler,
          context: this,
          method: this.$el.attr('method')
        });
        return false;
      }

      // 编辑model
      if (this.$el.hasClass('model-editor') && isPass) {
        var attr = {}
          , self = this;
        _.each(this.$el.serializeArray(), function (element) {
          var key = element.name.replace('[]', '')
            , value = element.value === '' || isNaN(element.value) || /^0\d+$/.test(element.value) || /^\d{16,}$/.test(element.value) ? element.value : Number(element.value);
          if (attr[key] !== undefined) {
            if (!_.isArray(attr[key])) {
              attr[key] = [attr[key]];
            }
            attr[key].push(value);
          } else {
            attr[key] = value;
          }
        }, this);
        this.$('.switch').each(function () {
          var isNumber = !isNaN(parseInt(this.value))
            , value = isNumber ? Number(this.value) : this.value
            , close = $(this).data('close');
          value = this.checked ? value : close;
          attr[this.name] = value;
        });

        // 有url就保存，不然就直接记录值
        try {
          var url = _.result(this.model, 'url');
          this.model.save(attr, {
            patch: true,
            wait: true,
            success: function (model, response) {
              self.submit_successHandler(response);
            },
            error: function (model, response) {
              self.submit_errorHandler(response);
            }
          });
        } catch (e) {
          this.model.set(attr);
        }
        return false;
      }

      return isPass;
    }
  });

  smart.recordHistory = function (form, value) {
    var iframe = document.getElementById(history).contentWindow.document;
    if (form.tagName && form.tagName.toLowerCase() === 'form') {
      form = form.cloneNode(true);
    } else {
      var input = document.createElement('input');
      input.name = form;
      input.value = value;
      form = document.createElement('form');
      form.action = 'about:blank';
      form.appendChild(input);
    }
    iframe.body.appendChild(form);
    form.onsubmit = null;
    form.submit();
    iframe.body.innerHTML = '';
  };

  // 全局表单元素增加事件
  $(document)
    .on('change', '[type=range]', function (event) {
      $(event.target).next().html(event.target.value);
    })
    .on('change dp.change', '.auto-submit', function (event) {
      if (event.type === 'dp') {
        var target = $(event.target);
        if (!target.hasClass('ready')) {
          target.addClass('ready');
          return;
        }
      }
      $(event.target).closest('form').submit();
    })
    .on('change', '.check-all', function (event) {
      var button = event.target
        , name = button.value
        , prop = button.checked;
      $('[name="' + name + '"]').prop('checked', prop);
    })
    .on('click change', '[data-toggle-class]', function (event) {
      var button = $(event.currentTarget)
        , data = button.data()
        , target = data.target
        , className = data.toggleClass
        , group = data.group
        , join = Array.prototype.join
        , classes = join.call($('[data-toggle-class][data-group="' + group + '"]').map(function () {
          return this.dataset.toggleClass;
        }), ' ');
      $(target).removeClass(classes).addClass(className);
    });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.BaseList = Backbone.View.extend({
    autoFetch: true,
    fragment: '',
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ''));
      this.container = options.container ? this.$(options.container) : this.$el;
      this.collection = this.getCollection(options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
      if (options.autoFetch || !('autoFetch' in options) && this.autoFetch) {
        this.refresh(options);
      }
    },
    remove: function () {
      this.collection.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').remove();
      this.container.append(this.fragment);
      this.fragment = '';
      this.$el.removeClass('loading');
    },
    getCollection: function (options) {
      if (this.collection) {
        return this.collection;
      }

      var init = this.$el.data();
      if ('url' in init) {
        init.url = init.url.replace('{{API}}', tp.API);
      }
      options = _.extend(options, init);

      this.params = tp.utils.decodeURLParam(options.params);
      // 起止日期
      if (options.defaults && _.isString(options.defaults)) {
        options.defaults = tp.utils.decodeURLParam(options.defaults);
      }
      if (options.start || options.end) {
        options.defaults = _.extend(options.defaults, _.pick(options, 'start', 'end'));
      }

      return tp.model.ListCollection.getInstance(options);
    },
    refresh: function (options) {
      options = options || {};
      options.data = _.extend(options.data, this.params);
      this.collection.fetch(options);
    },
    collection_addHandler: function (model, collection, options) {
      this.fragment += this.template(model instanceof Backbone.Model ? model.toJSON() : model);
      if (options && options.immediately) {
        var item = $(this.fragment);
        item.attr('id', model.id || model.cid);
        this.container[options.prepend ? 'prepend' : 'append'](item);
        this.fragment = '';
        return item;
      }
    },
    collection_changeHandler: function (model) {
      var html = this.template(model.toJSON());
      $(document.getElementById(model.id || model.cid)).replaceWith(html); // 因为id里可能有.
    },
    collection_removeHandler: function (model, collection, options) {
      var item = $(document.getElementById(model.id || model.cid));
      if (options.fadeOut) {
        item.fadeOut(function () {
          $(this).remove();
        });
      } else {
        item.remove();
      }
    },
    collection_resetHandler: function () {
      this.container.empty();
      this.collection.each(function (model) {
        this.collection_addHandler(model);
      }, this);
      this.render();
    },
    collection_syncHandler: function () {
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.FileFetcher = Backbone.View.extend({
    timeout: 0,
    events: {
      'click .fetch-button': 'fetchButton_clickHandler',
      'input': 'inputHandler'
    },
    initialize: function () {
      this.button = this.$('.fetch-button');
    },
    reset: function () {
      this.button.prop('disabled', false)
        .find('i').removeClass('fa-spin fa-spinner');
      this.$('[name=ad_url]').prop('disabled', false);
    },
    validate: function (value) {
      var reg = /^https?:\/\//;
      return reg.test(value);
    },
    fetchButton_clickHandler: function () {
      var field = this.$('[name=ad_url]')
        , value = field.val();
      if (!value || field.attr('type') === 'hidden') { // 用户上传的文件不抓包
        return;
      }
      if (/itunes\.apple\.com/.test(value)) {
        alert('App Store应用暂时不支持抓取');
        return;
      }
      tp.service.Manager.call(tp.API + 'fetch/', {
        type: 'ad_url',
        id: this.model.id,
        file: value
      }, {
        context: this,
        success: this.fetchFile_successHandler,
        error: this.fetchFile_errorHandler
      });
      this.$('.fetch-button').prop('disabled', true)
        .find('i').addClass('fa-spin fa-spinner');
      this.$('[name=ad_url]').prop('disabled', true);
    },
    fetchFile_successHandler: function (response) {
      alert('服务器抓取文件成功');
      this.trigger('data', response.form);
      this.reset();
    },
    /**
     *
     * @param response object
     * @param response.responseJSON object
     * @param response.msg string
     */
    fetchFile_errorHandler: function (response) {
      if ('responseJSON' in response) {
        response = response.responseJSON;
      }
      console.log(response);
      alert(response.msg || '抓取失败');
      this.reset();
    },
    inputHandler: function (event) {
      event.target.value = event.target.value.replace(/\s/g, '');
      var has_url = this.validate(event.target.value);
      this.button.prop('disabled', !has_url);
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {

  ns.Pager = Backbone.View.extend({
    events: {
      'click a': 'clickHandler'
    },
    initialize: function (options) {
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.pagesize = this.collection.pagesize;
      this.total = Math.ceil(options.length / this.pagesize);
      this.render();
      this.displayPageNum();
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.model = this.collection = null;
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      if (!this.template) {
        return;
      }
      var page = this.model.get('page')
        , arr = []
        , start = page - 5 > 0 ? page - 5 : 0
        , end = start + 10 < this.total ? start + 10 : this.total
        , length = end - start;
      for (var i = 0; i < length; i++) {
        arr[i] = {
          index: i + start,
          label: i + start + 1
        };
      }
      this.$el.html(this.template({
        pages: arr,
        prev: page - 1,
        next: page + 1
      }));
    },
    displayPageNum: function () {
      var page = this.model.get('page') || 0
        , total = this.total;
      this.$('[href="#/to/' + page + '"]').closest('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', page === 0)
          .end().last().toggleClass('disabled', page >= total - 1);
      });
    },
    setTotal: function (total, pagesize) {
      this.pagesize = pagesize || this.pagesize;
      this.total = Math.ceil(total / this.pagesize);
      this.render();
      this.displayPageNum();
    },
    collection_syncHandler: function () {
      this.setTotal(this.collection.total, this.collection.pagesize);
    },
    clickHandler: function (event) {
      var target = $(event.currentTarget)
        , parent = target.parent();
      if (parent.hasClass('disabled') || parent.hasClass('active')) {
        return false;
      }
      var href = target.attr('href')
        , index = Number(href.substr(href.lastIndexOf('/') + 1));
      this.model.set('page', index);
      target.html(tp.component.spinner);
      this.$el.children().addClass('disabled');
      event.preventDefault();
    }
  });

  ns.Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    initialize: function () {
      if (this.model.get('keyword')) {
        this.$el.val(this.model.get('keyword'));
      }
      if (this.el.value) {
        this.model.set('keyword', this.el.value);
      }
      this.model.on('change:keyword', this.model_changeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      this.collection = this.model = null;
      Backbone.View.prototype.remove.call(this);
    },
    collection_syncHandler: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    model_changeHandler: function (model, keyword) {
      this.el.value = keyword || '';
      this.$el.prop('readonly', true);
      this.spinner = this.spinner || $(tp.component.spinner);
      this.spinner.insertAfter(this.$el);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        var no_keyword = !event.target.value;
        this.model.unset('keyword', {silent: !no_keyword}); // 这次搜索之前要先把关键字删掉，保证触发change
        if (!no_keyword) {
          this.model.set({
            keyword: event.target.value,
            page: 0
          });
        }
      }
    }
  });

  ns.Filter = Backbone.View.extend({
    events: {
      'change': 'changeHandler'
    },
    initialize: function () {
      this.model.on('change', this.model_changeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.render();
    },
    render: function () {
      var data = this.model.toJSON();
      for (var prop in data) {
        this.$('[name=' + prop + ']')
          .val(data[prop])
          .data('value', data[prop]);
      }
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.collection = this.model = null;
      Backbone.View.prototype.remove.call(this);
    },
    collection_syncHandler: function () {
      this.$('.fa-spin').remove();
      this.$('select').prop('disabled', false);

      // 用options里的值填充select
      var options = this.collection.options;
      if (!options) {
        return;
      }
      this.$('select').each(function () {
        var self = $(this)
          , name = self.data('options');
        if (!(name in options) || self.hasClass('ready')) {
          return true;
        }
        var template = self.find('script').html()
          , fixed = self.find('.fixed');
        template = Handlebars.compile(template);
        self
          .addClass('ready')
          .html(template(options))
          .prepend(fixed)
          .val(self.data('value'));
      });
    },
    model_changeHandler: function () {
      this.$('select').prop('disabled', true);
    },
    changeHandler: function (event) {
      var target = event.target
        , name = target.name
        , value = target.value;
      if (!name) {
        return;
      }
      if (!value) {
        this.model.unset(name, {reset: true});
      } else {
        this.model.set(name, value, {
          reset: true
        });
      }
      $(target).after(tp.component.spinner);
    }
  });

  ns.FixedHeader = Backbone.View.extend({
    className: 'fixed-table-header',
    tagName: 'div',
    visible: false,
    events: {
      'click .filter,.order': 'button_clickHandler'
    },
    initialize: function (options) {
      this.target = options.target;
      this.target.on('table-rendered', this.render, this);
      this.top = this.target.$el.offset().top;
      this.scrollHandler = _.bind(this.scrollHandler, this);
      $(window).scroll(this.scrollHandler);
      this.$el.appendTo('body');
    },
    remove: function () {
      this.target = null;
      $(window).off('scroll', this.scrollHandler);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      var clone = this.target.$el.clone()
        , ths = clone.find('th');
      clone.find('tbody, tfoot').remove();
      this.target.$('th').each(function (i) {
        ths[i].width = this.offsetWidth;
      });
      this.$el.html(clone);
    },
    button_clickHandler: function (event) {
      var type = event.target.className.indexOf('filter') != -1 ? 'filter' : 'order';
      this.target.$('thead .' + type + '[href="' + event.target.hash + '"]').click();
      event.preventDefault();
    },
    scrollHandler: function () {
      var scroll = document.body.scrollTop + 70; // 50是topbar高度，20是间隙
      if (scroll > this.top) {
        if (!this.visible) {
          this.visible = true;
          this.$el.show();
        }
      } else {
        this.$el.hide();
        this.visible = false;
      }
    }
  });
}(Nervenet.createNameSpace('tp.component.table')));;
(function (ns) {
  ns.CollectionSelect = ns.BaseList.extend({
    autoFetch: true,
    refresh: function (options) {
      if (this.collection.length) {
        this.collection_resetHandler();
      } else {
        ns.BaseList.prototype.refresh.call(this, options);
      }
    },
    collection_addHandler: function (model, collection, options) {
      var item = ns.BaseList.prototype.collection_addHandler.call(this, model, collection, options);
      if (item) {
        item.prop('selected', true)
          .siblings().prop('selected', false);
      }
    },
    collection_changeHandler: function (model) {
      this.$('[value=' + model.id + ']').prop('selected', true)
        .siblings().prop('selected', false);
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.DateRanger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function () {
      this.$('.date input').datetimepicker({format: moment.DATE_FORMAT});
      if (!this.$('script').html()) {
        return;
      }

      this.template = Handlebars.compile(this.$('script').html());
      var date = new Date()
        , month = date.getMonth()
        , months = _.map(_.range(month, month - 3, -1), function (value) {
          return {
            month: value <= 0 ? value + 12 : value,
            start: moment(new Date(date.getFullYear(), value - 1, 1)).format(moment.DATE_FORMAT),
            end: moment(new Date(date.getFullYear(), value, 0)).format(moment.DATE_FORMAT)
          }
        })
        , self = this;
      this.$('script').replaceWith(this.template({ months: months }));
      this.$('.this-month').data('start', moment().startOf('month').format(moment.DATE_FORMAT));
      this.$('.this-season').data('start', moment().startOf('quarter').format(moment.DATE_FORMAT));
      this.$('.shortcut').each(function () {
        var data = $(this).data();
        data.start = self.formatDate(data.start);
        data.end = self.formatDate(data.end, date.getDate());
        $(this).data(data)
          .attr('data-start', data.start)
          .attr('data-end', data.end);
      });
    },
    render: function (options) {
      // 默认显示一个月
      options.dateFormat = options.dateFormat || moment.DATE_FORMAT;
      var isMonth = !/d/i.test(options.dateFormat) && /M/.test(options.dateFormat)
        , unit = isMonth ? 'months' : 'days'
        , range = _.defaults(options, {
          start: isMonth ? -1 : -31,
          end: 0
        });
      this.$('.date input').each(function () {
        $(this).data("DateTimePicker").format(range.dateFormat).viewMode(unit);
      });
      this.$el.toggleClass('select-month', isMonth);

      if (!isNaN(range.start)) {
        range.start = moment().add(range.start, unit).format(range.dateFormat);
      }
      if (!isNaN(range.end)) {
        range.end = moment().add(range.end, unit).format(range.dateFormat);
      }

      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
      var shortcut = this.$('[data-start="' + range.start + '"][data-end="' + range.end + '"]').eq(0);
      this.$('.label').text(shortcut.length ? shortcut.text() : range.start + ' ~ ' + range.end);
      return range;
    },
    trigger: function (range, options) {
      options = options || {};
      options.reset = true;
      this.model.set(range, options);
    },
    formatDate: function (date, today) {
      if (isNaN(date)) {
        return date;
      }
      if (today && today === 1 && date === -1) {
        date = 0;
      }
      return moment().add(date, 'days').format(moment.DATE_FORMAT);
    },
    use: function (model) {
      this.model = model;
      var range = this.render(model.pick('start', 'end', 'dateFormat'));
      this.model.set(range, {silent: true});
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    range_clickHandler: function () {
      var start = this.$('[name=start]').val()
        , end = this.$('[name=end]').val();
      this.$('.shortcut').removeClass('active');
      this.$('.label').text(start + ' - ' + end);
      this.trigger({
        start: start,
        end: end
      });
    },
    shortcut_clickHandler: function (event) {
      var item = $(event.currentTarget)
        , start = item.data('start')
        , end = item.data('end');
      item.addClass('active')
        .siblings().removeClass('active');
      this.$('.label').text(item.text());
      var range = this.render({start: start, end: end});
      this.trigger(range);
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.Manager = {
    $context: null,
    $me: null,
    map: {
      '.base-list': 'tp.component.BaseList',
      '.smart-table': 'tp.component.SmartTable',
      '.add-on-list': 'tp.component.AddOnList',
      '.collection-select': 'tp.component.CollectionSelect',
      '.morris-chart': 'tp.component.MorrisChart',
      '.typeahead': 'tp.component.Typeahead',
      'form': 'tp.component.SmartForm'
    },
    components: [],
    check: function ($el) {
      var components = [];
      $el.data('components', components);

      var dateFields = $el.find('.datetimepicker');
      if (dateFields.length) {
        dateFields.each(function () {
          var options = $(this).data();
          options = _.mapObject(options, function (value, key) {
            switch (key) {
              case 'maxDate':
              case 'minDate':
              case 'defaultDate':
                return moment().add(value, 'days');
                break;
              default:
                return value;
            }
          });
          $(this).datetimepicker(options);
        });
      }

      // 自动初始化组件
      var self = this;
      for (var selector in this.map) {
        if (!this.map.hasOwnProperty(selector)) {
          continue;
        }
        var dom = $el.find(selector);
        if (dom.length) {
          var component = Nervenet.parseNamespace(this.map[selector]);
          if (component) {
            dom.each(function () {
              components.push(self.$context.createInstance(component, {el: this}));
            });
          } else {
            this.loadMediatorClass(components, this.map[selector], dom); // mediator pattern
          }
        }
      }
      // 初始化非本库的自定义组件
      $el.find('[data-mediator-class]').each(function () {
        var className = $(this).data('mediator-class')
          , component = Nervenet.parseNamespace(className);
        if (component) {
          components.push(self.$context.createInstance(component, {el: this}));
        } else {
          self.loadMediatorClass(components, className, $(this));
        }
      });
    },
    clear: function ($el) {
      var dateFields = $el.find('.datetimepicker');
      if (dateFields.destroy) {
        dateFields.destroy();
      }
      var components = $el.data('components');
      if (!components || components.length === 0) {
        return;
      }

      // 移除组件
      for (var i = 0, len = components.length; i < len; i++) {
        components[i].remove();
      }
      components.length = 0;
    },
    find: function ($el, className) {
      var components = $el.data('components');
      if (!components) {
        return;
      }
      var result = [];
      className = Nervenet.parseNamespace(className);
      for (var i = 0, len = components.length; i < len; i++) {
        if (components[i] instanceof className) {
          result.push(components[i]);
        }
      }
      return result;
    },
    getPath: function (str) {
      var arr = str.split('.');
      if (arr[0] === tp.NAME_SPACE) {
        arr = arr.slice(1);
      }
      return 'js/' + arr.join('/') + '.js';
    },
    loadMediatorClass: function (components, className, dom, callback) {
      var self = this
        , script = document.createElement("script");
      script.async = true;
      script.src = this.getPath(className);
      script.onload = function() {
        this.onload = null;
        var component = Nervenet.parseNamespace(className);
        if (!component) {
          throw new Error('cannot find mediator')
        }
        if (dom) {
          dom.each(function () {
            components.push(self.$context.createInstance(component, {el: this}));
          });
        }
        if (callback) {
          callback(components);
        }
      };
      document.head.appendChild(script);
    },
    preCheck: function ($el) {
      var components = $el.data('components');
      if (!components) {
        return true;
      }
      for (var i = 0, len = components.length; i < len; i++) {
        if ('preCheck' in components[i] && !components[i].preCheck()) {
          return false;
        }
      }
      return true;
    },
    createComponents: function () {
      for (var i = 0, len = this.components.length; i < len; i++) {
        var func = this.components[i][0]
          , params = this.components[i][1];
        func = _.bind(func, this, params);
        func();
      }
    },
    registerComponent: function (func, params) {
      this.components.push([func, params]);
    }
  };
  ns.spinner = '<i class="fa fa-spin fa-spinner"></i>';
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {

  var timeout
    , placeholder = '<p><i class="fa fa-spinner fa-spin fa-4x"></i></p>';

  ns.Base = tp.view.DataSyncView.extend({
    $context: null,
    events: {
      'shown.bs.modal': 'shownHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'click [data-dismiss=modal]': 'closeButton_clickHandler',
      'keydown': 'keydownHandler',
      'success': 'form_successHandler'
    },
    initialize: function (options) {
      this.model = this.model || this.$context.getValue('model');
      if (options.isRemote) {
        this.$el.addClass('loading')
          .find('.modal-body').html(placeholder);
        if (/\.hbs$/.test(options.content)) {
          $.get(options.content, _.bind(this.template_loadedHandler, this));
        } else {
          options.isMD = /\.md$/.test(options.content);
          $.get(options.content, _.bind(this.onLoadComplete, this));
        }

        ga('send', 'pageview', options.content);
      } else {
        this.onLoadComplete(options.content);
      }
      if (options.autoFetch) {
        this.model.fetch();
        this.model.on('sync', this.model_syncHandler, this);
      }
      this.options = options;
      this.$el.modal(options);
    },
    remove: function () {
      clearTimeout(timeout);
      this.options = null;
      this.off();
      tp.component.Manager.clear(this.$el);
      Backbone.View.prototype.remove.call(this);
    },
    hide: function (delay) {
      delay = delay === undefined ? 3000 : delay;
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, delay);
    },
    onLoadComplete: function (response) {
      if (response) {
        if (this.options && this.options.isMD) {
          response = marked(response);
        }
        this.$('.modal-body').html(response);
      }
      this.$el.removeClass('loading')
        .find('.modal-footer .btn-primary').prop('disabled', false);
      tp.component.Manager.check(this.$el, this.model);
    },
    closeButton_clickHandler: function () {
      this.$el.modal('hide');
      this.trigger('cancel', this);
    },
    form_successHandler: function (delay) {
      this.hide(delay);
      this.trigger('success');
    },
    model_syncHandler: function (model) {
      if (this.template) {
        this.onLoadComplete(this.template(_.extend({}, this.options, model.toJSON())));
      }
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
      this.trigger('confirm', this);
    },
    template_loadedHandler: function (response) {
      this.template = Handlebars.compile(response);
      if (this.options && this.options.autoFetch && !this.model.hasChanged()) {
        return;
      }
      var data = _.extend({API: tp.API}, this.options, this.model ? this.model.toJSON() : null);
      this.onLoadComplete(this.template(data));
    },
    hiddenHandler: function () {
      this.remove();
      this.trigger('hidden', this);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.$('.modal-footer .btn-primary').submit();
        event.preventDefault();
      }
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    shownHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
    }
  });
}(Nervenet.createNameSpace('tp.popup')));;
(function (ns) {
  var timeout;
  /**
   * @property {object} options
   * @property {boolean} options.hasComponents 是否有组件需要初始化
   */
  var Editor = ns.Editor = tp.view.DataSyncView.extend({
    $context: null,
    form: null,
    events: {
      'hidden.bs.modal': 'hiddenHandler',
      'keydown': 'keydownHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler'
    },
    initialize: function (options) {
      this.submit = this.$('.btn-primary');
      this.options = options;
      var type = options.type || 'short-text'
        , template = options.template ? 'page/' + options.template : (tp.path + 'template/popup-' + type);
      $.get(template + '.hbs', _.bind(this.loadCompleteHandler, this), 'html');

      // 补充信息
      var info = $('.editor-info');
      if (info.length) {
        info = Handlebars.compile(info.html());
        this.$('.info').html(info(this.model.toJSON()));
      }
      this.$el.modal(options);
    },
    render: function (template) {
      template = Handlebars.compile(template);
      this.$('.loading').remove();
      this.form = new tp.component.SmartForm({
        tagName: 'form',
        id: 'prop-editor',
        className: 'editor-form model-editor',
        model: this.model
      });
      var html = template(_.extend(this.model.toJSON(), this.options));
      this.form.$el.html(html).insertAfter(this.$('.alert-msg'));
      this.form.on('success', this.form_successHandler, this);
      this.form.on('error', this.form_errorHandler, this);

      html = this.$('script').remove().html();
      if (html) {
        this.template = Handlebars.compile(html);
        this.$('script').empty();
      }

      var dateFields = this.$('.datetimepicker');
      if (dateFields.length) {
        dateFields.each(function () {
          $(this).datetimepicker($(this).data());
        });
      }

      if (this.options.hasComponents) {
        tp.component.Manager.check(this.form.$el);
      }

      this.submit.prop('disabled', false);
    },
    hide: function (delay) {
      delay = delay === undefined ? 3000 : delay;
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, delay);
    },
    form_errorHandler: function (xhr, status, error) {
      this.displayResult(false, error.message, 'frown-o');
      this.trigger('error', xhr, status, error);
    },
    form_successHandler: function (response) {
      this.displayResult(true, response.msg, 'smile-o');
      this.trigger('success', response);
      this.hide();
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.form.$el.submit();
        event.preventDefault();
      }
    },
    loadCompleteHandler: function (response) {
      this.render(response);
    },
    hiddenHandler: function () {
      this.form.remove();
      if (this.collection && this.collection instanceof Backbone.Collection) {
        this.collection.off(null, null, this);
      }
      clearTimeout(timeout);
      this.remove();
      this.trigger('hidden');
    }
  });

  ns.SearchEditor = Editor.extend({
    fragment: '',
    item: '{{label}}',
    events: _.extend(Editor.prototype.events, {
      'click .search-button': 'searchButton_clickHandler'
    }),
    /**
     * @param {object} options
     * @param {string} options.itemLabel 选项label的模板
     * @param {string} options.url 搜索接口
     */
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      if (!options.template) {
        Handlebars.registerPartial('item', options.itemLabel || this.item);
      }
      this.collection = tp.model.ListCollection.getInstance();
      this.collection.url = tp.API + options.url;
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.collection.off();
      Handlebars.unregisterPartial('item');
      Backbone.View.prototype.remove.call(this);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
    },
    search: function () {
      var keyword = this.$('[type=search]').val();
      if (!keyword) {
        return;
      }
      this.collection.fetch({data: {keyword: keyword}});
      this.$('[type=search]').prop('disabled', true);
      this.$('.search-button').spinner();
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(_.extend(model.toJSON(), this.options));
    },
    collection_syncHandler: function () {
      this.fragment = this.fragment || '没有与此关键词接近的结果。';
      this.$('.search-result').html(this.fragment);
      this.$('[type=search]').prop('disabled', false);
      this.$('.search-button').spinner(false);
      this.fragment = '';
    },
    searchButton_clickHandler: function () {
      this.search();
    },
    keydownHandler: function (event) {
      Editor.prototype.keydownHandler.call(this, event);
      if (event.keyCode === 13 && event.target.type === 'search' && event.target.value != '') {
        this.search();
        event.preventDefault();
      }
    }
  });

  ns.TagsEditor = Editor.extend({
    events: _.extend(Editor.prototype.events, {
      'click .add-button': 'addButton_clickHandler'
    }),
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      this.collection.on('add', this.collection_addHandler, this);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
      if (this.options.tag && this.collection) {
        var prop = this.options.tag;
        this.collection.map(function (model) {
          model.set('tag', model.get(prop));
        });
      }
      this.$('.tags').html(this.template({value: this.collection.toJSON()}));
    },
    add: function () {
      var value = this.$('[name=query]').val().replace(/^\s+|\s+$/, '');
      if (value && !this.collection.find({tag: value})){
        this.$('[name=query], .add-button').prop('disabled', true);
        this.$('.add-button i').addClass('fa-spin fa-spinner');
        this.collection.create({tag: value}, {wait: true});
      }
    },
    addButton_clickHandler: function () {
      this.add();
    },
    collection_addHandler: function (model) {
      var data = model.toJSON();
      data.index = this.collection.length - 1;
      $(this.template({value: [data], append: true})).insertBefore(this.$('hr'));
      this.$('[name=query],.add-button').prop('disabled', false).val('');
      this.$('.add-button i').removeClass('fa-spin fa-spinner');
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.target.value != '') {
        this.add();
        event.preventDefault();
      }
    }
  });

  /**
   * @property {object} options
   * @property {boolean} options.addNew
   */
  ns.SelectEditor = Editor.extend({
    render: function (response) {
      if (this.options.options) {
        if (this.model.options) {
          this.options.options = this.model.options[this.options.options];
        } else if (this.model.collection.options) {
          this.options.options = this.model.collection.options[this.options.options];
        }
      }
      Editor.prototype.render.call(this, response);

      if (this.options.addNew) {
        var collection = new tp.model.ListCollection.getInstance({
            collectionId: this.options.prop,
            url: tp.API + this.options.url
          })
          , select = new tp.component.CollectionSelect({
            el: this.$('select'),
            collection: collection
          });
        collection.reset(this.options.options);
      } else if (this.options.list) {
        this.$('select').html($(this.options.list).html());
      }

      this.$('select').val(this.options.value)
    }
  });

  ns.NumberEditor = Editor.extend({
    initialize: function (options) {
      options.range = options.type === 'range';
      options.type = 'number';
      Editor.prototype.initialize.call(this, options);
    }
  });

  ns.FileEditor = Editor.extend({
    events: _.extend({
      'click [data-dismiss]': 'clickHandler'
    }, Editor.prototype.events),
    initialize: function (options) {
      options.isImage = /image\/\*/.test(options.accept);
      options.API = tp.API;
      if (options.multiple) {
        options.items = _.isArray(options.value) ? options.value : options.value.split(',');
      }
      // 防止误触导致退出窗体
      options.backdrop = 'static';
      options.keyboard = false;
      Editor.prototype.initialize.call(this, options);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
      this.form.initUploader();
    },
    clickHandler: function (e) {
      var label = '您有文件正在上传，关闭窗口将导致上传失败。您确认要继续关闭窗口么？';
      if (this.form.$el.hasClass('loading') && !confirm(label)) {
        e.stopPropagation();
      }
    }
  });

  ns.SwitchEditor = Editor.extend({
    initialize: function (options) {
      var defaults = {
        open: 1,
        close: 0,
        readonly: true
      };
      options = _.extend(defaults, options);
      options.value = this.model.get(options.prop) != options.open;
      Editor.prototype.initialize.call(this, options);
    }
  });

  ns.CheckboxEditor = Editor.extend({
    render: function (response) {
      if (this.options.options) {
        if (this.model.options) {
          this.options.options = this.model.options[this.options.options];
        } else {
          this.options.options = this.model.collection.options[this.options.options];
        }
      }
      Editor.prototype.render.call(this, response);
    }
  });

  ns.DateTimeEditor = Editor.extend({
    initialize: function (options) {
      options.format = moment[options.type.toUpperCase() + '_FORMAT'];
      options.realType = options.type;
      options.type = 'datetime';
      Editor.prototype.initialize.call(this, options);
    }
  });
}(Nervenet.createNameSpace('tp.popup')));;
(function (ns) {
  ns.Loader = Backbone.View.extend({
    $context: null,
    fresh: false,
    tagName: 'div',
    events: {
      'click .edit': 'edit_clickHandler'
    },
    initialize: function (options) {
      if (this.model instanceof Backbone.Model && !options.hasData) {
        this.model.once('sync', this.model_syncHandler, this);
        this.model.fetch(options);
      } else {
        this.isModelReady = true;
      }

      $.get(options.template, _.bind(this.template_getHandler, this), 'html');

      if ('refresh' in options) {
        this.refresh = options.refresh;
      }
    },
    remove: function () {
      tp.component.Manager.clear(this.$el);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$el.html(this.template(this.model instanceof Backbone.Model ? this.model.toJSON() : this.model));
      if (this.refresh) {
        this.refresh = false;
        this.model.on('change', this.model_changeHandler, this);
      }
      var self = this
        , $el = this.$el
        , model = this.model;
      setTimeout(function () {
        tp.component.Manager.check($el, model);
        self.trigger('complete');
      }, 0);
    },
    edit_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , options = target.data()
        , prop = event.currentTarget.hash.substr(1);
      options.label = options.label || target.closest('td').prev('th').text();
      this.$context.trigger('edit-model', this.model, prop, options);
      event.preventDefault();
    },
    model_changeHandler: function () {
      // 记录当前活动元素的位置
      var id = this.$('.active').filter('.tab-pane').attr('id');
      tp.component.Manager.clear(this.$el);
      this.render();
      if (id) {
        this.$('[href="#' + id + '"][data-toggle]').click();
      }
    },
    model_syncHandler: function () {
      if (this.template) {
        return this.render();
      }
      this.isModelReady = true;
    },
    template_getHandler: function (data) {
      this.template = Handlebars.compile(data);
      if (this.isModelReady) {
        this.render();
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  var print_header = '<link rel="stylesheet" href="{{url}}css/screen.css"><link rel="stylesheet" href="{{url}}css/print.css"><title>{{title}}</title>';

  ns.Body = Backbone.View.extend({
    $context: null,
    $sidebarEditor: null,
    events: {
      'click .add-button': 'addButton_clickHandler',
      'click .print-button': 'printButton_clickHandler',
      'click .refresh-button': 'refreshButton_clickHandler',
      'click .request-button': 'requestButton_clickHandler'
    },
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loading = this.$('#page-loading').remove().removeClass('hide');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.$el
        .popover({
          selector: '[data-toggle=popover]'
        })
        .tooltip({
          selector: '[data-toggle=tooltip]'
        });
    },
    clear: function () {
      this.$context.removeValue('model');
      tp.component.Manager.clear(this.container);
      if (this.page) {
        this.page.remove();
        this.page = null;
      }
    },
    createSidebar: function () {
      this.$sidebarEditor.render();
    },
    load: function (url, data, options) {
      options = options || {};
      this.clear();
      this.$el.toggleClass('full-page', !!options.isFull)
        .removeClass(this.lastClass);
      $('#navbar-side').removeClass('in');

      // html or hbs
      if (/.hbs$/.test(url)) {
        var klass = options.loader || tp.view.Loader
          , page = this.page = this.$context.createInstance(klass, _.extend({
            template: url,
            model: data
          }, options));
        this.container.html(page.$el);
        page.once('complete', this.page_loadCompleteHandler, this);
      } else if (/.md$/.test(url)) {
        tp.service.Manager.fetch(url, this.md_loadCompleteHandler, this);
      } else {
        this.container.load(url, this.loadCompleteHandler);
      }

      this.container.append(this.loading);

      this.trigger('load:start', url);
      ga('send', 'pageview', url);

      return this;
    },
    setFramework: function (classes, title, sub, model) {
      this.$el.addClass(classes);
      this.lastClass = classes;
      if (model instanceof Backbone.Model && title) {
        model.once('sync', function () {
          this.setTitle(title, sub, model);
        }, this);
        return this;
      } else {
        return this.setTitle(title, sub, model);
      }
    },
    setLatestStat: function (model) {
      this.latest = this.latest || Handlebars.compile(this.$('.latest script').html());
      this.$('.latest').html(this.latest(model.toJSON()));
    },
    setTitle: function (title, sub, model) {
      if (model) {
        model = model instanceof Backbone.Model ? model.toJSON() : model;
        title = Handlebars.compile(title)(model);
        sub = Handlebars.compile(sub)(model);
      }
      title = title + (sub ? ' <small>' + sub + '</small>' : '');
      this.$('#content .page-header > h1').html(title);
      return this;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.createSidebar();
        this.$el.removeClass('full-page')
          .find('.login').remove();
        tp.component.Manager.createComponents();
      }
    },
    addButton_clickHandler: function (event) {
      var options = $(event.currentTarget).data();
      if (!options.title && event.currentTarget.title) {
        options.title = event.currentTarget.title;
      }
      options.collectionId = event.currentTarget.hash.substr(1);
      this.$context.trigger('add-model', options);
      event.preventDefault();
    },
    md_loadCompleteHandler: function (response) {
      this.container.html(marked(response));
      this.loading.remove();
      this.trigger('load:complete');
    },
    refreshButton_clickHandler: function (event) {
      Backbone.history.loadUrl(Backbone.history.fragment);
      event.preventDefault();
    },
    requestButton_clickHandler: function (event) {
      var href = event.target.getAttribute('href');
      href = /https?:\/\//.test(href) ? href : tp.API + href;
      $.get(href, function (response) {
        if (response.code === 0) {
          alert(response.msg);
        }
      }, 'json');
      event.preventDefault();
    },
    page_loadCompleteHandler: function () {
      this.loading.remove();
    },
    printButton_clickHandler: function (event) {
      var target = event.currentTarget
        , selector = target.getAttribute('href')
        , title = target.title
        , printWindow = window.open('', 'print-window')
        , url = location.href
        , header = Handlebars.compile(print_header);
      url = url.substr(0, url.lastIndexOf('/') + 1);
      printWindow.document.body.innerHTML = $(selector).html();
      printWindow.document.head.innerHTML = header({
        title: title,
        url: url
      });
      printWindow.print();
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        tp.component.Manager.check(this.container);
      }
      this.loading.remove();
      this.trigger('load:complete');
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  ns.Me = Backbone.View.extend({
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').html());
      this.model.on('change', this.model_changeHandler, this);
    },
    render: function () {
      if ('fullname' in this.model.changed) {
        this.$('.username').text(this.model.get('fullname'));
      }
      this.$el.filter('.navbar-user').html(this.template(this.model.toJSON()));
    },
    model_changeHandler: function () {
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  var HIDDEN_ITEMS = tp.PROJECT + '-hidden-items'
    , COLLAPSED_STATUS = tp.PROJECT + '-sidebar-collapsed';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click .eye-edit-button': 'eyeEditButton_clickHandler',
      'click .accordion-toggle': 'accordionToggle_clickHandler',
      'click #menu-edit-button': 'menuEditButton_clickHandler',
      'click #edit-confirm-button': 'editConfirmButton_clickHandler',
      'click #edit-cancel-button': 'editCancelButton_clickHandler',
      'click #menu-search-button': 'menuSearchButton_clickHandler',
      'click #search-clear-button': 'searchClearButton_clickHandler',
      'click #menu-collapse-button': 'menuCollapseButton_clickHandler',
      'blur #menu-search-input': 'menuSearchInput_blurHandler',
      'keyup #menu-search-input': 'menuSearchInput_keyupHandler'
    },
    initialize: function () {
      this.is_collapsed = !!localStorage.getItem(COLLAPSED_STATUS);
      this.hiddenItems = JSON.parse(localStorage.getItem(HIDDEN_ITEMS)) || [];
      this.template = Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
    },
    render: function () {
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default';
      $.getJSON('page/sidebar/' + role + '.json', _.bind(function (response) {
        _.each(response, function (parent) {
          var item = parent['link'] || parent['sub-id'];
          parent.invisible = this.hiddenItems.indexOf('parent-' + item) !== -1;
          if (parent.sub)  {
            _.each(parent.sub, function (child) {
              child.invisible = this.hiddenItems.indexOf(child.link) !== -1;
            }, this);
          }
        }, this);
        response = _.reject(response, function (item) {
          return item.only && !_.contains(item.only.split(','), this.model.get('id'));
        }, this);
        var html = this.template({list: response});
        this.$('#navbar-side-inner').append(html);
        $('body').toggleClass('sidebar-collapsed', this.is_collapsed);
      }, this));
    },
    eyeEditButton_clickHandler: function (event) {
      var li = $(event.currentTarget).closest('li');
      li.toggleClass('hidden');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      this.$('.collapse').collapse('show');
    },
    editConfirmButton_clickHandler: function () {
      var hiddenItems = _.map(this.$('.hidden'), function (node) {
        return node.id;
      });
      this.$el.removeClass('sidebar-editing');
      this.hiddenItems = hiddenItems;
      localStorage.setItem(HIDDEN_ITEMS, JSON.stringify(hiddenItems));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$('.collapse').collapse('hide');
      this.render();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('.collapse').collapse('show');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      if (!event.target.value.trim()) {
        this.$el.removeClass('sidebar-search');
        this.$('#navbar-side-inner').removeClass('search-typing');
      }
    },
    searchClearButton_clickHandler: function () {
      this.$('#menu-search-input').val('').focus();
    },
    menuSearchInput_keyupHandler: function (event) {
      var self = this
        , val = event.target.value.trim();
      this.$('#navbar-side-inner').addClass('search-typing');
      if (val) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(function () {
          var str = '.*' + val.split('').join('.*') + '.*'
            , reg = new RegExp(str);
          self.$('a[href^="#/"]').each(function () {
            var isMatch = reg.test(this.innerText.toLowerCase());
            $(this).closest('li').toggleClass('mismatch', !isMatch);
          })
        }, 500);
      }
    },
    menuCollapseButton_clickHandler: function () {
      this.is_collapsed = $('body').toggleClass('sidebar-collapsed').hasClass('sidebar-collapsed');
      if (this.is_collapsed) {
        localStorage.setItem(COLLAPSED_STATUS, this.is_collapsed);
      } else {
        localStorage.removeItem(COLLAPSED_STATUS);
      }
    },
    accordionToggle_clickHandler: function (event) {
      var body = $('body');
      if (body.hasClass('sidebar-collapsed')) {
        body.one('click', _.bind(this.items_hideHandler, this));
        this.$('.accordion-toggle').each(function () {
          var ul = $(this).siblings('ul');
          this === event.currentTarget ? ul.toggleClass('view').height('auto') : ul.removeClass('view');
        });
        event.preventDefault();
        event.stopPropagation();
      }
    },
    items_hideHandler: function () {
      this.$('.view').removeClass('view');
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  ns.Dashboard = ns.Loader.extend({
    className: 'dashboard',
    render: function () {
      ns.Loader.prototype.render.call(this);
      this.$el.removeClass('loading');
      this.$('.fa').remove('fa-spin fa-spinner');
    },
    model_changeHandler: function (model) {
      var range = _.pick(model.changed, 'start', 'end');
      if (_.isEmpty(range)) {
        this.render();
      } else {
        model.fetch({
          data: model.pick('start', 'end')
        });
        this.$el.addClass('loading');
        this.$('.fa').addClass('fa-spin fa-spinner');
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  ns.Search = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'focus .keyword': 'keyword_focusHandler',
      'click .clear-button': 'clearButton_clickHandler',
      'keydown': 'keyDownHandler',
      'input': 'inputHandler',
      'submit': 'submitHandler'
    },
    initialize: function () {
      this.result = this.$('.result');
      this.template = Handlebars.compile(this.$('script').html());
      this.spinner = this.$('.fa-spinner');
      this.clearButton = this.$('.clear-button');
      this.input = this.$('.keyword');

      this.fetch = _.bind(this.fetch, this);
      this.hide = _.bind(this.hide, this);
    },
    remove: function () {
      this.model.off();
      this.model = null;
      Backbone.View.remove.call(this);
    },
    /**
     * 渲染搜索结果列表
     *
     * @param {Object} response
     * @param {Array} response.ads 搜索结果
     * @param {String} response.keyword 搜索关键词
     * @param {Boolean} response.has_info 是否要显示广告投放情报链接
     */
    render: function (response) {
      response.ads = response.ads && response.ads.length > 0 ? response.ads : false;
      this.hasResult = !!response.ads;
      if (this.hasResult) {
        response.keyword = this.input.val();
        response.has_info = response.keyword.split(' ').length === 1;
      }
      this.result.html(this.template(response)).show();
      this.spinner.hide();
      this.clearButton.show();
      this.input.focus();
      this.xhr = null;
    },
    fetch: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = tp.service.Manager.get(tp.API + 'search/', this.$el.serialize(), {
        success: this.render,
        error: this.errorHandler,
        context: this
      });
      this.clearButton.hide();
      this.spinner.show();
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.result.hide();
      }
    },
    clearButton_clickHandler: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.input.val('');
      this.clearButton.hide();
      this.spinner.hide();
    },
    keyword_blurHandler: function () {
      this.hideTimeout = setTimeout(this.hide, 250);
    },
    keyword_focusHandler: function () {
      clearTimeout(this.hideTimeout);
      if (this.hasResult > 0) {
        this.result.show();
      }
    },
    errorHandler: function () {
      this.spinner.hide();
      this.result.html(this.template({
        error: true,
        msg: '加载错误，大侠请重新来过'
      })).show();
    },
    inputHandler: function () {
      clearTimeout(this.timeout);
      if (this.input.val().length > 1) {
        this.clearButton.show();
        this.timeout = setTimeout(this.fetch, this.delay);
      }
    },
    keyDownHandler: function (event) {
      var active = this.result.find('.active').removeClass('active');
      switch (event.keyCode) {
        case 13: // enter
          var id = active.children().attr('href');
          if (id) {
            id = id.substr(1);
            if (this.multiple) {
              this.selected.add(this.collection.get(id));
            } else {
              this.selected.set([this.collection.get(id)]);
              this.result.hide();
            }
          } else if (!this.input.prop('disabled') && this.input.val().length > 1) {
            this.fetch();
          }
          event.preventDefault();
          break;

        case 40: // down
          this.result.show();
          if (active.length === 0 || active.is(':last-child')) {
            this.result.children().first().addClass('active');
          } else {
            active.nextAll(':not(.divider,.disabled)').first().addClass('active');
          }
          event.preventDefault();
          break;

        case 38: // up
          this.result.show();
          if (active.length === 0 || active.is(':first-child')) {
            this.result.children().last().addClass('active');
          } else {
            active.prevAll(':not(.divider,.disabled)').first().addClass('active');
          }
          event.preventDefault();
          break;

        case 27: // esc
          if (this.result.is(':visible')) {
            this.hide();
            event.stopPropagation();
          }
          break;
      }
    },
    submitHandler: function (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}(Nervenet.createNameSpace('tp.view')));;
(function (ns) {
  ns.AddOnList = ns.BaseList.extend({
    autoFetch: false,
    initialize: function (options) {
      options = _.extend({
        container: 'tbody'
      }, options, this.$el.data());
      this.collection = new Backbone.Collection();
      ns.BaseList.prototype.initialize.call(this, options);

      var id = this.$el.data('collection-id')
        , key = this.$el.data('key')
        , collection = tp.model.ListCollection.getInstance({
          collectionId: id
        });
      collection.on('data:' + key, this.collection_dataHandler, this);
    },
    collection_dataHandler: function (list, collection) {
      if (collection.options) {
        this.collection.model = Backbone.Model.extend({
          defaults: collection.options
        });
      }
      this.collection.reset(list);
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.LoginForm = Backbone.View.extend({
    events: {
      'click #verify-code': 'verifyCode_clickHandler'
    },
    verifyCode_clickHandler: function (event) {
      var src = event.target.src
        , offset = src.indexOf('?ts=')
        , time = Date.now();
      src = offset === -1 ? src + '?ts=' + time : src.replace(/\?ts=\d+$/, '?ts=' + time);
      event.target.src = src;
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.MorrisChart = Backbone.View.extend({
    $colors: null,
    src: {},
    initialize: function (options) {
      if (options.data) {
        this.createOptions(options);
        this.render();
        return;
      }

      var init = this.$el.data();
      options = _.extend({
        autoFetch: true
      }, options, init);
      if (options.url) {
        this.collection = tp.model.ListCollection.getInstance(options);
        this.createOptions(options);
        if (options.autoFetch) {
          this.collection.on('sync reset', this.collection_fetchHandler, this);
          this.collection.fetch();
        } else {
          this.collection_fetchHandler();
        }
        return;
      }

      var data = this.$('script');
      if (data.length) {
        var chartData = JSON.parse(data.remove().html().replace(/,\s?]/, ']'));
        if (chartData.data.length) {
          this.createOptions(options, chartData);
          this.render();
          return;
        }
      }

      this.showEmpty();
    },
    remove: function () {
      if (this.collection) {
        this.collection.off(null, null, this);
      }
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$el.empty();
      this.chart = new Morris[this.className](this.options);
    },
    createOptions: function (options, chartData) {
      options = _.extend({
        element: this.el,
        lineWidth: 2
      }, options, chartData);
      this.className = 'type' in options ? options.type.charAt(0).toUpperCase() + options.type.substr(1) : 'Line';
      if ('colors' in options) {
        options.colors = options.lineColors = options.barColors = _.isArray(options.colors) ? options.colors : options.colors.split(',');
      } else {
        options.colors = options.lineColors = options.barColors = this.$colors;
      }
      if (this.className === 'Donut') {
        options.formatter = function (y, data) {
          return 'percent' in data ? y + '(' + data.percent + '%)' : y;
        }
      }
      if (options.ykeys && !_.isArray(options.ykeys)) {
        this.src.ykeys = options.ykeys = options.ykeys.split(',');
      }
      if (options.labels && !_.isArray(options.labels)) {
        this.src.labels = options.labels = options.labels.split(',');
      }
      if (options.yFormater) {
        options.yFormater = tp.utils.decodeURLParam(options.yFormater);
      }
      this.options = options;
    },
    showEmpty: function () {
      this.$el.addClass('empty').text('（无数据）');
    },
    collection_fetchHandler: function () {
      if (this.collection.length === 0) {
        this.showEmpty();
      }
      var json = this.collection.toJSON();
      if (this.collection.options) {
        if (this.collection.options.ykeys) {
          this.options.ykeys = this.src.ykeys.concat(this.collection.options.ykeys);
        }
        if (this.collection.options.labels) {
          this.options.labels = this.src.labels.concat(this.collection.options.labels);
        }
      }
      if (this.options.yFormater) {
        json = json.map(function (item) {
          return _.mapObject(item, function (value, key) {
            if (key in this.options.yFormater) {
              return Handlebars.helpers[this.options.yFormater[key]](value);
            }
            return value;
          }, this);
        }, this);
      }
      this.options.data = json;
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  var filterLabel = Handlebars.compile('<a href="#/{{key}}/{{value}}" class="filter label label-{{key}}">{{#if label}}{{label}}{{else}}{{value}}{{/if}}</a>');

  ns.SmartTable = ns.BaseList.extend({
    $context: null,
    $ranger: null,
    autoFetch: true,
    events: {
      'click .archive-button': 'archiveButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click tbody .filter': 'tbodyFilter_clickHandler',
      'click thead .filter': 'theadFilter_clickHandler',
      'click .order': 'order_clickHandler',
      'change select.edit': 'select_changeHandler',
      'change .stars input': 'star_changeHandler',
      'change .status-button': 'statusButton_changeHandler'
    },
    initialize: function (options) {
      var data = this.$el.data()
        , autoFetch = 'autoFetch' in data ? data.autoFetch : this.autoFetch
        , typeahead = 'typeahead' in data ? data.typeahead : true;
      ns.BaseList.prototype.initialize.call(this, _.extend(options, {
        autoFetch: false,
        container: 'tbody',
        reset: true
      }));

      // 通过页面中介来实现翻页等功能
      this.model = this.model && this.model instanceof tp.model.TableMemento ? this.model : new tp.model.TableMemento(this.params);
      this.model.on('change', this.model_changeHandler, this);
      this.model.on('invalid', this.model_invalidHandler, this);
      if (options.tags) {
        this.model.tags = options.tags.split(',');
      }
      if (this.model.has('start')) {
        if (!_.isString(this.collection.model)) {
          _.extend(this.collection.model.prototype.defaults, this.model.pick('start', 'end'));
        }
      }
      this.renderHeader();

      // 启用搜索
      if ('search' in options) {
        this.search = new ns.table.Search({
          el: options.search,
          model: this.model,
          collection: this.collection
        });
      }

      // 翻页
      if ('pagesize' in options && options.pagesize > 0) {
        this.pagination = new ns.table.Pager(_.extend({}, options, {
          el: 'pagination' in options ? options.pagination : '.pager',
          model: this.model,
          collection: this.collection
        }));
      }

      // 调整每页数量
      if ('pagesizeController' in options) {
        this.pagesizeController = $(options.pagesizeController);
        this.pagesizeController.val(this.collection.pagesize);
        this.pagesizeController.on('change', _.bind(this.pagesize_changeHandler, this));
      }

      // 起止日期
      if ('ranger' in options) {
        if (!this.model.has('start')) {
          this.model.set(_.pick(options, 'start', 'end', 'dateFormat'), {silent: true});
        }
        this.$ranger.use(this.model);
      }

      // 删选器
      if ('filter' in options) {
        this.filter = new ns.table.Filter({
          el: options.filter,
          model: this.model,
          collection: this.collection
        });
      }

      // 桌面默认都固定表头
      if (document.body.clientWidth >= 768 && this.$el.closest('modal').length === 0 && typeahead) {
        this.header = new ns.table.FixedHeader({
          target: this
        });
      }

      if (autoFetch) {
        this.refresh(options);
      }
      this.options = options;
    },
    remove: function () {
      if (this.pagination) {
        this.pagination.remove();
      }
      if (this.pagesizeController) {
        this.pagesizeController.off('change');
      }
      if (this.ranger) {
        this.ranger.remove();
      }
      if (this.filter) {
        this.filter.remove();
      }
      if (this.header) {
        this.header.remove();
      }
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      ns.BaseList.prototype.remove.call(this);
    },
    render: function () {
      ns.BaseList.prototype.render.call(this);
      this.$context.trigger('table-rendered', this);
      this.trigger('table-rendered', this);
      // 排序
      if ('order' in this.model.changed || 'seq' in  this.model.changed) {
        var container = this.container;
        this.collection.each(function (model) {
          container.append(container.find('#' + model.id));
        });
      }
    },
    refresh: function (options) {
      options = options || {};
      options.data = _.extend(this.model.toJSON(), options.data);
      this.collection.fetch(options);
    },
    renderHeader: function () {
      // 排序
      var order = this.model.get('order')
        , seq = this.model.get('seq')
        , status = this.model.getTags()
        , labels = _.chain(status)
          .omit(function (value, key) {
            return key.match(/_label$/);
          })
          .map(function (value, key) {
            var attr = {key: key, value: value};
            if (status[key + '_label']) {
              attr['label'] = status[key + '_label'];
            }
            return filterLabel(attr);
          })
          .value();
      if (order) {
        this.$('.order').removeClass('active inverse');
        this.$('.order[href="#' + order + '"]').addClass('active').toggleClass('inverse', seq == 'desc');
      }
      this.$('.filters').append(labels.join(''));
    },
    saveModel: function (button, id, prop, value, options) {
      button.spinner();
      this.collection.get(id).save(prop, value, {
        patch: true,
        wait: true,
        context: this,
        success: function () {
          button.spinner(false);
          if (options && options.remove) {
            this.collection.remove(id, {fadeOut: true});
          }
        }
      });
    },
    archiveButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定归档么？';
      if (!confirm(msg)) {
        return;
      }
      var id = button.closest('tr').attr('id');
      this.saveModel(button, id, button.attr('name'), button.val(), {remove: true});
    },
    collection_syncHandler: function () {
      ns.BaseList.prototype.collection_syncHandler.call(this);
      this.model.waiting = false;
      if (this.options.amount) {
        var data = this.collection.getAmount(this.options.omits);
        this.$('.amount').remove();
        this.collection_addHandler(data, null, {immediately: true});
      }
    },
    deleteButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定删除么？';
      if (!confirm(msg)) {
        return;
      }
      var id = button.closest('tr').attr('id');
      button.spinner();
      this.collection.get(id).destroy({
        fadeOut: true,
        wait: true,
        error: function (model, xhr) {
          var response = 'responseJSON' in xhr ? xhr.responseJSON : xhr;
          button.spinner(false);
          alert(response.msg || '删除失败');
        }
      });
      event.preventDefault();
    },
    edit_clickHandler: function (event) {
      if (event.currentTarget.tagName.toLowerCase() === 'select') {
        return;
      }
      var target = $(event.currentTarget)
        , data = target.data()
        , index = target.closest('td').index()
        , prop = event.currentTarget.hash.substr(1)
        , id = target.closest('tr').attr('id')
        , model = this.collection.get(id)
        , options = _.extend({
          label: this.$('thead th').eq(index).text()
        }, data);
      options.type = data.type || 'short-text';
      this.$context.trigger('edit-model', model, prop, options);
      event.stopPropagation();
      event.preventDefault();
    },
    model_changeHandler: function (model, options) {
      options = _.omit(options, 'unset') || {};
      this.refresh(options);

      if ('start' in model.changed || 'end' in model.changed) {
        _.extend(this.collection.model.prototype.defaults, _.pick(model.changed, 'start', 'end'));
      }
      this.$el.addClass('loading');
      model.warting = true;
    },
    model_invalidHandler: function (model, error) {
      alert(error);
    },
    order_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , order = target.attr('href').substr(1);
      this.$('.order.active').not(target).removeClass('active inverse');
      target.toggleClass('inverse', target.hasClass('active') && !target.hasClass('inverse')).addClass('active');
      this.model.set({
        order: order,
        seq: target.hasClass('inverse') ? 'desc' : 'asc'
      }, {reset: true});
      event.preventDefault();
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      this.refresh();
    },
    select_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id');
      this.saveModel(target, id, target.attr('name'), target.val());
    },
    star_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id');
      this.saveModel(target.add(target.siblings('.star')), id, target.attr('name'), target.val());
    },
    statusButton_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , data = _.extend({active: 1, deactive: 0}, target.data())
        , value = target.prop('checked') ? data.active : data.deactive
        , id = target.closest('tr').attr('id')
        , button = $(target[0].labels).filter('.btn');
      this.saveModel(button, id, target.attr('name'), value);
    },
    tbodyFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , label = target.text()
        , path = target.attr('href').split('/').slice(-2)
        , hasFilter = this.model.has(path[0])
        , attr = {};
      attr[path[0]] = path[1];
      if (path[0] != label) {
        attr[path[0] + '_label'] = label;
      }
      this.model.set(attr, {reset: true});
      if (hasFilter) {
        this.$('.filters').find('[href="#/' + path[0] + '"]').replaceWith(target.clone());
      } else {
        this.$('.filters').append(target.clone());
      }
      event.preventDefault();
    },
    theadFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , path = target.attr('href').split('/').slice(-2);
      this.model.unset(path[0], {reset: true});
      target.remove();
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.Typeahead = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'focus .keyword': 'keyword_focusHandler',
      'change .result input': 'result_changeHandler',
      'click .options a': 'options_clickHandler',
      'keydown': 'keyDownHandler',
      'input': 'inputHandler'
    },
    initialize: function (options) {
      options = _.extend(options, this.$el.data());

      this.result = this.$('.result');
      this.list = this.$('.options');
      this.result_template = Handlebars.compile(this.result.find('script').html());
      this.list_template = Handlebars.compile(this.list.find('script').html().replace(/\s{2,}|\n|\r/g, ''));
      this.spinner = this.$('.fa-spinner');
      this.input = this.$('.keyword');

      this.collection = tp.model.ListCollection.getInstance(options);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.selected = new Backbone.Collection();
      this.selected.on('add', this.selected_addHandler, this);
      this.selected.on('remove', this.selected_removeHandler, this);
      this.fetch = _.bind(this.fetch, this);
      this.error = _.bind(this.errorHandler, this);
      this.hide = _.bind(this.hide, this);
      this.multiple = options.multiple;
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.selected.off();
      this.selected = null;
      Backbone.View.prototype.remove.call(this);
    },
    fetch: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = this.collection.fetch({
        data: {keyword: this.input.val()},
        reset: true,
        error: this.error
      });
      this.spinner.show();
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.list.hide();
      }
    },
    collection_syncHandler: function (collection) {
      var data = collection.toJSON()
        , html = this.list_template({list: data});
      html = html || this.list_template({
        error: true,
        msg: '没有结果，请修改关键词，然后再试。'
      });
      this.list.html(html).show();
      this.spinner.hide();
      this.input.focus();
      this.xhr = null;
    },
    keyword_blurHandler: function () {
      var list = this.list;
      this.hideTimeout = setTimeout(function () {
        list.hide();
      }, 250);
    },
    keyword_focusHandler: function () {
      clearTimeout(this.hideTimeout);
      if (this.collection.length > 0) {
        this.list.show();
      }
    },
    options_clickHandler: function (event) {
      var id = event.target.hash.substr(1);
      if (this.multiple) {
        this.selected.add(this.collection.get(id));
        this.input.focus();
      } else {
        this.selected.set([this.collection.get(id)]);
        this.list.hide();
      }
      event.preventDefault();
    },
    result_changeHandler: function (event) {
      var target = event.target;
      if (!target.checked) {
        var id = target.id.substr(9);
        this.selected.remove(id);
      }
    },
    selected_addHandler: function (model) {
      var html = this.result_template(model.toJSON());
      this.result.append(html);
    },
    selected_removeHandler: function (model) {
      var id = model.id;
      this.$('#selected-' + id + ',[for=selected-' + id + ']').remove();
    },
    errorHandler: function () {
      this.spinner.hide();
      this.list.append(this.list_template({
        error: true,
        msg: '加载错误，大侠请重新来过'
      }));
    },
    inputHandler: function () {
      clearTimeout(this.timeout);
      if (this.input.val().length > 1) {
        this.timeout = setTimeout(this.fetch, this.delay);
      }
    },
    keyDownHandler: function (event) {
      var active = this.list.find('.active').removeClass('active');
      switch (event.keyCode) {
        case 13: // enter
          var id = active.children().attr('href');
          if (id) {
            id = id.substr(1);
            if (this.multiple) {
              this.selected.add(this.collection.get(id));
            } else {
              this.selected.set([this.collection.get(id)]);
              this.list.hide();
            }
          } else if (!this.input.prop('disabled') && this.input.val().length > 1) {
            this.fetch();
          }
          event.preventDefault();
          break;

        case 40: // down
          this.list.show();
          if (active.length === 0 || active.is(':last-child')) {
            this.list.children().eq(0).addClass('active');
          } else {
            active.next().addClass('active');
          }
          event.preventDefault();
          break;

        case 38: // up
          this.list.show();
          if (active.length === 0 || active.is(':first-child')) {
            this.list.children().last().addClass('active');
          } else {
            active.prev().addClass('active');
          }
          event.preventDefault();
          break;

        case 27: // esc
          if (this.list.is(':visible')) {
            this.hide();
            event.stopPropagation();
          }
          break;
      }
    }
  });
}(Nervenet.createNameSpace('tp.component')));}());