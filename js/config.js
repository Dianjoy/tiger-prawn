/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  ns.API = 'http://ad-diy.com/';
  ns.config = {
    login: {
      welcome: '欢迎使用点乐广告自助平台',
      admin: 'service@dianjoy.com',
      verify: ns.API + 'showimg.php',
      className: 'login'
    }
  };
}(Nervenet.createNameSpace('tp')));