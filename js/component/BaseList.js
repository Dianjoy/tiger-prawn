/**
 * Created by meathill on 15/4/28.
 */
'use strict';
(function (ns, Backbone) {
  /**
   * @class
   */
  ns.BaseList = Backbone.View.extend({
    autoFetch: true,
    fragment: '',
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ' '));
      this.container = options.container ? this.$(options.container) : this.$el;
      this.collection = this.getCollection(options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
      this.collection.on('error', this.collection_errorHandler, this);
      if (options.autoFetch || !('autoFetch' in options) && this.autoFetch) {
        this.refresh(options);
      }
    },
    remove: function () {
      this.collection.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').remove();
      this.container.append(this.fragment);
      this.fragment = '';
      this.$el.removeClass('loading');
    },
    getCollection: function (options) {
      if (this.collection) {
        return this.collection;
      }

      var init = this.$el.data();
      if ('url' in init) {
        init.url = init.url.replace('{{API}}', tp.API);
      }
      options = _.extend(options, init);

      this.params = tp.utils.decodeURLParam(options.params);
      // 起止日期
      if (options.defaults && _.isString(options.defaults)) {
        options.defaults = tp.utils.decodeURLParam(options.defaults);
      }
      if (!options.defaults) {
        options.defaults = {};
      }
      if (options.start || options.end) {
        options.defaults = _.extend(options.defaults, _.pick(options, 'start', 'end'));
      }

      return tp.model.ListCollection.getInstance(options);
    },
    refresh: function (options) {
      options = options || {};
      options.data = _.extend(options.data, this.params);
      this.collection.fetch(options);
    },
    collection_addHandler: function (model, collection, options) {
      this.fragment += this.template(model instanceof Backbone.Model ? model.toJSON() : model);
      if (options && options.immediately) {
        var item = $(this.fragment);
        item.attr('id', model.id || model.cid);
        this.container[options.prepend ? 'prepend' : 'append'](item);
        this.fragment = '';
        return item;
      }
    },
    collection_changeHandler: function (model) {
      var html = this.template(model.toJSON())
        , id = model.id || model.cid;
      this.$('.relate-to-' + id).remove();
      $(document.getElementById(id)).replaceWith(html); // 因为id里可能有.
    },
    collection_errorHandler: function (collection, response, options) {
      console.log('error', collection, response, options);
    },
    collection_removeHandler: function (model, collection, options) {
      var id = model.id || model.cid
        , item = $(document.getElementById(id));
      item = item.add(item.siblings('.relate-to-' + id)); // 有时候面临一拖N的局面,需要处理一下
      if (options.fadeOut) {
        item.fadeOut(function () {
          $(this).remove();
        });
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
}(Nervenet.createNameSpace('tp.component'), Backbone));