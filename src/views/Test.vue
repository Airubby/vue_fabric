<template>
  <div class="maintenancePlanAdd">
    <canvas style="width:1300px;height:700px;" id="c"></canvas>
  </div>
</template>
<script>
import { fabric } from "fabric";
export default {
  name: "App",
  data() {
    return {
      
    };
  },
  watch: {
    
  },
  methods: {
    
    
  },
  mounted() {
    var canvas  = new fabric.Canvas('c', { selection: false });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    canvas.setWidth(1300);
    canvas.setHeight(600);

    function makeCircle(left, top, line1, line2) {
        var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666'
        });
        c.hasControls = c.hasBorders = false;

        c.line1 = line1;
        c.line2 = line2;

        return c;
    }

    function makeLine(coords) {
        return new fabric.Line(coords, {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        evented: false,
        });
    }

    var line = makeLine([ 250, 125, 250, 175 ]),
        line2 = makeLine([ 250, 175, 250, 250 ]),
        line3 = makeLine([250,250,250,350]),
        line4 = makeLine([250,350,250,450]),
        
        line5 = makeLine([ 550, 125, 550, 175 ]);

    canvas.add(line, line2,line3,line4,line5);

    canvas.add(
        makeCircle(line.get('x1'), line.get('y1'), null, line),
        makeCircle(line.get('x2'), line.get('y2'), line, line2),
        makeCircle(line2.get('x2'), line2.get('y2'), line2,line3),
        makeCircle(line3.get('x2'), line3.get('y2'),line3,line4),
        makeCircle(line4.get('x2'), line4.get('y2'),line4,null),

        makeCircle(line5.get('x1'), line5.get('y1'), null, line5),
        makeCircle(line5.get('x2'), line5.get('y2'),line5,null),
    );

    canvas.on('object:moving', function(e) {
        var p = e.target;
        p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
        p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
        canvas.renderAll();
    });
    canvas.on('object:modified',function(e) {
      e.target.opacity = 1;
    });
    

    }
};
</script>

<style lang="less" scoped>
.el-container {
  flex-direction: column;
}
img,
input {
  display: none;
}
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
}
canvas {
  border: 1px dashed black;
}
.draw-btn-group {
  // width: 1270px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  & > div {
    background: #fafafa;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
    i {
      display: flex;
      background-repeat: no-repeat;
      background-size: 80%;
      background-position: 50% 50%;
      height: 30px;
      width: 30px;
    }
    .icon-1 {
      background: "#f00";
    }
    .icon-pentagram {
       background: "#f00";
    }
    .icon-2 {
      background: "#f00";
    }
    .icon-3 {
       background: "#f00";
    }
    .icon-4 {
      background: "#f00";
    }
    .icon-5 {
       background: "#f00";
    }
    .icon-6 {
       background: "#f00";
    }
    .icon-7 {
       background: "#f00";
    }
    .icon-del {
       background: "#f00";
    }
    .icon-img {
       background: "#f00";
    }
    .icon-back {
       background: "#f00";
    }
    .icon-save {
       background: "#f00";
    }
    .icon-mouse {
       background: "#f00";
    }
  }
  .active {
    background: #eee;
  }
}
</style>
