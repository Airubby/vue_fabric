<template>
    <div class="content">
        <div class="fabric-top">
            <div class="logo">
                <img src="/images/logo.png">
            </div>
            <div class="btn">
                <el-color-picker v-model="color" show-alpha @change="changeColor"></el-color-picker>
                <el-select v-model="value" placeholder="请选择" @change="changeObject">
                    <el-option
                    v-for="item in objects"
                    :key="item.data.id"
                    :label="item.data.name"
                    :value="item.data.id">
                    </el-option>
                </el-select>
                <el-tooltip class="item" content="清空画布" placement="top-end">
                    <span @click="clearDesign"><i class="el-icon-folder-delete"></i></span>
                </el-tooltip>
                <el-tooltip class="item" content="返回编辑" placement="top-end">
                    <span @click="backDesign"><i class="el-icon-edit-outline"></i></span>
                </el-tooltip>
            </div>
        </div>
        <div class="fabric-con">
            <div class="fabric-body" id="canvas-box">
                <canvas id="showCanvas"></canvas>
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
        this.init();
    },
    data() {
       return {
            design:"",
            objects:[],
            value:"",
            color:"",
            index:""
       }
    },
    methods:{
        init:function(){
            let _this=this;
            _this.design =new fabric.Canvas('showCanvas',{backgroundColor:''});
            _this.design.hoverCursor = 'default'; // 设置对象hover的光标为默认
            let dom=document.getElementById("canvas-box");
            
            _this.design.setWidth(dom.offsetWidth);
            _this.design.setHeight(dom.offsetHeight);
            window.onresize=function(){
                _this.design.setWidth(dom.offsetWidth);
                _this.design.setHeight(dom.offsetHeight);
            };
            if(sessionStorage.getItem("canvasDesign")){
                _this.design.loadFromJSON(JSON.parse(sessionStorage.getItem("canvasDesign")), function() {
                    _this.zoomToFitCanvas();
                    window.onresize=function(){
                        _this.resizeCanvas();
                    };
                    //test
                    _this.test();
                });
            }
            
        },
        resizeCanvas:function() {
            let dom=document.getElementById("canvas-box");
            this.design.setWidth(dom.offsetWidth);
            this.design.setHeight(dom.offsetHeight);
            //先还原缩放比例与位置
            this.design.setZoom(1);
            this.design.absolutePan({x:0, y:0});
            //缩放移动视图，使其适应Canvas大小
            this.zoomToFitCanvas();
        },
        //缩放移动视图，使其适应Canvas大小
        zoomToFitCanvas:function() {
            let _this=this;
            let minX,minY,maxX,maxY;
            //遍历所有对对象，获取最小坐标，最大坐标
            var objects = _this.design.getObjects();
            if(objects.length > 0 ){
                for(let i=0;i<objects.length;i++){
                    var rect = objects[i].getBoundingRect();
                    if(i==0){
                        minX = rect.left;
                        minY = rect.top;
                        maxX = rect.left + rect.width;
                        maxY = rect.top + rect.height;
                    }else{
                        minX = Math.min(minX, rect.left);
                        minY= Math.min(minY, rect.top);
                        maxX = Math.max(maxX, rect.left + rect.width);
                        maxY= Math.max(maxY, rect.top + rect.height);
                    }
                    objects[i].set('selectable', false);  //设置禁止编辑
                    objects[i].toObject = (function (toObject) {
                        return function (properties) {
                            return fabric.util.object.extend(toObject.call(this, properties), {
                                data: this.data
                            });
                        };
                    })(objects[i].toObject);
                }

                // var rect = objects[0].getBoundingRect();
                // var minX = rect.left;
                // var minY = rect.top;
                // var maxX = rect.left + rect.width;
                // var maxY = rect.top + rect.height;
                // objects[0].set('selectable', false);  //设置禁止编辑
                // for(var i = 1; i<objects.length; i++){
                //     rect = objects[i].getBoundingRect();
                //     minX = Math.min(minX, rect.left);
                //     minY= Math.min(minY, rect.top);
                //     maxX = Math.max(maxX, rect.left + rect.width);
                //     maxY= Math.max(maxY, rect.top + rect.height);
                //     objects[i].set('selectable', false);  //设置禁止编辑
                // }
            }
    
            //计算平移坐标
            var panX = (maxX - minX - _this.design.width)/2 + minX;
            var panY = (maxY - minY - _this.design.height)/2 + minY;
            //开始平移
            _this.design.absolutePan({x:panX, y:panY});
    
            //计算缩放比例
            var zoom = Math.min(_this.design.width/(maxX - minX), _this.design.height/(maxY - minY));
            //计算缩放中心
            var zoomPoint = new fabric.Point(_this.design.width / 2 , _this.design.height / 2);
            //开始缩放
            _this.design.zoomToPoint(zoomPoint, zoom);

        },

        //test
        test:function(){
            this.objects = this.design.getObjects();
            console.log(this.objects)
        },
        changeColor:function(val){
            console.log(val)
            if(this.value){
                for(let i=0;i<this.objects.length;i++){
                    if(this.value==this.objects[i].data.id){
                        this.objects[i].set("fill",val);
                        this.design.renderAll()
                    }
                }
                console.log(this.objects)
            }
        },
        changeObject:function(){

        },
        //返回编辑
        backDesign:function(){
            this.$router.push({path:'/'});
        },
        clearDesign:function(){
            this.test()
            // console.log(this.design.getObjects())
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
            width: 100%;
            height: 100%;
        }
        
    }
</style>



