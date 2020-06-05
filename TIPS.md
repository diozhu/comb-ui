
1. 注册[npmjs.com](https://www.npmjs.com/)账户，并在generator-comb根目录登陆：
```bash
npm login
```
2. 发布：
```bash
npm publish --access=public
```
* 如果发布错误：
```bash
no_perms Private mode enable, only admin can publish this module
```
* 原因是淘宝源没有开通registory，所以要切回默认源：
```bash
nrm ls
nrm use npm 
（或者：npm config set registry http://registry.npmjs.org）
```
* 发布成功后，当前窗口能看到发布的版本号，注意以后每次发版，版本号都需要进行更改。
* 如果符合规范，发布的组件会出现在Yeoman 首页的 Generators [清单](http://yeoman.io/generators/)中，由于本项目使用的是内网的gitlib，所以官网清单中只有项目介绍，并无链接。
