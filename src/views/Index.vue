<template>
    <div class="content">
        <div class="fabric-top">
            <div class="logo">
                <img src="/images/logo.png">
            </div>
            <div class="btn">
                <el-tooltip class="item" content="更改图片" placement="top-end">
                    <span @click="changeImg"><i class="el-icon-picture-outline"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="设计预览" placement="top-end">
                    <span @click="showDesign"><i class="el-icon-view"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="删除对象" placement="top-end">
                    <span @click="removeObject"><i class="el-icon-folder-delete"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="保存操作(Ctrl+s)" placement="top-end">
                    <span @click="saveDesign"><i class="el-icon-folder-checked"></i></span>
                </el-tooltip>
            </div>
        </div>
        <div class="fabric-con">
            <div class="side-bar">
                <el-scrollbar class="scrollbar">
                    <el-collapse v-model="activeItem" accordion>
                        <el-collapse-item :title="list.title" :name="list.key" :key="list.key" v-for="list in List">
                            <div class="collapse-con">
                                <span v-for="(item,index) in list.data" :title="item.data.name" :key="index">
                                    <i :class="item.data.icon" draggable="true" @dragstart="drag($event,item)"></i>
                                </span>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </el-scrollbar>
            </div>
            <div class="fabric-body" id="canvas-box" @drop='drop($event)' @touchstart='drop($event)' @dragover='allowDrop($event)'>
                <canvas id="designCanvas"></canvas>
            </div>
        </div>
    </div>
</template>


