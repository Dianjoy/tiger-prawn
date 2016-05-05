/**
 * Created by meathill on 14-5-14.
 */
'use strict';
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
    createErrorMsg: function (xhr) {
      var status = 0
        , response = xhr || {};
      if ('status' in xhr) {
        status = xhr.status;
        response = xhr.responseJSON || {};
      }
      if (status >= 500) {
        response.msg = '程序出错，请联系管理员。';
      } else if (status === 401) {
        response.msg = '您的登录已失效。请重新登录后再试。'
      }
      return ns.errorMsg(response);
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
      if (!className) {
        return;
      }
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
        func.apply(this, params);
      }
    },
    registerComponent: function (func, params) {
      this.components.push([func, params]);
    }
  };

  // 一些通用模板
  ns.spinner = '<i class="fa fa-spin fa-spinner"></i>';
  ns.errorMsg = Handlebars.compile('<div class="alert alert-warning">' +
    '<h4><i class="fa fa-warning"></i> 加载数据出错</h4>' +
    '<p>{{msg}}</p>' +
    '<button type="button" class="btn btn-primary refresh-button"><i class="fa fa-refresh"></i> 再试一次</button></div>')
}(Nervenet.createNameSpace('tp.component')));