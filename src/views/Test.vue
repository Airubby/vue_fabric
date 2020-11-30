<template>
    <div class="content">
        <canvas id="designCanvas" width="300" height="300"></canvas>
        
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
        var options={
            title:{
                text:"title",  
                bottom: 15,
                x:'center',
                textStyle:{
                    color:"#999",
                    fontSize:'16'
                },
            },
            series: [
                {
                    name: "title",
                    type: 'gauge',
                    radius:'70%',
                    min:1,
                    max:3,
                    splitNumber:0,
                    axisLine:{
                        lineStyle:{
                            color:[[0.5, "#00AB6F"],[1, "#E4E5ED"]],
                            width:'10',
                        }
                    },
                    splitLine:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    },
                    axisLabel:{
                        show:false
                    },
                    pointer:{
                        length:'75%',
                        width:'0.1%'
                    },
                    itemStyle:{
                        normal:{
                            color:'transparent'
                        }
                    },
                    detail: {
                            show: true,
                            textStyle: {
                                fontSize: 26,
                                color:'#fff',
                            },
                            formatter: '{value}',
                            offsetCenter: ['0%', '0%'],
                            

                        },
                    data: [{value: 1.5}]
                }
            ]
        }
        var mcanvas=document.createElement("canvas");
        mcanvas.width=100;
        mcanvas.height=100;
        var myChart = echarts.init(mcanvas);
        myChart.setOption(options, true);

        var canvas = new fabric.Canvas('designCanvas',{backgroundColor : "",width: '300',height: '300'});
        var LabeledRect = fabric.util.createClass(fabric.Rect, {
                type: 'labeledRect',
                initialize: function(options) {
                    options || (options = { });
                    this.callSuper('initialize', options);
                },
                toObject: function() {
                    return fabric.util.object.extend(this.callSuper('toObject'), {
                    });
                },
                _render: function(ctx) {
                    this.callSuper('_render', ctx);
                    var offcanvas = myChart.getRenderedCanvas({
                        pixelRatio: 1,
                    });
                    ctx.drawImage(offcanvas,0,0);
                }
            });
            
            var labeledRect = new LabeledRect();
            canvas.add(labeledRect);

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



