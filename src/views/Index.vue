<template>
    <div class="content">
        <div class="side-bar">
            <h2 class="title">
                <img src="/images/logo.png">
            </h2>
            <el-scrollbar class="side-content">
                <el-collapse v-model="activeItem" accordion>
                    <el-collapse-item :title="list.title" :name="list.key" :key="list.key" v-for="list in List">
                        <div class="collapse-con">
                            <span v-for="(item,index) in list.data" :title="item.title" :key="index">
                                <i :class="item.icon" draggable="true" @dragstart="drag($event,item)"></i>
                            </span>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </el-scrollbar>
        </div>
        <div class="fabric-con">
            <div class="fabric-top"></div>
            <div class="fabric-body" id="canvas-box" @drop='drop($event)' @touchstart='drop($event)'  @dragover='allowDrop($event)'>
                <canvas id="canvas"></canvas>
            </div>
        </div>
    </div>
</template>


<script>
import { fabric } from "fabric";
export default {
    created () {

    },
    mounted() {
        let _this=this;
        this.init();
        //是否拖动
        var panning = false;
        //鼠标按下
        _this.canvas.on('mouse:down', function (options) {
            _this.mouseDown.x=options.e.offsetX;
            _this.mouseDown.y=options.e.offsetY;
            if(_this.drawing){
                _this.startDrawing=true;
            }
            //按住alt键才可拖动画布
            if(options.e.altKey) {
                panning = true;
                _this.canvas.selection = false;
            }
            //如果是按下point
            if(options.target&&options.target.pointEdit){
                _this.thePointObj=options.target;
                _this.canvas.bringForward(options.target)
            }
            //如果按下是自定义对象
            if(options.target&&options.target.custom){
                _this.customObj=options.target;
                _this._customObj=Object.assign({}, options.target)
            }


        });

        //鼠标抬起
        _this.canvas.on('mouse:up', function (options) {
            _this.mouseTo.x=options.e.offsetX;
            _this.mouseTo.y=options.e.offsetY;
            panning = false;
            _this.canvas.selection = true;
            _this.startDrawing=false;
            if(_this.drawing){
                _this.drawGraph();
            }
            //如果是按下point抬起
            if(options.target&&options.target.pointEdit){
                _this.thePointObj="";
            }
            //如果按下是自定义对象
            if(options.target&&options.target.custom){
                _this.customObj="";
                _this._customObj="";
            }


        });

        //鼠标移动按住alt拖动画布
        _this.canvas.on('mouse:move', function (options) {
            if (panning && options && options.e) {
                var delta = new fabric.Point(options.e.movementX, options.e.movementY);
                _this.canvas.relativePan(delta);
            }
            if(_this.drawing&&_this.startDrawing){
                _this.mouseTo.x=options.e.offsetX;
                _this.mouseTo.y=options.e.offsetY;
                _this.drawLine()
            }
        });
        //拖动对象移动
        _this.canvas.on('object:moving',function(options){
            console.log(options)
            if(options.target.pointEdit){  //pointEdit自定义的字段，
                //_this.thePointObj=options.target;
            }
        });

        
    },
    data() {
       return {
            activeItem: 'first',
            List:[
                {
                    title:"基本图形",
                    key:"first",
                    data:[
                        {
                                title:'矩形',
                                type:'Rect',
                                icon:'el-icon-s-marketing',
                                json:{
                                    width: 50, height: 50, left: 25, top: 25,
                                    fill: 'rgba(255,0,0,0.5)'
                                },
                            },{
                                title:'圆形',
                                type:'Circle',
                                icon:'el-icon-s-marketing',
                                json:{
                                    radius: 50, left: 12, top: 12, fill: '#aac'
                                }
                            },{
                                title:'三角形',
                                type:'Triangle',
                                icon:'el-icon-s-marketing',
                                json:{
                                    width: 100, height: 100, left: 50, top: 50, fill: '#cca'
                                }
                            },{
                                title:'直线',
                                type:'',
                                otherType:"Line",
                                icon:'el-icon-s-marketing',
                                json:{
                                    fill: '#5E2300',
                                    stroke: '#5E2300',
                                    strokeWidth: 4,
                                    width: 100, 
                                    left: 50, 
                                    top: 2
                                }
                            }
                    ]
                },
                {
                    title:"自定义图形",
                    key:"second",
                    data:[
                        {
                                title:'矩形',
                                type:'Rect',
                                icon:'el-icon-s-marketing',
                                json:{
                                    width: 50, height: 50, left: 50, top: 50,
                                    fill: 'rgba(255,0,0,0.5)'
                                },
                            },{
                                title:'圆形',
                                type:'Circle',
                                icon:'el-icon-s-marketing',
                                json:{
                                    radius: 50, left: 50, top: 50, fill: '#aac'
                                }
                            },{
                                title:'三角形',
                                type:'Triangle',
                                icon:'el-icon-s-marketing',
                                json:{
                                    width: 100, height: 100, left: 50, top: 50, fill: '#cca'
                                }
                            },{
                                title:'直线',
                                type:'',
                                otherType:"Line",
                                icon:'el-icon-s-marketing',
                                json:{
                                    fill: '#5E2300',
                                    stroke: '#5E2300',
                                    strokeWidth: 4,
                                    width: 100, 
                                    left: 50, 
                                    top: 50
                                }
                            }
                    ]
                }
            ],
           
            type:"Line",
            canvas:"",
            evIcon:'',  //存储拖拽的图片组件，用于获取拖动图片组件时获取其偏移值offsetX，offsetY
       }
    },
    methods:{
        init:function(){
            let _this=this;
            _this.canvas =new fabric.Canvas('canvas',{backgroundColor:''});
            let dom=document.getElementById("canvas-box");
            window.onresize=resizeCanvas();
            _this.canvas.setWidth(dom.offsetWidth);
            _this.canvas.setHeight(dom.offsetHeight);
            function resizeCanvas() {   
                _this.canvas.setWidth(dom.offsetWidth);
                _this.canvas.setHeight(dom.offsetHeight);
            };
        },
        //拖拽
        drag:function(ev,item){
            this.evIcon=ev;
            console.log(item)
            ev.dataTransfer.setData("item",JSON.stringify(item));
        },
        allowDrop:function (ev) {
            ev.preventDefault();
        },
        drop:function(ev){
            var item=JSON.parse(ev.dataTransfer.getData("item"));
            var left=ev.offsetX-Number(item.json.left);
            var top=ev.offsetY-Number(item.json.top);
            var pic="";

            var json=item.json;
            json.left=left;
            json.top=top;
            if(item.type){
                pic= new fabric[item.type](json);
            }else{
                switch (item.otherType){
                    case 'Line':
                        pic=new fabric.Line([left,top,left+Number(item.json.left),top],item.json)
                        break;
                    default:
                        break;
                }
            }
            this.canvas.add(pic);
        },
    },
    components:{}
}
</script>
<style lang="less" scoped>
    .content{
        width: 100%;
        height: 100%;
        background: #061C47;
        .side-bar{
            width: 225px;
            height: 100%;
            display: block;
            background: #073474;
            left: 0;
            color: #DDE4F6;
            position: absolute;
            z-index: 999;
            transition: all 0.5s ease-in;
           .title{
                height: 60px;
                line-height: 60px;
                font-size: 16px;
                padding-left: 20px;
                color: #16c5bb;
                background: #052B62;
                display: flex;
                align-items: center;
            }
            .side-content{
                width: 100%;
                height: calc(100% - 60px);
            }
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
                border: none;
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
        .fabric-con{
            width: 100%;
            height: 100%;
            padding-left: 225px;
            float: left;
            transition: all 0.5s ease-in;
            .fabric-top{
                width: 100%;
                height: 60px;
                background: #052b62;
            }
            .fabric-body{
                width: 100%;
                height: calc(100% - 60px);
                #canvas{
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
</style>



