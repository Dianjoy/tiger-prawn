/**
 * Created by meathill on 14-5-14.
 */
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
    clear: function ($el) {
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
}(Nervenet.createNameSpace('tp.component')));