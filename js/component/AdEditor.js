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
      'click .ad_url button': 'adURLButton_clickHandler',
      'change .domestic input': 'area_changeHandler'
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
    adURLButton_clickHandler: function (event) {
      $(event.target).closest('.form-group')
        .removeClass('file url')
        .addClass(event.target.value);
    },
    area_changeHandler: function (event) {
      var target = $(event.target);
      this.$el.toggleClass(target.data('class'), target.val() === '1');
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
