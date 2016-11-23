部署说明
====

## 系统需求

1. [Node.js](https://nodejs.org) >= 4.2
2. [ruby](https://ruby-lang.org/)，linux下使用[rvm](https://rvm.io/)安装
3. [compass](https://compass-style.org/)，安装ruby后，执行<kbd>gem install compass</kbd>
4. [bower](https://bower.io/)，安装node后，执行<kbd>npm install bower -g</kbd>
5. [gulp](https://gulpjs.com/)，安装node后，执行 <kbd>npm install gulp -g</kbd>
6. [git](http://git-scm.com/)

## 初次部署

1. Clone代码到本地
    ```bash
    git clone
    ```
2. 安装依赖
    ```bash
    bower install --production
    npm install
    ```
3. 修改配置文件 `js/config.js` 
    ```javascript
    ns.API = '提供服务的自助后台 API 的 URL，不需要协议，可以是相对路径，比如 `//diy.dianjoy.com/api/v1/` 或者 `/api/v1/`';
    ns.UPLOAD = '上传文件的访问路径前缀，截止到 `upload`，主要用于 CDN，比如 `http://fast-cdn.dianjoy.com/`';
    ns.BASE = '此项目的访问路径，不包括域名等，比如 URL 是 `https://diy.dianjoy.com/` 时，那么这里就填 `/`';
    ```
4. 编译压缩生成执行文件
    ```bash
    gulp
    ```
5. 完成！

## 更新

1. 取得最新代码
    ```bash
    git pull
    ```
2. 更新依赖
    ```bash
    npm install
    bower install --production
    ```
3. 编译压缩
    ```bash
    gulp
    ```
4. 完成！