/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.Body = Backbone.View.extend({
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.model.on('change:fullname', this.model_nameChangeHandler, this);
    },
    clear: function () {
      tp.component.Manager.clear(this.$el);
    },
    load: function (url, data, isFull, hasData) {
      this.clear();
      this.$el.toggleClass('full-page', !!isFull)
        .removeClass(this.lastClass);

      // html or hbs
      if (/.hbs$/.test(url)) {
        var page = new tp.view.Loader({
          template: url,
          model: data,
          className: data.className,
          hasData: hasData
        });
        this.container.html(page.$el);
      } else {
        this.container.load(url, this.loadCompleteHandler);
      }

      this.trigger('load:start', url);
      ga('send', 'pageview', url);
    },
    setFramework: function (classes) {
      this.$el.addClass(classes);
      this.lastClass = classes;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        tp.popup.Manager.removePopup();
        this.$el.removeClass('full-page')
          .find('.login').remove();
      }
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        tp.component.Manager.check(this.$el);
      }
      this.trigger('load:complete');
    },
    model_nameChangeHandler: function (model, name) {
      this.$('.username').html(name);
    }
  });
}(Nervenet.createNameSpace('tp.view')));