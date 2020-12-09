//1: 获得画布上的所有对象：
var items = canvas.getObjects();
//2: 设置画布上的某个对象为活动对象：
canvas.setActiveObject(items[i]);
//3：获得画布上的活动对象：
canvas.getActiveObject();
//4：取消画布中的所有对象的选中状态：
canvas.discardActiveObject();
//5: 设置画布中的对象的某个属性值，比如第 0 个对象的 id：
items[0].set("id","items_id0");
//6：获得画布中对象的某个属性，比如 第0 个对象的 id：
items[0].id;
//7: 重新渲染一遍画布，当画布中的对象有变更，在最后显示的时候，需要执行一次该操作：
canvas.renderAll();
//8: 清除画布中所有对象：
canvas.clear();
//9:清除画布中的活动对象： 
var t = canvas.getActiveObject(); t && canvas.remove(t);
//10: 设置活动对象在画布中的层级：
canvas.sendBackwards(t) //向下跳一层
canvas.sendToBack(t)    //向下跳底层：
canvas.bringForward(t)  //向上跳一层：
canvas.bringToFront(t)  //向上跳顶层：
//或者：
t.sendBackwards();
t.sendToBack();
t.bringForward();
t.bringToFront();
//10：加载图片时图片缩放到指定的大小。
fabric.Image.fromURL(image_src, function(oImg) {
    oImg.set({
        left:tmp_left,
        top:tmp_top,
        centeredScaling:true,
        cornerSize: 7,
        cornerColor: "#9cb8ee",
        transparentCorners: false,
    });
    oImg.scaleToWidth(image_width);
    oImg.scaleToHeight(image_height);
    canvas.add(oImg).setActiveObject(oImg);
 });

//11：当选择画布中的对象时，该对象不出现在顶层。
canvas.preserveObjectStacking = true;

// 12：为画布通过URL方式添加背景图片
var bg_url = "http://www.xxxx.com/...../bg.png"           
fabric.Image.fromURL( bg_url , function(oImg) {
    oImg.set({
    width: canvas_obj.width, 
    height: canvas_obj.height,
    originX: 'left', 
    originY: 'top'
    });
    canvas_obj.setBackgroundImage(oImg, canvas_obj.renderAll.bind(canvas_obj));
});
//13: originx: originy:代表坐标系。
//14: 画布对象居中设置：
var t = canvas.getActiveObject();
t.center();    //全部居中
t.centerH();   //水平居中
t.centerV();   //垂直居中
t.setCoords(); //注：必须设coords以上设置才会有效。

//15: 当对象移动时 限制对象的 不超出画布
// canvas moving limit 
function objectMoving(e){
    var obj = e.target;
    if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
            return;
      }        
      obj.setCoords();        
       // top-left  corner
        if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
            obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
         }
          // bot-right corner
         if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height 
         || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
            obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
                 obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
            }
}

//16：当画布对象放大时限制其操出边界：
//注意当创建对象到画布上时必须先加上：
 obj.saveState();
 //在对象修改时方法里就可以调用了。
 function objectModified (e) {
    let obj = e.target;
    let boundingRect = obj.getBoundingRect(true);
    if (boundingRect.left < 0
        || boundingRect.top < 0
        || boundingRect.left + boundingRect.width > obj.canvas.getWidth()
        || boundingRect.top + boundingRect.height > obj.canvas.getHeight()) {
        obj.top = obj._stateProperties.top;
        obj.left = obj._stateProperties.left;
        obj.angle = obj._stateProperties.angle;
        obj.scaleX = obj._stateProperties.scaleX;
        obj.scaleY = obj._stateProperties.scaleY;
        obj.setCoords();
        obj.saveState();
    }else{
    obj.saveState();
}
    }
