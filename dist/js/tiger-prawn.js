"use strict";
(function () {
(function (b) {
  var sync = b.sync;

  // add withCredential
  b.sync = function (method, model, options) {
    options = options || {};

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
  var slice = Array.prototype.slice
    , pop = Array.prototype.pop;
  // 从后面给的值中挑出一个
  h.registerHelper('pick', function (value, array) {
    value = parseInt(value);
    array = _.isArray(array) || _.isObject(array) ? array : slice.call(arguments, 1, -1);
    return array[value];
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

  // 用来生成可读时间
  h.registerHelper('moment', function (value) {
    return value ? moment(value).calendar() : '';
  });
  h.registerHelper('from-now', function (value) {
    return value ? moment(value).fromNow() : '';
  });

  // 等于
  h.registerHelper('equal', function (value, target, options) {
    if (value == target) {
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
  m.DATE_FORMAT = 'YYYY-MM-DD';
  m.TIME_FORMAT = 'HH:mm:ss';
  m.defaultFormat = m.DATE_FORMAT + ' ' + m.TIME_FORMAT;
}(moment));;
(function () {
  var data = {}

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
;(function (ns) {
  ns.Base = Backbone.Router.extend({
    $body: null,
    $me: null,
    routes: {
      'user/:page': 'showUserPage',
      'dashboard': 'showDashboard'
    },
    showDashboard: function () {
      this.$body.load('page/dashboard.hbs', new tp.model.Dashboard());
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
      this.$body.setFramework('login');
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
      options = _.extend({
        url: url,
        data: data
      }, defaults, options);
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
      $.ajax(options);
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
        var collection = tp.model.ListCollection.getInstance(options)
        options.model = collection.get(options.id);
      }
      if (target.tagName.toLowerCase() === 'a') {
        options.content = target.href;
        options.isRemote = true;
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
;(function (ns) {
  function callPopup(model, prop, options) {
    options.model = model;
    options.prop = prop;
    tp.popup.Manager.popupEditor(options);
  }

  ns.editModelCommand = function (model, prop, options) {
    options = _.extend({}, options);
    options.value = model.get(prop);
    callPopup(model, prop, options);
  }
}(Nervenet.createNameSpace('tp.controller')));;
(function (ns) {
  ns.addModelCommand = function (options) {
    var collection = tp.model.ListCollection.getInstance(options)
      , model = new collection.model(null, options);
    options.isRemote = true;
    options.content = 'page/' + options.template;
    model.options = collection.options;
    model.urlRoot = collection.url;
    model.key = collection.key;
    options.model = model;
    var popup = tp.popup.Manager.popup(options);
    popup.on('success', function () {
      collection.add(model, {
        immediately: true,
        prepend: true,
        merge: true
      });
    });
  };
}(Nervenet.createNameSpace('tp.controller')));;
(function (ns) {
  var OWNER = 'ad_owner'
    , CONFIRM_MSG = '您刚刚上传的包和之前的报名不同，可能有误。您确定要保存么？';

  ns.AD = Backbone.Model.extend({
    defaults: {
      ad_app_type: 1,
      ad_type: 0,
      cate: 0,
      cpc_cpa: 'cpa',
      put_net: 0,
      province_type: 0,
      put_jb: 0,
      put_ipad: 0,
      net_type: 0,
      down_type: 0,
      feedback: 2,
      cycle: 2
    },
    urlRoot: tp.API + 'ad/',
    initialize: function () {
      if (this.isNew()) {
        this.isEmpty = true;
        this.urlRoot += 'init';
        this.on('sync', this.syncHandler, this);
      }
    },
    parse: function (response, options) {
      if (response.options) {
        this.options = response.options;
        this.options.API = tp.API;
        this.options.UPLOAD = tp.UPLOAD;
      }
      var has_ad = response.ad && _.isObject(response.ad);
      if (has_ad && !response.ad.owner) {
        response.ad.owner = Number(localStorage.getItem(OWNER));
      }
      return has_ad ? response.ad : response;
    },
    save: function (key, value, options) {
      if (key === 'owner' && value) {
        localStorage.setItem(OWNER, value);
      }
      if (key.owner) {
        localStorage.setItem(OWNER, key.owner);
      }
      return Backbone.Model.prototype.save.call(this, key, value, options);
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
      return _.extend(json, this.options);
    },
    validate: function (attrs) {
      var pack_name = this.get('pack_name');
      if (pack_name && attrs.pack_name !== pack_name && !confirm(CONFIRM_MSG)) {
        return '新包名与之前不一致，请检查后重新上传。';
      }
    },
    syncHandler: function () {
      if ('id' in this.changed) {
        location.hash = '#/ad/' + this.id;
        this.urlRoot = tp.API + 'ad/';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.Dashboard = Backbone.Model.extend({
    className: 'dashboard',
    url: tp.API + 'dashboard/',
    parse: function (resposne) {
      if ('record' in resposne.data) {
        _.each(resposne.data.record, function (item, i) {
          item.is_checked = item.status < 2;
        });
      }
      return resposne.data;
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.Me = Backbone.Model.extend({
    $body: null,
    url: tp.API + 'user/',
    initialize: function () {
      this.on('change:id', this.id_changeHandler, this);
    },
    fetch: function (options) {
      Backbone.Model.prototype.fetch.call(this, _.extend({
        error: _.bind(this.onError, this)
      }, options));
    },
    parse: function (response) {
      return response.me;
    },
    id_changeHandler: function (model, id) {
      if (id) {
        this.$body.start(true);
        tp.notification.Manager.start();
        var route;
        if (!Backbone.History.started) {
          route = Backbone.history.start({
            root: tp.BASE
          });
        }
        if (!route || /^#\/user\/\w+$/.test(location.hash)) {
          var from = localStorage.getItem(tp.PROJECT + '-from');
          from = from === '#/user/login' ? '' : from;
          location.hash = from || tp.startPage || '#/dashboard';
        }
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
;(function (ns) {var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response, options) {
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
    , Collection = ns.ListCollection = Backbone.Collection.extend({
      total: 0,
      pagesize: 10,
      isLoading: false,
      initialize: function(models, options) {
        this.key = options.key || 'data';
        this.save = tp.PROJECT + location.hash + '-pagesize';
        Backbone.Collection.prototype.initialize.call(this, models, options);
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
      parse: function (response) {
        this.isLoading = false;
        this.total = _.isArray(response) ? response.length : response.total;
        if (response.options) {
          this.options = response.options;
        }
        for (var key in _.omit(response, 'total', 'list', 'options', 'code', 'msg')) {
          if (response.hasOwnProperty(key) && _.isArray(response[key])) {
            this.trigger('data:' + key, response[key]);
          }
        }
        return _.isArray(response) ? response : response.list;
      },
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(this.save, size);
      }
    });

  Collection.getInstance = function (options) {
    if (options.collectionId && options.collectionId in collections) {
      return collections[options.collectionId];
    }

    var params = _.extend({}, options);
    if (!params.model || !(params.model instanceof Backbone.Model)) {
      var init = _.pick(params, 'idAttribute', 'defaults');
      params.model = _.isEmpty(init) ? Model : Model.extend(init);
    }
    var collection = new Collection(null, params);
    if (options.collectionId) {
      collections[options.collectionId] = collection;
    }
    return collection;
  };
  Collection.destroyInstance = function (id) {
    if (id in collections) {
      delete collections[id];
    }
  }
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  var TIMEOUT = 60000
    , autoNext = false; // 60s取一次

  ns.Notice = Backbone.Collection.extend({
    latest: 0,
    url: tp.API + 'notice/',
    initialize: function () {
      this.on('sync', this.syncHandler, this);
      this.fetch = _.bind(this.fetch, this);
    },
    fetch: function (options) {
      autoNext = true;
      options = _.extend({
        data: {
          latest: this.latest
        },
        remove: false
      }, options);
      Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function (response) {
      for (var i = 0, len = response.list.length; i < len; i++) {
        response.list[i].create_time = response.list[i].create_time.substr(5, 11);
        this.latest = response.list[i].id > this.latest ? response.list[i].id : this.latest;
      }
      return response.list;
    },
    stop: function () {
      autoNext = false;
      clearTimeout(TIMEOUT);
    },
    syncHandler: function () {
      if (autoNext) {
        setTimeout(this.fetch, TIMEOUT);
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.TableMemento = Backbone.Model.extend({
    waiting: false,
    initialize: function () {
      this.key = tp.PROJECT + location.hash;
      var storage = localStorage.getItem(this.key);
      if (storage) {
        storage = JSON.parse(storage);
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
    validate: function (attr, options) {
      if (this.waiting || ('ignore' in options && !options.ignore)) {
        return '表格正在更新数据，请稍候。';
      }
    },
    changeHandler: function () {
      localStorage.setItem(this.key, JSON.stringify(this.omit('page', 'keyword')));
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.Detail = Backbone.Model.extend({
      parse: function (response, options) {
        if (response.options) {
          this.options = response.options;
          this.options.API = tp.API;
          this.options.UPLOAD = tp.UPLOAD;
        }
        return response.list;
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
        return _.extend(json, this.options);
      }
    }
  );
}(Nervenet.createNameSpace('tp.model')));;
;(function (ns) {
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
      if (this.count > 2) {
        this.count++;
        return;
      } else {
        this.fragment.push(this.template(model.toJSON()));
        this.count++;
      }
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        if (this.count > 3) {
          this.fragment[2] = this.template({number: this.count - 2});
        }
        this.$el.append(this.fragment.join(''));
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
        notification.requestPermission();
      }
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    createDesktopNotice: function () {
      if (document[hidden] && notification.permission === 'granted') {
        new notification('点乐自助平台通知', {
          icon: 'img/fav.png',
          body: '收到' + this.count + '条通知，请及时处理哟。'
        });
      }
    },
    start: function () {
      this.collection.fetch();
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

  var collection = new tp.model.Notice()
    , panel = new ns.Panel({
      el: '.system-notice',
      collection: collection
    })
    , growl = new ns.Growl({
      el: '#growl',
      collection: collection
    });

  if (tp.NOTICE_KEY) {
    ns.Manager = new Manager({
      collection: collection
    });
  }
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
    $router: null,
    uploaders: [],
    events: {
      "blur input,textarea": "input_blurHandler",
      'focus input': 'input_focusHandler',
      'submit': 'submitHandler',
      'data': 'dataHandler',
      'click .collapsible legend': 'legend_clickHandler'
    },
    initialize: function () {
      this.submit = this.getSubmit();
      if (this.model instanceof Backbone.Model) {
        this.model.on('invalid', this.model_invalidHandler, this);
      }
      this.initUploader();
    },
    remove: function () {
      this.model.off(null, null, this);
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
    initUploader: function () {
      var id = this.model ? this.model.id : null
        , self = this
        , collection = this.uploaders;
      this.$('.uploader').each(function () {
        var options = $(this).data();
        if (id) {
          options.data = {id: id};
        }
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
    },
    useData: function (data) {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) {
          return;
        }
        var value = data[key];
        if (_.isArray(value)) {
          this.$('[name="' + key +'[]"]').each(function () {
            this.checked = value.indexOf(this.value) !== -1;
          });
          continue;
        }
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
      smart.recordHistory(this.el);
      this.$el.trigger('success');
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
      if (action.indexOf('#') !== -1) {
        action = action.substr(action.indexOf('#'));
        action = action.replace(/\/:(\w+)/g, function(str, key) {
          return '/' + form.elements[key].value;
        });
        location.href = action;
        event.preventDefault();
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
            , value = isNaN(element.value) ? element.value : Number(element.value);
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
            , value = isNumber ? Number(this.value) : this.value;
          value = this.checked ? value : !value;
          attr[this.name] = isNumber ? Number(value) : value;
        });
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
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.BaseList = Backbone.View.extend({
    fragment: '',
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ''));
      this.container = options.container ? this.$(options.container) : this.$el;
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
    },
    remove: function () {
      this.collection.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').hide();
      this.container.append(this.fragment);
      this.fragment = '';
      this.$el.removeClass('loading');
    },
    collection_addHandler: function (model, collection, options) {
      this.fragment += this.template(model.toJSON());
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
    events: {
      'click .fetch-button': 'fetchButton_clickHandler',
      'change [name]': 'input_changeHandler'
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
      this.$('.fetch-button').prop('disabled', false)
        .find('i').removeClass('fa-spin fa-spinner');
      this.$('[name=ad_url]').prop('disabled', false);
    },
    fetchFile_errorHandler: function (response) {
      console.log(response);
      alert(response.msg);
    },
    input_changeHandler: function (event) {
      event.target.value = event.target.value.replace(/\s/g, '');
      var has_url = this.validate(event.target.value);
      this.$('.fetch-button')
        .toggleClass('btn-warning', has_url)
        .prop('disabled', !has_url);
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  var DATE_FORMAT = 'YYYY-MM-DD';

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

  ns.Ranger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function (options) {
      this.$('[type=date]').datetimepicker({format: DATE_FORMAT});
      var range = this.render(options);
      this.trigger(range, {silent: true});
    },
    render: function (options) {
      // 默认显示一个月
      var range = _.extend({
        start: -31,
        end: 0
      }, _.pick(options, 'start', 'end'));

      var reg = /^\d{4}-\d{2}-\d{2}$/;
      if (!(reg.test(range.start) && reg.test(range.end))) {
        range.start = moment().add(range.start, 'days').format(DATE_FORMAT);
        range.end = moment().add(range.end, 'days').format(DATE_FORMAT);
      }

      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
      return range;
    },
    remove: function () {
      this.stopListening();
      this.el = this.$el = this.model = null;
      return this;
    },
    trigger: function (range, options) {
      options = options || {};
      options.reset = true;
      this.model.set(range, options);
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

  ns.Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    initialize: function () {
      this.$el.val(this.model.get('keyword'));
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.collection = this.model = null;
      Backbone.View.prototype.remove.call(this);
    },
    collection_syncHandler: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        this.model.unset('keyword', {silent: true}); // 这次搜索之前要先把关键字删掉，保证触发change
        this.model.set({
          keyword: event.target.value,
          page: 0
        });
        this.$el.prop('readonly', true);
        this.spinner = this.spinner || $(tp.component.spinner);
        this.spinner.insertAfter(this.$el);
        tp.component.SmartForm.recordHistory('keyword', event.target.value);
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
        this.$('[name=' + prop + ']').val(data[prop]);
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
    },
    model_changeHandler: function () {
      this.$('select').prop('disabled', true);
    },
    changeHandler: function (event) {
      var target = event.target
        , name = target.name
        , value = target.value;
      this.model.set(name, value, {
        reset: true
      });
      $(target).after(spinner);
    }
  });
}(Nervenet.createNameSpace('tp.component.table')));;
(function (ns) {
  ns.CollectionSelect = ns.BaseList.extend({
    initialize: function (options) {
      var init = this.$el.data();
      this.collection = tp.model.ListCollection.getInstance(init);
      ns.BaseList.prototype.initialize.call(this, options);

      if (this.collection.length) {
        this.collection_resetHandler();
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
;(function (ns) {
  ns.Manager = {
    $context: null,
    map: {
      '.smart-table': 'tp.component.SmartTable',
      '.add-on-list': 'tp.component.AddOnList',
      '.collection-select': 'tp.component.CollectionSelect',
      '.morris-chart': 'tp.component.MorrisChart',
      '#login-form': 'tp.component.LoginForm',
      'form': 'tp.component.SmartForm'
    },
    check: function ($el, mediator) {
      var components = [];
      $el.data('components', components);

      var dateFields = $el.find('.datetimepicker');
      if (dateFields.length) {
        dateFields.each(function () {
          $(this).datetimepicker($(this).data());
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
          var init = {
            model: mediator
          };
          var component = Nervenet.parseNamespace(this.map[selector]);
          if (component) {
            dom.each(function () {
              init.el = this;
              components.push(self.$context.createInstance(component, init));
            });
          } else {
            this.loadMediatorClass(components, this.map[selector], init, dom); // mediator pattern
          }
        }
      }
      // 初始化非本库的自定义组件
      $el.find('[data-mediator-class]').each(function () {
        var className = $(this).data('mediator-class')
          , component = Nervenet.parseNamespace(className)
          , init = {
            model: mediator
          };
        if (component) {
          init.el = this;
          components.push(self.$context.createInstance(component, init));
        } else {
          self.loadMediatorClass(components, className, init, $(this));
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
    loadMediatorClass: function (components, className, init, dom) {
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
        dom.each(function () {
          init.el = this;
          components.push(self.$context.createInstance(component, init));
        });
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
      this.options = options;
      this.$el.modal(options);
    },
    remove: function () {
      clearTimeout(timeout);
      this.options = null;
      this.off();
      Backbone.View.prototype.remove.call(this);
    },
    hide: function () {
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, 3000);
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
    form_successHandler: function () {
      this.hide();
      this.trigger('success');
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
      this.trigger('confirm', this);
    },
    template_loadedHandler: function (response) {
      this.template = Handlebars.compile(response);
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
;(function (ns) {
  var timeout;
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

      html = this.$('.item-grid').html();
      if (html) {
        this.template = Handlebars.compile(html);
        this.$('.item-grid').empty();
      }

      var dateFields = this.$('[type=datetime]');
      if (dateFields.length) {
        dateFields.each(function () {
          $(this).datetimepicker($(this).data());
        });
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
      this.$el.remove();
      this.trigger('hidden');
    }
  });

  ns.SearchEditor = Editor.extend({
    fragment: '',
    events: _.extend(Editor.prototype.events, {
      'click .search-button': 'searchButton_clickHandler'
    }),
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
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
      this.$('[type=search], .search-button').prop('disabled', true);
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_syncHandler: function () {
      this.$('.search-result').html(this.fragment + '<hr />');
      this.$('[type=search], .search-button').prop('disabled', false);
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
      this.$('.item-grid').html(this.template({value: this.collection.toJSON()}));
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
        options.items = options.value.split(',');
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
        this.model.fetch();
      } else {
        this.isModelReady = true;
      }

      $.get(options.template, _.bind(this.template_getHandler, this), 'html');

      if ('fresh' in options) {
        this.fresh = options.fresh;
      }
    },
    render: function () {
      this.$el.html(this.template(this.model instanceof Backbone.Model ? this.model.toJSON() : this.model));
      if (this.fresh) {
        this.fresh = false;
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
        this.$('[href=#' + id + '][data-toggle]').click();
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
;(function (ns) {
  ns.Body = Backbone.View.extend({
    $context: null,
    events: {
      'change [type=range]': 'range_changeHandler',
      'click .add-button': 'addButton_clickHandler',
      'click .refresh-button': 'refreshButton_clickHandler'
    },
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loading = this.$('#page-loading').remove().removeClass('hide');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.model.on('change:fullname', this.model_nameChangeHandler, this);
      this.$el.popover({
        selector: '[data-toggle=popover]'
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
      this.template = this.template || Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default'
        , template = this.template;
      $.getJSON('page/sidebar/' + role + '.json', function (response) {
        var html = template({list: response});
        $('#navbar-side-inner').append(html);
      });
    },
    load: function (url, data, options) {
      options = options || {};
      this.clear();
      this.$el.toggleClass('full-page', !!options.isFull)
        .removeClass(this.lastClass);

      // html or hbs
      if (/.hbs$/.test(url)) {
        var klass = options.loader || tp.view.Loader
          , page = this.page = this.$context.createInstance(klass, _.extend({
            template: url,
            model: data
          }, options));
        this.container.html(page.$el);
        page.once('complete', this.page_loadCompleteHandler, this);
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
      if (model instanceof Backbone.Model) {
        model.once('sync', function () {
          this.setTitle(title, sub, model);
        }, this);
        return this;
      } else {
        return this.setTitle(title, sub, model);
      }
    },
    setTitle: function (title, sub, model) {
      if (model) {
        model = model instanceof Backbone.Model ? model.toJSON() : model;
        title = Handlebars.compile(title)(model);
        sub = Handlebars.compile(sub)(model);
      }
      title = title + (sub ? ' <small>' + sub + '</small>' : '');
      this.$('#content > .page-header > h1').html(title);
      return this;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.createSidebar();
        this.$el.removeClass('full-page')
          .find('.login').remove();
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
    model_nameChangeHandler: function (model, name) {
      this.$('.username').html(name);
    },
    range_changeHandler: function (event) {
      $(event.target).next().html(event.target.value);
    },
    refreshButton_clickHandler: function (event) {
      Backbone.history.loadUrl(Backbone.history.fragment);
      event.preventDefault();
    },
    page_loadCompleteHandler: function () {
      this.loading.remove();
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
;(function (ns) {
  var IOS_PREFIX = 'itms-apps://'
    , option_template = '{{#each list}}<option value="{{id}}">{{channel}} {{ad_name}} {{cid}}</option>{{/each}}'
    , omit = ['ad_url', 'ad_lib', 'ad_size', 'id'];
  
  ns.AdEditor = tp.view.Loader.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'change [name=ad_name]': 'adName_changeHandler',
      'change [name=ad_app_type]': 'platform_changeHandler',
      'change [name=search_flag]': 'searchFlag_changeHandler',
      'change .ad-source-list': 'adSource_changeHandler',
      'change #replace-ad': 'replaceAD_changeHandler',
      'change .domestic input': 'area_changeHandler',
      'change .isp input': 'isp_changeHandler',
      'change #feedback': 'feedback_changeHandler',
      'change #app-uploader [name=ad_url]': 'adURL_changeHandler',
      'click .search-ad-button': 'searchADButton_clickHandler',
      'click .search-channel-button': 'searchChannelButton_clickHandler',
      'keydown .channel-keyword': 'channelKeyword_keyDownHandler'
    },
    render: function () {
      tp.view.Loader.prototype.render.call(this);

      this.channels = tp.model.ListCollection.getInstance({
        collectionId: 'channel',
        url: tp.API + 'channel/',
        key: 'channel'
      });
      this.channels.options = {
        channel_types: this.model.options.channel_types,
        relativeSales: this.model.options.relativeSales
      };
      this.channels.reset(this.model.options.channels);
      this.channels.on('reset', function () {
        this.$('.channel').find('input').prop('disabled', false);
        this.$('.search-channel-button').spinner(false);
      }, this);

      var init = this.model.pick(_.keys(this.model.defaults))
        , form = this.$('form');
      setTimeout(function () {
        form.trigger('data', init);
      }, 50);
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
      this.channels.off();
      this.channels = null;
    },
    checkADURL: function (value) {
      if (/\.ipa$/.test(value) || /itunes.apple.com/.test(value)) {
        this.$('input[name=ad_app_type][value=2]').prop('checked', true);
        return;
      }
      if (/\.apk$/.test(value)) {
        this.$('input[name=ad_app_type][value=1]').prop('checked', true);
      }
    },
    searchChannel: function () {
      var keyword = $.trim(this.$('.channel-keyword').val());
      if (!keyword) {
        return false;
      }
      this.$('.channel').find('input').prop('disabled', true);
      this.$('.search-channel-button').spinner();
      this.channels.fetch({
        data: {keyword: keyword},
        reset: true
      });
    },
    adName_changeHandler: function (event) {
      this.$('.search-ad-button').prop('disabled', !event.target.value);
    },
    adSource_changeHandler: function (event) {
      var list = $(event.target).data('list')
        , data = _.omit(list[event.target.selectedIndex], omit);
      this.$('form').trigger('data', data);
    },
    adURL_blurHandler: function (event) {
      if (this.$el.hasClass('iPhone') && event.target.value.substr(0, 12) !== IOS_PREFIX) {
        event.target.value = event.target.value.replace(/^https?:\/\//i, IOS_PREFIX);
      }
    },
    // 根据内容选择平台
    adURL_changeHandler: function (event) {
      this.checkADURL(event.target.value);
    },
    area_changeHandler: function (event) {
      var target = $(event.target);
      this.$el.toggleClass(target.data('class'), target.val() === '1');
    },
    channelKeyword_keyDownHandler: function (event) {
      if (event.keyCode === 13) {
        this.searchChannel();
        event.preventDefault();
      }
    },
    feedback_changeHandler: function (event) {
      this.$el.toggleClass('show-feedback-detail', event.target.value === '2' || event.target.value === '3');
    },
    fetchAD_errorHandler: function (xhr, status, err) {
      alert('加载已有广告失败');
      this.$('#replace-ad').prop('disabled', false)
        .next().removeClass('spin');
    },
    fetchAD_successHandler: function (response) {
      var template = Handlebars.compile(option_template)
        , options = template(response);
      this.hasAD = true;
      this.$('[name=replace-with]')
        .data('list', response.list)
        .html(options);
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', false);
      this.$('#replace-ad').next().removeClass('spin');
      this.$('form').trigger('data', _.omit(response.list[0], omit));
    },
    isp_changeHandler: function (event) {
      var target = $(event.target)
        , value = event.target.value
        , checked = event.target.checked;
      if (checked) { // 选中
        if (value === '0') { // 选中了全部
          target.siblings().prop('checked', false);
        } else { // 选中了某个ISP
          target.siblings().first().prop('checked', false);
        }
      } else { // 取消选中
        if (value === '0') {
          target.siblings().prop('checked', true);
        } else if (target.siblings().filter(':checked').length === 0) {
          target.siblings().first().prop('checked', true);
        }
      }
    },
    platform_changeHandler: function (event) {
      this.$('form')
        .removeClass('Android iPhone')
        .addClass(event.target.labels[0].innerText);
      var is_ios = event.target.value === '2';
      this.$('#process_name').prop('required', is_ios);
      $('#feedback').val(function () { return is_ios ? 4 : this.value});
      $('#app-uploader').data('accept', is_ios ? '*.ipa' : '*.apk');
    },
    replaceAD_changeHandler: function (event) {
      var replace = event.target.checked
        , pack_name = this.model.get('pack_name') || this.$('[name=pack_name]').val();
      if (replace && !pack_name) {
        alert('包名未知，请先上传安装包，或填写包名');
        event.target.checked = false;
        return;
      }
      if (replace && !this.hasAD) {
        tp.service.Manager.call(tp.API + 'ad/', {
          pack_name: pack_name,
          status: 0
        }, {
          success: this.fetchAD_successHandler,
          error: this.fetchAD_errorHandler,
          context: this,
          method: 'get'
        });
        this.$('#replace-time').datetimepicker({
          format: 'YYYY-MM-DD HH:mm'
        });
        event.target.disabled = true;
        $(event.target).next().addClass('spin');
        return;
      }
      this.$('[name=replace-with],#replace-time').prop('disabled', !replace);
    },
    searchAD_errorHandler: function () {
      alert('未找到符合广告名的广告');
      this.$('.search-ad-button').spinner(false);
    },
    searchAD_successHandler: function (response) {
      var template = Handlebars.compile(option_template)
        , data = _.omit(response.list[0], omit);
      this.$('.ad-list-container').slideDown()
        .find('select')
          .html(template(response))
          .data('list', response.list);
      this.$('form').trigger('data', data);
      this.$('.search-ad-button').spinner(false);
    },
    searchADButton_clickHandler: function () {
      var ad_name = this.$('[name=ad_name]').val();
      tp.service.Manager.call(tp.API + 'ad_basic/', {
        ad_name: ad_name
      }, {
        success: this.searchAD_successHandler,
        error: this.searchAD_errorHandler,
        context: this,
        method: 'get'
      });
      this.$('.search-ad-button').spinner();
    },
    searchChannelButton_clickHandler: function () {
      this.searchChannel();
    },
    searchFlag_changeHandler: function (event) {
      this.$('.aso').toggle(event.target.value === '1');
    }
  });
}(Nervenet.createNameSpace('tp.page')));
;
(function (ns) {
  var FORMAT = 'YYYY-MM-DD';
  ns.DateRange = tp.popup.Base.extend({
    events: _.extend(tp.popup.Base.prototype.events, {
      'dp.change input[name="start-date"]': 'startDate_changeHandler',
      'dp.change input[name="end-date"]': 'endDate_changeHandler'
    }),
    onLoadComplete: function (response) {
      tp.popup.Base.prototype.onLoadComplete.call(this, response);
      var start = $('input[name="start-date"]');
      this.setMaxDate(start, moment());
    },
    startDate_changeHandler: function (event) {
      var startDate = event.date,
          start = $('input[name="start-date"]'),
          end = $('input[name="end-date"]');
      var result = this.getDateFromStart(end.val(), startDate.format(FORMAT));
      end.val(result);
      this.setEndDateRange(startDate, startDate.clone().add(6, 'days'));
    },
    endDate_changeHandler: function(event) {
      var start = $('input[name="start-date"]'),
          end = $('input[name="end-date"]'),
          endDate = event.date;
      var result = this.getDateFromEnd(start.val(), endDate.format(FORMAT));
      start.val(result);
      this.setEndDateRange(moment(result), moment(result).add(6, 'days'));
    },
    setMinDate: function (elem, date) {
      elem.data("DateTimePicker").minDate(date);
    },
    setMaxDate: function (elem, date) {
      elem.data("DateTimePicker").maxDate(date);
    },
    setEndDateRange: function (start, end) {
      var endElem = $('input[name="end-date"]');
      try {
        this.setMinDate(endElem, start);
        this.setMaxDate(endElem, end);
      } catch (e) {
        this.setMaxDate(endElem, end);
        this.setMinDate(endElem, start);
      }
    },
    getDateFromEnd: function (current, end) {
      var min = current
        , max = moment(current).add(6, 'days').format(FORMAT);
      if (end >= min && end <= max) {
        return current;
      } else if (end < min) {
        return end;
      } else if (end > max) {
        return end;
      }
    },
    getDateFromStart: function (current, start) {
      var min = moment(current).subtract(6, 'days').format(FORMAT),
          max = current;
      if (start < min) {
        return moment(start).add(6,'days').format(FORMAT);
      } else if (start >= min && start <= max) {
        return current;
      } else if (start > max) {
        return moment(start).add(6,'days').format(FORMAT);
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));
;
(function (ns) {
  ns.AddOnList = ns.BaseList.extend({
    initialize: function (options) {
      options = _.extend({
        container: 'tbody'
      }, options);
      this.collection = new Backbone.Collection();
      ns.BaseList.prototype.initialize.call(this, options);

      var id = this.$el.data('collection-id')
        , key = this.$el.data('key')
        , collection = tp.model.ListCollection.getInstance({
          collectionId: id
        });
      collection.on('data:' + key, this.collection_dataHandler, this);
    },
    collection_dataHandler: function (list) {
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
    initialize: function (options) {
      var init = this.$el.data();
      options = _.extend({
        autoFetch: true
      }, options, init);
      if (options.url) {
        this.collection = tp.model.ListCollection.getInstance(options);
        this.collection.on('sync reset', this.collection_fetchHandler, this);
        this.createOptions(options);
        if (options.autoFetch) {
          this.collection.fetch();
        }
      } else {
        var data = this.$('script');
        if (data.length) {
          var chartData = JSON.parse(data.remove().html().replace(/,\s?]/, ']'));
          if (chartData.data.length) {
            this.createOptions(options, chartData);
            this.drawChart();
            return;
          }
        }
        this.showEmpty();
      }
    },
    createOptions: function (options, chartData) {
      options = _.extend({
        element: this.el,
        lineWidth: 2
      }, options, chartData);
      this.className = 'type' in options ? options.type.charAt(0).toUpperCase() + options.type.substr(1) : 'Line';
      if ('colors' in options) {
        options.colors = options.lineColors = options.barColors = options.colors.split(',');
      } else {
        options.colors = options.lineColors = options.barColors = this.$colors;
      }
      if (this.className === 'Donut') {
        options.formatter = function (y, data) {
          return 'percent' in data ? y + '(' + data.percent + '%)' : y;
        }
      }
      if (!_.isArray(options.ykeys)) {
        options.ykeys = [options.ykeys];
      }
      if (!_.isArray(options.labels)) {
        options.labels = [options.labels];
      }
      this.options = options;
    },
    drawChart: function () {
      this.$('.fa-spin').remove();
      this.chart = new Morris[this.className](this.options);
    },
    showEmpty: function () {
      this.$el.addClass('empty').text('（无数据）');
    },
    collection_fetchHandler: function (collection) {
      if (collection.length === 0) {
        this.showEmpty();
      }
      this.options.data = collection.toJSON();
      this.drawChart();
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
;(function (ns) {var init = {
    events: {
      'change .auto-submit': 'autoSubmit_Handler',
      'click .add-row-button': 'addRowButton_clickHandler'
    },
    initialize: function () {
      var cid = this.$el.data('collection-id');
      if (cid) {
        this.collection = tp.model.ListCollection.createInstance(null, {
          id: cid
        });
      }

      this.render();
    },
    render: function () {
      this.$('.keyword-form').find('[name=query]').val(this.model.get('keyword'));
    },
    addRowButton_clickHandler: function (event) {
      this.collection.add({});
      event.preventDefault();
    },
    autoSubmit_Handler: function (event) {
      $(event.currentTarget).closest('form').submit();
    }
  };
  ns.SmartNavbar = Backbone.View.extend(init);
}(Nervenet.createNameSpace('tp.component')));
;
(function (ns) {
  var filterLabel = Handlebars.compile('<a href="#/{{key}}/{{value}}" class="filter label label-{{key}}">{{value}}</a>');

  ns.SmartTable = ns.BaseList.extend({
    $context: null,
    events: {
      'click .add-row-button': 'addRowButton_clickHandler',
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
      var init = this.$el.data();
      init.url = init.url.replace('{{API}}', tp.API);
      options = _.extend({
        pagesize: 10,
        autoFetch: true
      }, options, init);

      // 可能会从别的地方带来model
      options.model = init.model ? Nervenet.parseNamespace(init.model) : null;
      // 特定的过滤器
      this.params = tp.utils.decodeURLParam(init.params);

      if (options.start || options.end) {
        options.defaults = _.pick(options, 'start', 'end');
      }
      this.collection = tp.model.ListCollection.getInstance(options);
      ns.BaseList.prototype.initialize.call(this, {container: 'tbody'});

      // 通过页面中介来实现翻页等功能
      this.model = this.model && this.model instanceof tp.model.TableMemento ? this.model : new tp.model.TableMemento();
      this.model.on('change', this.model_changeHandler, this);
      this.model.on('invalid', this.model_invalidHandler, this);
      this.renderHeader();

      // 启用搜索
      if ('search' in init) {
        this.search = new ns.table.Search({
          el: init.search,
          model: this.model,
          collection: this.collection
        });
      }

      // 翻页
      if ('pagesize' in init && init.pagesize > 0) {
        this.pagination = new ns.table.Pager(_.extend({}, options, {
          el: 'pagination' in init ? init.pagination : '.pager',
          model: this.model,
          collection: this.collection
        }));
      }

      // 调整每页数量
      if ('pagesizeController' in init) {
        this.pagesizeController = $(init.pagesizeController);
        this.pagesizeController.val(this.collection.pagesize);
        this.pagesizeController.on('change', _.bind(this.pagesize_changeHandler, this));
      }

      // 起止日期
      if ('ranger' in init) {
        this.ranger = new ns.table.Ranger(_.extend({}, options, {
          el: init.ranger,
          model: this.model
        }));
      }

      // 删选器
      if ('filter' in init) {
        this.filter = new ns.table.Filter({
          el: init.filter,
          model: this.model,
          collection: this.collection
        });
      }

      if (options.autoFetch) {
        this.collection.fetch({
          data: _.extend(this.model.toJSON(), this.params)
        });
      }
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
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      ns.BaseList.prototype.remove.call(this);
    },
    render: function () {
      ns.BaseList.prototype.render.call(this);
      this.$context.trigger('table-rendered', this);
      // 排序
      if ('order' in this.model.changed || 'seq' in  this.model.changed) {
        var container = this.container;
        this.collection.each(function (model) {
          container.append(container.find('#' + model.id));
        });
      }
    },
    renderHeader: function () {
      // 排序
      var order = this.model.get('order')
        , seq = this.model.get('seq')
        , status = this.model.omit('keyword', 'order', 'seq')
        , labels = '';
      if (order) {
        this.$('.order').removeClass('active inverse');
        this.$('.order[href=#' + order + ']').addClass('active').toggleClass('inverse', seq == 'desc');
      }
      _.each(status, function (value, key) {
        labels += filterLabel({key: key, value: value});
      });
      this.$('.filters').append(labels);
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
    addRowButton_clickHandler: function (event) {
      var prepend = $(event.currentTarget).data('prepend');
      this.collection.add(null, {
        immediately: true,
        prepend: !!prepend
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
          console.log(response.msg);
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
      options.data = _.extend(model.toJSON(), this.params);
      _.extend(this.collection.model.prototype.defaults, _.pick(model.changed, 'start', 'end'));
      this.collection.fetch(options);
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
      });
      event.preventDefault();
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      this.collection.fetch({data: _.extend(this.model.toJSON(), this.params)});
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
        , id = target.closest('tr').attr('id');
      this.saveModel(target, id, target.attr('name'), value);
    },
    tbodyFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , path = target.attr('href').split('/').slice(-2)
        , hasFilter = this.model.has(path[0]);
      this.model.set(path[0], path[1]);
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
      this.model.unset(path[0]);
      target.remove();
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component')));}());