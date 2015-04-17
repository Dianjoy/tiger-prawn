/**
 * @overview 用来处理编辑广告页的js
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-08
 */
'use strict';
;(function (ns) {
  var IOS_PREFIX = 'itms-apps://';
  
  ns.AdEditor = tp.view.Loader.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'change [name=ad_app_type]': 'platform_changeHandler',
      'change [name=search_flag]': 'searchFlag_changeHandler',
      'change [name=replace-with]': 'replaceWith_changeHandler',
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
      this.replace = response;
      this.$('[name=replace-with]').html(options);
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', false);
      this.$('#replace-ad').next().removeClass('spin');
      this.$('form').trigger('data', _.omit(response.list[0], 'ad_url', 'ad_lib', 'ad_size', 'id', 'pack_name'));
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
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', !replace);
    },
    replaceWith_changeHandler: function (event) {
      var data = _.omit(this.replace.list[event.target.selectedIndex], 'id', 'ad_lib', 'ad_size', 'ad_url', 'pack_name');
      this.$('form').trigger('data', data);
    },
    searchFlag_changeHandler: function (event) {
      this.$('.aso').toggle(event.target.value === '1');
    }
  });
}(Nervenet.createNameSpace('tp.page')));
