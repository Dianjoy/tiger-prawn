/**
 * Created by meathill on 15/9/28.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.Typeahead = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'focus .keyword': 'keyword_focusHandler',
      'change .result input': 'result_changeHandler',
      'click .options a': 'options_clickHandler',
      'keydown': 'keyDownHandler',
      'input': 'inputHandler'
    },
    initialize: function (options) {
      options = _.extend(options, this.$el.data());

      this.result = this.$('.result');
      this.list = this.$('.options');
      this.result_template = Handlebars.compile(this.result.find('script').html());
      this.list_template = Handlebars.compile(this.list.find('script').html().replace(/\s{2,}|\n|\r/g, ''));
      this.spinner = this.$('.fa-spinner');
      this.input = this.$('.keyword');

      this.collection = tp.model.ListCollection.getInstance(options);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.selected = new Backbone.Collection();
      this.selected.on('add', this.selected_addHandler, this);
      this.selected.on('remove', this.selected_removeHandler, this);
      this.fetch = _.bind(this.fetch, this);
      this.error = _.bind(this.errorHandler, this);
      this.hide = _.bind(this.hide, this);
      this.multiple = options.multiple;
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.selected.off();
      this.selected = null;
      Backbone.View.prototype.remove.call(this);
    },
    fetch: function () {
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = this.collection.fetch({
        data: {keyword: this.input.val()},
        reset: true,
        error: this.error
      });
      this.spinner.show();
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.list.hide();
      }
    },
    collection_syncHandler: function (collection) {
      var data = collection.toJSON()
        , html = this.list_template({list: data});
      html = html || this.list_template({
        error: true,
        msg: '没有结果，请修改关键词，然后再试。'
      });
      this.list.html(html).show();
      this.spinner.hide();
      this.input.focus();
      this.xhr = null;
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
    options_clickHandler: function (event) {
      var id = event.target.hash.substr(1);
      if (this.multiple) {
        this.selected.add(this.collection.get(id));
        this.input.focus();
      } else {
        this.selected.set([this.collection.get(id)]);
        this.list.hide();
      }
      event.preventDefault();
    },
    result_changeHandler: function (event) {
      var target = event.target;
      if (!target.checked) {
        var id = target.id.substr(9);
        this.selected.remove(id);
      }
    },
    selected_addHandler: function (model) {
      var html = this.result_template(model.toJSON());
      this.result.append(html);
    },
    selected_removeHandler: function (model) {
      var id = model.id;
      this.$('#selected-' + id + ',[for=selected-' + id + ']').remove();
    },
    errorHandler: function () {
      this.spinner.hide();
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
}(Nervenet.createNameSpace('tp.component')));