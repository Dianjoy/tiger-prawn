'use strict';
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
    $context: null,
    $router: null,
    events: {
      "blur input,textarea,select": "input_blurHandler",
      'focus input': 'input_focusHandler',
      "click .upload-button": "uploadButton_clickHandler",
      'submit': 'submitHandler'
    },
    initialize: function () {
      this.submit = this.getSubmit();
      this.$context.mapEvent('table-rendered', this.searchedHandler, this);
    },
    remove: function () {
      this.$context.removeEvent('table-rendered', this.searchedHandler);
      Backbone.View.prototype.remove.call(this);
    },
    validate: function () {
      // 验证表单项是否合乎要求
      var elements = this.el.elements;
      if (this.$el.hasClass('uploading')) {
        this.$('.upload-button').push('上传文件中，请稍候');
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
      if (pattern && input.val() !== '' && !RegExp(pattern).test(input.val())) {
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
      if (input.attr('type') === 'password' && !/^[0-9a-zA-Z$!^#_@%&*.]{6,16}$/.test(input.val())) {
        return '密码应为6~16个字符，包含字母、数字、特殊符号等';
      }

      return '';
    },
    createUploader: function (sibling) {
      var data = $(sibling).data()
        , accept = 'accept' in data ? 'accept="' + data.accept + '"' : ''
        , uploader = $('<input type="file" class="hidden" ' + accept + '>');
      uploader.insertAfter(sibling);
      return uploader;
    },
    getSubmit: function () {
      var selector = 'button:not([type=button]), input[type=submit]'
        , submit = this.$(selector);
      if (submit.length === 0) {
        var id = this.$el.attr('id');
        submit = $(selector).filter('[for=' + id + ']');
      }
      return submit;
    },
    input_blurHandler: function(event) {
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
    input_focusHandler: function(event) {
      $(event.currentTarget).tooltip('destroy');
    },
    submit_successHandler: function(response) {
      if ('go_to_url' in response) {
        var router = this.$router;
        response.msg += '<br>将于3秒后跳转';
        setTimeout(function () {
          router.navigate(response.go_to_url);
        }, 3000);
      }
      this.displayResult(true, response.msg, 'smile-o');
      this.$el.trigger('form-success');
    },
    submit_errorHandler: function(xhr, status, error) {
      var error = tp.Error.getAjaxMessage(xhr, status, error);
      this.displayResult(false, error.message, error.icon);
    },
    uploadButton_clickHandler: function(event) {
      var uploader = this.createUploader(event.currentTarget);
      uploader.click();
    },
    searchedHandler: function () {
      this.displayResult(true);
    },
    submitHandler: function(event) {
      var form = this.el,
          action = form.action;
      // 不需要提交的表单和不能提交
      if (this.$el.hasClass('fake') || this.$el.hasClass('loading')) {
        event.preventDefault();
        return false;
      }

      // 筛选类型的
      if (this.$el.hasClass('keyword-form')) {
        this.$context.trigger('search', this.$('[name=query]').val());
        this.displayProcessing();
        event.preventDefault();
        return false;
      }

      // 跳转类型的
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

      // ajax提交类型的
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

      // 编辑model的
      if (this.$el.hasClass('model-editor') && isPass) {
        var attr = {};
        _.each($.serializeArray(this.$el), function (element) {
          if (element.value === '') {
            return;
          }
          if (attr[element.name] !== undefined) {
            if (!_.isArray(attr[element.name])) {
              attr[element.name] = [attr[element.name]];
            }
            attr[element.name].push(element.value);
          } else {
            attr[element.name] = this.value;
          }
        }, this);
        this.model.save(attr, {
          patch: true
        });
        return false;
      }

      // 原则上当然尽量都整成ajax的
      // 不过暂时改不过来，所以需要上传图片的表单都直接提交
      return isPass;
    }
  });
}(Nervenet.createNameSpace('tp.component')));