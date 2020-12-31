<template>
    <div class="content">
        <div class="fabric-con">
            <div class="fabric-body" id="canvas-box" @drop='drop($event)' @touchstart='drop($event)' @dragover='allowDrop($event)'>
                <canvas class="root"></canvas>
                <canvas id="designCanvas"></canvas>
            </div>
        </div>
    </div>
</template>


<script>
import { fabric } from "fabric";
import Ruler from './test/Ruler'
export default {
    components:{},
    created () {

    },
    mounted() {
        let _this=this;
        this.init();
        this.ruler = new Ruler({
            canvasId: ".root",
            width: 1000,
        }).render();

    },
    data() {
       return {
            
            zoomPoint:"",//中心点
            zoom:1, //缩放比例
            viewportTransform:null, //拖动画布后，存的距离上左的间距arr[0]比率；arr[4]左右移动的距离；arr[5]上下移动距离
            design:"",
            ActiveObject:{},
            ActiveGroup:[],

            ruler:null,
            timer:null,
            lastTime:null,
       }
    },
    methods:{
        init:function(){
            let _this=this;
            _this.design =new fabric.Canvas('designCanvas',{
                backgroundColor:'',
                // skipTargetFind: false, //当为真时，跳过目标检测。目标检测将返回始终未定义。点击选择将无效
                // selectable: false,  //为false时，不能选择对象进行修改
                // selection: false   // 是否可以多个对象为一组
            });
            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
            let dom=document.getElementById("canvas-box");
            this.contextMenuTarget=dom;
            
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
            
            _this.design.on('mouse:wheel', function(opt) {
                var delta = opt.e.deltaY;
                _this.zoom = _this.design.getZoom();
                _this.zoom *= 0.999 ** delta;
                if (_this.zoom > 20) _this.zoom = 20;
                if (_this.zoom < 0.01) _this.zoom = 0.01;
                this.zoomToPoint(_this.zoomPoint, _this.zoom);
                // this.setZoom(_this.zoom);
                _this.mouseWheel();
                opt.e.preventDefault();
                opt.e.stopPropagation();
                _this.viewportTransform=this.viewportTransform;
            });
           
            
        },
        mouseWheel:function(){
            let _this=this;
            clearTimeout(this.timer);
            this.timer=null;
            if(this.lastTime==null){
                this.ruler.update({
                    scale:this.zoom,
                });
            }else{
                let lastTime=new Date();
                if(lastTime.getTime()-this.lastTime.getTime()>500){ //时间超过了一秒
                    this.ruler.update({
                        scale:this.zoom,
                    });
                }else{
                    this.timer=setTimeout(() => {
                        _this.mouseWheel();
                    }, 500);
                }
            }
            this.lastTime=new Date();
        },
        transformMouse(mouseX, mouseY) {
            return { x: mouseX / 1, y: mouseY / 1 };
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
                case 'IText':
                    object=new fabric.IText('文字信息',json)
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
                console.log(this.design.getActiveObject())
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
        },
        test:function(){
            fabric.backgroundImage = 'https://source.unsplash.com/random'
        },

        //绘制多边形
        drawPolyLine:function(type){
            this.drawType = type;
            this.polygonMode = true;
            this.pointArray = [];  // 顶点集合
            this.lineArray = [];  //线集合
            this.design.isDrawingMode = false;
        },
        finishPolyLine:function(){
            this.activeLine = null;
            this.activeShape = null;
            this.polygonMode = false;
            this.doDrawing = false;
            this.drawType = null;
        },
        generatePolygon() {
            var points = [];
            this.pointArray.map((point, index) => {
                points.push({
                    x: point.left,
                    y: point.top
                });
                this.design.remove(point);
            });
            this.lineArray.map((line, index) => {
                this.design.remove(line);
            });
            this.design.remove(this.activeShape).remove(this.activeLine);
            var polygon = new fabric.Polygon(points, {
                stroke: this.color,
                strokeWidth: this.drawWidth,
                fill: "rgba(255, 255, 255, 0)",
                opacity: 1,
                hasBorders: true,
                hasControls: false
            });
            this.design.add(polygon);

            this.finishPolyLine();
            
        },
        generateSegements(){
            
            this.design.remove(this.lineArray[this.lineArray.length-1]);
            this.lineArray.splice(this.lineArray.length-1,1);
        
            for(let i=0;i<this.pointArray.length;i++){
                if(i==0){
                    this.pointArray[i].startLine=null;
                    this.pointArray[i].endLine=this.lineArray[0];
                }else{
                    if(i==this.lineArray.length){
                        this.pointArray[i].startLine=this.lineArray[i-1];
                        this.pointArray[i].endLine=null;
                    }else{
                        this.pointArray[i].startLine=this.lineArray[i-1];
                        this.pointArray[i].endLine=this.lineArray[i];
                    }
                }
            }


            // for(let i=0;i<this.pointArray.length;i++){
            //     if(i==0){
            //         this.design.add(this.makeCircle(this.lineArray[i].get('x1'),this.lineArray[i].get('y1'),null,this.lineArray[i]));
            //     }else{
            //         if(i==this.lineArray.length){
            //             this.design.add(this.makeCircle(this.lineArray[i-1].get('x2'),this.lineArray[i-1].get('y2'),this.lineArray[i-1],null));
            //         }else{
            //             this.design.add(this.makeCircle(this.lineArray[i-1].get('x2'),this.lineArray[i-1].get('y2'),this.lineArray[i-1],this.lineArray[i]));
            //         }
            //     }
            // }

            this.finishPolyLine();
        },
        makeCircle:function(left, top, line1, line2){
            var c = new fabric.Circle({
                left: left,
                top: top,
                radius: 5,
                fill: "#ffffff",
                stroke: "#333333",
                strokeWidth: 0.5,
            });
            c.hasControls = c.hasBorders = false;

            c.startLine = line1;
            c.endLine = line2;

            return c;
        },
        addPoint(e) {
            // var random = Math.floor(Math.random() * 10000);
            // var id = new Date().getTime() + random;
            var id=uuid();
            var circle = new fabric.Circle({
                radius: 5,
                fill: "#ffffff",
                stroke: "#333333",
                strokeWidth: 0.5,
                left: (e.pointer.x || e.e.layerX) / this.design.getZoom(),
                top: (e.pointer.y || e.e.layerY) / this.design.getZoom(),
                // selectable: false,
                hasBorders: false,
                hasControls: false,
                originX: "center",
                originY: "center",
                id: id,
                objectCaching: false
            });
            var points = [
                (e.pointer.x || e.e.layerX) / this.design.getZoom(),
                (e.pointer.y || e.e.layerY) / this.design.getZoom(),
                (e.pointer.x || e.e.layerX) / this.design.getZoom(),
                (e.pointer.y || e.e.layerY) / this.design.getZoom()
            ];

            this.line = new fabric.Line(points, {
                strokeWidth: 2,
                fill: "#999999",
                stroke: "#999999",
                class: "line",
                originX: "center",
                originY: "center",
                selectable: false,
                // hasBorders: false,
                // hasControls: false,
                evented: false,

                objectCaching: false
            });
            if(this.drawType=="polygon"){
                if (this.activeShape) {
                    var pos = this.design.getPointer(e.e);
                    var points = this.activeShape.get("points");
                    points.push({
                        x: pos.x,
                        y: pos.y
                    });
                    var polygon = new fabric.Polygon(points, {
                        stroke: "#333333",
                        strokeWidth: 1,
                        fill: "#cccccc",
                        opacity: 0.3,

                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        evented: false,
                        objectCaching: false
                    });
                    this.design.remove(this.activeShape);
                    this.design.add(polygon);
                    this.activeShape = polygon;
                    this.design.renderAll();
                } else {
                    var polyPoint = [{
                        x: (e.pointer.x || e.e.layerX) / this.design.getZoom(),
                        y: (e.pointer.y || e.e.layerY) / this.design.getZoom()
                    }];
                    var polygon = new fabric.Polygon(polyPoint, {
                        stroke: "#333333",
                        strokeWidth: 1,
                        fill: "#cccccc",
                        opacity: 0.3,

                        selectable: false,
                        hasBorders: false,
                        hasControls: false,
                        evented: false,
                        objectCaching: false
                    });
                    this.activeShape = polygon;
                    this.design.add(polygon);
                }
            }
            
            this.activeLine = this.line;

            this.pointArray.push(circle);
            this.lineArray.push(this.line);
            this.design.add(this.line);
            this.design.add(circle);
        },
        //操作图层
        handleLayer:function(type){
            console.log(type)
            switch(type) {
                case "upLayer":
                    if(this.ActiveObject){
                        this.ActiveObject.bringForward();
                    }
                    break;
                case "downLayer":
                    if(this.ActiveObject){
                        this.ActiveObject.sendBackwards();
                    }
                    break;
                case "topLayer":
                    if(this.ActiveObject){
                        this.ActiveObject.bringToFront();
                    }
                    break;
                case "footLayer":
                    if(this.ActiveObject){
                        this.ActiveObject.sendToBack();
                    }
                    break;
                case "removeLayer":
                    if( this.ActiveObject ){
                        this.$confirm("确定删除？","提示",{
                            confirmButtonText:"确定",
                            cancelButtonText:"取消",
                            type:"warning"
                        }).then(()=>{
                            console.log(this.ActiveObject)
                            this.design.remove(this.ActiveObject);
                            this.ActiveObject = null;
                        })
                    }
                    break;
                default:
                    
            } 
            this.contextMenuVisible=false;
        }
    },
    watch:{
        drawType() {
            this.design.selection = !this.drawType;
        },
    }
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
                flex-wrap: wrap;
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



