<template>
    <div ref="container" class="v-starry">
        <canvas ref="canvas" class="v-starry__canvas"></canvas>
    </div>
</template>
<script>
/**
 * v-starry组件
 *              -- Author by Dio Zhu. on 2019.10.29
 */
export default {
    name: 'v-starry',

    props: {
        value: {
            type: Number,
            default: 0
        }
    },

    data () {
        return {
            ctx: null,
            //Time step
            dt: 0.03,
            //Time
            time: 0.0
       };
    },

    computed: {
    },

    watch: {
    },

    mounted () {
        this.init();
    },

    methods: {
        init () {
            console.log('v-starry.init ...');
            this.$refs.canvas.width = this.$refs.container.offsetWidth;
            this.$refs.canvas.height = this.$refs.container.offsetHeight;
            this.ctx = this.$refs.canvas.getContext('webgl');
            if(!this.ctx) console.error("Unable to initialize WebGL.");

            //************** Shader sources **************

            let vertexSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
            `;

            var fragmentSource = `
            precision highp float;

            uniform float width;
            uniform float height;
            vec2 resolution = vec2(width, height);

            uniform float time;

            float random(vec2 par){
                return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
            }

            vec2 random2(vec2 par){
                float rand = random(par);
                return vec2(rand, random(par+rand));
            }

            void main(){
                // Normalized pixel coordinates (from 0 to 1)
                vec2 uv = gl_FragCoord.xy/resolution.xy;

                //The ratio of the width and height of the screen
                float widthHeightRatio = resolution.x/resolution.y;

                float t = time * 0.01;
                float dist = 0.0;
                const float layers = 8.0;
                float scale = 100.0;
                float depth;
                float phase;
                float rotationAngle = time * -0.01;

                vec2 offset;
                vec2 local_uv;
                vec2 index;
                vec2 pos;
                vec2 seed;
                vec2 centre = vec2(0.5, 0.5);

                mat2 rotation = mat2(cos(rotationAngle), -sin(rotationAngle),
                                sin(rotationAngle),  cos(rotationAngle));

                for(float i = 0.0; i < layers; i++){
                    depth = fract(i/layers + t);

                    //Move centre in a circle depending on the depth of the layer
                    centre.x = 0.5 + 0.1 * cos(t) * depth;
                    centre.y = 0.5 + 0.1 * sin(t) * depth;

                    //Get uv from the fragment coordinates, rotation and depth
                    uv = centre-gl_FragCoord.xy/resolution.xy;
                    uv.y /= widthHeightRatio;
                    uv *= rotation;
                    uv *= mix(scale, 0.0, depth);

                    //The local cell
                    index = floor(uv);

                    //Local cell seed;
                    seed = 20.0 * i + index;

                    //The local cell coordinates
                    local_uv = fract(i + uv) - 0.5;

                    //Get a random position for the local cell
                    pos = 0.8 * (random2(seed) - 0.5);

                    //Get a random phase
                    phase = 128.0 * random(seed);

                    //Get distance to the generated point, add fading to distant points
                    //Add the distance to the sum
                    dist += pow(abs(1.0-length(local_uv-pos)), 50.0 + 20.0 * sin(phase + 3.0 * time)) * min(1.0, depth*2.0);
                }

                gl_FragColor = vec4(vec3(dist),0.01);
            }
            `;

            //************** Create shaders **************

            //Create vertex and fragment shaders
            let vertexShader = this.compileShader(vertexSource, this.ctx.VERTEX_SHADER),
                fragmentShader = this.compileShader(fragmentSource, this.ctx.FRAGMENT_SHADER);

            //Create shader programs
            let program = this.ctx.createProgram();
            this.ctx.attachShader(program, vertexShader);
            this.ctx.attachShader(program, fragmentShader);
            this.ctx.linkProgram(program);

            this.ctx.useProgram(program);

            //Set up rectangle covering entire canvas
            let vertexData = new Float32Array([
                -1.0,  1.0, 	// top left
                -1.0, -1.0, 	// bottom left
                1.0,  1.0, 	// top right
                1.0, -1.0, 	// bottom right
            ]);

            //Create vertex buffer
            let vertexDataBuffer = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, vertexDataBuffer);
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, vertexData, this.ctx.STATIC_DRAW);

            // Layout of our data in the vertex buffer
            let positionHandle = this.getAttribLocation(program, 'position');

            this.ctx.enableVertexAttribArray(positionHandle);
            this.ctx.vertexAttribPointer(positionHandle,
                2, 				// position is a vec2 (2 values per component)
                this.ctx.FLOAT, // each component is a float
                false, 		// don't normalize values
                2 * 4, 		// two 4 byte float components per vertex (32 bit float is 4 bytes)
                0 				// how many bytes inside the buffer to start from
            );

            //Set uniform handle
            this.timeHandle = this.getUniformLocation(program, 'time');
            let widthHandle = this.getUniformLocation(program, 'width'),
                heightHandle = this.getUniformLocation(program, 'height');

            this.ctx.uniform1f(widthHandle, this.$refs.canvas.offsetWidth);
            this.ctx.uniform1f(heightHandle, this.$refs.canvas.offsetHeight);

            // *** draw *** //
            this.draw();
        },
        draw () {
            //Update time
            this.time += this.dt;
            //Send uniforms to program
            this.ctx.uniform1f(this.timeHandle, this.time);
            //Draw a triangle strip connecting vertices 0-4
            this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4);

            requestAnimationFrame(this.draw);
        },
        //Compile shader and combine with source
        compileShader (shaderSource, shaderType){
            let shader = this.ctx.createShader(shaderType);
            this.ctx.shaderSource(shader, shaderSource);
            this.ctx.compileShader(shader);
            if(!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)){
                throw 'Shader compile failed with: ' + this.ctx.getShaderInfoLog(shader);
            }
            return shader;
        },

        //From https://codepen.io/jlfwong/pen/GqmroZ
        //Utility to complain loudly if we fail to find the attribute/uniform
        getAttribLocation(program, name) {
            var attributeLocation = this.ctx.getAttribLocation(program, name);
            if (attributeLocation === -1) {
                throw 'Cannot find attribute ' + name + '.';
            }
            return attributeLocation;
        },

        getUniformLocation(program, name) {
            var attributeLocation = this.ctx.getUniformLocation(program, name);
            if (attributeLocation === -1) {
                throw 'Cannot find uniform ' + name + '.';
            }
            return attributeLocation;
        }

    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "../scss/variables";

.v-starry {
    width: 100%;
    height: 100%;
}
</style>
