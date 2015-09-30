/**
 * Created by chensheng on 15/9/30.
 */
(function(ns) {
  ns.HandlerView = Backbone.View.extend({
    events: {
      'click': 'export_clickHandler'
    },

    export_clickHandler: function () {
      var start = $('#stat-range-start-date').val()
        , end = $('#stat-range-end-date').val()
        , uri = this.$el.data('uri');
      this.el.href = tp.API + uri + '?start=' + start + '&end=' + end;
    }
  });
}(Nervenet.createNameSpace('tp.view')));