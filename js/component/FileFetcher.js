/**
 * Created by meathill on 15/3/3.
 */
'use strict';
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
}(Nervenet.createNameSpace('tp.component')));