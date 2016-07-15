'use strict';
(function (ns, $, _, Backbone) {
  var history = 'history-recorder'
    , successSign = '<i class="fa fa-check form-control-feedback"></i>'
    , errorSign = '<i class="fa fa-times form-control-feedback"></i>';

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

  /**
   * @class
   */
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
        , msg = this.checkInput(target)
        , formGroup = target.closest('.form-group');
      if (msg) {
        this.$('input').tooltip('destroy');
        target
          .tooltip({
            title: msg,
            placement: 'bottom',
            trigger: 'manual'
          }).tooltip('show');
      }
      if (formGroup.length) {
        formGroup.removeClass('has-error has-success')
          .addClass(msg ? 'has-error' : 'has-success');
        if (formGroup.hasClass('has-feedback')) {
          formGroup.find('.form-control-feedback').remove();
          target.after(msg ? errorSign : successSign);
        }
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
        // 空白的复选框有时候也有保存的必要
        var empty = {};
        this.$(':checkbox[name]:not(:checked)').each(function () {
          var key = this.name.replace('[]', '');
          if (key in attr) {
            return;
          }
          empty[key] = '';
        });
        attr = _.defaults(attr, empty);
        // 开关类的值需要特殊处理
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
}(Nervenet.createNameSpace('tp.component'), jQuery, _, Backbone));