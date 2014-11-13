$(function () {
  $('.morris-data').each(function () {
    var data = JSON.parse(this.innerHTML);
    data.element = $(this).data('target');
    new Morris.Line(data);
  });

  function isLogin() {
    Backbone.history.start({
      root: '/tiger-prawn/'
    });
  }
  function notLogin() {
    location.hash = '#/user/login'
    Backbone.history.start({
      root: '/tiger-prawn'
    });
  }

  // start here
  var context = Nervenet.createContext()
    , me = new tp.model.Me()
    , body = new tp.view.Body({
      el: 'body'
    });

  // map values
  context
    .mapValue('me', me)
    .mapValue('body', body);
  context.inject(tp.component.Manager);

  // routers
  context.createInstance(tp.router.Base);

  // 验证用户身份
  me.fetch({
    success: isLogin,
    error: notLogin
  });

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-35957679-15', 'auto');
  ga('send', 'pageview');
});