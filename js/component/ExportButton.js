'use strict';
(function(ns) {
  /**
   * @class
   */
  ns.ExportButton = Backbone.View.extend({
    events: {
      'click': 'clickHandler'
    },
    initialize: function () {
      if (this.$el.attr('download')) {
        this.template = Handlebars.compile(this.$el.attr('download').replace(/\${(\w+)}/g, '{{$1}}'));
      }
    },
    clickHandler: function () {
      if (this.model) {
        return this.onClick();
      }
      this.onClick_withoutModel();
    },
    onClick: function () {
      this.el.search = tp.utils.encodeURLParam(this.model.toJSON());
    },
    onClick_withoutModel: function () {
      var start = ''
        , end = ''
        , href = this.$el.attr('href')
        , hasDate = $('.date-range').is(':visible');
      if (!/^https?:\/\//.test(href)) {
        href = href.indexOf('{{API}}') === -1 ? tp.API + href : href.replace('{{API}}', tp.API);
        this.el.href = href;
      }
      if (hasDate) {
        start = $("#stat-range-start-date").val();
        end = $("#stat-range-end-date").val();
        this.el.search = 'start=' + start + '&end=' + end;
      }
      if (this.template) {
        this.$el.attr('download', this.template({
          start: start,
          end: end
        }));
      }
    }
  });
}(Nervenet.createNameSpace ('tp.component')));
