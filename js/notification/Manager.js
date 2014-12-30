/**
 * Created by meathill on 14/12/25.
 */
'use strict';
(function (ns) {
  var hidden
    , notification = Notification
      || new MockNotification();
  if ('hidden' in document) {
    hidden = 'hidden';
  } else if ('webkitHidden' in document) {
    hidden = 'webkitHidden';
  } else if ('mozHidden' in document) {
    hidden = 'mozHidden';
  } else if ('msHidden' in document) {
    hidden = 'msHidden';
  }

  function MockNotification() {
    console.log('no desktop notification');
  }
  MockNotification.permission = '';
  MockNotification.requestPermission = function () {};

  var Manager = Backbone.View.extend({
    count: 0,
    initialize: function () {
      if (notification.permission !== 'granted') {
        notification.requestPermission();
      }
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    createDesktopNotice: function () {
      if (document[hidden] && notification.permission === 'granted') {
        new notification('点乐自助平台通知', {
          icon: 'img/fav.png',
          body: '收到' + this.count + '条通知，请及时处理哟。'
        });
      }
    },
    collection_addHandler: function () {
      this.count++;
    },
    collection_syncHandler: function () {
      if (this.count > 0) {
        this.createDesktopNotice(this.count);
        this.count = 0;
      }
    }
  });
  ns.Manager = {
    init: function (collection) {
      var panel = new ns.Panel({
          el: '.system-notice',
          collection: collection
        })
        , growl = new ns.Growl({
          el: '#growl',
          collection: collection
        });
      ns.Manager = new Manager({
        collection: collection
      });
    }
  };
}(Nervenet.createNameSpace('tp.notification')));