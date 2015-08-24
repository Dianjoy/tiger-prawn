/**
 * Created by meathill on 14/11/13.
 */
'use strict';
(function (ns) {
  var print_header = '<link rel="stylesheet" href="{{url}}css/screen.css"><link rel="stylesheet" href="{{url}}css/print.css"><title>{{title}}</title>';

  ns.Body = Backbone.View.extend({
    $context: null,
    events: {
      'click .add-button': 'addButton_clickHandler',
      'click .print-button': 'printButton_clickHandler',
      'click .refresh-button': 'refreshButton_clickHandler'
    },
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loading = this.$('#page-loading').remove().removeClass('hide');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.model.on('change:fullname', this.model_nameChangeHandler, this);
      this.$el.popover({
        selector: '[data-toggle=popover]'
      });
    },
    clear: function () {
      this.$context.removeValue('model');
      tp.component.Manager.clear(this.container);
      if (this.page) {
        this.page.remove();
        this.page = null;
      }
    },
    createSidebar: function () {
      this.template = this.template || Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default'
        , template = this.template;
      $.getJSON('page/sidebar/' + role + '.json', function (response) {
        var html = template({list: response});
        $('#navbar-side-inner').append(html);
      });
    },
    load: function (url, data, options) {
      options = options || {};
      this.clear();
      this.$el.toggleClass('full-page', !!options.isFull)
        .removeClass(this.lastClass);
      $('#navbar-side').removeClass('in');

      // html or hbs
      if (/.hbs$/.test(url)) {
        var klass = options.loader || tp.view.Loader
          , page = this.page = this.$context.createInstance(klass, _.extend({
            template: url,
            model: data
          }, options));
        this.container.html(page.$el);
        page.once('complete', this.page_loadCompleteHandler, this);
      } else {
        this.container.load(url, this.loadCompleteHandler);
      }

      this.container.append(this.loading);

      this.trigger('load:start', url);
      ga('send', 'pageview', url);

      return this;
    },
    setFramework: function (classes, title, sub, model) {
      this.$el.addClass(classes);
      this.lastClass = classes;
      if (model instanceof Backbone.Model && title) {
        model.once('sync', function () {
          this.setTitle(title, sub, model);
        }, this);
        return this;
      } else {
        return this.setTitle(title, sub, model);
      }
    },
    setTitle: function (title, sub, model) {
      if (model) {
        model = model instanceof Backbone.Model ? model.toJSON() : model;
        title = Handlebars.compile(title)(model);
        sub = Handlebars.compile(sub)(model);
      }
      title = title + (sub ? ' <small>' + sub + '</small>' : '');
      this.$('#content > .page-header > h1').html(title);
      return this;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.createSidebar();
        this.$el.removeClass('full-page')
          .find('.login').remove();
      }
    },
    addButton_clickHandler: function (event) {
      var options = $(event.currentTarget).data();
      if (!options.title && event.currentTarget.title) {
        options.title = event.currentTarget.title;
      }
      options.collectionId = event.currentTarget.hash.substr(1);
      this.$context.trigger('add-model', options);
      event.preventDefault();
    },
    model_nameChangeHandler: function (model, name) {
      this.$('.username').html(name);
    },
    refreshButton_clickHandler: function (event) {
      Backbone.history.loadUrl(Backbone.history.fragment);
      event.preventDefault();
    },
    page_loadCompleteHandler: function () {
      this.loading.remove();
    },
    printButton_clickHandler: function (event) {
      var target = event.currentTarget
        , selector = target.getAttribute('href')
        , title = target.title
        , printWindow = window.open('', 'print-window')
        , url = location.href
        , header = Handlebars.compile(print_header);
      url = url.substr(0, url.lastIndexOf('/') + 1);
      printWindow.document.body.innerHTML = $(selector).html();
      printWindow.document.head.innerHTML = header({
        title: title,
        url: url
      });
      printWindow.print();
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        tp.component.Manager.check(this.container);
      }
      this.loading.remove();
      this.trigger('load:complete');
    }
  });
}(Nervenet.createNameSpace('tp.view')));