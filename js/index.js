'use strict';
(function (Backbone, _, Nervenet) {
  // start here
  var context = Nervenet.createContext()
    , me = new tp.model.DIYUser()
    , profile = new tp.view.Me({
      el: '.me',
      model: me
    })
    , body = new tp.view.Body({
      el: 'body',
      model: me
    })
    , sidebarEditor = new tp.view.SidebarEditor({
      el: '#navbar-side',
      model: me
    })
    , ranger = new tp.component.DateRanger({
      el: '.date-range'
    })
    , search = new tp.view.Search({
      el: '.global-search'
    });

  // map values
  context
    .mapValue('me', me)
    .mapValue('sidebarEditor', sidebarEditor)
    .mapValue('body', body)
    .mapValue('ranger', ranger)
    .mapValue('colors', ['#e5412d', '#f0ad4e', '#444', '#888', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#ASBESTOS']);
  context
    .inject(me)
    .inject(body)
    .inject(sidebarEditor)
    .inject(tp.component.Manager)
    .inject(tp.popup.Manager)
    .inject(tp.service.Manager)
    .mapEvent('edit-model', tp.controller.editModelCommand)
    .mapEvent('add-model', tp.controller.addModelCommand);
  Handlebars.$context = context;

  // routers
  _.each(tp.router, context.createInstance, context);

  // 全局处理取得数据后的操作
  Backbone.on('backbone-sync', function (response) {
    if ('me' in response) {
      me.set(response.me);
    }
  });

  // 验证用户身份
  me.fetch();

  // moment使用中式语法
  moment.locale('zh-cn');

  // 全局处理 ajax 错误
  $(document).ajaxError(function (event, xhr) {
    if (xhr.status === 401) {
      me.unset('id');
    }
  });

  // 诸葛io
  window.zhuge = window.zhuge || [];
  window.zhuge.methods = "_init debug identify track trackLink trackForm page".split(" ");
  window.zhuge.factory = function(b) {
    return function() {
      var a = Array.prototype.slice.call(arguments);
      a.unshift(b);
      window.zhuge.push(a);
      return window.zhuge;
    }
  };
  for (var i = 0; i < window.zhuge.methods.length; i++) {
    var key = window.zhuge.methods[i];
    window.zhuge[key] = window.zhuge.factory(key);
  }
  window.zhuge.load = function(b, x) {
    if (!document.getElementById("zhuge-js")) {
      var a = document.createElement("script");
      var verDate = new Date();
      var verStr = verDate.getFullYear().toString()
        + verDate.getMonth().toString() + verDate.getDate().toString();

      a.type = "text/javascript";
      a.id = "zhuge-js";
      a.async = !0;
      a.src = (location.protocol == 'http:' ? "http://sdk.zhugeio.com/zhuge-lastest.min.js?v=" : 'https://zgsdk.zhugeio.com/zhuge-lastest.min.js?v=') + verStr;
      var c = document.getElementsByTagName("script")[0];
      c.parentNode.insertBefore(a, c);
      window.zhuge._init(b, x)
    }
  };
  window.zhuge.load('dd8b74d2fbfe45318fbcef7755c8e077');
}(Backbone, _, Nervenet));

// 防止被 iframe
(function () {
  if (self != top) {
    top.location = self.location;
  }
}());