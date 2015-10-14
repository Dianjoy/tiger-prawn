/**
 * Created by meathill on 15/9/28.
 */
'use strict';
(function (ns) {
  ns.Typeahead = Backbone.View.extend({
    timeout: null,
    delay: 500,
    events: {
      'blur .keyword': 'keyword_blurHandler',
      'change .result input': 'result_changeHandler',
      'click .options a': 'options_clickHandler',
      'keydown': 'keydownHandler',
      'input': 'inputHandler'
    },
    initialize: function (options) {
      options = _.extend(options, this.$el.data());

      this.result = this.$('.result');
      this.list = this.$('.options');
      this.result_template = Handlebars.compile(this.result.find('script').html());
      this.list_template = Handlebars.compile(this.list.find('script').html());
      this.spinner = this.$('.fa-spinner');
      this.input = this.$('.keyword');

      this.collection = tp.model.ListCollection.getInstance(options);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.selected = new Backbone.Collection();
      this.selected.on('add', this.selected_addHandler, this);
      this.selected.on('remove', this.selected_removeHandler, this);
      this.fetch = _.bind(this.fetch, this);
      this.hide = _.bind(this.hide, this);
      this.multiple = options.multiple;
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.selected.off();
      this.selected = null;
      Backbone.View.remove.call(this);
    },
    fetch: function () {
      this.collection.fetch({
        data: {keyword: this.input.val()},
        reset: true
      });
      this.spinner.show();
      this.input.prop('disabled', true);
    },
    hide: function (event) {
      if (!event || !$.contains(this.el, event.target)) {
        this.list.hide();
      }
    },
    collection_syncHandler: function (collection) {
      var data = collection.toJSON()
        , html = this.list_template({list: data});
      this.list.html(html).show();
      this.spinner.hide();
      this.input.prop('disabled', false).focus();
    },
    keyword_blurHandler: function () {
      this.list.hide();
    },
    options_clickHandler: function (event) {
      var id = event.target.hash.substr(1);
      if (this.multiple) {
        this.selected.add(this.collection.get(id));
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
    inputHandler: function () {
      clearTimeout(this.timeout);
      if (this.input.val().length > 1) {
        this.timeout = setTimeout(this.fetch, this.delay);
      }
    },
    keydownHandler: function (event) {
      var active = this.list.find('.active').removeClass('active');
      switch (event.keyCode) {
        case 13: // enter
          var id = active.children().attr('href');
          if (id) {
            id = id.substr(1);
            this.selected.add(this.collection.get(id));
            this.list.hide();
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