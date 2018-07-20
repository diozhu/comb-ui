<template>
    <div id="app">
        <router-link class="page-back" :to="'/'">
            <div class="banner">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAMAAAArteDzAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAByUExURUxpcf94U/93Tv9vSP9vSP9vSP+Sbf+CVf9vSf9vS/9vSP9yTv9vSP9vSP9vSP9zSv9xSf9vSP9vSP9wSf9vSP9wSf9wSv9vSP9vSP91Sv9wSP9vSP9vSP9xSv9vSP9wSf9vSP9wSf9vSP9vSv9wSv9vSJlteWgAAAAldFJOUwAKD/j80QIGeUDGF+ji8yMz24BPu2Ir7bAda5KgOolZqHWaSD0A4EBrAAACIUlEQVR42u2Z3XaCMBCEAYGAaEXxDwVUlPd/xbbH0OU0hGGBNjfkCiN+xjEMO4vVeySJNfU47qtqf5wU6Vzd6mu4V2cypH85VXKcLv40zNCrGsMLJ0BuzpK23cqD82asmMXiTfoIhAg+3seLYpS0h5VcXRZ9v4wy+XJ1GIzMl5KxjOup+GcqH4RM7/Lz61tz+raW0/eUjbR3tYA7+/c7tcz0Dh7qevBvwIOU817tJ7w8RW0wotKt/2Nfe5HV+8Itox5I8ZBiuoXTvYNdKe1DIOZTvW7wtfZEBifFlOeBFdTS7o/A4BQvQv4lTRGcQNpj54/KroWE9FN4zk+ShVrRE77zJ+1/riCDG+L8ZIqiOUsGN8T5yRQVqBePcf7Ya4UG45w/QFDs/Bwo3/kxlO/8GMp3fgxlO//W50Bf/Zx/x1pp2Mv51zYfWiLnv1l8aIic3/oDqDVDZ+gMnaEzdAqoU0RcKN2i9Depkg2lCk9bCboxC7qh235XbF2yoJZQCpTWEsVn1lJpRqVUe2zNUp6matEHyj4A1ZanoECFUJKvaCaMRilt8za/PgspyQZAKUigcEKbFwcJkk4XoyhIociDwxkFPop8OJzhGEkBlMIpjpEkXecntd9HYrOzuxCwRzB9E+Ff2h1YdHBd4BaSEmtBE/QhTDS7+G05Iw1EfuA125SlkZNyqtq5sUY33o1gBxt+eICbXeYfyOAGovmHXOMfx30CPRTVXNdLE+8AAAAASUVORK5CYII=">
                <p>蜂巢（Comb）</p>
            </div>
        </router-link>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'app',
    data () {
        return {
        };
    },
    methods: {
        handleToast () {
            this.$toast('success~');
        }
    }
};
</script>

<style lang="scss">
    @import "../src/scss/_variables.scss";

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: none;
        outline: 0;
        vertical-align: baseline;
        font-family: Arial;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    *:before,
    *:after {
        box-sizing: border-box;
    }

    html {
        height: 100%;
        tap-highlight-color: transparent;
        text-size-adjust: 100%;
        user-select: none;
    }

    html * {
        outline:none;
    }

    body {
        width: 100%;
        height: 100%;
        user-select: none;
        text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
        /*overflow: hidden;*/
        -webkit-overflow-scrolling: touch;
    }
    article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {
        display: block;
    }

    ol, ul {
        list-style: none;

        &.disc {
            list-style: disc;
        }
        &.decimal {
            list-style-type: decimal;
        }
    }

    blockquote, q {
        quotes: none;
    }

    blockquote:before, blockquote:after, q:before, q:after {
        content: '';
        content: none;
    }

    ins, a {
        text-decoration: none;
    }

    del {
        text-decoration: line-through;
    }

    table {
        border-collapse: collapse;
        border-spacing: 0;
    }

    fieldset, img {
        border: 0;
    }
    img {
        display: inline-block;
    }

    input, select, textarea {
        font-size: 100%;
        border: none;
        background: none;
        outline: none;
        -webkit-appearance: none;
        resize: none;
    }

    input:focus::-webkit-input-placeholder {
        color: transparent;
    }

    textarea:focus::-webkit-input-placeholder {
        color: transparent;
    }

    input[type="search"] {
        -webkit-appearance: none;
    }

    input::-webkit-search-cancel-button {
        display: none;
    }

    #app {
        color: #2c3e50;
        /*margin-top: 60px;*/
    }
    .banner {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        img {
            width: pxTorem(50);
            padding: pxTorem(15);
        }
        p {
            font-size: pxTorem(12);
        }
    }

    .page {
        h2 {
            margin: pxTorem(20) 0 0 0;
        }
    }
</style>
