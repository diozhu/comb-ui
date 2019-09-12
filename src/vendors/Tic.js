/**
 * based TicSlice
 * @author Dio Zhu
 * @date 2019.9.10
 */
const raf = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (cb) { window.setTimeout(cb, 1000 / 60); };
const caf = window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        clearTimeout;

class Tic {

    constructor (list, callback) {
        if (!callback || typeof callback !== 'function') return console.error('[Tic] callback method is null!');
        this.generator = this.queue(list, callback);
        this.t = null;
        this.next();
    }

    next () {
        const { generator } = this;
        const t = performance.now();
        let res = null;

        do res = generator.next();
        while (!res.done && performance.now() - t < 16.7);

        if (res.done) return;
        this.t = raf(this.next.bind(this));
    }

    * queue (list, callback) {
        for (let i = 0; i < list.length; i++) {
            const ti = performance.now();
            callback(list[i]);
            while (performance.now() - ti < 16.7) yield;
        }
    }

    clear () {
        caf(this.t);
    }
}

export default Tic;