/**
 * Created by meathill on 15/2/11.
 */
'use strict';
(function (ns) {
  ns.Info = tp.component.BaseList.extend({
    initialize: function () {
      this.onSuccess = _.bind(this.onSuccess, this);
      $(document).on('ajaxSuccess', this.onSuccess);
      this.collection = new Backbone.Collection();
      tp.component.BaseList.prototype.initialize.call(this, {container: 'tbody'});
    },
    remove: function () {
      $(document).off('ajaxSuccess', this.onSuccess);
      tp.component.BaseList.prototype.remove.call(this);
    },
    onSuccess: function (event, xhr, settings) {
      if (xhr.responseJSON && xhr.responseJSON.ad_comments) {
        this.collection.set(xhr.responseJSON.ad_comments);
        this.collection.trigger('sync');
        this.$el.toggleClass('hide', this.collection.length === 0);
      }
    }
  });
}(Nervenet.createNameSpace('tp.page')));