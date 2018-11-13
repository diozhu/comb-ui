/**
 * Created by diozhu on 2017/2/6.
 */
export default function (target) {
    for (let i = 1, j = arguments.length;i < j;i++) {
        let source = arguments[i] || {};
        for (let prop in source) {
            if (source.hasOwnProperty(prop)) {
                let value = source[prop];
                if (value !== undefined) {
                    target[prop] = value;
                }
            }
        }
    }

    return target;
};
