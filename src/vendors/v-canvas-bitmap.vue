<template>
    <div class="v-canvas-bitmap">
        <canvas ref="glcanvas" :style="canvasStyle"></canvas>
    </div>
</template>

<script>
    export default {
        props: {
            value: Array,
            width: {
                type: String,
                default: '100%'
            },
            height: {
                type: String,
                default: '100%'
            }
        },
        data () {
            return {
            };
        },

        computed: {
            canvasStyle () {
                return {
                    border: '#574C57 1px solid',
                    width: this.width,
                    height: this.height
                };
            }
        },

        mounted () {
            // // const canvas = document.querySelector("#glcanvas"); // 获取webgl上下文 
            // const canvas = this.$refs.glcanvas; // 获取webgl上下文 
            // const gl = canvas.getContext("webgl"); 
            // if (!gl) { alert("浏览器不支持webgl"); return; } 
            // // 设置初始的背景色是黑色 
            // gl.clearColor(0.0, 0.0, 0.0, 1.0); 
            // // 清除保存颜色的缓冲区 
            // gl.clear(gl.COLOR_BUFFER_BIT); 
            // const vsSource = ` 
            // attribute vec4 aVertexPosition; 
            // uniform mat4 uModelViewMatrix; 
            // uniform mat4 uProjectionMatrix; 
            // void main() { 
            //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; 
            // }`; 
            // const fsSource = ` 
            // void main() { 
            //     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
            // } `; 
            // const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource); 
            // const programInfo = {
            //     program: shaderProgram, 
            //     attribLocations: { 
            //         vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
            //     }, 
            //     uniformLocations: { 
            //         projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'), 
            //         modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
            //     }, 
            // }; 
            // const buffer = this.initBuffers(gl); 
            // // console.log(gl.bufferData) 
            // this.drawScene(gl,programInfo,buffer);
        },
        methods: {
            // initShaderProgram(gl, vsSource, fsSource) { 
            //     const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource); 
            //     const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource); 
            //     // 创建着色器程序 
            //     const shaderProgram = gl.createProgram(); 
            //     gl.attachShader(shaderProgram, vertexShader); 
            //     gl.attachShader(shaderProgram, fragmentShader); 
            //     gl.linkProgram(shaderProgram); 
            //     // 创建失败， alert 
            //     if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { 
            //         alert('初始化着色器程序失败' + gl.getProgramInfoLog(shaderProgram)); 
            //         return null; 
            //     } 
            //     return shaderProgram; 
            // }, 
            // loadShader(gl, type, source) { 
            //     const shader = gl.createShader(type); 
            //     // 将资源发送到着色器对象 
            //     gl.shaderSource(shader, source); 
            //     gl.compileShader(shader); 
            //     // See if it compiled successfully 
            //     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { 
            //         alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)); 
            //         gl.deleteShader(shader); 
            //         return null; 
            //     } 
            //     return shader; 
            // }, 
            // initBuffers(gl) { 
            //     this.squareVerticesBuffer = gl.createBuffer(); 
            //     gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer); 
            //     var vertices = [ 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0 ]; 
            //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 
            //     // console.log( gl.STATIC_DRAW) 
            //     return {
            //         position:this.squareVerticesBuffer
            //     };
            // }, 
            // drawScene(gl, programInfo, buffers) { 
            //     gl.clearColor(0.0, 0.0, 0.0, 1.0); 
            //     gl.clearDepth(1.0); 
            //     gl.enable(gl.DEPTH_TEST); 
            //     gl.depthFunc(gl.LEQUAL); 
            //     // Clear the canvas before we start drawing on it. 
            //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
            //     //创建一个透视矩阵，一个特殊的矩阵 
            //     //用于模拟照相机透视的失真。 
            //     //视角是45度，宽/高 //匹配画布显示大小的比率 
            //     //可以看到0.1个单位之间的对象 
            //     //距离摄像机100个单位。 
            //     const fieldOfView = 45 * Math.PI / 180; 
            //     // in radians 
            //     const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight; 
            //     const zNear = 0.1; 
            //     const zFar = 100.0; 
            //     const projectionMatrix = mat4.create(); 
            //     // 注意:glmatrix.js总是有第一个参数 
            //     // 作为接收结果。 
            //     mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar); 
            //     // 现在将绘图位置移动到我们想要的位置 
            //     // 场景的中心 
            //     const modelViewMatrix = mat4.create(); 
            //     // // start drawing the square. 
            //     mat4.translate(modelViewMatrix, 
            //     // 变形矩阵 
            //     modelViewMatrix, 
            //     //矩阵变换 
            //     [-0.0, 0.0, -6.0]); 
            //     // 变换的矩阵 
            //     // 告诉WebGL从position拉出位置 
            //     // 缓冲到vertexPosition属性中。 
            //     { 
            //         const numComponents = 2; 
            //         // 每次迭代取出2个值 
            //         const type = gl.FLOAT; 
            //         // 缓冲区中的数据是32位浮点数 
            //         const normalize = false; 
            //         const stride = 0; 
            //         // 从一组值到下一组值需要多少字节 
            //         //0 =使用上面的type和numComponents 
            //         const offset = 0; 
            //         // 缓冲区中要从多少字节开始 
            //         gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position); 
            //         gl.vertexAttribPointer( programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset); 
            //         gl.enableVertexAttribArray( programInfo.attribLocations.vertexPosition); 
            //     } 
            //     //使用我们的 programInfo绘制图形 
            //     gl.useProgram(programInfo.program); 
            //     // 设置着色器 
            //     gl.uniformMatrix4fv( programInfo.uniformLocations.projectionMatrix, false, projectionMatrix); 
            //     gl.uniformMatrix4fv( programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix); 
            //     { 
            //         const offset = 0; 
            //         const vertexCount = 4; 
            //         gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount); 
            //     } 
            // }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-canvas-bitmap {
    }

</style>
