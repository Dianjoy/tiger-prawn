/**
 * Created by 路佳 on 2015/12/11.
 */
'use strict';
(function (ns) {
  ns.Search = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'focus .keyword': 'keyword_focusHandler',
      'click .options a': 'options_clickHandler',
      'keydown': 'keyDownHandler',
      'input': 'inputHandler'
    },
    initialize: function (options) {
      this.result = this.$('.result');
      this.template = Handlebars.compile(this.result.find('script').html());
      this.clearButton = this.$('.clear-button');
      this.input = this.$('.keyword');

      this.model = new Backbone.Model();
      this.model.on('sync', this.render, this);
      this.fetch = _.bind(this.fetch, this);
      this.error = _.bind(this.errorHandler, this);
      this.hide = _.bind(this.hide, this);
    },
    remove: function () {
      this.model.off();
      this.model = null;
      Backbone.View.remove.call(this);
    },
    render: function () {
      var data = this.model.toJSON()
        , html = this.template({list: data});
      html = html || this.template({
          error: true,
          msg: '没有结果，请修改关键词，然后再试。'
        });
      this.list.html(html).show();
      this.clearButton.hide();
      this.input.focus();
      this.xhr = null;
    },
    fetch: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = this.model.fetch({
        data: {keyword: this.input.val()},
        error: this.error
      });
      this.spinner.show();
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.list.hide();
      }
    },
    keyword_blurHandler: function () {
      var list = this.list;
      this.hideTimeout = setTimeout(function () {
        list.hide();
      }, 250);
    },
    keyword_focusHandler: function () {
      clearTimeout(this.hideTimeout);
      if (this.collection.length > 0) {
        this.list.show();
      }
    },
    errorHandler: function () {
      this.clearButton.hide();
      this.list.append(this.list_template({
        error: true,
        msg: '加载错误，大侠请重新来过'
      }));
    },
    inputHandler: function () {
      clearTimeout(this.timeout);
      if (this.input.val().length > 1) {
        this.timeout = setTimeout(this.fetch, this.delay);
      }
    },
    keyDownHandler: function (event) {
      var active = this.list.find('.active').removeClass('active');
      switch (event.keyCode) {
        case 13: // enter
          var id = active.children().attr('href');
          if (id) {
            id = id.substr(1);
            if (this.multiple) {
              this.selected.add(this.collection.get(id));
            } else {
              this.selected.set([this.collection.get(id)]);
              this.list.hide();
            }
          } else if (!this.input.prop('disabled') && this.input.val().length > 1) {
            this.fetch();
          }
          event.preventDefault();
          break;

        case 40: // down
          this.list.show();
          if (active.length === 0 || active.is(':last-child')) {
            this.list.children().eq(0).addClass('active');
          } else {
            active.next().addClass('active');
          }
          event.preventDefault();
          break;

        case 38: // up
          this.list.show();
          if (active.length === 0 || active.is(':first-child')) {
            this.list.children().last().addClass('active');
          } else {
            active.prev().addClass('active');
          }
          event.preventDefault();
          break;

        case 27: // esc
          if (this.list.is(':visible')) {
            this.hide();
            event.stopPropagation();
          }
          break;
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));