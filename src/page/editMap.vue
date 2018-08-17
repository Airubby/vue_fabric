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
                                    <span v-for="item in firstList">
                                        <img :src="item.img" :data-type="item.type" draggable="true" @dragstart="drag($event)">
                                    </span>
                                </div>
                            </el-collapse-item>
                            <el-collapse-item title="自定义图形" name="second">
                                <div class="loncom_zt_sidebarcon loncom_zt_item">
                                    <span v-for="item in secondList">
                                        <img :src="item.img" :data-type="item.type" draggable="true" @dragstart="drag($event)">
                                    </span>
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
                        <span ><i class="fa fa-cloud-upload"></i></span>
                    </el-tooltip>
                    <el-tooltip class="item" content="全屏预览" placement="top-end">
                        <span @click="fullScreen" ><i class="fa fa-arrows-alt"></i></span>
                    </el-tooltip>
                    
                </div>
            </div>
            <div class="loncom_zt_backFull" ref="backFull" @click="backFullScreen"><el-button type="primary">退出全屏</el-button></div>
            <div class="canvasbox" @drop='drop($event)' @touchstart='drop($event)'  @dragover='allowDrop($event)' >
                <canvas id="canvas"></canvas>
                <div id="contextmenu-output"></div>
            </div>
        </div>
        
    </div>
</template>


