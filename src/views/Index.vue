<template>
    <div class="content">
        <div class="fabric-top">
            <div class="logo">
                <img src="/images/logo.png">
            </div>
            <div class="btn">
                
                <el-tooltip class="item" content="线段" placement="top-end">
                    <span @click="drawPolyLine('segments')"><i class="el-icon-share"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="多边形" placement="top-end">
                    <span @click="drawPolyLine('polygon')"><i class="el-icon-share"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="测试" placement="top-end">
                    <span @click="test"><i class="el-icon-picture-outline"></i></span>
                </el-tooltip>
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
        <context-menu
            :target="contextMenuTarget" 
            :show="contextMenuVisible" 
            @handleLayer="handleLayer" 
            @update:show="(show) => contextMenuVisible = contextMenuObjHover?show:contextMenuObjHover">
        </context-menu>
    </div>
</template>


<script>
import { fabric } from "fabric";
import initAligningGuidelines from '@/utils/AligningGuidelines';
import initCenteringGuidelines from '@/utils/CenteringGuidelines';
import ContextMenu from './ContextMenu';
import echarts from 'echarts';
import uuid from 'uuid-random';
import 'fabric-history';
export default {
    components:{ContextMenu},
    created () {

    },
    mounted() {
        this.init();

    },
    data() {
       return {
            contextMenuTarget:null,
            contextMenuVisible:false,
            contextMenuObjHover:false, //是否移到对象上了
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
                            
                        },
                        {
                            data:{name:"直线",icon:'el-icon-s-marketing',type:'Line'},
                            fill: '#5E2300',
                            stroke: '#5E2300',
                            strokeWidth: 10,
                            width: 100, 
                           
                        },
                        {
                            data:{name:"文字",icon:'el-icon-s-marketing',type:'IText'},
                            lockScalingFlip: true, // 不能通过缩放为负值来翻转对象
                            lockUniScaling: false, // 对象非均匀缩放被锁定
                            fontSize:16,
                            padding: 5,
                            fontFamily:'arial black',
                            fill: '#ff0000',
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
            ActiveObject:{},
            ActiveGroup:[],


            //绘制参数
            drawType:"",  //绘制类型
            drawWidth: 2, //笔触宽度
            color: "#E34F51", //画笔颜色
            drawingObject: null, //当前绘制对象
            moveCount: 1, //绘制移动计数器
            doDrawing: false, // 绘制状态
            
            mouseFrom: {},
            mouseTo: {},
            
            polygonMode: false,
            pointArray: [],
            lineArray: [],
            activeShape: false,
            activeLine: "",
            line: {},
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
            initAligningGuidelines(_this.design);   //初始化辅助线
            initCenteringGuidelines(_this.design);
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
                                _this.design.undo();
                            }
                            break;
                        case 89:
                            if(ev.ctrlKey){ //反撤销  ctrl+y
                                _this.design.redo();
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
                //绘制
                // 记录鼠标按下时的坐标
                var xy = opt.pointer || _this.transformMouse(evt.offsetX, evt.offsetY);
                _this.mouseFrom.x = xy.x;
                _this.mouseFrom.y = xy.y;
                _this.doDrawing = true;
                // 绘制多边形
                if (_this.drawType == "polygon"||_this.drawType == "segments") {
                    _this.design.skipTargetFind = false;
                    try {
                        // 此段为判断是否闭合多边形，点击红点时闭合多边形
                        if (_this.pointArray.length > 1) {
                            // opt.target.id == this.pointArray[0].id 表示点击了初始红点
                            if (_this.drawType == "polygon"&&opt.target && opt.target.id == _this.pointArray[0].id) {
                                _this.generatePolygon();
                            }
                            if(_this.drawType == "segments"&&opt.target&&opt.target.id==_this.pointArray[_this.pointArray.length-1].id){
                                _this.generateSegements();
                            }
                        }
                        //未点击红点则继续作画
                        if (_this.polygonMode) {
                            _this.addPoint(opt);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
            _this.design.on('mouse:move', function(opt) {
                var e = opt.e;
                if (this.isDragging) {
                    var vpt = this.viewportTransform;
                    vpt[4] += e.clientX - this.lastPosX;
                    vpt[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                    _this.viewportTransform=this.viewportTransform;
                }
                //绘制
                if (_this.moveCount % 3 && !_this.doDrawing) {
                    //减少绘制频率
                    return;
                }
                _this.moveCount++;
                var xy = opt.pointer || _this.transformMouse(e.offsetX, e.offsetY);
                _this.mouseTo.x = xy.x;
                _this.mouseTo.y = xy.y;
                
                if (_this.drawType == "polygon"||_this.drawType == "segments") {
                    if (_this.activeLine && _this.activeLine.class == "line") {
                        var pointer = _this.design.getPointer(e);
                        _this.activeLine.set({ x2: pointer.x, y2: pointer.y });
                        if(_this.drawType == "polygon"){
                            var points = _this.activeShape.get("points");
                            points[_this.pointArray.length] = {
                                x: pointer.x,
                                y: pointer.y,
                                zIndex: 1
                            };
                            _this.activeShape.set({
                                points: points
                            });
                        }
                        
                        // _this.design.renderAll();
                    }
                    _this.design.renderAll();
                }
            });
            _this.design.on('mouse:up', function(opt) {
                var e=opt.e;
                this.isDragging = false;
                this.selection = true;

                if(_this.drawType == "polygon"||_this.drawType == "segments"){
                    var xy = opt.pointer || _this.transformMouse(e.offsetX, e.offsetY);
                    _this.mouseTo.x = xy.x;
                    _this.mouseTo.y = xy.y;
                    _this.drawingObject = null;
                    _this.moveCount = 1;
                }
                

                
            });
            _this.design.on('object:moving',function(opt){
                console.log(opt)
                let target = opt.target;
                let point = opt.target;
                target.startLine && target.startLine.set({ 'x2': target.left, 'y2': target.top });
                target.endLine && target.endLine.set({ 'x1': target.left, 'y1': target.top });
                if(point._objects){
                    for(let i=0;i<point._objects.length;i++){
                        target=point._objects[i];
                        let left=point.left+target.left;
                        let top=point.top+target.top;
                        target.startLine && target.startLine.set({ 'x2': left, 'y2': top });
                        target.endLine && target.endLine.set({ 'x1': left, 'y1': top });
                    }
                }
                _this.design.renderAll();
            });
            _this.design.on('mouse:over', function(opt) {
                
                if(opt.target){
                    console.log(opt)
                    _this.contextMenuObjHover=true;
                    if(opt.target._objects){
                        _this.ActiveGroup=opt.target._objects;
                    }else{
                        _this.ActiveObject=opt.target;
                    }
                    
                }
            });
            _this.design.on('mouse:out', function() {
                _this.contextMenuObjHover=false;
            });

            
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
            this.pointArray.map((point) => {
                points.push({
                    x: point.left,
                    y: point.top
                });
                this.design.remove(point);
            });
            this.lineArray.map((line) => {
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
                    var p = this.activeShape.get("points");
                    p.push({
                        x: pos.x,
                        y: pos.y
                    });
                    let polygon = new fabric.Polygon(points, {
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
                    let polygon = new fabric.Polygon(polyPoint, {
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



