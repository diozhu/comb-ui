const loadLib = (url) => {
    // const script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.async = true;
    // script.defer = true;
    // script.src = 'http://static.91wuliu.com/laya/js/bandle.js';
    // document.head.appendChild(script);
    // init();
    var script = document.createElement("script");
    script.async = false;
    script.src = url;
    document.body.appendChild(script);
};
const init = () => {
    /**
     * 设置LayaNative屏幕方向，可设置以下值
     * landscape           横屏
     * portrait            竖屏
     * sensor_landscape    横屏(双方向)
     * sensor_portrait     竖屏(双方向)
     */
    window.screenOrientation = "sensor_landscape";
};

init();

if (!window.Laya) {
    // load();
    //-----libs-begin-----
    loadLib("//static.91wuliu.com/laya/libs/laya.core.js");
    loadLib("//static.91wuliu.com/laya/libs/laya.webgl.js");
    loadLib("//static.91wuliu.com/laya/libs/laya.ui.js");
    loadLib("//static.91wuliu.com/laya/libs/laya.physics.js");
    //-----libs-end-------
    loadLib("//static.91wuliu.com/laya/js/bundle.js");
}
