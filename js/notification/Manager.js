/**
 * Created by meathill on 14/12/25.
 */
'use strict';
(function (ns, Backbone) {
  var hidden
    , notification = 'Notification' in window ? Notification : new MockNotification();
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

    this.permission = '';
    this.requestPermission = function () {};
  }

  var Manager = Backbone.View.extend({
    count: 0,
    initialize: function () {
      if (notification.permission !== 'granted') {
        try {
          notification.requestPermission();
        } catch (e) {
          console.log('no browser notice');
        }
      }
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    createDesktopNotice: function () {
      if (document[hidden] && notification.permission === 'granted') {
        var notice = new notification('点乐自助平台通知', {
          icon: 'img/fav.png',
          body: '收到' + this.count + '条通知，请及时处理哟。'
        });
        notice.onclick = function () {
          window.focus();
          this.onclick = null;
        }
      }
    },
    start: function () {
      if (!this.panel) {
        this.panel = new ns.Panel({
          el: '.system-notice',
          collection: collection
        });
        this.growl = new ns.Growl({
          el: '#growl',
          collection: collection
        });
      }
      if (tp.NOTICE_KEY) {
        this.collection.fetch();
      }
    },
    stop: function () {
      this.collection.stop();
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

  var collection = new tp.model.Notice();
  ns.Manager = new Manager({
    collection: collection
  });
}(Nervenet.createNameSpace('tp.notification'), Backbone));