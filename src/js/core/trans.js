/**
 * 枚举字典类, 使用时直接调用:trans('question_status', 2)即可;
 * 用于标准枚举类的显示, 以及后期error的code对应码;
 *              -- Author by Dio Zhu. on 2016.12.6
 */
const dic = {
    /**
     * 评论点赞错误码
     */
    COMMENTS_ERROR: {
        'DEFAULT': '操作失败, 请您稍后再试~',
        1001: '参数错误，请您稍后再试~'
    }
};

let trans = function (key, val) {
    if (dic[key] && dic[key][val]) {
        return dic[key][val];
    } else if (dic[key]['DEFAULT']) {
        return dic[key]['DEFAULT'];
    } else {
        return '请您稍后再试~';
    }
};

export default trans;
