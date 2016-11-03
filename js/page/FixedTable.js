'use strict';
(function (ns, _, Backbone) {
  ns.FixedTable = Backbone.View.extend({
    initialize: function () {
      this.scrollHandler = _.bind(this.scrollHandler, this);
      $(window).scroll(this.scrollHandler);
    },
    remove: function () {
      $(window).off('scroll', this.scrollHandler);
      Backbone.View.prototype.remove.call(this);
    },
    scrollHandler: function () {
      var scroll = document.body.scrollTop + 70
        , fixTable = this.$('.fix-table');
      fixTable.toggleClass('fixed', scroll > this.$('.smart-table').offset().top);
      if (fixTable.hasClass('fixed')) {
        fixTable.width(this.$('.smart-table').width());
      } else {
        fixTable.removeAttr('style');
      }
    }
  });
})(Nervenet.createNameSpace('tp.page'), _, Backbone);