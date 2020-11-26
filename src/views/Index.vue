<template>
    <div class="content">
        <div class="fabric-top">
            <div class="logo">
                <img src="/images/logo.png">
            </div>
            <div class="btn">
                <el-tooltip class="item" content="设计预览" placement="top-end">
                    <span @click="showDesign"><i class="el-icon-view"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="清空画布" placement="top-end">
                    <span @click="clearDesign"><i class="el-icon-folder-delete"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="保存操作(Ctrl+s)" placement="top-end">
                    <span @click="saveDesign"><i class="el-icon-folder-checked"></i></span>
                </el-tooltip>
            </div>
        </div>
        <div class="fabric-con">
            <div class="side-bar">
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
            <div class="fabric-body" id="canvas-box" @drop='drop($event)' @touchstart='drop($event)'  @dragover='allowDrop($event)'>
                <canvas id="designCanvas"></canvas>
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
           
            viewportTransform:null, //拖动画布后，存的距离上右下左的间距{bl:{x:xx,y:yy},br:{},tl:{},tr:{}}
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
            window.onresize=function(){
                _this.design.setWidth(dom.offsetWidth);
                _this.design.setHeight(dom.offsetHeight);
            };
            document.onkeydown=function(event){
                if (_this && _this._isDestroyed) {return}  //摧毁组件了就不执行下面了，不然其他地方input框又可能不能输入下面的快捷键
                var ev = event || window.event || arguments.callee.caller.arguments[0];
                if(ev){
                    switch(ev.keyCode){
                        case 46 :// 点击删除
                            _this.removeDevice();
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
                var zoom = _this.design.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                this.setZoom(zoom);
                // updateMiniMapVP();
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
                    // updateMiniMapVP();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                    _this.viewportTransform=this.viewportTransform;
                }
            });
            _this.design.on('mouse:up', function(opt) {
                this.isDragging = false;
                this.selection = true;
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
            var item=JSON.parse(ev.dataTransfer.getData("item"));
            var left=ev.offsetX;
            var top=ev.offsetY;
            //viewportTransform[0] 存的缩放比例；viewportTransform[4]X轴移动距离；this.viewportTransform[5]Y轴移动距离
            if(this.viewportTransform){
                left=left/this.viewportTransform[0]-this.viewportTransform[4];
                top=top/this.viewportTransform[0]-this.viewportTransform[5];
            }
            var pic="";

            var json=item.json;
            json.left=left;
            json.top=top;
            if(item.type){
                pic= new fabric[item.type](json);
            }else{
                switch (item.otherType){
                    case 'Line':
                        //[终止位置，线长，起始位置，top]
                        pic=new fabric.Line([left,item.json.width,left,top],item.json)
                        break;
                    default:
                        break;
                }
            }
            this.design.add(pic);
        },
        //保存
        saveDesign:function(){
            sessionStorage.setItem("canvasDesign",JSON.stringify(this.design.toJSON()))
            this.$notify.success("保存成功！");
        },
        clearDesign:function(){
            console.log(this.design)
            // console.log(this.design.getObjects())
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
        
    }
</style>



