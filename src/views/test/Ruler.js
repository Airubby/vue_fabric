"use strict";
/**
 * @class Ruler
 */
var Ruler = /** @class */ (function () {
    function Ruler(config) {
        /**
         * default config
         */
        this.config = {
            width: 500,
            height: 24,
            color: '#000',
            background: '#fff',
            labelColor: '#345',
            labelFontSize: 12,
            labelFontFamily: 'Arial',
            lineWidth: 1,
            scale: 10,
            lastScale:1,
            wheelScroll:100,
            wheelUpNumber:1,
            wheelDownNumber:1,
            labelScale: 1,
            canvas: document.createElement('canvas'),
            start: 0,
            beginOffset: 0,
            endOffset: 0,
            base: 10,
            originOffset: 0,
        };
        Object.assign(this.config, config);
        this.checkCanvas();
        this.resize();
    }
    Object.defineProperty(Ruler.prototype, "canvas", {
        get: function () {
            return this.config.canvas;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * resize the base canvas
     */
    Ruler.prototype.resize = function () {
        var config = this.config;
        var canvas = config.canvas, width = config.width, height = config.height;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        return this;
    };
    /** render the ruler */
    Ruler.prototype.render = function () {
        return this.beforeRender().rendering().afterRender();
    };
    /** update the config of the ruler and refresh it */
    Ruler.prototype.update = function (config) {
        var scale = this.config.scale;
        var lastScale=this.config.lastScale;
        Object.assign(this.config, config);
        if (config.width || config.height)
            this.resize();
        if (config.scale) {
            // console.log(scale,config.scale)
            if(scale==config.scale){
                return;
            }
            if(scale>config.scale){ //缩小
                console.log("!!!!!!!!!!!!!!!!!")
                this.config.wheelScroll++;
                if(this.config.wheelScroll%4==0){
                    this.config.base=this.config.base+10*this.config.wheelDownNumber;
                    this.render();
                    this.config.wheelDownNumber++;
                }else{
                    this.addAnimate({ type: 'scale', from: scale, to: config.scale });
                }
            }else if(scale<config.scale){ //放大
                this.config.wheelScroll--;
                if(this.config.wheelScroll%4==0){
                    if(this.config.wheelDownNumber>1){
                        this.config.base=this.config.base-10*this.config.wheelDownNumber;
                        this.config.wheelDownNumber--;
                    }
                    this.render();
                }else{
                    this.addAnimate({ type: 'scale', from: scale, to: config.scale });
                }
                
            }
        }else {
            this.render();
        }
        return this;
    };
    Ruler.prototype.addAnimate = function (_a) {
        var _this = this;
        var type = _a.type, from = _a.from, to = _a.to;
        if (type === 'scale') {
            var cur_1 = from;
            var sign_1 = Math.sign(to - from);
            var start_1;
            // let elapsed:number;
            cancelAnimationFrame(this.animateTimer);
            var doAnimate_1 = function (timestamp) {
                if (!start_1)
                    start_1 = timestamp;
                // elapsed = timestamp - start;
                // console.log(elapsed);
                cur_1 = parseFloat((cur_1 + sign_1 * 0.02).toFixed(2));
                if ((to - cur_1) * sign_1 >= 0) {
                    Object.assign(_this.config, { scale: cur_1 });
                    _this.render();
                    _this.animateTimer = requestAnimationFrame(doAnimate_1);
                }
            };
            this.animateTimer = requestAnimationFrame(doAnimate_1);
        }
        return this;
    };
    /** befroe render the ruler */
    Ruler.prototype.beforeRender = function () {
        var ctx = this.canvas.getContext('2d');
        var _a = this.canvas, width = _a.width, height = _a.height;
        ctx.clearRect(0, 0, width, height);
        var background = this.config.background;
        ctx.save();
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return this;
    };
    /**
     * do rendering
     */
    Ruler.prototype.rendering = function () {
        var _this = this;
        var ctx = this.canvas.getContext('2d');
        var _a = this.canvas, width = _a.width, height = _a.height;
        var _b = this.config, lineWidth = _b.lineWidth, scale = _b.scale, color = _b.color, beginOffset = _b.beginOffset, endOffset = _b.endOffset, base = _b.base, labelScale = _b.labelScale, originOffset = _b.originOffset;
        /** each space of scale on the screen */
        var es = base * scale;
        var pointsArr = [];
        var LabelArr = [];
        /** draw the baseLine of the ruler */
        pointsArr.push([
            [beginOffset, height - lineWidth / 2],
            [width - endOffset, height - lineWidth / 2],
        ]);
        var splitLine = [];
        var ZeroPos = beginOffset + originOffset * labelScale;
        var cur = ZeroPos;
        var count = 0;
        // left
        while (cur > beginOffset) {
            let from = [cur - lineWidth / 2, height];
            // eslint-disable-next-line no-nested-ternary
            let ty = count % 5 ? height / 2 : (count % 10 ? height / 3 : 0);
            let to = [cur - lineWidth / 2, ty];
            splitLine.push([from, to]);
            if (count % 5 === 0) {
                LabelArr.push({
                    point: to,
                    text: String(-(count * base) / labelScale),
                    type: count % 2,
                });
            }
            cur -= es;
            count += 1;
        }
        cur = ZeroPos + es;
        count = 1;
        while (cur < width - endOffset) {
            let from = [cur - lineWidth / 2, height];
            // eslint-disable-next-line no-nested-ternary
            let ty = count % 5 ? height / 2 : (count % 10 ? height / 3 : 0);
            let to = [cur - lineWidth / 2, ty];
            splitLine.push([from, to]);
            if (count % 5 === 0) {
                LabelArr.push({
                    point: to,
                    text: String((count * base) / labelScale),
                    type: count % 2,
                });
            }
            cur += es;
            count += 1;
        }
        pointsArr.push.apply(pointsArr, splitLine);
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        pointsArr.forEach(function (oneItem) {
            oneItem.forEach(function (p, index) {
                var x = p[0], y = p[1];
                if (index === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            });
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.save();
        LabelArr.forEach(function (_a) {
            var point = _a.point, text = _a.text, type = _a.type;
            _this.renderLabel(text, point[0], point[1], type);
        });
        ctx.restore();
        return this;
    };
    /**
     * after rendered
     */
    Ruler.prototype.afterRender = function () {
        return this;
    };
    /**
     * render the label of the ruler
     */
    Ruler.prototype.renderLabel = function (text, x, y, type) {
        var _a = this.config, canvas = _a.canvas, labelFontFamily = _a.labelFontFamily, labelColor = _a.labelColor;
        var labelFontSize = this.config.labelFontSize;
        var ctx = canvas.getContext('2d');
        var textBaseline;
        var textAlign;
        switch (type) {
            case 0:
                textBaseline = 'top';
                textAlign = 'left';
                x += 1;
                break;
            case 1:
                textBaseline = 'middle';
                textAlign = 'left';
                x += 1;
                y -= 1;
                labelFontSize -= 1;
                break;
            default:
                break;
        }
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        ctx.font = labelFontSize + "px " + labelFontFamily;
        ctx.fillStyle = labelColor;
        ctx.fillText(text, x, y);
        return this;
    };
    /**
     * check the canvas of config
     */
    Ruler.prototype.checkCanvas = function () {
        var _a = this.config, canvasId = _a.canvasId, canvasClass = _a.canvasClass;
        if (canvasClass) {
            this.config.canvas = document.querySelector(canvasId);
        }
        if (canvasId) {
            this.config.canvas = document.querySelector(canvasId);
        }
        return this;
    };
    /**
     * destory the instance
     */
    Ruler.prototype.dispose = function () {
        // this.config.canvas = null;
        this.config = null;
        return this;
    };
    /**
     * show ruler
     */
    Ruler.prototype.show = function () {
        this.canvas.style.display = 'block';
        return this;
    };
    /**
     * hidden ruler
     */
    Ruler.prototype.hidden = function () {
        this.canvas.style.display = 'none';
        return this;
    };
    return Ruler;
}());
export default Ruler;
