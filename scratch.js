/**
 * Created with WebStorm.
 * User: JIN
 * Date: 2015/1/19
 * Time: 16:10
 *
 */
(function (win, doc) {
    var Scratch = function (options) {
        this.underCanvas = doc.getElementById("underCanvas");
        this.upCanvas = doc.getElementById("upCanvas");
        this.underCtx = this.underCanvas.getContext("2d");
        this.upCtx = this.upCanvas.getContext("2d");
        this.width = this.upCanvas.width;
        this.height = this.upCanvas.height;
        this.options = options;
        this.award = null;
    };

    Scratch.prototype = {
        constructor: Scratch,
        init: function () {
            this.drawText();
            this.drawMask();
            this.addEvent();
        },
        drawText: function () {
            var ctx = this.underCtx;
            var text = this.options.text;
            ctx.font = text.fontWeight + " " + text.fontSize + 'px ' + text.fontFamily;
            ctx.textAlign = text.align;
            ctx.fillStyle = text.color;
            this.award = this.options.awards[(Math.random() * this.options.awards.length) | 0]; //随机抽奖
            ctx.fillText(this.award, this.width / 2, this.height / 2 + text.fontSize / 2);
        },
        drawMask: function () {
            var ctx = this.upCtx;
            ctx.fillStyle = this.options.maskColor;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.globalCompositeOperation = 'destination-out';
        },
        addEvent: function () {
            var that = this;
            var upCanvas = this.upCanvas;
            var callback1, callback2, callback3;
            upCanvas.addEventListener("mousedown", callback1 = function (evt) {
                upCanvas.addEventListener("mousemove", callback2 = function (evt) {
                    var x = evt.clientX - upCanvas.offsetLeft;
                    var y = evt.clientY - upCanvas.offsetTop;
                    var ctx = that.upCtx;
                    var options = that.options;
                    ctx.beginPath();
                    var gradient = ctx.createRadialGradient(x, y, 0, x, y, options.radius);
                    // 其实这边的颜色值是可以随便写的，因为都会变成透明，重要的是透明度
                    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
                    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                    ctx.fillStyle = gradient;
                    ctx.arc(x, y, options.radius, 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.closePath();
                    if (that.result() > 0.8) {
                        alert(that.award);
                        upCanvas.removeEventListener("mousemove", callback2);
                    }
                }, false);
                doc.addEventListener("mouseup", callback3 = function () {
                    upCanvas.removeEventListener("mousemove", callback2);
                    doc.removeEventListener("mouseup", callback3);
                }, false);
            }, false);
        },
        result: function () {
            var textWidth = this.options.text.fontSize * this.award.length;
            var textHeight = this.options.text.fontSize;
            // 获取文字部分的像素，这样可以根据刮开文字的部分占全部文字部分的百分比来提示结果，比如说在刮开80%的时候提示刮奖结果
            var imgData = this.upCtx.getImageData(this.width / 2 - textWidth / 2, this.height / 2 - textHeight / 2, textWidth, textHeight);
            var pixelsArr = imgData.data;
            var transPixelsArr = [];
            for (var i = 0, j = pixelsArr.length; i < j; i += 4) {
                // a代表透明度
                var a = pixelsArr[i + 3];
                // 渐变的透明度＜=0.5，其实透明度的值是介于0~255之间的，0.5 * 255 = 127.5就是a的值
                if (a < 128) {
                    transPixelsArr.push(a);
                }
            }
            // 小于128的透明度的值的个数占总透明度的的个数的百分比
            return transPixelsArr.length / (pixelsArr.length / 4);
        }
    };

    win.Scratch = Scratch;
}(window, document));