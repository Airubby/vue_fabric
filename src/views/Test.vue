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
        
    //     var canvas = document.getElementById("canvas");
    // canvas.width = 200;
    // canvas.height = 200;
    // var ctx = canvas.getContext('2d');
    // var offcanvas = myChart.getRenderedCanvas({
    //     pixelRatio: 2,
    //     backgroundColor: '#fff'
    // });
    // ctx.drawImage(offcanvas,0,0);


var canvas = new fabric.Canvas('designCanvas',{backgroundColor : "",width: '300',height: '300'});
var LabeledRect = fabric.util.createClass(fabric.Rect, {
	    type: 'labeledRect',
	    initialize: function(options) {
		    options || (options = { });
		    this.callSuper('initialize', options);
		    // this.set('label', options.label || '');
		    // this.set('labelFont', options.labelFont || '');
		    // this.set('labelFill', options.labelFill || '');
	    },
	    toObject: function() {
		    return fabric.util.object.extend(this.callSuper('toObject'), {
			    // label: this.get('label'),
			    // labelFont: this.get('labelFont'),
			    // labelFill: this.get('labelFill')
		    });
	    },
	    _render: function(ctx) {
            this.callSuper('_render', ctx);
            var offcanvas = myChart.getRenderedCanvas({
                pixelRatio: 1,
            });
            ctx.drawImage(offcanvas,0,0);

		    // ctx.font = '20px Helvetica';
		    // ctx.fillStyle = '#333';
		    // console.log('this', this);
		    // ctx.font = this.labelFont;
		    // ctx.fillStyle = this.labelFill;
		    // // ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
		    // ctx.fillText(this.label, 0, 0+10);
	    }
    });
    
    var labeledRect = new LabeledRect();
    canvas.add(labeledRect);
    // setTimeout(function(){
	//     labeledRect.set({
	// 	    label: 'trololo',
	// 	    fill: '#aaf',
	// 	    rx: 10,
	// 	    ry: 10,
    //         labelFill: '#0000ff'
	//     });
	//     canvas.renderAll();
    // }, 3000)





        // this.design =new fabric.Canvas('designCanvas',{backgroundColor:''});



        // // fabric.Object.prototype.objectCaching = false;
        // var mcanvas=document.createElement("canvas");
        // mcanvas.width=300;
        // mcanvas.height=300;
        // var context = mcanvas.getContext("2d");
        // // 设置字体
        // context.font = "18px bold 黑体";
        // // 设置颜色
        // context.fillStyle = "#ff0";
        // // 设置水平对齐方式
        // context.textAlign = "center";
        // // 设置垂直对齐方式
        // context.textBaseline = "middle";
        // // 绘制文字（参数：要写的字，x坐标，y坐标）
        // context.fillText("要写的文字", 100, 100);
        // mcanvas.background="#f00";
        // // document.getElementById("test").append(mcanvas)
        // this.design.add(mcanvas);
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



