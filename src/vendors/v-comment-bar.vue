<template>
    <div class="v-comment">
        <div class="v-comment-bar">
            <!--<div class="v-comment-bar__dt" v-text="formatedCreateDt"></div>-->
            <!--<div class="v-comment-bar__dt">{{comment.Tm | specialTime}}</div>-->
            <div>
                <div class="v-comment-bar__dt">{{comment.Tm | specialTime}}</div>
                <div class="v-comment-bar__del" v-if="delTopicEnableTag"><p @click="delTopic">删除主题</p></div>
                <div class="v-comment-bar__del" v-if="delCommentEnableTag"><p @click="delComment">删除评论</p></div>
            </div>
            <div class="v-comment-bar__praise" @click="togglePraise">
                <span :class="['icon', {'icon-heart cancel': !formatedLikeFlag}, {'icon-heart-o done': formatedLikeFlag}]"></span>
                <p v-text="formatedPraiseNum"></p>
            </div>
            <div class="v-comment-bar__comment" @click="addComment">
                <span class="icon icon-comment"></span>
                <p v-text="formatedCommentNum"></p>
            </div>
        </div>
    </div>
</template>
<script>
    import config from '../config';
    import MicroComment from '../vendor/v-comment';
    import * as utils from '../js/utils/utils';
    import { mapState } from 'vuex'; //eslint-disable-line

    export default {
        name: 'v-comment-bar',

        props: {
            id: {
                type: Number | String,
                default: 0
            },
            value: {
                type: Object,
                default: () => {
                    return {Tm: ''};
                }
            },

            delTopicEnable: {   // 是否可以删除当前主题
                type: Boolean,
                default: false
            },
            delCommentEnable: { // 是否可以删除当前评论
                type: Boolean,
                default: false
            },
            praiseEnable: {    // 是否可以点赞
                type: Boolean,
                default: false
            },
            commentEnable: {    // 是否可以评论
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                comment: this.value || {}
            };
        },

        computed: {
            ...mapState({
                subjects: state => state.comment.subjects,
                comments: state => state.comment.comments,
                formatedCreateDt (state) {
//                    return (this.comment.Id && state.forum.forumComments[this.comment.Id] && state.forum.forumComments[this.comment.Id].Tm) ? utils.formatTime(state.forum.forumComments[this.comment.Id].Tm) : '';
                    if (!this.comment.CommentId && this.subjects.hasOwnProperty(this.comment.Id)) { // 主题的评论赞
                        return utils.formatTime(this.subjects[this.comment.Id].Tm);
                    } else if (this.comments.hasOwnProperty(this.comment.CommentId)) { // 评论的评论赞
                        return utils.formatTime(this.comments[this.comment.CommentId].Tm);
                    }
                    return '';
                },
                formatedPraiseNum (state) {
                    if (!this.comment.CommentId && this.subjects.hasOwnProperty(this.comment.Id) && this.subjects[this.comment.Id].LikeNum) { // 主题的评论赞
                        return this.subjects[this.comment.Id].LikeNum;
                    } else if (this.comments.hasOwnProperty(this.comment.CommentId) && this.comments[this.comment.CommentId].LikeNum) { // 评论的评论赞
                        return this.comments[this.comment.CommentId].LikeNum;
                    }
                    return '赞';
                },
                formatedCommentNum (state) {
                    if (!this.comment.CommentId && this.subjects.hasOwnProperty(this.comment.Id) && this.subjects[this.comment.Id].CommentNum) { // 主题的评论赞
                        return this.subjects[this.comment.Id].CommentNum;
                    } else if (this.comments.hasOwnProperty(this.comment.CommentId) && this.comments[this.comment.CommentId].CommentNum) { // 评论的评论赞
                        return this.comments[this.comment.CommentId].CommentNum;
                    }
                    return '评论';
                },
                formatedLikeFlag (state) {
                    if (!this.comment.CommentId && this.subjects.hasOwnProperty(this.comment.Id) && this.subjects[this.comment.Id].LikeFlag) { // 主题的评论赞
                        return this.subjects[this.comment.Id].LikeFlag;
                    } else if (this.comments.hasOwnProperty(this.comment.CommentId) && this.comments[this.comment.CommentId].LikeFlag) { // 评论的评论赞
                        return this.comments[this.comment.CommentId].LikeFlag;
                    }
                    return 0;
                }
            }),
            delTopicEnableTag () { // 是否显示删除主题按钮
                return this.delTopicEnable && (parseInt(this.comment.UserId) === parseInt(this.$store.getters.userInfo.id));
            },
            delCommentEnableTag () { // 是否显示删除评论按钮
                return this.delCommentEnable && (parseInt(this.comment.UserId) === parseInt(this.$store.getters.userInfo.id));
            }
        },

        watch: {
            value (val) {
                this.comment = val;
            },
            comment (val) {
//                console.log('v-comment-bar.watch ===> comment: ', val);
                // 初始化评论赞对象
                if (!this.comment.CommentId && !this.subjects.hasOwnProperty(this.comment.Id)) {
                    this.$store.commit('SET_COMMENT', Object.create(this.comment));
                } else if (!this.comments.hasOwnProperty(this.comment.CommentId)) {
                    this.$store.commit('SET_COMMENT', Object.create(this.comment));
                }
//                this.$store.commit('SET_FORUM_COMMENT', Object.create(val));
                this.$emit('input', val);
            },
            'comment.LikeFlag' (val) {
                this.$emit('input', this.comment);
            }
        },

        mounted () {
//            console.log('=====>>> ', this.comment);
//            // 初始化评论赞对象
            if (!this.comment.CommentId && !this.subjects.hasOwnProperty(this.comment.Id)) {
                this.$store.commit('SET_COMMENT', Object.create(this.comment));
            } else if (!this.comments.hasOwnProperty(this.comment.CommentId)) {
                this.$store.commit('SET_COMMENT', Object.create(this.comment));
            }
        },

        methods: {
            togglePraise (e) {
                if (!this.praiseEnable) return;
//                logger.log('v-comment-bar.method.togglePraise...', e.target);
                e.stopPropagation();

                let params = {};
                params.userId = this.comment.UserId || 0;

                if (!this.comment.LikeFlag) { // 点赞
                    MicroComment.addPraise({
                        subjectId: this.comment.Id, // this.comment.SubjectId || 0,
                        toId: this.comment.CommentId || 0,
                        type: 1
                    }).then(res => {
                        this.$set(this.comment, 'LikeFlag', true);
                        this.$set(this.comment, 'LikeNum', this.comment.LikeNum + 1);

//                        if (e.target.classList.contains('cancel')) { e.target.classList.remove('cancel'); }
//                        e.target.classList.add('done');
                        this.$store.commit('ADD_PRAISE', this.comment);
                    }).catch(e => {
                        console.error('post praise error: ', e);
                    });
                } else { // 取消点赞
                    MicroComment.delPraise({
                        cId: this.comment.CommentId || 0,
                        subjectId: this.comment.Id, // this.comment.SubjectId || 0,
                        userId: config.loginData.userInfo.userId || 0
                    }).then(res => {
                        this.$set(this.comment, 'LikeFlag', false);
                        this.$set(this.comment, 'LikeNum', this.comment.LikeNum - 1);

//                        if (e.target.classList.contains('done')) { e.target.classList.remove('done'); }
//                        e.target.classList.add('cancel');
                        this.$store.commit('DEL_PRAISE', this.comment);
                    }).catch(e => {
                        console.error('delete praise error: ', e);
                    });
                }
            },

            addComment (e) {
                if (!this.commentEnable) return;
                console.log('v-comment-bar.method.addComment...');
                e.stopPropagation();

                // 如果是主题，直接返回parent = 0，如果有parent直接返回，如果没有，取第一级评论的commentId
                let pid = !this.comment.CommentId ? 0 : (this.comment.Parent ? this.comment.Parent : this.comment.CommentId),
                    touid = this.comment.CommentId ? this.comment.UserId : 0; // 一级评论不带touid
                this.$router.push({name: 'comment-create', params: {id: this.comment.Id}, query: {toid: this.comment.CommentId, touid: touid, pid: pid}});
            },

            delTopic () {
//                MicroComment.delTopic({
//                    topicId: this.$route.params.topicId || 0
//                }).then(res => {
//                    console.log('v-comment-bar.delTopic.SUCCESS: ', res);
//                    this.$router.go(-1);
//                }).catch(e => {
//                    console.error('v-comment-bar.delTopic.ERROR: ', e);
//                });
            },

            delComment () {
                MicroComment.delComment({
                    subjectId: this.$route.params.id,
                    commentId: this.comment.CommentId
                }).then(res => {
                    console.log('v-comment-bar.delComment.SUCCESS: ', res);
                    this.$store.commit('DEL_COMMENT_NUM', {Id: this.comment.Id}); // 提交变更
                    this.$emit('handle-del-comment', res);
                }).catch(e => {
                    console.error('v-comment-bar.delComment.ERROR: ', e);
                });
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-comment-bar {
        padding: pxTorem(18px) 0;
        background: #FFF;

        @include box-flex;
        @include align_items(center);
        @include justify-content(space-between);

        > div {
            color: #8E8E93;

            @include flex_grow(0);
            @include flex-shrink(0);
            @include flex_basis(auto);

            display: flex;

            &:first-child {
                @include flex_grow(1);
                @include flex-shrink(1);
            }

            p {
                font-size: pxTorem(12px);
                line-height: pxTorem(15px);
            }
        }

        .v-comment-bar__dt {
            margin-left: pxTorem(15px);
            flex-shrink: 0;
            flex-grow: 0;
            flex-basis: auto;
        }

        .v-comment-bar__del {
            margin-left: pxTorem(15px);
            flex-shrink: 1;
            flex-grow: 1;
            flex-basis: auto;
            color: #3395ff;

            p {
                display: inline;
            }
        }

        .icon {
            width: pxTorem(15px);
            height: pxTorem(15px);
            font-size: pxTorem(15px);
            margin-right: pxTorem(5px);

            &.icon-heart-o {
                color: #FB434F;
            }
        }
    }

    .v-comment-bar__dt {
        margin-left: pxTorem(15px);
    }
    .v-comment-bar__praise {
        width: pxTorem(56px);

        @include box-flex;
        @include flex-direction-row;

        .icon.done{
            animation: shake 500ms 1;
        }
        .icon.cancel{
            animation: shake2 500ms 1;
        }
        &.act {
            animation: shake 100ms 1;
        }
        @keyframes shake { 0%{ @include opacity(.5); font-size: pxTorem(12px);} 10% { @include opacity(1); font-size: pxTorem(14px); } 20% { font-size: pxTorem(14.5px) } }
        @keyframes shake2 { 0%{ @include opacity(.5); font-size: pxTorem(12px);} 10% { @include opacity(1); font-size: pxTorem(14px); } 20% { font-size: pxTorem(14.5px) } }

    }
    .v-comment-bar__comment {
        width: pxTorem(56px);
        margin-right: pxTorem(15px);

        @include box-flex;
        @include flex-direction-row;
    }
</style>
