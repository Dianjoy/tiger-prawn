/**
 * 全局搜索
 * 
 * Created by 路佳 on 2015/12/11.
 */
'use strict';
(function (ns, $, Backbone, _) {
  /**
   * @class
   */
  ns.Search = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'focus .keyword': 'keyword_focusHandler',
      'click .clear-button': 'clearButton_clickHandler',
      'keydown': 'keyDownHandler',
      'input': 'inputHandler',
      'submit': 'submitHandler'
    },
    initialize: function () {
      this.result = this.$('.result');
      this.template = Handlebars.compile(this.$('script').html());
      this.spinner = this.$('.fa-spinner');
      this.clearButton = this.$('.clear-button');
      this.input = this.$('.keyword');

      this.fetch = _.bind(this.fetch, this);
      this.hide = _.bind(this.hide, this);
    },
    remove: function () {
      this.model.off();
      this.model = null;
      Backbone.View.remove.call(this);
    },
    /**
     * 渲染搜索结果列表
     *
     * @param {Object} response
     * @param {Array} response.ads 搜索结果
     * @param {String} response.keyword 搜索关键词
     * @param {Boolean} response.has_info 是否要显示广告投放情报链接
     */
    render: function (response) {
      response.ads = response.ads && response.ads.length > 0 ? response.ads : false;
      this.hasResult = !!response.ads;
      if (this.hasResult) {
        response.keyword = this.input.val();
        response.has_info = response.keyword.split(' ').length === 1;
      }
      this.result.html(this.template(response)).show();
      this.spinner.hide();
      this.clearButton.show();
      this.input.focus();
      this.xhr = null;
    },
    fetch: function () {
      var query = this.$el.serialize();
      if (this.query === query) {
        return;
      }

      this.query = query;
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = tp.service.Manager.get(tp.API + 'search/', query, {
        success: this.render,
        error: this.errorHandler,
        context: this
      });
      this.clearButton.hide();
      this.spinner.show();
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.result.hide();
      }
    },
    clearButton_clickHandler: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.input.val('');
      this.clearButton.hide();
      this.spinner.hide();
    },
    keyword_blurHandler: function () {
      this.hideTimeout = setTimeout(this.hide, 250);
    },
    keyword_focusHandler: function () {
      clearTimeout(this.hideTimeout);
      if (this.hasResult > 0) {
        this.result.show();
      }
    },
    errorHandler: function () {
      this.spinner.hide();
      this.result.html(this.template({
        error: true,
        msg: '加载错误，大侠请重新来过'
      })).show();
    },
    inputHandler: function () {
      clearTimeout(this.timeout);
      if (this.input.val().length > 1) {
        this.clearButton.show();
        this.timeout = setTimeout(this.fetch, this.delay);
      }
    },
    keyDownHandler: function (event) {
      var active = this.result.find('.active').removeClass('active');
      switch (event.keyCode) {
        case 13: // enter
          var id = active.children().attr('href');
          if (id) {
            id = id.substr(1);
            if (this.multiple) {
              this.selected.add(this.collection.get(id));
            } else {
              this.selected.set([this.collection.get(id)]);
              this.result.hide();
            }
          } else if (!this.input.prop('disabled') && this.input.val().length > 1) {
            this.fetch();
          }
          event.preventDefault();
          break;

        case 40: // down
          this.result.show();
          if (active.length === 0 || active.is(':last-child')) {
            this.result.children().first().addClass('active');
          } else {
            active.nextAll(':not(.divider,.disabled)').first().addClass('active');
          }
          event.preventDefault();
          break;

        case 38: // up
          this.result.show();
          if (active.length === 0 || active.is(':first-child')) {
            this.result.children().last().addClass('active');
          } else {
            active.prevAll(':not(.divider,.disabled)').first().addClass('active');
          }
          event.preventDefault();
          break;

        case 27: // esc
          if (this.result.is(':visible')) {
            this.hide();
            event.stopPropagation();
          }
          break;
      }
    },
    submitHandler: function (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}(Nervenet.createNameSpace('tp.view'), jQuery, Backbone, _));