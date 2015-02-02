/**
 * Created by meathill on 14/11/13.
 */
;(function (ns) {
  //ns.API = 'http://diytest.dianjoy.com/api/v1/'; //原来的地址为'http://ad-diy.com/'
  ns.API = 'http://ad-diy.com/';
  ns.UPLOAD = 'http://ad-diy.com/'; // 上传文件的起始路径
  ns.path = ''; // 项目路径
  ns.config = {
    login: {
      welcome: '欢迎使用点乐广告自助平台',
      admin: 'service@dianjoy.com',
      verify: ns.API + 'showimg.php',
      className: 'login'
    }
  };
}(Nervenet.createNameSpace('tp')));