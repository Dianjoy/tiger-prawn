/**
 * @overview 用来处理编辑广告页的js
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-08
 */
'use strict';
;(function (ns) {
  var IOS_PREFIX = 'itms-apps://';
  
  ns.AdEditor = Backbone.View.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'click .platform label': 'platformButton_clickHandler',
      'change .domestic input': 'area_changeHandler',
      'change .isp input': 'isp_changeHandler',
      'change #feedback': 'feedback_changeHandler',
      'change #app-uploader [name=ad_url]': 'adURL_changeHandler'
    },
    initialize: function () {
      var init = this.model.pick(_.keys(this.model.defaults));
      for (var key in init) {
        var items = this.$('[name=' + key + '][value=' + init[key] + ']').prop('checked', true); // radio
        items.length > 0 || (items = this.$('[name="' + key + '[]"][value=' + init[key] + ']').prop('checked', true)); // checkbox
        items.length > 0 || this.$('[name=' + key + ']').val(init[key]); // select
      }
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
    },
    adURL_blurHandler: function (event) {
      if (this.$el.hasClass('iPhone') && event.target.value.substr(0, 12) !== IOS_PREFIX) {
        event.target.value = event.target.value.replace(/^https?:\/\//i, IOS_PREFIX);
      }
    },
    adURL_changeHandler: function (event) {
      var value = event.target.value;
      if (!value) {
        return;
      }
      tp.service.Manager.call(tp.API + 'fetch/', {
        type: 'ad_url',
        file: value
      }, {
        context: this,
        success: this.fetchFile_successHandler,
        error: this.fetchFile_errorHandler
      });
    },
    area_changeHandler: function (event) {
      var target = $(event.target);
      this.$el.toggleClass(target.data('class'), target.val() === '1');
    },
    feedback_changeHandler: function (event) {
      this.$el.toggleClass('show-feedback-detail', event.target.value === '2' || event.target.value === '3');
    },
    fetchFile_successHandler: function (response) {
      alert('服务器抓取文件成功');
      for (var key in response.form) {
        if (response.form.hasOwnProperty(key)) {
          this.$('[name=' + key + ']').val(response.form[key]);
        }
      }
    },
    fetchFile_errorHandler: function (response) {
      console.log(response);
      alert(response.msg);
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
    platformButton_clickHandler: function (event) {
      this.$el
        .removeClass('Android iPhone')
        .addClass(event.target.innerText);
      var is_ios = this.$el.hasClass('iPhone');
      this.$('#process_name').prop('required', is_ios);
      $('#feedback').val(function () { return is_ios ? 4 : this.value});
      $('#app-uploader').data('accept', is_ios ? '*.ipa' : '*.apk');
    }
  });
}(Nervenet.createNameSpace('tp.component')));
