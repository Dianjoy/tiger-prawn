/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Body = Backbone.View.extend({
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
    },
    clear: function () {
      tp.component.Manager.clear(this.$el);
    },
    load: function (url, data, isFull) {
      this.setDisabled(true);
      this.clear();
      this.$el.toggleClass('full-page', !!isFull);

      // html or hbs
      if (/.hbs$/.test(url)) {
        var page = new tp.view.Loader({
          template: url,
          model: data,
          className: data.className
        });
        page.once('ready', this.loadCompleteHandler);
        this.container.append(page.$el);
      } else {
        this.container.load(url, this.loadCompleteHandler);
      }

      this.trigger('load:start', url);
      ga('send', 'pageview', url);
    },
    setDisabled: function (bl) {
      this.$('a.btn').toggleClass('disabled', bl);
      this.$('button').prop('disabled', bl);
    },
    start: function (showFramework) {
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.$el.removeClass('full-page');
      }
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        tp.component.Manager.check(this.$el);
      }
      this.trigger('load:complete');
    }
  });
}(Nervenet.createNameSpace('tp.view')));