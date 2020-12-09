<template>
    <div class="content">
        <canvas id="designCanvas" width="300" height="300"></canvas>
        <div id="test" style="height: 100px;width: 100px;background:pink;position:absolute;top:0;left:0;">测试文字</div>
    </div>
</template>


<script>
import { fabric } from "fabric";
import echarts from 'echarts'
var _ = require('lodash'); 
export default {
    created () {

    },
    mounted() {
        function drag(obj){
            obj.onmousedown = function(e){
                e = e || event;
                //获取元素距离定位父级的x轴及y轴距离
                var x0 = this.offsetLeft;
                var y0 = this.offsetTop;
                //获取此时鼠标距离视口左上角的x轴及y轴距离
                var x1 = e.clientX;
                var y1 = e.clientY;
                //鼠标按下时，获得此时的页面区域
                var L0 = 0;
                var R0 = document.documentElement.clientWidth;
                var T0 = 0;
                var B0 = document.documentElement.clientHeight;
                //鼠标按下时，获得此时的元素宽高
                var EH = obj.offsetHeight;
                var EW = obj.offsetWidth;
                document.onmousemove = function(e){
                e = e || event;
                //获取此时鼠标距离视口左上角的x轴及y轴距离
                x2 = e.clientX;
                y2 = e.clientY; 
                //计算此时元素应该距离视口左上角的x轴及y轴距离
                var X = x0 + (x2 - x1);
                var Y = y0 + (y2 - y1);
                /******磁性吸附*******/
                //获取鼠标移动时元素四边的瞬时值
                var L = X;
                var R = X + EW;
                var T = Y;
                var B = Y + EH;
                //在将X和Y赋值给left和top之前，进行范围限定
                //只有在范围内时，才进行相应的移动
                //如果到达左侧的吸附范围，则left置L0
                if(L - L0 < 50){X = L0;}
                //如果到达右侧的吸附范围，则left置为R0
                if(R0 - R < 50){X = R0 - EW;}
                //如果到达上侧的吸附范围，则top置T0
                if(T - T0 < 50){Y = T0;}
                //如果到达右侧的吸附范围，则top置为B0
                if(B0 - B < 50){Y = B0 - EH;}
                obj.style.left = X + 'px';
                obj.style.top = Y + 'px';
                }
                document.onmouseup = function(e){
                //当鼠标抬起时，拖拽结束，则将onmousemove赋值为null即可
                document.onmousemove = null;
                //释放全局捕获
                if(obj.releaseCapture){
                    obj.releaseCapture();
                }
                }
                //阻止默认行为
                return false;
                //IE8-浏览器阻止默认行为
                if(obj.setCapture){
                obj.setCapture();
                }
            } 
        }
        drag(test);
    },
    data() {
       return {
            
       }
    },
    methods:{
        
    },
    components:{}
}
</script>
<style lang="less" scoped>
    .content{
        width: 100%;
        height: 100%;
        background: #061C47;
        .minimap {
            border: 1px solid blue;
            position: absolute !important;
            top: 20px;
            left: 20px;
        }
        .design {
            border: 1px solid black;
        }

    }
</style>



