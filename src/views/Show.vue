<template>
    <div class="content">
        <div class="fabric-top">
            <div class="logo">
                <img src="/images/logo.png">
            </div>
            <div class="btn">
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
       }
    },
    methods:{
        init:function(){
            let _this=this;
            _this.design =new fabric.Canvas('showCanvas',{backgroundColor:''});
            let dom=document.getElementById("canvas-box");
            
            _this.design.setWidth(dom.offsetWidth);
            _this.design.setHeight(dom.offsetHeight);
            window.onresize=function(){
                _this.design.setWidth(dom.offsetWidth);
                _this.design.setHeight(dom.offsetHeight);
            };
            if(sessionStorage.getItem("canvasDesign")){
                _this.design.loadFromJSON(JSON.parse(sessionStorage.getItem("canvasDesign")), function() {});
            }
            
        },
        //返回编辑
        backDesign:function(){
            this.$router.push({path:'/'});
        }
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



