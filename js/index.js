$(function () {
  // start here
  var context = Nervenet.createContext()
    , me = new tp.model.Me()
    , profile = new tp.view.Me({
      el: '.me',
      model: me
    })
    , body = new tp.view.Body({
      el: 'body',
      model: me
    });

  // map values
  context
    .mapValue('me', me)
    .mapValue('body', body)
    .mapValue('colors', ['#e5412d', '#f0ad4e', '#444', '#888', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#ASBESTOS']);
  context
    .inject(me)
    .inject(body)
    .inject(tp.component.Manager)
    .inject(tp.popup.Manager)
    .inject(tp.service.Manager)
    .mapEvent('edit-model', tp.controller.editModelCommand)
    .mapEvent('add-model', tp.controller.addModelCommand);
  Handlebars.$context = context;

  // routers
  context.createInstance(tp.router.Base);
  context.createInstance(tp.router.AD);
  context.createInstance(tp.router.Stat);
  context.createInstance(tp.router.Me);

  // 验证用户身份
  me.fetch();

  // moment使用中式语法
  moment.locale('zh-cn');

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o);m=m[m.length - 1];
    a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-35957679-15', 'auto');
  ga('send', 'pageview');
});