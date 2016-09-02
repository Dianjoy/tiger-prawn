/**
 * Created by meathill on 14/11/13.
 */
'use strict';
(function (ns, Backbone, _, $) {
  var print_header = '<link rel="stylesheet" href="{{url}}css/screen.css"><link rel="stylesheet" href="{{url}}css/print.css"><title>{{title}}</title>';

  /**
   * @class
   */
  ns.Body = Backbone.View.extend({
    $context: null,
    $sidebarEditor: null,
    events: {
      'click .add-button': 'addButton_clickHandler',
      'click .print-button': 'printButton_clickHandler',
      'click .request-button': 'requestButton_clickHandler',
      'shown.bs.tab': 'bootstrapTab_shownHandler'
    },
    initialize: function () {
      this.framework = this.$('.framework');
      this.container = this.$('#page-container');
      this.loading = this.$('#page-loading').remove().removeClass('hide');
      this.loadCompleteHandler = _.bind(this.loadCompleteHandler, this); // 这样就不用每次都bind了
      this.$el
        .popover({
          selector: '[data-toggle=popover]'
        })
        .tooltip({
          selector: '[data-toggle=tooltip]'
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
      this.$sidebarEditor.render();
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
      } else if (/.md$/.test(url)) {
        tp.service.Manager.fetch(url, this.md_loadCompleteHandler, this);
      } else {
        this.container.load(url, this.loadCompleteHandler);
      }

      this.container.append(this.loading);
      this.$sidebarEditor.getBreadcrumb();

      this.trigger('load:start', url);
      zhuge.track('pageview', {url: url});

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
    setLatestStat: function (model) {
      this.latest = this.latest || Handlebars.compile(this.$('.latest script').html());
      this.$('.latest').html(this.latest(model.toJSON()));
    },
    setTitle: function (title, sub, model) {
      if (model) {
        model = model instanceof Backbone.Model ? model.toJSON() : model;
        title = Handlebars.compile(title)(model);
        sub = Handlebars.compile(sub)(model);
      }
      title = title + (sub ? ' <small>' + sub + '</small>' : '');
      this.$('#content .page-header > h1').html(title);
      return this;
    },
    start: function (showFramework) {
      this.isStart = true;
      this.$('#page-preloader').remove();
      if (showFramework) {
        this.createSidebar();
        this.$el.removeClass('full-page login')
          .find('.login').remove();
      }
      if (this.isStart) {
        tp.component.Manager.createComponents();
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
    md_loadCompleteHandler: function (response) {
      this.container.html(marked(response));
      this.loading.remove();
      this.trigger('load:complete');
    },
    requestButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , href = button.attr('href')
        , method = button.data('method') || 'get'
        , msg = button.data('msg');
      if (msg && !confirm(msg)) {
        return;
      }
      href = /^(https?:)?\/\//.test(href) ? href : tp.API + href;
      $.ajax({
        url: href,
        dataType: 'json',
        method: method,
        xhrFields: {
          withCredentials: true
        }
      }).done(function (response) {
        if (response.code === 0) {
          alert(response.msg);
        }
        if (method === 'delete') {
          button.closest(button.data('item')).fadeOut(function () {
            $(this).remove();
          });
        }
      });
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
    },
    bootstrapTab_shownHandler: function (event) {
      var tab = this.$(event.target.hash)
        , chart = tab.find('.morris-chart');
      if (!chart.hasClass('rendered')) {
        chart.trigger('render');
      }
    }
  });
}(Nervenet.createNameSpace('tp.view'), Backbone, _, jQuery));