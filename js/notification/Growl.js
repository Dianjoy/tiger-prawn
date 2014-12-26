/**
 * Created by meathill on 14/12/25.
 */
'use strict';
(function (ns) {
  ns.Growl = Backbone.View.extend({
    count: 0,
    fragment: [],
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());

      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    collection_addHandler: function (model) {
      if (this.count > 2) {
        this.count++;
        return;
      } else {
        this.fragment.push(this.template(model.toJSON()));
        this.count++;
      }
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        if (this.count > 3) {
          this.fragment[2] = this.template({number: this.count - 2});
        }
        this.$el.append(this.fragment.join(''));
        this.fragment = [];
      }
    }
  });
}(Nervenet.createNameSpace('tp.notification')));