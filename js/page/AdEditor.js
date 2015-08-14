/**
 * @overview 用来处理编辑广告页的js
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-08
 */
'use strict';
(function (ns) {
  var IOS_PREFIX = 'itms-apps://'
    , option_template = '{{#each list}}<option value="{{id}}">{{agreement}} {{channel}} {{ad_name}} {{cid}}</option>{{/each}}'
    , aso_desc = 'App Store搜索关键字“XX”，找到“XXX”（约第X位）\n下载并注册帐号后，二次登录体验可得奖励。'
    , omit = ['ad_url', 'ad_lib', 'ad_size', 'id'];
  
  ns.AdEditor = tp.view.Loader.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'change [name=ad_name]': 'adName_changeHandler',
      'change [name=ad_app_type]': 'platform_changeHandler',
      'change [name=search_flag]': 'searchFlag_changeHandler',
      'change .ad-source-list': 'adSource_changeHandler',
      'change #replace-ad': 'replaceAD_changeHandler',
      'change .domestic input': 'area_changeHandler',
      'change .isp input': 'isp_changeHandler',
      'change #feedback': 'feedback_changeHandler',
      'change #app-uploader [name=ad_url]': 'adURL_changeHandler',
      'click .search-ad-button': 'searchADButton_clickHandler',
      'click .search-agreement-button': 'searchAgreementButton_clickHandler',
      'keydown .agreement-keyword': 'agreementKeyword_keyDownHandler'
    },
    render: function () {
      tp.view.Loader.prototype.render.call(this);

      this.agreements = tp.model.ListCollection.getInstance({
        collectionId: 'agreement',
        url: tp.API + 'agreement/',
        key: 'agreement'
      });
      this.agreements.reset(this.model.options.agreements);
      this.agreements.add({
        id: 1735,
        company: '商务免费测试合同',
        agreement_id: '测试专用'
      }, {at: 0});
      this.agreements.on('reset', function () {
        this.$('.agreement').find('input').prop('disabled', false);
        this.$('.search-agreement-button').spinner(false);
      }, this);

      var init = this.model.pick(_.keys(this.model.defaults))
        , form = this.$('form');
      setTimeout(function () {
        form.trigger('data', init);
      }, 50);
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
      this.agreements.off();
      this.agreements = null;
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
    searchAgreement: function () {
      var keyword = $.trim(this.$('.agreement-keyword').val());
      if (!keyword) {
        return false;
      }
      this.$('.agreement').find('input').prop('disabled', true);
      this.$('.search-agreement-button').spinner();
      this.agreements.fetch({
        data: {keyword: keyword},
        reset: true
      });
    },
    adName_changeHandler: function (event) {
      this.$('.search-ad-button').prop('disabled', !event.target.value);
    },
    adSource_changeHandler: function (event) {
      var list = $(event.target).data('list')
        , data = _.omit(list[event.target.selectedIndex], omit);
      this.$('form').trigger('data', data);
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
    agreementKeyword_keyDownHandler: function (event) {
      if (event.keyCode === 13) {
        this.searchAgreement();
        event.preventDefault();
      }
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
      var template = Handlebars.compile(option_template)
        , options = template(response);
      this.hasAD = true;
      this.$('[name=replace-with]')
        .data('list', response.list)
        .html(options);
      this.$('[name=replace-with],#replace-time,#replace-ad').prop('disabled', false);
      this.$('#replace-ad').next().removeClass('spin');
      this.$('form').trigger('data', _.omit(response.list[0], omit));
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
          status: 0,
          pagesize: 30
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
      this.$('[name=replace-with],#replace-time').prop('disabled', !replace);
    },
    searchAD_errorHandler: function () {
      alert('未找到符合广告名的广告');
      this.$('.search-ad-button').spinner(false);
    },
    searchAD_successHandler: function (response) {
      var template = Handlebars.compile(option_template)
        , data = _.omit(response.list[0], omit);
      this.$('.ad-list-container').slideDown()
        .find('select')
          .html(template(response))
          .data('list', response.list);
      this.$('form').trigger('data', data);
      this.$('.search-ad-button').spinner(false);
    },
    searchADButton_clickHandler: function () {
      var ad_name = this.$('[name=ad_name]').val();
      tp.service.Manager.call(tp.API + 'ad_basic/', {
        ad_name: ad_name
      }, {
        success: this.searchAD_successHandler,
        error: this.searchAD_errorHandler,
        context: this,
        method: 'get'
      });
      this.$('.search-ad-button').spinner();
    },
    searchAgreementButton_clickHandler: function () {
      this.searchAgreement();
    },
    searchFlag_changeHandler: function (event) {
      var is_aso = event.target.value === '1';
      this.$('.aso').toggle(is_aso);
      $('#keywords').prop('required', is_aso);
      $('#ad_desc').val(is_aso ? aso_desc : this.model.get('ad_url'));
    }
  });
}(Nervenet.createNameSpace('tp.page')));
