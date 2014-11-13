;(function (ns) {
  'use strict';
  ns.SmartForm = tp.view.DataSyncView.extend({
    $context: null,
    $router: null,
    events: {
      "blur input,textarea,select": "input_blurHandler",
      'focus input': 'input_focusHandler',
      "click .upload-button": "uploadButton_clickHandler",
      "change input[type=file]": "fileUploader_changeHandler",
      'submit': 'submitHandler'
    },
    initialize: function () {
      this.submit = this.getSubmit();
      this.submit.toggleClass('disabled', this.$(':invalid').length !== 0);
      this.model.on('change', this.model_changeHandler, this);
      this.$context.mapEvent('table-rendered', this.searchedHandler, this);
    },
    remove: function () {
      this.model.off(null, null, this);
      this.$context.removeEvent('table-rendered', this.searchedHandler);
      Backbone.View.prototype.remove.call(this);
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
    fileUploader_changeHandler: function(event) {
      var input = $(event.currentTarget)
        , button = input.siblings('.upload-button')
        , progress = input.siblings('.progress').removeClass('hide')
        , data = button.data()
        , preview = $(data.preview)
        , field = $(data.field)
        , validate = data.validate;
      if (!input[0].hasOwnProperty('files') || input[0].files.length === 0) {
        return;
      }

      // 校验文件类型
      var spec = data.accept
        , file = input[0].files[0];
      if (spec && file) {
        var reg = new RegExp(spec, 'i');
        if (!reg.test(file.type) && !reg.test(file.name)) {
          var types = spec.slice(3, -2).split('|');
          button.addClass('btn-danger')
            .find('i').addClass('fa-times');
          alert('文件类型不匹配，请上传扩展名为' + types.join('，') + '的文件\n（手工修改不算哦）');
          return;
        }
      }
      button
        .prop('disabled', true)
        .addClass('disabled')
        .removeClass('btn-success btn-danger')
        .find('i')
          .removeClass('fa-times fa-check')
          .addClass("fa-spin fa-spinner");
      this.$el.addClass('loading');
      
      if (!dianjoy.service.Manager.autoUpload) {
        return;
      }
      var uploader = dianjoy.service.Manager.upload(file, {
        id: this.model.id || '',
        type: data.type
      }, this);
      uploader.bar = progress;
      uploader.button = button;
      uploader.preview = preview.length ? preview : null;
      uploader.field = field;
      uploader.filename = file.name;
      uploader.isSrc = /image|video/i.test(file.type);
      uploader.on('success', this.fileUpload_successHandler, uploader);
      uploader.on('progress', this.fileUpload_progressHandler, uploader);
      uploader.on('error', this.fileUpload_errorHandler, uploader);

      // 添加样式
      this.$el.addClass('uploading');

      // 是否需要md5和大小校验
      if (validate) {
        var spark = new SparkMD5.ArrayBuffer()
          , reader = new FileReader();
        reader.onload = function () {
          spark.append(this.result);
          uploader.md5 = spark.end();
        };
        uploader.size = file.size;
        reader.readAsArrayBuffer(file);
      }
    },
    fileUpload_errorHandler: function (response) {
      this.bar.children()
        .addClass('progress-bar-danger')
        .end().fadeOut(function () {
          $(this).addClass('hide').children().removeClass('progress-bar-danger');
        })
        .closest('form').removeClass('uploading');

      this.preview.append('<p class="text-danger">' + response.msg + '</p>');

      this.button
        .prop('disabled', false)
        .removeClass('disabled')
        .addClass('btn-success')
        .find('i')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-times');
      this.button.closest('form').removeClass('loading');
      this.off();
    },
    fileUpload_progressHandler: function(loaded, total) {
      var progress = (loaded / total * 100 >> 0) + '%';
      this.bar.children()
        .width(progress)
        .text(progress);
    },
    fileUpload_successHandler: function(response) {
      // 校验MD5
      if (this.md5 && (this.size !== response.size || this.md5 !== response.md5)) {
        alert('上传后文件校验未通过，请重新上传');
        return;
      }

      // 隐藏进度条，去掉样式
      this.bar.children()
        .addClass('progress-bar-success')
        .end().fadeOut(function () {
          $(this).addClass('hide').children().removeClass('progress-bar-success');
        })
        .closest('form').removeClass('uploading');

      // 生成缩略图或链接
      if (this.preview) {
        if (this.isSrc) {
          this.preview.html('<img src="' + response.url + '" class="img-thumbnail">');
        } else {
          this.preview.html('<a href="' + src + '">' + this.filename + '</a> 已上传');
        }
      }

      if (this.field.hasClass('multiple')) {
        var imgs = this.field.val() === '' ? [] : _.filter(this.field.val().split(','));
        if (imgs.indexOf(response.url) === -1) {
          imgs.push(response.url);
        }
        this.field.val(imgs.join(','));
      } else {
        this.field.val(response.url);
      }

      this.button
        .prop('disabled', false)
        .removeClass('disabled')
        .addClass('btn-success')
        .find('i')
          .removeClass("fa-spin fa-spinner")
          .addClass('fa-check');
      this.button.closest('form').removeClass('loading');
      this.off();
    },
    input_blurHandler: function(event) {
      var target = $(event.currentTarget)
        , msg = dianjoy.form.checkInput(target);
      if (msg) {
        this.$('input').tooltip('destroy');
        target.tooltip({
          title: msg,
          placement: 'bottom',
          trigger: 'manual'
        }).tooltip('show');
      }
      this.submit.toggleClass('disabled', this.$(':invalid').length !== 0);
    },
    input_focusHandler: function(event) {
      $(event.currentTarget).tooltip('destroy');
    },
    model_changeHandler: function (model) {
      if ('keyword' in model.changed && model.changed.keyword === undefined) {
        this.displayResult(true);
      }
    },
    submit_successHandler: function(response) {
      if ('go_to_url' in response) {
        var router = this.$router;
        response.msg += '<br>将于3秒后跳转';
        setTimeout(function () {
          router.navigate(response.go_to_url);
        }, 3000);
      }
      this.model.set(_.omit(response, 'code', 'msg'));
      this.displayResult(true, response.msg, 'smile-o');
      this.$el.trigger('form-success');
    },
    submit_errorHandler: function(xhr, status, error) {
      this.displayResult(false, xhr.msg || error, 'frown-o');
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
      var isPass = dianjoy.form.checkForm(this.el);
      if (this.$el.hasClass('ajax') && isPass) {
        var data = this.$el.serialize();
        dianjoy.service.Manager.call(action, data, {
          success: this.submit_successHandler,
          error: this.submit_errorHandler,
          context: this,
          method: this.$el.attr('method')
        });
        return false;
      }

      // 原则上当然尽量都整成ajax的
      // 不过暂时改不过来，所以需要上传图片的表单都直接提交
      return isPass;
    }
  });
}(Nervenet.createNameSpace('tp.component')));