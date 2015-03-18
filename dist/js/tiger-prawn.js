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
    return value ? value.substr(start, length) : '';
  });

  // text-collapse
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

  // 用来生成可读时间
  h.registerHelper('moment', function (value) {
    return value ? moment(value).calendar() : '';
  });
  h.registerHelper('from-now', function (value) {
    return value ? moment(value).fromNow() : '';
  })
}(Handlebars));
;
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
      tp.config.login.api = this.$me.url;
      this.$body.load('page/' + page + '.hbs', tp.config.login, {
        isFull: true
      });
      this.$body.setFramework('login');
    }
  });
}(Nervenet.createNameSpace('tp.router')));;
(function (ns) {
  ns.AD = Backbone.Router.extend({
    $body: null,
    routes: {
      "ad(/)": "list",
      "ad/create": "create",
      "ad/:id": "edit",
      "apply/(:id)": "listApplies",
      "info/(:query)": "showHistoryInfo"
    },
    create: function () {
      var model = new tp.model.AD();
      this.$body
        .load('page/ad/edit.hbs', model, {
          className: 'ad ad-new Android',
          loader: tp.page.AdEditor
        })
        .setFramework('ad ad-new', '创建广告');
    },
    edit: function (id) {
      var model = new tp.model.AD({
        id: id
      });
      this.$body
        .load('page/ad/ad.hbs', model, {className: 'ad ad-detail'})
        .setFramework('ad', '编辑广告');
    },
    list: function () {
      this.$body
        .load('page/ad/list.html')
        .setFramework('ad ad-list', '我的广告');
    },
    listApplies: function (id) {
      this.$body
        .load('page/ad/apply.html')
        .setFramework('apply', '我的申请');
    },
    showHistoryInfo: function (query) {
      this.$body
        .load('page/info.html')
        .setFramework('info', '广告投放情报');
    }
  });
}(Nervenet.createNameSpace('tp.router')));;
(function (ns) {
  ns.Stat = Backbone.Router.extend({
    $body: null,
    routes: {
      'stat(/)': 'showStat'
    },
    showStat: function () {
      this.$body.load('page/stat/list.html');
      this.$body.setFramework('has-date-range');
    }
  });
}(Nervenet.createNameSpace('tp.router')));;
;(function (ns) {
  var manager = {
    $body: null,
    $me: null,
    call: function (url, data, options) {
      options = options || {};
      var self = this
        , onSuccess = options.success || this.onSuccess
        , onError = options.error || this.onError
        , context = options.context;
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        type: options.method || 'post',
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        success: function (response) {
          if (response.code === 0) {
            onSuccess.call(context, response);
            self.postHandle(response);
            self.trigger('complete:call', response);
          } else {
            onError.call(context, response);
          }
        },
        error: function (xhr, status, err) {
          onError.call(context, xhr, status, err);
        }
      });
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
      this.trigger('complete:upload', response);
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
      var popup = $(this.template(options));
      this.$el.append(popup);
      popup = this.$context.createInstance(ns.Base, _.extend({
        el: popup
      }, options));
      return popup;
    },
    popupEditor: function (options) {
      var editor = options.el = $(this.editor(options));
      this.$el.append(editor);
      editor = EditorFactory.createEditor(this.$context, options);
      return editor;
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
    options.value = model.get(prop) || model.get(options.display);
    callPopup(model, prop, options);
  }
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
;(function (ns) {
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
            root: '/tiger-prawn/'
          });
        }
        if (!route || /^#\/user\/\w+$/.test(location.hash)) {
          location.hash = '#/dashboard';
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
          location.hash = '#/user/login';
        }
      }
    },
    onError: function () {
      this.$body.start();
      location.hash = '#/user/login';
      Backbone.history.start({
        root: '/tiger-prawn'
      });
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
;(function (ns) {var collections = {}
    , Model = Backbone.Model.extend({
      parse: function (response, options) {
        if ('code' in response && 'msg' in response && 'data' in response) {
          return response.data;
        }
        return response;
      }
    });
  var Collection = ns.ListCollection = Backbone.Collection.extend({
      total: 0,
      pagesize: 10,
      isLoading: false,
      initialize: function(models, options) {
        Backbone.Collection.prototype.initialize.call(this, models, options);
        if (!options) {
          return;
        }
        if (options.url) {
          this.url = options.url;
        }
        var size = localStorage.getItem(location.hash + '-pagesize');
        this.pagesize = size || options.pagesize || this.pagesize;
      },
      fetch: function (options) {
        if (this.isLoading) {
          return;
        }
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
        return _.isArray(response) ? response : response.list;
      },
      setPagesize: function (size) {
        this.pagesize = size;
        localStorage.setItem(location.hash + '-pagesize', size);
      }
    });
  Collection.createInstance = function (models, options) {
    options.Model = options.model || ('idAttribute' in options ? Model.extend({
      idAttribute: options.idAttribute
    }) : Model);
    var collection;
    if (!('collectionId' in options)) {
      return new Collection(models, options);
    }
    if (options.collectionId in collections) {
      collection = collections[options.collectionId];
      if (collection.length === 0 && models) {
        collection.reset(models);
      }
    } else {
      collection = new Collection(models, options);
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
        //setTimeout(this.fetch, TIMEOUT);
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.TableMemento = Backbone.Model.extend({
    waiting: false,
    _validate: function (attr, options) {
      if (!('validate' in options)) {
        options.validate = true;
      }
      Backbone.Model.prototype._validate.call(this, attr, options);
    },
    validate: function (attr, options) {
      if (this.waiting || ('ignore' in options && !options.ignore)) {
        return '表格正在更新数据，请稍候。';
      }
    }
  });
}(Nervenet.createNameSpace('tp.model')));;
(function (ns) {
  ns.Panel = Backbone.View.extend({
    fragment: '',
    events: {
      'click input': 'input_clickHandler',
      'change [name=check]': 'check_changeHandler',
      'animationend': 'animationEndHandler',
      'webkitAnimationEnd': 'animationEndHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.list = this.$('.message-list');
      this.button = this.$('.dropdown-toggle');

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
        this.list.append(this.fragment);
        this.refreshNumber();
        this.fragment = '';
      }
    },
    input_clickHandler: function (event) {
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

  ns.Manager = new Manager({
    collection: collection
  });
}(Nervenet.createNameSpace('tp.notification')));;
;(function (ns) {
  ns.DataSyncView = Backbone.View.extend({
    displayProcessing: function () {
      this.$el.addClass('processing');
      this.submit
        .prop('disabled', true)
        .find('i').hide()
        .end().prepend('<i class="fa fa-spin fa-spinner"></i>');
    },
    displayResult: function (isSuccess, msg, icon) {
      msg = (icon ? '<i class="fa fa-' + icon + '"></i> ' : '') + msg;
      this.submit
        .find('i:hidden').show()
        .end().find('.fa-spin').remove();
      this.$el.removeClass('processing');
      this.$('button:not([type])').prop('disabled', false);
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

  ns.SmartForm = tp.view.DataSyncView.extend({
    $router: null,
    uploaders: [],
    events: {
      "blur input,textarea,select": "input_blurHandler",
      'focus input': 'input_focusHandler',
      'submit': 'submitHandler',
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
      this.$el.trigger('success');
      this.trigger('success', response);
    },
    submit_errorHandler: function(xhr, status, error) {
      error = tp.Error.getAjaxMessage(xhr, status, error);
      this.displayResult(false, error.message, error.icon);
      this.trigger('error', xhr, status, error);
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
        this.$router.navigate(action);
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
          var key = element.name.replace('[]', '');
          if (attr[key] !== undefined) {
            if (!_.isArray(attr[key])) {
              attr[key] = [attr[key]];
            }
            attr[key].push(element.value);
          } else {
            attr[key] = element.value;
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
    },
    uploader_dataHandler: function (data) {
      this.$el.removeClass('uploading');
      for (var key in data) {
        if (!data.hasOwnProperty(key)) {
          return;
        }
        var value = data[key]
          , items = this.$('[name= ' + key + ']').val(value);
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
    uploader_startHandler: function () {
      this.$el.addClass('uploading');
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  ns.FileFetcher = Backbone.View.extend({
    events: {
      'click .fetch-button': 'fetchButton_clickHandler',
      'change [name]': 'input_changeHandler'
    },
    fetchButton_clickHandler: function () {
      var field = this.$('[name=ad_url]')
        , value = field.val();
      if (!value || field.attr('type') === 'hidden') { // 用户上传的文件不抓包
        return;
      }
      if (/itunes\.apple\.com/.test(value)) {
        alert('App Store应用不需要抓取');
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
      var has_url = !!event.target.value;
      this.$('.fetch-button')
        .toggleClass('btn-warning', has_url)
        .prop('disabled', !has_url);
    }
  });
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {
  var DATE_FORMAT = 'YYYY-MM-DD'
    , spinner = '<i class="fa fa-spin fa-spinner"></i>';

  ns.Pager = Backbone.View.extend({
    events: {
      'click a': 'clickHandler'
    },
    initialize: function (options) {
      var total = Math.ceil(options.length / options.pagesize);
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.total = total;
      this.pagesize = options.pagesize;
      this.render();
      this.displayPageNum();
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
      this.$('[href="#/to/' + page + '"]').parent('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', page === 0)
          .end().last().toggleClass('disabled', page >= total - 1);
      });
    },
    setTotal: function (total) {
      this.total = Math.ceil(total / this.pagesize);
      this.render();
      this.displayPageNum();
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
      target.html(spinner);
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
      this.render(options);
    },
    render: function (options) {
      // 默认显示一个月
      var range = _.extend({
        start: -31,
        end: 0
      }, _.pick(options, 'start', 'end'));
      range.start = moment().add(range.start, 'days').format(DATE_FORMAT);
      range.end = moment().add(range.end, 'days').format(DATE_FORMAT);
      this.model.set(range, {silent: true});
      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
    },
    remove: function () {
      this.stopListening();
      this.el = this.$el = this.model = null;
      return this;
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    range_clickHandler: function () {
      var start = this.$('[name=start]').val()
        , end = this.$('[name=end]').val();
      this.$('.shortcut').removeClass('active');
      this.$('.label').text(start + ' - ' + end);
      this.model.set({
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
      start = moment().add(start, 'days').format(DATE_FORMAT);
      end = moment().add(end, 'days').format(DATE_FORMAT);
      this.model.set({
        start: start,
        end: end
      });
      this.$('.label').text(item.text());
      event.preventDefault();
    }
  });

  ns.Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    start: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        this.model.set({
          keyword: event.target.value,
          page: 0
        });
        this.$el.prop('readonly', true);
        this.spinner = this.spinner || $(spinner);
        this.spinner.insertAfter(this.$el);
      }
    }
  });
}(Nervenet.createNameSpace('tp.component.table')));;
;(function (ns) {
  ns.Manager = {
    $context: null,
    map: {
      '.smart-table': 'tp.component.SmartTable',
      '.smart-navbar': 'tp.component.SmartNavbar',
      '.smart-info': 'dianjoy.component.SmartInfo',
      '.smart-list': 'dianjoy.component.SmartList',
      '.smart-slide': 'dianjoy.component.SmartSlide',
      '.morris-chart': 'tp.component.MorrisChart',
      '.article-editor': 'dianjoy.component.ArticleEditor',
      '#login-form': 'tp.component.LoginForm',
      'form': 'tp.component.SmartForm'
    },
    check: function (el, mediator) {
      var components = [];
      el.data('components', components);
      el.popover({
        html: true,
        selector: '.has-popover'
      });

      // 自动初始化组件
      var self = this;
      for (var selector in this.map) {
        if (!this.map.hasOwnProperty(selector)) {
          continue;
        }
        var dom = el.find(selector);
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
      el.find('[data-mediator-class]').each(function () {
        var className = $(this).data('mediator-class')
          , component = Nervenet.parseNamespace(className)
          , init = {
            model: mediator
          };
        if (component) {
          init.el = this;
          components.push(self.$context.createInstance(component, init));
        } else {
          self.loadMediatorClass(components, className, init, $(this), true);
        }
      });
    },
    clear: function (el) {
      var components = el.data('components');
      if (!components || components.length === 0) {
        return;
      }

      // 移除组件
      for (var i = 0, len = components.length; i < len; i++) {
        components[i].remove();
      }
      components.length = 0;
    },
    find: function (el, className) {
      var components = el.data('components');
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
    getPath: function (str, isCustom) {
      var arr = str.split('.');
      if (isCustom) {
        return arr.join('/') + '.js';
      }
      if (arr[0] === 'tp') {
        arr = arr.slice(1);
      }
      return 'js/' + arr.join('/') + '.js';
    },
    loadMediatorClass: function (components, className, init, dom, isCustom) {
      var self = this
        , script = document.createElement("script");
      script.async = true;
      script.src = this.getPath(className, isCustom);
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
    preCheck: function (el) {
      var components = el.data('components');
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
}(Nervenet.createNameSpace('tp.component')));;
(function (ns) {

  var timeout
    , placeholder = '<p><i class="fa fa-spinner fa-spin fa-4x"></i></p>';

  ns.Base = tp.view.DataSyncView.extend({
    $context: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'keydown textarea': 'textarea_keydownHandler',
      'success': 'form_successHandler'
    },
    initialize: function (options) {
      if (options.isRemote) {
        this.$el.addClass('loading')
          .find('.modal-body').html(placeholder);
        if (/\.hbs$/i.test(options.content)) {
          $.get(options.content, _.bind(this.template_successHandler, this));
          options.remote = false;
        } else {
          options.remote = options.content;
        }
      }
      this.$el.modal({
        show: true,
        remote: options.remote
      });
    },
    hide: function () {
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, 3000);
    },
    onLoadComplete: function () {
      this.$el.removeClass('loading')
        .find('.modal-footer .btn-primary').prop('disabled', false);
      tp.component.Manager.check(this.$el, this.model);
    },
    form_successHandler: function () {
      this.hide();
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
    },
    template_successHandler: function (response) {
      this.template = Handlebars.compile(response);
      this.$('.modal-body').html(this.template(_.extend({
        urlRoot: this.model.collection.url
      }, this.model.toJSON())));
      this.onLoadComplete();
    },
    textarea_keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        $(event.target).closest('form').submit();
        event.preventDefault();
      }
    },
    hiddenHandler: function () {
      tp.component.Manager.clear(this.$el);
      this.$('.modal-body').empty();
      clearTimeout(timeout);
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    showHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.alert').hide();
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
        , template = tp.path + (options.template ? 'page/' + options.template : ('template/popup-' + type));
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
      this.form.$el.html(template(_.extend(this.model.toJSON(), this.options))).insertAfter(this.$('.alert-msg'));
      this.form.on('success', this.form_successHandler, this);
      this.form.on('error', this.form_errorHandler, this);

      var html = this.$('.item-grid').html();
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
        this.options.options = this.model.options[this.options.options];
      }
      Editor.prototype.render.call(this, response);
      if (this.options.list) {
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
}(Nervenet.createNameSpace('tp.popup')));;
(function (ns) {
  ns.Loader = Backbone.View.extend({
    $context: null,
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
    },
    render: function () {
      this.$el.html(this.template(this.model instanceof Backbone.Model ? this.model.toJSON() : this.model));
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
      'change [type=range]': 'range_changeHandler'
    },
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loading = this.$('#page-loading').remove().removeClass('hide');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.model.on('change:fullname', this.model_nameChangeHandler, this);
    },
    clear: function () {
      tp.component.Manager.clear(this.$el);
    },
    load: function (url, data, options) {
      options = options || {};
      this.clear();
      this.$el.toggleClass('full-page', !!options.isFull)
        .removeClass(this.lastClass);

      // html or hbs
      if (/.hbs$/.test(url)) {
        var klass = options.loader || tp.view.Loader
          , page = this.$context.createInstance(klass, _.extend({
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
    setFramework: function (classes, title) {
      this.$el.addClass(classes);
      this.lastClass = classes;
      this.$('#content h1').text(title);
      return this;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.$el.removeClass('full-page')
          .find('.login').remove();
      }
    },
    model_nameChangeHandler: function (model, name) {
      this.$('.username').html(name);
    },
    range_changeHandler: function (event) {
      $(event.target).next().html(event.target.value);
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
  var IOS_PREFIX = 'itms-apps://';
  
  ns.AdEditor = tp.view.Loader.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'change [name=ad_app_type]': 'platform_changeHandler',
      'change #replace-ad': 'replaceAD_changeHandler',
      'change .domestic input': 'area_changeHandler',
      'change .isp input': 'isp_changeHandler',
      'change #feedback': 'feedback_changeHandler',
      'change #app-uploader [name=ad_url]': 'adURL_changeHandler'
    },
    render: function () {
      tp.view.Loader.prototype.render.call(this);

      var init = this.model.pick(_.keys(this.model.defaults));
      for (var key in init) {
        if (!init.hasOwnProperty(key)) {
          continue;
        }
        var items = this.$('[name=' + key + '][value=' + init[key] + ']').prop('checked', true); // radio
        items.length > 0 || (items = this.$('[name="' + key + '[]"][value=' + init[key] + ']').prop('checked', true)); // checkbox
        items.length > 0 || this.$('[name=' + key + ']').val(init[key]); // select
      }
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
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
    feedback_changeHandler: function (event) {
      this.$el.toggleClass('show-feedback-detail', event.target.value === '2' || event.target.value === '3');
    },
    fetchAD_errorHandler: function (xhr, status, err) {
      alert('加载已有广告失败');
      this.$('#replace-ad').prop('disabled', false)
        .next().removeClass('spin');
    },
    fetchAD_successHandler: function (response) {
      var template = Handlebars.compile('{{#each list}}<option value="{{id}}">{{channel}} {{ad_name}} {{cid}}</option>{{/each}}')
        , options = template(response);
      this.hasAD = true;
      this.$('[name=replace-with]').html(options);
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', false);
      this.$('#replace-ad').next().removeClass('spin');
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
      this.$el
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
          pack_name: pack_name
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
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', !replace);
    }
  });
}(Nervenet.createNameSpace('tp.page')));
;
(function (ns) {
  ns.Info = tp.view.Loader.extend({
    events: {
      'submit': 'searchHandler'
    },

    searchHandler: function (event) {
      this.collection.fetch();
    }
  });
}(Nervenet.createNameSpace('tp.page')));}());