<script>
import { fabric } from "fabric";
import echarts from 'echarts';
var _ = require('lodash');
import uuid from 'uuid-random';
export default {
    created () {

    },
    mounted() {
        let _this=this;
        this.init();
        console.log(fabric.util)

    },
    data() {
       return {
            activeItem: 'second',
            List:[
                {
                    title:"基本图形",
                    key:"first",
                    data:[
                        {
                            data:{
                                name:"矩形",
                                icon:'el-icon-s-marketing',
                                type:'Rect',
                            },
                            width: 50, height: 50,
                            fill: 'rgba(255,0,0,0.5)'
                        },{
                            
                            data:{name:"圆形",icon:'el-icon-s-marketing',type:'Circle'},
                            radius: 50, left: 12, top: 12, fill: '#aac'
                        },
                        {
                            width: 100, height: 100, fill: '#cca',
                            data:{name:"三角形",icon:'el-icon-s-marketing',type:'Triangle'},
                            
                        },{
                            data:{name:"直线",icon:'el-icon-s-marketing',type:'Line'},
                            fill: '#5E2300',
                            stroke: '#5E2300',
                            strokeWidth: 10,
                            width: 100, 
                           
                        }
                    ]
                },
                {
                    title:"自定义图形",
                    key:"second",
                    data:[
                        {
                            data:{
                                name:"自定义",icon:'el-icon-s-marketing',type:'Echart',
                                value:1,width:10,
                                handle:[`data.options.series.axisLine.lineStyle.width=data.width;`,`data.options.series.data[0].value=data.value;`],
                                options:{
                                    title:{
                                        text:"",  
                                        bottom: 15,
                                        x:'center',
                                        textStyle:{
                                            color:"#999",
                                            fontSize:'16'
                                        },
                                    },
                                    series: {
                                        name: "title",
                                        type: 'gauge',
                                        radius:'99%',
                                        min:1,
                                        max:3,
                                        splitNumber:0,
                                        axisLine:{
                                            lineStyle:{
                                                color:[[0.5, "#00AB6F"],[1, "#E4E5ED"]],
                                                width:10,
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
                                }
                            },
                            width: 100, 
                            height: 100, 
                            fill:"transparent",
                        },
                        {
                            width:50,
                            height:50,
                            data:{
                                name:"自定义",icon:'el-icon-s-marketing',type:'Svg',
                                imgsrc:"images/wechat.svg"
                            }
                        }
                    ]
                }
            ],
            zoomPoint:"",//中心点
            zoom:1, //缩放比例
            viewportTransform:null, //拖动画布后，存的距离上左的间距arr[0]比率；arr[4]左右移动的距离；arr[5]上下移动距离
            design:"",
       }
    },
    methods:{
        init:function(){
            let _this=this;
            _this.design =new fabric.Canvas('designCanvas',{backgroundColor:''});
            let dom=document.getElementById("canvas-box");
            
            _this.design.setWidth(dom.offsetWidth);
            _this.design.setHeight(dom.offsetHeight);
            this.zoomPoint = new fabric.Point(_this.design.width / 2 , _this.design.height / 2);
            // window.onresize=function(){
            //     _this.design.setWidth(dom.offsetWidth);
            //     _this.design.setHeight(dom.offsetHeight);
            //     console.log(_this.design)
            //     // _this.design.zoomToPoint(_this.zoomPoint, _this.zoom);
            //     // _this.design.requestRenderAll();
            // };
            document.onkeydown=function(event){
                if (_this && _this._isDestroyed) {return}  //摧毁组件了就不执行下面了，不然其他地方input框又可能不能输入下面的快捷键
                var ev = event || window.event || arguments.callee.caller.arguments[0];
                if(ev){
                    switch(ev.keyCode){
                        case 46 :// 点击删除
                            _this.removeObject();
                            break;
                        case 90:
                            if(ev.ctrlKey){ //撤销 ctrl+z
                                _this.backout();
                            }
                            break;
                        case 89:
                            if(ev.ctrlKey){ //反撤销  ctrl+y
                            _this.returnBackout();
                            }
                            break;
                        case 83:
                            ev.preventDefault(); 
                            if(ev.ctrlKey){
                                _this.saveDesign();
                            }
                            break;
                    }
                }
            }
            
            _this.design.on('mouse:wheel', function(opt) {
                console.log(this)
                var delta = opt.e.deltaY;
                _this.zoom = _this.design.getZoom();
                _this.zoom *= 0.999 ** delta;
                if (_this.zoom > 20) _this.zoom = 20;
                if (_this.zoom < 0.01) _this.zoom = 0.01;
                this.zoomToPoint(_this.zoomPoint, _this.zoom);
                // this.setZoom(_this.zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                _this.viewportTransform=this.viewportTransform;
            });
            _this.design.on('mouse:down', function(opt) {
                var evt = opt.e;
                if (evt.altKey === true) {
                    this.isDragging = true;
                    this.selection = false;
                    this.lastPosX = evt.clientX;
                    this.lastPosY = evt.clientY;
                }
            });
            _this.design.on('mouse:move', function(opt) {
                if (this.isDragging) {
                    var e = opt.e;
                    var vpt = this.viewportTransform;
                    vpt[4] += e.clientX - this.lastPosX;
                    vpt[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                    _this.viewportTransform=this.viewportTransform;
                }
            });
            _this.design.on('mouse:up', function(opt) {
                this.isDragging = false;
                this.selection = true;
            });
            _this.design.on('object:move',function(opt){
                _this.$confirm("确定删除？","提示",{
                    confirmButtonText:"确定",
                    cancelButtonText:"取消",
                    type:"warning"
                }).then(()=>{
                    _this.design.remove(
                        _this.design.item(
                            _this.design.getObjects().indexOf(opt.target)
                        )
                    )

                })
            });
            
        },
        //拖拽
        drag:function(ev,item){
            ev.dataTransfer.setData("item",JSON.stringify(item));
        },
        allowDrop:function (ev) {
            ev.preventDefault();
        },
        drop:function(ev){
            var object="";
            // //开始缩放
            this.design.zoomToPoint(this.zoomPoint, this.zoom);

            var json=JSON.parse(ev.dataTransfer.getData("item"));
            var left=ev.offsetX;
            var top=ev.offsetY;
            //viewportTransform[0] 存的缩放比例；viewportTransform[4]X轴移动距离；this.viewportTransform[5]Y轴移动距离
            if(this.viewportTransform){
                left=(left-this.viewportTransform[4])/this.zoom;
                top=(top-this.viewportTransform[5])/this.zoom;
                
            }
            json.left=left;
            json.top=top;
            json.data["uuid"]=uuid();
            switch (json.data.type){
                case 'Line':
                    //[终止位置，线长，起始位置，top]
                    object=new fabric.Line([left,json.width,left,top],json)
                    break;
                case 'Echart':
                    object=this.getCanvas(json);
                    break;
                case 'Svg':
                    this.getSvg(json);
                    break;
                default:
                    object= new fabric[json.data.type](json);
                    break;
            }
            if(object!=""){
                this.addObject(object);
            }
        },
        addObject:function(object){
            let _this=this;
            object.toObject = (function (toObject) {//赋值自定义属性
                return function (properties) {
                    return fabric.util.object.extend(toObject.call(this, properties), {
                        data: this.data
                    });
                };
            })(object.toObject);
            this.design.add(object);
        },
        getCanvas:function(json){
            var canvas=document.createElement("canvas");
            canvas.width=json.width?json.width*this.zoom:100;
            canvas.height=json.height?json.height*this.zoom:100;
            console.log(canvas)
            var myChart = echarts.init(canvas);
            var data=json.data||{}
            if(data.hasOwnProperty("handle")){
                for(let i=0;i<json.data.handle.length;i++){
                    eval(data.handle[i]);
                }
            }
            myChart.setOption(data.options, true);
            var CanvasRect = fabric.util.createClass(fabric.Rect, {
                type: 'canvasRect',
                initialize: function(options) {
                    options || (options = { });
                    this.callSuper('initialize', options);
                    // this.set('label', options.label || '');
                },
                toObject: function() {
                    return fabric.util.object.extend(this.callSuper('toObject'), {
                        // label: this.get('label'),
                    });
                },
                _render: function(ctx) {
                    this.callSuper('_render', ctx);
                    var offcanvas = myChart.getRenderedCanvas({
                        pixelRatio: 2,
                        backgroundColor:""
                    });
                    //在画布上定位图像，并规定图像的宽度和高度： ctx.drawImage(img,x,y,width,height);
                    ctx.drawImage(offcanvas,-(json.width/2),-(json.height/2),json.width,json.height);
                }
            });
            console.log(new CanvasRect(json))
            return new CanvasRect(json);
        },
        getSvg:function(json){
            let _this=this;
            fabric.Image.fromURL(json.data.imgsrc, function(object){
                console.log(object)
                object["data"]=json.data;
                object.set({
                    left: json.left,
                    top: json.top,
                    // scaleX:json.width/object.width,
                    // scaleY:json.height/object.height
                });
                object.scaleToWidth(json.width);
                object.scaleToHeight(json.height);
                _this.addObject(object)
            });
        },
        changeImg:function(){
            let _this=this;
            if(this.design.getActiveObject()){
                let objects=this.design.getObjects();
                let uuid=this.design.getActiveObject().data.uuid;
                for(let i=0;i<objects.length;i++){
                    // //更改图片
                    if(objects[i].data.uuid==uuid&&objects[i].data.type=="Svg"){
                        console.log(objects[i])
                        let imgsrc="images/runstatus.svg";
                        let json=objects[i];
                        json.data.imgsrc=imgsrc;
                        fabric.Image.fromURL(imgsrc, function(object){
                            console.log(object)
                            object["data"]=json.data;
                            object.set({
                                left: json.left,
                                top: json.top,
                            });
                            object.scaleToWidth(objects[i].width*objects[i].scaleX);
                            object.scaleToHeight(objects[i].height*objects[i].scaleY);
                            _this.design.remove(json);
                            _this.addObject(object);
                        });
                    }

                    //更改canvas
                    if(objects[i].data.uuid==uuid&&objects[i].data.type=="Echart"){
                        console.log(objects[i])
                        console.log(this.zoom)
                        let json={
                            width:objects[i].width,
                            height:objects[i].height,
                            data:objects[i].data
                        };
                        json.data.value=5.2;

                        var canvas=document.createElement("canvas");
                        canvas.width=json.width;
                        canvas.height=json.height;
                        console.log(canvas)
                        var myChart = echarts.init(canvas);
                        var data=json.data||{}
                        if(data.hasOwnProperty("handle")){
                            for(let i=0;i<json.data.handle.length;i++){
                                eval(data.handle[i]);
                            }
                        }
                        myChart.setOption(data.options, true);
                        var offcanvas = myChart.getRenderedCanvas({
                            pixelRatio: 2,
                            backgroundColor:""
                        });
                        objects[i]._cacheContext.clearRect(-(json.width/2),-(json.height/2),json.width,json.height);
                        objects[i]._cacheContext.drawImage(offcanvas,-(json.width/2),-(json.height/2),json.width,json.height);
                        this.design.renderAll();
                    }

                }
            }
        },
        //删除对象
        removeObject:function(){
            if(this.design.getActiveObject()){
                this.$confirm("确定删除？","提示",{
                    confirmButtonText:"确定",
                    cancelButtonText:"取消",
                    type:"warning"
                }).then(()=>{
                    this.design.remove(this.design.getActiveObject());
                })
            }else{
                this.$notify.warning("请选择需要删除的对象");
            }
            
        },
        //保存
        saveDesign:function(){
            //canvas.item(0).sourcePath = '/assets/dragon.svg';
            sessionStorage.setItem("canvasDesign",JSON.stringify(this.design.toDatalessJSON()))
            console.log(JSON.stringify(this.design.toJSON()))
            this.$notify.success("保存成功！");
        },
        //查看
        showDesign:function(){
            this.$router.push({path:'/show'});
        }
    },
}
</script>
<style lang="less" scoped>
    .content{
        width: 100%;
        height: 100%;
        background: #061C47;
        .fabric-top{
            width: 100%;
            height: 60px;
            font-size: 16px;
            background: #052b62;
            text-align: right;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .item{
                color: #DDE4F6;
                margin-left: 20px;
                font-size: 30px;
                line-height: 60px;
                cursor: pointer;
            }
        }
        .fabric-con{
            width: 100%;
            height: calc(100% - 60px);
            display: flex;
        }
        .fabric-body{
            width: calc(100% - 225px);
            height: 100%;
        }
        .side-bar{
            width: 225px;
            height: 100%;
            display: block;
            background: #073474;
            color: #DDE4F6;
            z-index: 999;
            transition: all 0.5s ease-in;
            .collapse-con{
                padding: 15px 10px 0;
                display: flex;
                flex-wrap: nowrap;
                span{
                    display: block;
                    margin: 0 5px;
                    cursor: move;
                    i{
                        font-size: 40px;
                        color: #DDE4F6;
                    }
                }
            }
            /deep/ .el-collapse{
                border-color: #0A3B79;
            }
            /deep/ .el-collapse-item__header {
                background: #0A3B79;
                color: #fff;
                border-bottom-color: #073474;
                padding-left: 20px;
            }
            /deep/ .el-collapse-item__wrap{
                background-color: #073474;
                border-color: #073474;
            }
            /deep/ .el-collapse-item__arrow{
                font-size: 16px;
            }
            /deep/ .el-collapse-item.is-active .el-collapse-item__header{
                color: #16c5bb;
            }
            /deep/ .el-scrollbar__wrap{
                overflow-x: hidden; 
            }
        }
        
    }
</style>



