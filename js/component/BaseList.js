/**
 * Created by meathill on 15/4/28.
 */
'use strict';
(function (ns) {
  ns.BaseList = Backbone.View.extend({
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ''));
      this.container = options.container ? this.$(options.container) : this.$el;
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
    },
    remove: function () {
      this.collection.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').hide();
      this.container.append(this.fragment);
      this.fragment = '';
      this.$el.removeClass('loading');
    },
    collection_addHandler: function (model, collection, options) {
      this.fragment += this.template(model.toJSON());
      if (options && options.immediately) {
        var item = $(this.fragment);
        item.attr('id', model.id || model.cid);
        this.container[options.prepend ? 'prepend' : 'append'](item);
        this.fragment = '';
      }
    },
    collection_changeHandler: function (model) {
      var html = this.template(model.toJSON());
      this.$('#' + (model.id || model.cid)).replaceWith(html);
    },
    collection_removeHandler: function (model, collection, options) {
      var item = this.$('#' + (model.id || model.cid));
      if (options.fadeOut) {
        item.fadeOut(function () {
          $(this).remove();
        })
      } else {
        item.remove();
      }
    },
    collection_resetHandler: function () {
      this.container.empty();
      this.collection.each(function (model) {
        this.collection_addHandler(model);
      }, this);
      this.render();
    },
    collection_syncHandler: function () {
      this.render();
    }
  });
}(Nervenet.createNameSpace('tp.component')));