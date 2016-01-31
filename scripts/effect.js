/*******绘制直方图******/
function fDrawHistogram(imageData) {
    var pixelData = imageData.data
    var histogramCanvas = document.getElementById('histogram')
    var hgContext = histogramCanvas.getContext('2d')
    var hgArr = []
    for (var i = 0; i < 256; i++) {
        hgArr[i] = 0
    }
    for (var i = 0; i < canvas.width * canvas.height; i++) {
        var r = pixelData[i * 4 + 0] || 0
        var g = pixelData[i * 4 + 1] || 0
        var b = pixelData[i * 4 + 2] || 0
        var a = pixelData[i * 4 + 3] || 0

        var grey = Math.round((r + g + b) / 3)
        hgArr[grey]++
    }
    var maxValue = Math.max.apply(Math, hgArr)

    hgContext.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height)
    hgContext.fillWidth = 1
    histogramCanvas.width = 255
    histogramCanvas.height = 500
    hgContext.strokeStyle = '#bbb'
    hgContext.fillWidth = 1
    hgContext.translate(histogramCanvas.width - 1, histogramCanvas.height - 1)
    hgContext.rotate(Math.PI)
    hgArr.reverse()

    for (var i = 0; i < 256; i++) {
        var h = histogramCanvas.height
        hgArr[i] = (hgArr[i] / maxValue) * h //修改比例
        hgContext.moveTo(i, 0)
        hgContext.lineTo(i, hgArr[i])
        hgContext.stroke()
    }
    // hgContext.restore()
}
/***********滤镜*********/
var FilteringEffect = (function() {
    function defaultOptions(options, defaults) {
        var O = {};
        for (var opt in defaults) {
            if (typeof options[opt] == "undefined") {
                O[opt] = defaults[opt];
            } else {
                O[opt] = options[opt];
            }
        }
        return O;
    }

    function clamp(val, min, max) {
        return Math.min(max, Math.max(min, val));
    }

    function verifyOptions(options) {
        var notRight
        var Reg = {
            reg: [
                /^\-?(0\.\d*|[01])$/, //-1~1  0
                /^(0\.\d*|[01])$/, //0-1     1
                /^\d+$/, //int                2
                /^(false|true|[01])$/, //bool  3
                /^\-?(\d\d?|[012]\d{2}|[3][0-5]\d|360)$/, //angle 0-360   4
                /^([2-9]\d?|[1]\d{2}|[2]([0-4]\d|[5][0-6]))$/ //level     5
            ],
            infoMsg: [
                '应为-1~1之间的数', //0
                '应为0~1之间的数', //1
                '应为一个正整数', //2
                '应为1/0或true/false', //3
                '应为-360~360间的整数', //4
                '应为2-256之间的整数' //5
            ]
        }
        var verifyReg = function(msg, optionValue, RegNumber) { //-1~1

            notRight = !(Reg.reg[RegNumber].test(optionValue))
            if (notRight) {
                errormsg(msg + Reg.infoMsg[RegNumber])
                Show_popDiv()
                noInputError = false
                return false
            }
        }
        for (var type in options) {
            switch (type) {
                case 'brightness':
                    verifyReg("亮度", options.brightness, 0)
                    break;
                case "hue":
                    verifyReg("色相", options.hue, 0)
                    break;
                case "saturation":
                    verifyReg("饱和度", options.saturation, 0)
                    break;
                case "lightness":
                    verifyReg("亮度", options.lightness, 0)
                    break;
                case "contrast":
                    verifyReg("对比度", options.contrast, 0)
                    break;
                case 'r':
                    verifyReg("红", options.r, 0)
                    break;
                case 'g':
                    verifyReg("绿", options.g, 0)
                    break;
                case "b":
                    verifyReg("蓝", options.b, 0)
                    break;
                case "amount":
                    verifyReg("数量", options.amount, 1)
                    break;
                case "strength":
                    verifyReg("长度", options.strength, 1)
                    break
                case 'kernelSize':
                    verifyReg('半径值', options.kernelSize, 2)
                    break;
                case 'blockSize':
                    verifyReg('单元格大小', options.blockSize, 2)
                    break;
                case "mono":
                    verifyReg("是否单色", options.mono, 3)
                    break;
                case "angle":
                    verifyReg("角度", options.angle, 4)
                    break;
                case 'levels':
                    verifyReg("色阶", options.levels, 4)
                    break;
            }
        }
    }

    function convolve3x3(inData, outData, width, height, kernel, alpha, invert, mono) {
        var idx, r, g, b, a,
            pyc, pyp, pyn,
            pxc, pxp, pxn,
            x, y,

            n = width * height * 4,

            k00 = kernel[0][0],
            k01 = kernel[0][1],
            k02 = kernel[0][2],
            k10 = kernel[1][0],
            k11 = kernel[1][1],
            k12 = kernel[1][2],
            k20 = kernel[2][0],
            k21 = kernel[2][1],
            k22 = kernel[2][2],

            p00, p01, p02,
            p10, p11, p12,
            p20, p21, p22;

        for (y = 0; y < height; ++y) {
            pyc = y * width * 4;
            pyp = pyc - width * 4;
            pyn = pyc + width * 4;

            if (y < 1) pyp = pyc;
            if (y >= width - 1) pyn = pyc;

            for (x = 0; x < width; ++x) {
                idx = (y * width + x) * 4;

                pxc = x * 4;
                pxp = pxc - 4;
                pxn = pxc + 4;

                if (x < 1) pxp = pxc;
                if (x >= width - 1) pxn = pxc;

                p00 = pyp + pxp;
                p01 = pyp + pxc;
                p02 = pyp + pxn;
                p10 = pyc + pxp;
                p11 = pyc + pxc;
                p12 = pyc + pxn;
                p20 = pyn + pxp;
                p21 = pyn + pxc;
                p22 = pyn + pxn;

                r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02 + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12 + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22;

                g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02 + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12 + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22;

                b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02 + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12 + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22;

                if (alpha) {
                    a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02 + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12 + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22;
                } else {
                    a = inData[idx + 3];
                }

                if (mono) {
                    r = g = b = (r + g + b) / 3;
                }
                if (invert) {
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                }

                outData[idx] = r;
                outData[idx + 1] = g;
                outData[idx + 2] = b;
                outData[idx + 3] = a;

            }
        }
    }

    function convolve5x5(inData, outData, width, height, kernel, alpha, invert, mono) {
        var idx, r, g, b, a,
            pyc, pyp, pyn, pypp, pynn,
            pxc, pxp, pxn, pxpp, pxnn,
            x, y,

            n = width * height * 4,

            k00 = kernel[0][0],
            k01 = kernel[0][1],
            k02 = kernel[0][2],
            k03 = kernel[0][3],
            k04 = kernel[0][4],
            k10 = kernel[1][0],
            k11 = kernel[1][1],
            k12 = kernel[1][2],
            k13 = kernel[1][3],
            k14 = kernel[1][4],
            k20 = kernel[2][0],
            k21 = kernel[2][1],
            k22 = kernel[2][2],
            k23 = kernel[2][3],
            k24 = kernel[2][4],
            k30 = kernel[3][0],
            k31 = kernel[3][1],
            k32 = kernel[3][2],
            k33 = kernel[3][3],
            k34 = kernel[3][4],
            k40 = kernel[4][0],
            k41 = kernel[4][1],
            k42 = kernel[4][2],
            k43 = kernel[4][3],
            k44 = kernel[4][4],

            p00, p01, p02, p03, p04,
            p10, p11, p12, p13, p14,
            p20, p21, p22, p23, p24,
            p30, p31, p32, p33, p34,
            p40, p41, p42, p43, p44;

        for (y = 0; y < height; ++y) {
            pyc = y * width * 4;
            pyp = pyc - width * 4;
            pypp = pyc - width * 4 * 2;
            pyn = pyc + width * 4;
            pynn = pyc + width * 4 * 2;

            if (y < 1) pyp = pyc;
            if (y >= width - 1) pyn = pyc;
            if (y < 2) pypp = pyp;
            if (y >= width - 2) pynn = pyn;

            for (x = 0; x < width; ++x) {
                idx = (y * width + x) * 4;

                pxc = x * 4;
                pxp = pxc - 4;
                pxn = pxc + 4;
                pxpp = pxc - 8;
                pxnn = pxc + 8;

                if (x < 1) pxp = pxc;
                if (x >= width - 1) pxn = pxc;
                if (x < 2) pxpp = pxp;
                if (x >= width - 2) pxnn = pxn;

                p00 = pypp + pxpp;
                p01 = pypp + pxp;
                p02 = pypp + pxc;
                p03 = pypp + pxn;
                p04 = pypp + pxnn;
                p10 = pyp + pxpp;
                p11 = pyp + pxp;
                p12 = pyp + pxc;
                p13 = pyp + pxn;
                p14 = pyp + pxnn;
                p20 = pyc + pxpp;
                p21 = pyc + pxp;
                p22 = pyc + pxc;
                p23 = pyc + pxn;
                p24 = pyc + pxnn;
                p30 = pyn + pxpp;
                p31 = pyn + pxp;
                p32 = pyn + pxc;
                p33 = pyn + pxn;
                p34 = pyn + pxnn;
                p40 = pynn + pxpp;
                p41 = pynn + pxp;
                p42 = pynn + pxc;
                p43 = pynn + pxn;
                p44 = pynn + pxnn;

                r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02 + inData[p03] * k04 + inData[p02] * k04 + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12 + inData[p13] * k14 + inData[p12] * k14 + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22 + inData[p23] * k24 + inData[p22] * k24 + inData[p30] * k30 + inData[p31] * k31 + inData[p32] * k32 + inData[p33] * k34 + inData[p32] * k34 + inData[p40] * k40 + inData[p41] * k41 + inData[p42] * k42 + inData[p43] * k44 + inData[p42] * k44;

                g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02 + inData[p03 + 1] * k04 + inData[p02 + 1] * k04 + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12 + inData[p13 + 1] * k14 + inData[p12 + 1] * k14 + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22 + inData[p23 + 1] * k24 + inData[p22 + 1] * k24 + inData[p30 + 1] * k30 + inData[p31 + 1] * k31 + inData[p32 + 1] * k32 + inData[p33 + 1] * k34 + inData[p32 + 1] * k34 + inData[p40 + 1] * k40 + inData[p41 + 1] * k41 + inData[p42 + 1] * k42 + inData[p43 + 1] * k44 + inData[p42 + 1] * k44;

                b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02 + inData[p03 + 2] * k04 + inData[p02 + 2] * k04 + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12 + inData[p13 + 2] * k14 + inData[p12 + 2] * k14 + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22 + inData[p23 + 2] * k24 + inData[p22 + 2] * k24 + inData[p30 + 2] * k30 + inData[p31 + 2] * k31 + inData[p32 + 2] * k32 + inData[p33 + 2] * k34 + inData[p32 + 2] * k34 + inData[p40 + 2] * k40 + inData[p41 + 2] * k41 + inData[p42 + 2] * k42 + inData[p43 + 2] * k44 + inData[p42 + 2] * k44;

                if (alpha) {
                    a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02 + inData[p03 + 3] * k04 + inData[p02 + 3] * k04 + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12 + inData[p13 + 3] * k14 + inData[p12 + 3] * k14 + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22 + inData[p23 + 3] * k24 + inData[p22 + 3] * k24 + inData[p30 + 3] * k30 + inData[p31 + 3] * k31 + inData[p32 + 3] * k32 + inData[p33 + 3] * k34 + inData[p32 + 3] * k34 + inData[p40 + 3] * k40 + inData[p41 + 3] * k41 + inData[p42 + 3] * k42 + inData[p43 + 3] * k44 + inData[p42 + 3] * k44;
                } else {
                    a = inData[idx + 3];
                }

                if (mono) {
                    r = g = b = (r + g + b) / 3;
                }

                if (invert) {
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                }

                outData[idx] = r;
                outData[idx + 1] = g;
                outData[idx + 2] = b;
                outData[idx + 3] = a;

            }
        }
    }

    function gaussian(inData, outData, width, height, kernelSize) {
        var r, g, b, a, idx,
            n = width * height * 4,
            x, y, i, j,
            inx, iny, w,
            tmpData = [],
            maxKernelSize = 20,
            kernelSize = clamp(kernelSize, 3, maxKernelSize),
            k1 = -kernelSize / 2 + (kernelSize % 2 ? 0.5 : 0),
            k2 = kernelSize + k1,
            weights,
            kernels = [
                [1]
            ]


        for (i = 1; i < maxKernelSize; ++i) {
            kernels[0][i] = 0;
        }

        for (i = 1; i < maxKernelSize; ++i) {
            kernels[i] = [1];
            for (j = 1; j < maxKernelSize; ++j) {
                kernels[i][j] = kernels[i - 1][j] + kernels[i - 1][j - 1];
            }
        }

        weights = kernels[kernelSize - 1]

        for (i = 0, w = 0; i < kernelSize; ++i) {
            w += weights[i];
        }
        for (i = 0; i < kernelSize; ++i) {
            weights[i] /= w;
        }

        // pass 1
        for (y = 0; y < height; ++y) {
            for (x = 0; x < width; ++x) {
                r = g = b = a = 0;

                for (i = k1; i < k2; ++i) {
                    inx = x + i;
                    iny = y;
                    w = weights[i - k1];

                    if (inx < 0) {
                        inx = 0;
                    }
                    if (inx >= width) {
                        inx = width - 1;
                    }

                    idx = (iny * width + inx) * 4;

                    r += inData[idx] * w;
                    g += inData[idx + 1] * w;
                    b += inData[idx + 2] * w;
                    a += inData[idx + 3] * w;

                }

                idx = (y * width + x) * 4;

                tmpData[idx] = r;
                tmpData[idx + 1] = g;
                tmpData[idx + 2] = b;
                tmpData[idx + 3] = a;

            }
        }


        // pass 2
        for (y = 0; y < height; ++y) {
            for (x = 0; x < width; ++x) {
                r = g = b = a = 0;

                for (i = k1; i < k2; ++i) {
                    inx = x;
                    iny = y + i;
                    w = weights[i - k1];

                    if (iny < 0) {
                        iny = 0;
                    }
                    if (iny >= height) {
                        iny = height - 1;
                    }

                    idx = (iny * width + inx) * 4;

                    r += tmpData[idx] * w;
                    g += tmpData[idx + 1] * w;
                    b += tmpData[idx + 2] * w;
                    a += tmpData[idx + 3] * w;
                }

                idx = (y * width + x) * 4;

                outData[idx] = r;
                outData[idx + 1] = g;
                outData[idx + 2] = b;
                outData[idx + 3] = a;
            }
        }
    }
    return {
        /******反相******/
        invert: function(inData, outData, width, height, options) {
            var n = width * height * 4
            for (var i = 0; i < n; i += 4) {
                outData[i] = 255 - inData[i];
                outData[i + 1] = 255 - inData[i + 1];
                outData[i + 2] = 255 - inData[i + 2];
                outData[i + 3] = inData[i + 3]
            }
        },
        /******去色*******/
        desaturate: function(inData, outData, width, height, options) {
            var n = width * height * 4,
                level;

            for (var i = 0; i < n; i += 4) {
                level = inData[i] * 0.3 + inData[i + 1] * 0.59 + inData[i + 2] * 0.11;
                outData[i] = level;
                outData[i + 1] = level;
                outData[i + 2] = level;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*************曝光过度***********/
        solarize: function(inData, outData, width, height, options) {
            var n = width * height * 4,
                r, g, b;

            for (i = 0; i < n; i += 4) {
                r = inData[i];
                g = inData[i + 1];
                b = inData[i + 2];

                outData[i + 0] = r > 127 ? 255 - r : r;
                outData[i + 1] = g > 127 ? 255 - g : g;
                outData[i + 2] = b > 127 ? 255 - b : b;
                outData[i + 3] = inData[i + 3];
            }
        },
        /**********马赛克***********/
        mosaic: function(inData, outData, width, height, options) {

            verifyOptions(options) //验证options

            var blockSize = clamp(options.blockSize, 1, Math.max(width, height)),
                yBlocks = Math.ceil(height / blockSize),
                xBlocks = Math.ceil(width / blockSize),
                y0, y1, x0, x1, idx, pidx,
                n = yBlocks * xBlocks

            for (i = 0, y0 = 0, bidx = 0; i < yBlocks; i++) {
                y1 = clamp(y0 + blockSize, 0, height);
                for (j = 0, x0 = 0; j < xBlocks; j++, bidx++) {
                    x1 = clamp(x0 + blockSize, 0, width);

                    idx = (y0 * width + x0) << 2;
                    var r = inData[idx],
                        g = inData[idx + 1],
                        b = inData[idx + 2];

                    for (bi = y0; bi < y1; bi++) {
                        for (bj = x0; bj < x1; bj++) {
                            pidx = (bi * width + bj) << 2;
                            outData[pidx] = r, 
                            outData[pidx + 1] = g, 
                            outData[pidx + 2] = b;
                            outData[pidx + 3] = inData[pidx + 3];
                        }
                    }
                    x0 = x1;
                }
                y0 = y1;
            }
        },
        /*********亮度/对比度调节*********/
        brightness: function(inData, outData, width, height, options) {

            verifyOptions(options) //验证options

            options = defaultOptions(options, {
                brightness: 0,
                contrast: 0
            });

            var contrast = clamp(options.contrast, -1, 1) / 2,
                brightness = 1 + clamp(options.brightness, -1, 1),
                r, g, b,
                n = width * height * 4;

            var brightMul = brightness < 0 ? -brightness : brightness;
            var brightAdd = brightness < 0 ? 0 : brightness;

            contrast = 0.5 * Math.tan((contrast + 1) * Math.PI / 4);
            contrastAdd = -(contrast - 0.5) * 255;

            for (var i = 0; i < n; i += 4) {
                r = inData[i];
                g = inData[i + 1];
                b = inData[i + 2];

                r = (r + r * brightMul + brightAdd) * contrast + contrastAdd;
                g = (g + g * brightMul + brightAdd) * contrast + contrastAdd;
                b = (b + b * brightMul + brightAdd) * contrast + contrastAdd;

                outData[i] = r;
                outData[i + 1] = g;
                outData[i + 2] = b;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*******色彩平衡*************/
        coloradjust: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options

            var n = width * height * 4,
                r, g, b
            ar = clamp(options.r, -1, 1) * 255,
                ag = clamp(options.g, -1, 1) * 255,
                ab = clamp(options.b, -1, 1) * 255;

            for (var i = 0; i < n; i += 4) {
                r = inData[i] + ar;
                g = inData[i + 1] + ag;
                b = inData[i + 2] + ab;
                if (r < 0) r = 0;
                if (g < 0) g = 0;
                if (b < 0) b = 0;
                if (r > 255) r = 255;
                if (g > 255) g = 255;
                if (b > 255) b = 255;
                outData[i] = r;
                outData[i + 1] = g;
                outData[i + 2] = b;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*********HSL色相饱和度亮度*******/
        hsl: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options
            var n = width * height * 4,
                hue = clamp(options.hue, -1, 1),
                saturation = clamp(options.saturation, -1, 1),
                lightness = clamp(options.lightness, -1, 1),
                satMul = 1 + saturation * (saturation < 0 ? 1 : 2),
                lightMul = lightness < 0 ? 1 + lightness : 1 - lightness,
                lightAdd = lightness < 0 ? 0 : lightness * 255,
                vs, ms, vm, h, s, l, v, m, vmh, sextant

            hue = (hue * 6) % 6;

            for (var i = 0; i < n; i += 4) {

                r = inData[i];
                g = inData[i + 1];
                b = inData[i + 2];

                if (hue != 0 || saturation != 0) {
                    vs = r;
                    if (g > vs) vs = g;
                    if (b > vs) vs = b;
                    ms = r;
                    if (g < ms) ms = g;
                    if (b < ms) ms = b;
                    vm = (vs - ms);
                    l = (ms + vs) / 510;

                    if (l > 0 && vm > 0) {
                        if (l <= 0.5) {
                            s = vm / (vs + ms) * satMul;
                            if (s > 1) s = 1;
                            v = (l * (1 + s));
                        } else {
                            s = vm / (510 - vs - ms) * satMul;
                            if (s > 1) s = 1;
                            v = (l + s - l * s);
                        }
                        if (r == vs) {
                            if (g == ms) {
                                h = 5 + ((vs - b) / vm) + hue;
                            } else {
                                h = 1 - ((vs - g) / vm) + hue;
                            }
                        } else if (g == vs) {
                            if (b == ms) {
                                h = 1 + ((vs - r) / vm) + hue;
                            } else {
                                h = 3 - ((vs - b) / vm) + hue;
                            }
                        } else {
                            if (r == ms) {
                                h = 3 + ((vs - g) / vm) + hue;
                            } else {
                                h = 5 - ((vs - r) / vm) + hue;
                            }
                        }
                        if (h < 0) h += 6;
                        if (h >= 6) h -= 6;
                        m = (l + l - v);
                        sextant = h >> 0;
                        vmh = (v - m) * (h - sextant);
                        if (sextant == 0) {
                            r = v;
                            g = m + vmh;
                            b = m;
                        } else if (sextant == 1) {
                            r = v - vmh;
                            g = v;
                            b = m;
                        } else if (sextant == 2) {
                            r = m;
                            g = v;
                            b = m + vmh;
                        } else if (sextant == 3) {
                            r = m;
                            g = v - vmh;
                            b = v;
                        } else if (sextant == 4) {
                            r = m + vmh;
                            g = m;
                            b = v;
                        } else if (sextant == 5) {
                            r = v;
                            g = m;
                            b = v - vmh;
                        }

                        r *= 255;
                        g *= 255;
                        b *= 255;
                    }
                }

                r = r * lightMul + lightAdd;
                g = g * lightMul + lightAdd;
                b = b * lightMul + lightAdd;

                if (r < 0) r = 0;
                if (g < 0) g = 0;
                if (b < 0) b = 0;
                if (r > 255) r = 255;
                if (g > 255) g = 255;
                if (b > 255) b = 255;

                outData[i] = r;
                outData[i + 1] = g;
                outData[i + 2] = b;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*******高斯模糊*******/
        blur: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options
            gaussian(inData, outData, width, height, options.kernelSize);
        },
        /*******噪声*****/
        noise: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options
            var n = width * height * 4,
                amount = clamp(options.amount, 0, 1),
                strength = clamp(options.strength, 0, 1),
                mono = !!options.mono,
                random = Math.random,
                rnd, r, g, b;

            for (var i = 0; i < n; i += 4) {
                r = inData[i];
                g = inData[i + 1];
                b = inData[i + 2];

                rnd = random();

                if (rnd < amount) {
                    if (mono) {
                        rnd = strength * ((rnd / amount) * 2 - 1) * 255;
                        r += rnd;
                        g += rnd;
                        b += rnd;
                    } else {
                        r += strength * random() * 255;
                        g += strength * random() * 255;
                        b += strength * random() * 255;
                    }
                }

                outData[i] = r;
                outData[i + 1] = g;
                outData[i + 2] = b;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*******色彩分离******/
        posterize: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options
            var numLevels = clamp(options.levels, 2, 256),
                numAreas = 256 / numLevels,
                numValues = 256 / (numLevels - 1),
                r, g, b,
                n = width * height * 4

            for (i = 0; i < n; i += 4) {
                outData[i] = numValues * ((inData[i] / numAreas) >> 0);
                outData[i + 1] = numValues * ((inData[i + 1] / numAreas) >> 0);
                outData[i + 2] = numValues * ((inData[i + 2] / numAreas) >> 0);

                outData[i + 3] = inData[i + 3];
            }
        },
        /********查找边缘*******/
        findedges: function(inData, outData, width, height, options) {
            var n = width * height * 4,
                i,
                data1 = [],
                data2 = [],
                gr1, gr2, gg1, gg2, gb1, gb2,
                convProgress1, convProgress2;


            convolve3x3(inData, data1, width, height, [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ]);
            convolve3x3(inData, data2, width, height, [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ]);

            for (i = 0; i < n; i += 4) {
                gr1 = data1[i];
                gr2 = data2[i];
                gg1 = data1[i + 1];
                gg2 = data2[i + 1];
                gb1 = data1[i + 2];
                gb2 = data2[i + 2];

                if (gr1 < 0) gr1 = -gr1;
                if (gr2 < 0) gr2 = -gr2;
                if (gg1 < 0) gg1 = -gg1;
                if (gg2 < 0) gg2 = -gg2;
                if (gb1 < 0) gb1 = -gb1;
                if (gb2 < 0) gb2 = -gb2;

                outData[i] = 255 - (gr1 + gr2) * 0.8;
                outData[i + 1] = 255 - (gg1 + gg2) * 0.8;
                outData[i + 2] = 255 - (gb1 + gb2) * 0.8;
                outData[i + 3] = inData[i + 3];

            }
        },
        /*******浮雕*******/
        emboss: function(inData, outData, width, height, options) {
            verifyOptions(options) //验证options
            var amount = options.amount,
                angle = options.angle,
                x = Math.cos(-angle) * amount,
                y = Math.sin(-angle) * amount,
                n = width * height * 4,

                a00 = -x - y,
                a10 = -x,
                a20 = y - x,
                a01 = -y,
                a21 = y,
                a02 = -y + x,
                a12 = x,
                a22 = y + x,

                tmpData = []



            convolve3x3(
                inData, tmpData, width, height, [
                    [a00, a01, a02],
                    [a10, 0, a12],
                    [a20, a21, a22]
                ]
            );

            for (var i = 0; i < n; i += 4) {
                outData[i] = 128 + tmpData[i];
                outData[i + 1] = 128 + tmpData[i + 1];
                outData[i + 2] = 128 + tmpData[i + 2];
                outData[i + 3] = inData[i + 3];

            }
        },
        /********3X3锐化********/
        edgeenhance3x3: function(inData, outData, width, height, options) {
            convolve3x3(
                inData, outData, width, height, [
                    [-1 / 9, -1 / 9, -1 / 9],
                    [-1 / 9, 17 / 9, -1 / 9],
                    [-1 / 9, -1 / 9, -1 / 9]
                ]
            );
        },
        /********5x5锐化********/
        edgeenhance5x5: function(inData, outData, width, height, options, progress) {
            convolve5x5(
                inData, outData, width, height, [
                    [-1 / 25, -1 / 25, -1 / 25, -1 / 25, -1 / 25],
                    [-1 / 25, -1 / 25, -1 / 25, -1 / 25, -1 / 25],
                    [-1 / 25, -1 / 25, 49 / 25, -1 / 25, -1 / 25],
                    [-1 / 25, -1 / 25, -1 / 25, -1 / 25, -1 / 25],
                    [-1 / 25, -1 / 25, -1 / 25, -1 / 25, -1 / 25]
                ],
                progress
            );
        },
        //  3x3 Laplace算了
        laplace3x3: function(inData, outData, width, height, options) {
            convolve3x3(
                inData, outData, width, height, [
                    [-1, -1, -1],
                    [-1, 8, -1],
                    [-1, -1, -1]
                ],
                false, true, true
            );
        },
        /*********均值滤波*********/
        //  3x3 
        soften3x3: function(inData, outData, width, height, options, progress) {
            var c = 1 / 9;
            convolve3x3(
                inData, outData, width, height, [
                    [c, c, c],
                    [c, c, c],
                    [c, c, c]
                ],
                progress
            );
        },

        //5x5 
        soften5x5: function(inData, outData, width, height, options, progress) {
            var c = 1 / 25;
            convolve5x5(
                inData, outData, width, height, [
                    [c, c, c, c, c],
                    [c, c, c, c, c],
                    [c, c, c, c, c],
                    [c, c, c, c, c],
                    [c, c, c, c, c]
                ],
                progress
            );
        },
        /*********调整*********/
        /********************/
        /************水平翻转*********/
        horizontal: function(inData, outData, width, height) {
            var inPix, outPix,
                x, y;
            for (y = 0; y < height; ++y) {
                for (x = 0; x < width; ++x) {
                    inPix = (y * width + x) * 4;
                    outPix = ((height - y - 1) * width + x) * 4;
                    outData[outPix] = inData[inPix];
                    outData[outPix + 1] = inData[inPix + 1];
                    outData[outPix + 2] = inData[inPix + 2];
                    outData[outPix + 3] = inData[inPix + 3];

                }
            }
        },
        /************垂直翻转********/
        vertical: function(inData, outData, width, height) {
            var inPix, outPix,
                x, y;
            for (y = 0; y < height; ++y) {
                for (x = 0; x < width; ++x) {
                    inPix = (y * width + x) * 4;
                    outPix = (y * width + (width - x - 1)) * 4;

                    outData[outPix] = inData[inPix];
                    outData[outPix + 1] = inData[inPix + 1];
                    outData[outPix + 2] = inData[inPix + 2];
                    outData[outPix + 3] = inData[inPix + 3];

                }
            }
        },
        /************旋转********/
        rotate90_1: function(inData, outData, width, height) {
            var inPix, outPix,
                x, y;
            canvas.width = height
            canvas.height = width
            for (y = 0; y < height; ++y) {
                for (x = 0; x < width; ++x) {
                    inPix = (y * width + x) * 4;
                    outPix = (height * (width - x - 1) + y) * 4
                    outData[outPix] = inData[inPix];
                    outData[outPix + 1] = inData[inPix + 1];
                    outData[outPix + 2] = inData[inPix + 2];
                    outData[outPix + 3] = inData[inPix + 3];
                }
            }
            adjustCanvasPos() //调整显示大小
        },
        /************旋转********/
        rotate90_2: function(inData, outData, width, height) {
            var inPix, outPix,
                x, y;
            canvas.width = height
            canvas.height = width
            for (y = 0; y < height; ++y) {
                for (x = 0; x < width; ++x) {
                    inPix = (y * width + x) * 4;
                    outPix = (height * x + (height - y - 1)) * 4

                    outData[outPix] = inData[inPix];
                    outData[outPix + 1] = inData[inPix + 1];
                    outData[outPix + 2] = inData[inPix + 2];
                    outData[outPix + 3] = inData[inPix + 3];
                }
            }
            adjustCanvasPos() //调整显示大小
                // slider.value  = 1.0 //放大控制条还原
        }
    }
})();
/*********工具条***********/
    var pp = false
    var fdoTool = {
            colorPicker: function(toolSwitch) {
                if (toolSwitch) {
                    // console.log('colorPicker-ON');
                    canvas.addEventListener('mousedown', colorPickerMousedown)
                } else {
                    // console.log('colorPicker-OFF');
                    canvas.removeEventListener('mousedown', colorPickerMousedown)
                }
            },
            pen: function(toolSwitch, color, strokeSize) {
                if (toolSwitch) {
                    // console.log('pen--ON');
                    context.lineWidth = strokeSize
                    context.strokeStyle = color
                    context.lineCap = 'round'
                    context.lineJoin="round";
                    canvas.addEventListener('mousedown', penMousedown)
                    canvas.addEventListener('mousemove', penMousemove)
                    canvas.addEventListener('mouseup', penMouseup)
                        // //touchevent
                    canvas.addEventListener('touchstart', penMousedown)
                    canvas.addEventListener('touchmove', penMousemove)
                    canvas.addEventListener('touchend', penMouseup)
                } else {
                    // console.log('pen--OFF');
                    canvas.removeEventListener('mousedown', penMousedown)
                    canvas.removeEventListener('mouseup', penMousemove)
                    canvas.removeEventListener('mousemove', penMouseup)
                        ///
                    canvas.removeEventListener('touchstart', penMousedown)
                    canvas.removeEventListener('touchmove', penMousemove)
                    canvas.removeEventListener('touchend', penMouseup)

                }

            },
            rect: function(toolSwitch, color, strokeSize) {
                if (toolSwitch) {
                    context.lineWidth = strokeSize
                    context.strokeStyle = color
                    context.fillStyle = color
                    context.lineCap = 'butt'
                    context.lineJoin="miter";

                    canvas.addEventListener('mousedown', rectMousedown)
                    canvas.addEventListener('mouseup', rectMouseup)
                    canvas.addEventListener('touchstart', rectMousedown)
                    canvas.addEventListener('touchend', rectMouseup)
                } else {
                    // console.log('rect--OFF');
                    canvas.removeEventListener('mousedown', rectMousedown)
                    canvas.removeEventListener('mouseup', rectMouseup)

                    canvas.removeEventListener('touchstart', rectMousedown)
                    canvas.removeEventListener('touchend', rectMouseup)
                }
            },
            circle: function(toolSwitch, color, strokeSize) {
                if (toolSwitch) {
                    // console.log('circle--ON');
                    context.lineWidth = strokeSize
                    context.strokeStyle = color
                    context.fillStyle = color

                    canvas.addEventListener('mousedown', circleMousedown)
                    canvas.addEventListener('mouseup', circleMouseup)

                    canvas.addEventListener('touchstart', circleMousedown)
                    canvas.addEventListener('touchend', circleMouseup)
                } else {
                    // console.log('circle--OFF');

                    canvas.removeEventListener('mousedown', circleMousedown)
                    canvas.removeEventListener('mouseup', circleMouseup)
                    canvas.removeEventListener('touchstart', circleMousedown)
                    canvas.removeEventListener('touchend', circleMouseup)
                }

            },
            arrow: function(toolSwitch, color, strokeSize) {
                if (toolSwitch) {
                    // console.log('arrow--ON');
                    context.lineWidth = strokeSize
                    context.strokeStyle = color
                    context.fillStyle = color
                    context.lineCap = 'butt'
                    context.lineJoin="miter";


                    canvas.addEventListener('mousedown', arrowMousedown)
                    canvas.addEventListener('mouseup', arrowMouseup)

                    canvas.addEventListener('touchstart', arrowMousedown)
                    canvas.addEventListener('touchend', arrowMouseup)

                } else {
                    // console.log('arrow--OFF');          
                    canvas.removeEventListener('mousedown', arrowMousedown)
                    canvas.removeEventListener('mouseup', arrowMouseup)
                    canvas.removeEventListener('touchstart', arrowMousedown)
                    canvas.removeEventListener('touchend', arrowMouseup)
                }
            },
            changePos: function(toolSwitch) {
                if (toolSwitch) {
                    // console.log('changePos-ON');
                    canvas.addEventListener('mousedown', changePosMousedown)
                    canvas.addEventListener('mouseup', changePosMouseup)

                    canvas.addEventListener('touchstart', changePosMousedown)
                    canvas.addEventListener('touchend', changePosMouseup)

                } else {
                    // console.log('changePos-OFF');
                    canvas.removeEventListener('mousedown', changePosMousedown)
                    canvas.removeEventListener('mouseup', changePosMouseup)
                    canvas.removeEventListener('touchstart', changePosMousedown)
                    canvas.removeEventListener('touchend', changePosMouseup)
                }
            }
        }
        /******拾色器*****/
    function colorPickerMousedown(e) {
        var mousePos = getMousePos(canvas, e);
        var mouseX = mousePos.x
        var mouseY = mousePos.y
        recta = canvas.getBoundingClientRect();

        var pixColorPos = Math.round(mouseY * canvas.width + mouseX)
        imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        var pixData = imageData.data
        var r, g, b, hex = '#'
        r = pixData[pixColorPos * 4 + 0]
        g = pixData[pixColorPos * 4 + 1]
        b = pixData[pixColorPos * 4 + 2]
            //调用rgb 转 hex 
        hex += zero_fill_hex(r, 2) + zero_fill_hex(g, 2) + zero_fill_hex(b, 2)
            //更新color
        ocolor.value = hex
        ocolorCont.style.backgroundColor = hex
        ocolorNumber.value = hex
        context.fillStyle = hex
        context.strokeStyle = hex
    }
    /***画笔的鼠标控制***/
    function penMousedown(e) {
        e.preventDefault()
            //更新历史纪录
        imageDataRecord.data = imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate = imageDataRecord.isRotate.slice(0, tmpIndex)
        var mousePos = getMousePos(canvas, e);
        var mouseX = mousePos.x
        var mouseY = mousePos.y
        pp = true
        context.beginPath()
        context.moveTo(mouseX, mouseY)
    }

    function penMouseup(e) {
        pp = false
            //记录操作
        imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        writeImageDataRecord(imageData)
    }

    function penMousemove(e) {
        e.preventDefault()
        var mousePos = getMousePos(canvas, e);
        var mouseX = mousePos.x
        var mouseY = mousePos.y
        if (pp) {
            context.lineTo(mouseX, mouseY)
            context.stroke()
        }
    }
    /***箭头的鼠标控制***/
    var sta = {
            x: "",
            y: ""
        },
        end = {
            x: '',
            y: ''
        }

    function arrowMousedown(e) {
        e.preventDefault()
            //更新历史纪录
        imageDataRecord.data = imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate = imageDataRecord.isRotate.slice(0, tmpIndex)
        var mousePos = getMousePos(canvas, e);
        sta.x = mousePos.x
        sta.y = mousePos.y

    }

    function arrowMouseup(e) {
        var mousePos = getMousePos(canvas, e);
        end.x = mousePos.x
        end.y = mousePos.y
            //直线部分
        context.beginPath()
        context.moveTo(sta.x, sta.y)
        context.lineTo(end.x, end.y)
        context.stroke()
        context.save();
        //绘制箭头
        /**先在end位置绘制出向下的箭头再旋转**/

        //旋转
        context.translate(end.x, end.y); //改变旋转原点
        var ang = (end.x - sta.x) / (end.y - sta.y);
        ang = Math.atan(ang)
        if (end.y - sta.y >= 0) {
            context.rotate(-ang)
        } else {
            context.rotate(Math.PI - ang)
        }
        //绘制三角
        context.beginPath()
        context.moveTo(0, 0)
        var strWidth = context.lineWidth * 4 //三角形取4线宽
        context.lineTo(0 + strWidth / 2, 0 + 0)
        context.lineTo(0, 0 + strWidth * Math.sin(Math.PI / 3))
        context.lineTo(0 - strWidth / 2, 0)
        context.fill()
        context.closePath()

        context.restore();

        //记录操作
        imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        writeImageDataRecord(imageData)

    }
    /***椭圆选框的鼠标控制***/
    function circleMousedown(e) {
        e.preventDefault()
            //更新历史纪录
        imageDataRecord.data = imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate = imageDataRecord.isRotate.slice(0, tmpIndex)
        var mousePos = getMousePos(canvas, e);
        sta.x = mousePos.x
        sta.y = mousePos.y

    }

    function circleMouseup(e) {
        var mousePos = getMousePos(canvas, e);
        end.x = mousePos.x
        end.y = mousePos.y
            //椭圆
        var a = (end.x - sta.x) / 2
        var b = (end.y - sta.y) / 2
        if (a < 0 && b < 0) {
            return
        }
        var x = sta.x + a
        var y = sta.y + b

        context.save();

        var r = (a > b) ? a : b; //选择a、b中的较大者作为arc方法的半径参数
        var ratioX = a / r;
        var ratioY = b / r;
        context.scale(ratioX, ratioY); //进行缩放（均匀压缩）
        context.beginPath();
        //从椭圆的左端点开始逆时针绘制
        context.moveTo((x + a) / ratioX, y / ratioY);
        context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI);
        context.closePath();

        context.restore();//注意 restore 和 stroke 为顺序，不然会引起线宽的不同
        context.stroke();

        //记录操作
        imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        writeImageDataRecord(imageData)
    }
    /***方选框的鼠标控制***/
    function rectMousedown(e) {
        e.preventDefault()
            //更新历史纪录
        imageDataRecord.data = imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate = imageDataRecord.isRotate.slice(0, tmpIndex)
        var mousePos = getMousePos(canvas, e);
        sta.x = mousePos.x
        sta.y = mousePos.y
    }

    function rectMouseup(e) {
        var mousePos = getMousePos(canvas, e);
        end.x = mousePos.x
        end.y = mousePos.y

        var w = end.x - sta.x
        var h = end.y - sta.y
        if (w < 0 && h < 0) {
            return
        }
        context.strokeRect(sta.x, sta.y, w, h)

        //记录操作
        imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        writeImageDataRecord(imageData)
    }
    /********移动工具*********/
    function changePosMousedown(e) {
        e.preventDefault()

        if (e.touches) {
            sta.x = e.changedTouches[0].clientX
            sta.y = e.changedTouches[0].clientY
        } else {
            sta.x = e.clientX
            sta.y = e.clientY
        }


    }

    function changePosMouseup(e) {
        if (e.touches) {
            end.x = e.changedTouches[0].clientX
            end.y = e.changedTouches[0].clientY
        } else {
            end.x = e.clientX
            end.y = e.clientY
        }

        var w = end.x - sta.x
        var h = end.y - sta.y
        var xstr = canvas.style.left
        var ystr = canvas.style.top
        var x = xstr.substring(0, xstr.indexOf('px')) //去除string中的px单位
        var y = ystr.substring(0, ystr.indexOf('px'))

        //通过改变 pos=absolute 的canvas的left top 实现移动
        canvas.style.left = parseInt(x) + parseInt(w) + "px"
        canvas.style.top = parseInt(y) + parseInt(h) + "px"
    }