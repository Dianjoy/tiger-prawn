/**
 * Created by Meathill on 2015/8/20.
 */

'use strict';
$(function () {
  var context = Nervenet.createContext()
    , model = new tp.model.Me()
    , body = new tp.view.Body({
      el: 'body',
      model: model
    })
    , sidebar = new tp.view.SidebarEditor({
      el: '#navbar-side',
      model: model
    });

  context
    .mapValue('body', body)
    .mapValue('sidebarEditor', sidebar)
    .mapValue('colors', ['#e5412d', '#f0ad4e', '#444', '#888', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#ASBESTOS'])
    .inject(body)
    .inject(tp.component.Manager)
    .inject(tp.popup.Manager)
    .inject(tp.service.Manager);
  Handlebars.$context = context;

  context.createInstance(tp.router.Docs);

  // moment使用中文格式
  moment.locale('zh-cn');

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o);m=m[m.length - 1];
    a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-35957679-17', 'auto');
  ga('send', 'pageview');

  // start
  body.start(true);
  Backbone.history.start({
    root: tp.BASE
  });
});