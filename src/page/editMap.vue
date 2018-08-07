<template>
    <div class="loncom_content" ref="loncom_zt_content">
        <div class="loncom_sidebar loncom_zt_sidebar" ref="sidebar">
            <el-tabs v-model="activeName">
                <el-tab-pane label="设备素材" name="first" class="loncom_scrollbar">
                    <el-scrollbar style="height:100%;" class="loncom_zt_edititem">
                       <el-collapse v-model="activeItem" accordion>
                            <el-collapse-item title="视频" name="first">
                                <div class="loncom_zt_sidebarcon loncom_zt_item">
                                    <span><img src="static/images/video.png"></span>
                                </div>
                            </el-collapse-item>
                            <el-collapse-item title="门禁" name="second">
                                <div class="loncom_zt_sidebarcon loncom_zt_item">
                                   <span><img src="static/images/access.png"></span>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="基础控件" name="second" class="loncom_scrollbar">
                    <el-scrollbar style="height:100%;" class="loncom_zt_edititem">
                       <el-collapse v-model="activeItem" accordion>
                            <el-collapse-item title="基本图形" name="first">
                                <div class="loncom_zt_sidebarcon loncom_zt_item">
                                    3
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </el-scrollbar>
                </el-tab-pane>
            </el-tabs>
            <span class="loncom_zt_sidebar_btn" @click="navclick" ref="navbtnspan"><i class="fa fa-chevron-left" ref="navbtn"></i></span>
            
        </div>
        <div class="loncom_sidebar_right loncom_zt_edit_right" ref="content">
            <div class="loncom_public_top loncom_ztright_top" ref="ztright">
                <div class="loncom_fr loncom_zt_editmap_btn">
                    <el-tooltip class="item" content="返回" placement="top-end">
                        <span @click="backPage"><i class="fa fa-chevron-left"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="撤销(Ctrl+z)" placement="top-end">
                        <span @click="backout"><i class="fa fa-mail-reply"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="反撤销(Ctrl+y)" placement="top-end">
                        <span @click="returnBackout"><i class="fa fa-mail-forward"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="删除设备(Delete)" placement="top-end">
                        <span @click="removeDevice"><i class="fa fa-remove"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="保存操作(Ctrl+s)" placement="top-end">
                        <span @click="saveDevice"><i class="fa fa-save"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="上传机房图" placement="top-end">
                        <span @click="uploadImg"><i class="fa fa-cloud-upload"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="全屏预览" placement="top-end">
                        <span @click="fullScreen" ><i class="fa fa-arrows-alt"></i></span>
                    </el-tooltip>
                    
                </div>
            </div>
            <div class="loncom_zt_backFull" ref="backFull" @click="backFullScreen"><el-button type="primary">退出全屏</el-button></div>
            
        </div>
        
    </div>
</template>


<script>
import Vue from 'vue' 
export default {
    created () {
        if(JSON.stringify(localStorage.loginInfo) == undefined){
            this.$message.warning("请登录");
            this.$router.push({path:'/login'});
            return;
        }
        var obj = this.$route.query;
        this.mapIndex=obj.index;
       
        
    },
    mounted() {
        
    },
    data() {
       return {
           //侧边点击显示或隐藏
           navbtn:'open',
           //侧边头部切换
           activeName: 'first',
           //手风琴切换
           activeItem: 'first',
           
           //上传图片
           upload_img:{
                title:'图片上传',
                visible:false,
                width:"500px",
           },
           
            device_show:true,  //是否可以显示侧边详情
           

       }
   },
    methods:{
        //点击隐藏显示侧边
        navclick:function(){
            if(this.navbtn=='open'){
                $(this.$refs.sidebar).css({
                    "left":"-225px",
                    "transition":"all 0.4s ease-in"
                });
                $(this.$refs.content).css({
                    "padding-left":"0",
                    "transition":"all 0.4s ease-in"
                });
                $(this.$refs.navbtn).addClass("fa-chevron-right");
                this.navbtn='close';
            }else{
                $(this.$refs.sidebar).css({
                    "left":"0",
                    "transition":"all 0.4s ease-in"
                });
                $(this.$refs.content).css({
                    "padding-left":"225px",
                    "transition":"all 0.4s ease-in"
                });
                $(this.$refs.navbtn).removeClass("fa-chevron-right");
                this.navbtn='open';
            }
        },
        //上传图片
        uploadImg:function(){
            this.upload_img.visible=true;
        },
        //全屏
        fullScreen:function(){
            $(this.$refs.sidebar).css("left","-225px");
            $(this.$refs.ztright).css("top","-65px");
            $(this.$refs.backFull).css("top","0");
            $(this.$refs.content).css({
                "padding-left":"0",
                "padding-top":"0",
            });
            $(this.$refs.navbtnspan).hide(500);
        },
        //退出全屏
        backFullScreen:function(){
            $(this.$refs.sidebar).css("left","0");
            $(this.$refs.ztright).css("top","0");
            $(this.$refs.backFull).css("top","-55px");
            $(this.$refs.content).css({
                "padding-left":"225px",
                "padding-top":"65px",
            });
            $(this.$refs.navbtnspan).show();
            if(this.navbtn!="open"){
                $(this.$refs.navbtn).removeClass("fa-chevron-right");
                this.navbtn='open';
            }
        },
        //返回主页面
        backPage:function(){
            this.$router.push({path:'/',query:{'index':this.mapIndex}});
        },
        //确认修改
        onSubmit:function(){
            this.$confirm('确认提交修改?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                

            });
        },
        //删除设备
        removeDevice:function(){
            if(this.img_html==""){
                this.$message.warning("请选择要删除的设备!");
                return;
            }
            this.$confirm('确认删除此设备?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
            });
            
        },
        
        //保存操作
        saveDevice:function(){
            
        },
        //撤销
        backout:function(){
            
        },
        //反撤销
        returnBackout:function(){
            
        },
        
        
    },
    
    components:{}
}
</script>




