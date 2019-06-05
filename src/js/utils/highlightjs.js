/**
 * Created by diozhu on 2017/4/27.
 */
import Vue from 'vue';
// import hljs from 'highlight.js';
import hljs from 'highlight.js/lib/highlight'; // 整个加载太大了。。。这里只用了常用的模板. Author by Dio Zhu. on 2017.5.23
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('stylus', require('highlight.js/lib/languages/stylus'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('groovy', require('highlight.js/lib/languages/groovy'));
/**
 * 高亮组件highlight.js，绑定时替换内容，行号的实现官方未支持，此处利用ol.start实现。
 *              -- Author by Dio Zhu. on 2017.5.2
 */
Vue.directive('highlightjs', {
    bind: function (el) {
        // console.log('############', el.querySelector('code').innerHTML);
        let code = el.querySelector('code'),
            lines = code.innerHTML.split('\n'),
            ol = document.createElement('ol');
        code.innerHTML = ''; // 先清除，再替换
        ol.start = 1;   // 利用ol加入行号
        for (let i = 0, len = lines.length;i < len;i++) {
            let li = document.createElement('li');
            li.innerHTML = lines[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
            ol.appendChild(li);
        }
        code.appendChild(ol);
        hljs.highlightBlock(el);
    }
});

// export default;
