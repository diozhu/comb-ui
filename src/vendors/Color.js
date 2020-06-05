const Color = {
    rgbToHex: function(color) {
        let reg = /^(rgba|RGBA|rgb|RGB)/;
        if (reg.test(color)) {
            let strHex = '#';
            // => Array
            let colorArr = color.replace(/(?:\(|\)|rgba|RGBA|rgb|RGB)*/g, '').split(',');
            // => hex
            for (let i = 0; i < 3; i++) {
                let hex = Number(colorArr[i]).toString(16);
                if (hex === '0') hex += hex;
                strHex += hex;
            }
            return strHex;
        } else {
            return color;
        }
    },

    hexToRgb: function(color) {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        color = color.toLowerCase();
        if (reg.test(color)) {
            // #fff => #ffffff
            if (color.length === 4) {
                let colorNew = '#';
                for (let i = 1; i < 4; i += 1) {
                    colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                }
                color = colorNew;
            }
            // #ffffff => rgb
            let colorChange = [];
            for (let i = 1; i < 7; i += 2) {
                colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
            }
            return 'rgb(' + colorChange.join(',') + ')';
        } else {
            return color;
        }
    },

    colorToByteArray: function(color) {
        if (!color || color === '?') return [0, 0, 0, 0];
        color = this.hexToRgb(color);
        color = color.replace(/\s/g, '');
        let values = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color);
        if (!values) values = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color);
        if (!values) return [0, 0, 0, 0];

        values.shift();
        values[3] = values.length < 4 ? 255 : Math.round(values[3] * 255);
        return values;
    },
    getContrastColor: function(color) {
        if (!color) return 'black';
        var values = this.colorToByteArray(color);
        var brightness = (values[0] * 299 + values[1] * 587 + values[2] * 114) / 1000;
        brightness += ((255 - brightness) * (255 - values[3])) / 255; // consider alpha channel
        // return brightness > 125 ? 'black' : 'white';
        return brightness > 125 ? '#363433' : '#f1f0ed';
    },

    lightOrDark: function(col) {
        let rtn = 'light';
        if (!col) return rtn;
        let r, g, b;
        if (/^#/g.test(col)) {
            r = Math.floor(parseInt(col.slice(1, 3), 16) * 0.299);
            g = Math.floor(parseInt(col.slice(3, 5), 16) * 0.578);
            b = Math.floor(parseInt(col.slice(5, 7), 16) * 0.114);
            // if (r + g + b >= 192) rtn = 'light';
            if (r + g + b >= 150) rtn = 'light';
            else rtn = 'dark';
        }
        // console.error('rbg:', col, r, b, g, amt);
        return rtn;
    },

    lightenDarkenColor: function(col, amt) {
        if (amt >= 1) return col;
        let r, g, b;
        if (/^#/g.test(col)) {
            r = Math.floor(amt * parseInt(col.slice(1, 3), 16) + (1 - amt) * 255);
            g = Math.floor(amt * parseInt(col.slice(3, 5), 16) + (1 - amt) * 255);
            b = Math.floor(amt * parseInt(col.slice(5, 7), 16) + (1 - amt) * 255);
        }
        // console.error('rbg:', col, r, b, g, amt);
        return '#' + r.toString(16).slice(-2) + g.toString(16).slice(-2) + b.toString(16).slice(-2);
    }
};
export default Color;