<script>
import Vue from 'vue' 
import '../assets/components/basicComponents.js'
export default {
    created () {
        if(JSON.stringify(sessionStorage.loginInfo) == undefined){
            this.$message.warning("请登录");
            this.$router.push({path:'/login'});
            return;
        }
        var obj = this.$route.query;
        this.mapIndex=obj.index;
       
        
    },
    mounted() {
        var _this=this;
        _this.canvas =new fabric.Canvas('canvas',{backgroundColor:'#fff'});
        
        //添加窗口尺寸改变响应监听
        $(".canvasbox").resize(resizeCanvas);
        //页面加载后先设置一下canvas大小
        _this.canvas.setWidth($(".canvasbox").width());
        _this.canvas.setHeight($(".canvasbox").height());
        //窗口尺寸改变响应（修改canvas大小）
        function resizeCanvas() {   
            console.log(1)
            _this.canvas.setWidth($(".canvasbox").width());
            _this.canvas.setHeight($(".canvasbox").height());
            //缩放移动视图，使其适应Canvas大小
            zoomToFitCanvas();
        };

      //缩放移动视图，使其适应Canvas大小
      function zoomToFitCanvas() {
          console.log(2)
        //先还原缩放比例与位置
        //_this.canvas.setZoom(1.0012);
        // _this.canvas.absolutePan({x:0, y:0});
        // //遍历所有对对象，获取最小坐标，最大坐标
        // var objects = _this.canvas.getObjects();
        // if(objects.length > 0 ){
        //   var rect = objects[0].getBoundingRect();
        //   var minX = rect.left;
        //   var minY = rect.top;
        //   var maxX = rect.left + rect.width;
        //   var maxY = rect.top + rect.height;
        //   for(var i = 1; i<objects.length; i++){
        //     rect = objects[i].getBoundingRect();
        //     minX = Math.min(minX, rect.left);
        //     minY= Math.min(minY, rect.top);
        //     maxX = Math.max(maxX, rect.left + rect.width);
        //     maxY= Math.max(maxY, rect.top + rect.height);
        //   }
        // }
        // //计算平移坐标
        // var panX = (maxX - minX - _this.canvas.width)/2 + minX;
        // var panY = (maxY - minY - _this.canvas.height)/2 + minY;
        // //开始平移
        // _this.canvas.absolutePan({x:panX, y:panY});
        // //计算缩放比例
        // var zoom = Math.min(_this.canvas.width/(maxX - minX), _this.canvas.height/(maxY - minY));
        // //计算缩放中心
        // var zoomPoint = new fabric.Point(_this.canvas.width / 2 , _this.canvas.height / 2);
        // //开始缩放
        // _this.canvas.zoomToPoint(zoomPoint, zoom);

      } 

      //是否拖动
       var panning = false;
      //鼠标按下
        _this.canvas.on('mouse:down', function (e) {
            //按住alt键才可拖动画布
            if(e.e.altKey) {
                panning = true;
                _this.canvas.selection = false;
            }
        });

        //鼠标抬起
        _this.canvas.on('mouse:up', function (e) {
            panning = false;
            _this.canvas.selection = true;
        });

        //鼠标移动
        _this.canvas.on('mouse:move', function (e) {
            if (panning && e && e.e) {
                var delta = new fabric.Point(e.e.movementX, e.e.movementY);
                _this.canvas.relativePan(delta);
            }
        });

        //鼠标滚轮监听
        $(".upper-canvas").mousewheel(function(event) {
            console.log(event)
            var zoom = (event.deltaY > 0 ? 0.1 : -0.1) + _this.canvas.getZoom();
            zoom = Math.max(0.1,zoom); //最小为原来的1/10
            zoom = Math.min(3,zoom); //最大是原来的3倍
            var zoomPoint = new fabric.Point(event.pageX, event.pageY);
            _this.canvas.zoomToPoint(zoomPoint, zoom);
        });
        //在canvas上层对象上添加右键事件监听
        $(".upper-canvas").contextmenu(onContextmenu);
        //初始化右键菜单
        $.contextMenu({
          selector: '#contextmenu-output',
          trigger: 'none',
          build: function($trigger, e) {
              //构建菜单项build方法在每次右键点击会执行
              console.log(_this.contextMenuItems)
              return {
                  callback: contextMenuClick,
                  items: _this.contextMenuItems
              };
          },
        });
         //右键点击事件响应
        function onContextmenu(event) {
            var pointer = _this.canvas.getPointer(event.originalEvent);
            var objects = _this.canvas.getObjects();
            for (var i = objects.length - 1; i >= 0; i--) {
                var object = objects[i];
                //判断该对象是否在鼠标点击处
                if (_this.canvas.containsPoint(event, object)) {
                    //选中该对象
                    _this.canvas.setActiveObject(object);
                    //显示菜单
                    showContextMenu(event, object);
                    continue;
                }
            }
            //阻止系统右键菜单
            event.preventDefault();
            return false;
        }
        //右键菜单项点击
        function showContextMenu(event, object) {
            //定义右键菜单项
            _this.contextMenuItems = {
                "delete": {name: "删除", icon: "delete", data: object},
            };
            //右键菜单显示位置
            var position = {
                x: event.clientX,
                y: event.clientY
            }
            $('#contextmenu-output').contextMenu(position);
        }
        //右键菜单项点击
        function contextMenuClick(key, options) {
            if(key == "delete") {
            //得到对应的object并删除
            var object = _this.contextMenuItems[key].data;
                _this.canvas.remove(object);
            }
        }


    //  var rect = new fabric.Rect({
    //         left:500,//距离画布左侧的距离，单位是像素
    //         top:500,//距离画布上边的距离
    //         fill:'red',//填充的颜色
    //         width:30,//方形的宽度
    //         height:30//方形的高度
    //     })
    //     console.log(rect)
    //     _this.canvas.add(rect);
    //     _this.canvas.renderAll();

    },
    data() {
       return {
           canvas:'',
           //侧边点击显示或隐藏
           navbtn:'open',
           //侧边头部切换
           activeName: 'second',
           //手风琴切换
           activeItem: 'first',
           
           img_ev:'',  //存储拖拽的图片组件，用于获取拖动图片组件时获取其偏移值offsetX，offsetY
            device_show:true,  //是否可以显示侧边详情
            secondList:[
                {
                    title:'直线',
                    type:'Line',
                    img:'static/images/sanjiao.png',
                    json:{
                        strokeWidth: 2, fill: '#cca'
                    }
                }
            ],
            firstList:[
                {
                    title:'矩形',
                    type:'rect',
                    img:'static/images/login_user.png',
                    json:{
                        width: 50, height: 50, left: 50, top: 50,
                        fill: 'rgba(255,0,0,0.5)'
                    }
                },{
                    title:'圆形',
                    type:'circle',
                    img:'static/images/login_user.png',
                    json:{
                        radius: 50, left: 50, top: 50, fill: '#aac'
                    }
                },{
                    title:'三角形',
                    type:'triangle',
                    img:'static/images/login_user.png',
                    json:{
                        width: 100, height: 100, left: 50, top: 50, fill: '#cca'
                    }
                }
            ],
            contextMenuItems:'', //存储右键的菜单项
           

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
        //拖拽
        drag:function(ev){
            console.log(ev)
            this.img_ev=ev;
            ev.dataTransfer.setData("type",ev.target.dataset.type);
        },
        allowDrop:function (ev) {
            ev.preventDefault();
        },
        drop:function(ev){
            console.log(ev) 
            var type=ev.dataTransfer.getData("type");
            var left=ev.offsetX-this.img_ev.offsetX;
            var top=ev.offsetY-this.img_ev.offsetY;
            if(type){
                var pic='';
                switch (type){
                    case 'rect':
                        pic = new fabric.Rect({
                            width: 80, height: 80, left: left, top: top,
                            fill: '#f00'
                        });
                        break;
                    case 'circle':
                        pic=new fabric.Circle({
                            radius: 50, left: left, top: top, fill: '#f00'
                        });
                        break;
                    case 'triangle':
                        pic=new fabric.Triangle({
                            width: 80, height: 80, left: left, top: top, fill: '#f00'
                        });
                        break;
                    case 'Line':
                        pic=new fabric.Line([ev.clientX, ev.clientY, mouseTo.x, mouseTo.y],{
                            strokeWidth:2, fill: '#f00'
                        });
                        break;
                    default:
                        break;
                }
                this.canvas.add(pic);
            }
            console.log(type)
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