//17:当生成json对象时，背景图片显示出来。
fabric.Image.fromURL( bgImg, function(oImg) {
     oImg.set({
         width: 400,
         height:400,
         left:0,
         top:0,
         originX: 'left',
         originY: 'top',
         opacity:0
     });
     //当toObject方法时显示背景图片。
     oImg.toObject = (function(toObject) {
          return function() {
            return fabric.util.object.extend(toObject.call(this), {
                opacity:1
            });
          };
    })(oImg.toObject);   

  canvas_obj.setBackgroundImage(oImg, canvas_obj.renderAll.bind(canvas_obj));   
}, { crossOrigin: 'Anonymous' });

//18：创建蒙版层
//获取蒙版位置属性（非必要）：
var maskLayerTop    = parseInt($(this).attr("data-top"));
var maskLayerLeft   = parseInt($(this).attr("data-left"));
var maskLayerWidth  = parseInt($(this).attr("data-width"));
var maskLayerHeight = parseInt($(this).attr("data-height"));
//创建蒙版
var clipMask = new fabric.Rect({
    originX: 'left',
    originY: 'top',
    left: maskLayerLeft,
    top:  maskLayerTop,
    width: maskLayerWidth,
    height: maskLayerHeight,
    fill: 'rgba(0,0,0,0)', 
    strokeWidth:0,
    selectable: false
});    

clipMask.set({
    clipFor: 'pug'
});

canvas_obj.add(clipMask);                                
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}       

function findByClipName(name){
    return _(canvas_obj.getObjects()).where({
        clipFor: name
    }).first()
}    

canvas_obj.clipByName = function(ctx) {
    this.setCoords();
    var clipObj = findByClipName(this.clipName);
    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    var skewXReverse = - this.skewX;
    var skewYReverse = - this.skewY;
    ctx.save();                                    
    var ctxLeft = -( this.width / 2 ) + clipObj.strokeWidth;
        var ctxTop = -( this.height / 2 ) + clipObj.strokeWidth;
        var ctxWidth = clipObj.width - clipObj.strokeWidth;
        var ctxHeight = clipObj.height - clipObj.strokeWidth;
    ctx.translate( ctxLeft, ctxTop );
    ctx.scale(scaleXTo1, scaleYTo1);
    ctx.transform(1, skewXReverse, skewYReverse, 1, 0, 0);
    ctx.rotate(degToRad(this.angle * -1));                                    
    ctx.beginPath();                                    
    ctx.rect(
        clipObj.left - this.oCoords.tl.x,
        clipObj.top - this.oCoords.tl.y,
        clipObj.width,
        clipObj.height
    );
    ctx.closePath();                                    
    ctx.restore();
} 
//调用的地方：
//文字层设置蒙版
  var t = new fabric.Text("Your Text", {
            id: first_level+"-text-input"+unique_id,
            cornerSize: 7,
            cornerColor: "#9cb8ee",
            transparentCorners: false,
            textAlign:"center",
            clipName: 'pug',
            clipTo: function(ctx) { 
            return _.bind(tmp_canvas_obj.clipByName, t)(ctx) 
           }
});
// 图片层设置蒙版：
// add  the forntimage  to the canvas
fabric.Image.fromURL(image_src, function(oImg) {
    oImg.set({
        id:first_level+"-image-input"+unique_id,
        left:tmp_left,
        top:tmp_top,
        centeredScaling:true,
        cornerSize: 7,
        cornerColor: "#9cb8ee",
        transparentCorners: false,
        clipName: 'pug',
        clipTo: function(ctx) { 
            return _.bind(tmp_canvas_obj.clipByName, oImg)(ctx) 
        }

    });

//19：生成的图片缩放到指定的尺寸。
    oImg.scaleToWidth(image_width);
    oImg.scaleToHeight(image_height);

//20：to object 时添加 id属性。
    oImg.toObject = (function(toObject) {
              return function() {
                return fabric.util.object.extend(toObject.call(this), {
                  id: this.id,
                });
              };
    })(oImg.toObject);
    oImg.id = first_level+"-image-input"+unique_id;                              
    oImg.saveState();
    tmp_canvas_obj.add(oImg).setActiveObject(oImg);
}, { crossOrigin: 'Anonymous' });
tmp_canvas_obj.renderAll();   
