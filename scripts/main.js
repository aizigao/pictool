var canvas  =document.getElementById('mycanvas') 
var context =canvas.getContext('2d')
var slider  = document.getElementById("scale-range")
var mainContainer     =document.getElementById('main')



var toolSwitchCounter =0
var imageData
var noInputError=true //用于滤镜输入参数错误的判定
window.onload=function(){
    init()
    filterBtnshow()
}
/****初始化****/
function init(){
/********滤镜/调整*********/
    //滤镜
    var filteringBtn=[
        {
            name:'反相',
            effect:'invert'
        },
        {
            name:'去色',
            effect:'desaturate'
        },
        {
            name:'马赛克',
            effect : 'mosaic',
            options : {
                blockSize : 8
            },
            optionnames:{
                blockSize:'单元格大小'
            },
            optiontypes:{
                blockSize:2
            }
        },
        {
            name:'曝光过度',
            effect:'solarize'
        },
        {
            name:'亮度/对比度',
            effect : "brightness",
            options : {
                brightness : 0,
                contrast : 0
            },
            optionnames:{
              brightness : '亮度(-1~1)' ,
              contrast : '对比度(-1~1)' 
            },
            optiontypes:{
                brightness :0 ,
                contrast : 0 
            }
        },        
        {
            name:"色相/饱和度",
            effect : "hsl",
            options : {
                hue : 0,
                saturation : 0,
                lightness : 0
            },
            optionnames:{
              hue :'色相(-1~1)' ,
              saturation : '饱和度(-1~1)' ,
              lightness : '亮度(-1~1)' 
            },
            optiontypes:{
                hue    :    0,
                saturation :0,
                lightness : 0
            }

        },
        {
            name:'色彩平衡',
            effect : "coloradjust",
            options : {
                 r : 0,
                 g : 0,
                 b : 0
            },
            optionnames:{
                r : "红(-1~1)" ,
                g : "绿(-1~1)",
                b : "蓝(-1~1)"
            },
            optiontypes:{
                r :0 ,
                g :0,
                b :0
            }
        },
        {
            name:'高斯模糊',
            effect : "blur",
            options : {
                kernelSize : 5 //模糊半径
            },
            optionnames : {
                kernelSize : "高斯半径" 
            },
            optiontypes:{
                kernelSize :2
            }
        },
        {   
            name:'椒盐噪声',
            effect : "noise",
            options : {
                amount : 0.5,
                strength : 0.5,
                mono : true
            }  ,
            optionnames : {
                amount : "数量(0-1)",
                strength :"强度(0-1)",
                mono : "是否单色(false/true)"
            },
            optiontypes:{ 
                amount :  1,
                strength :1,
                mono :    3
            }      

        },{
            name:'查找边缘',
            effect : "findedges"
        },{
            name:'浮雕',
            effect : "emboss",
            options : {
                amount : 0.5,
                angle : 135
            },
            optionnames : {
                amount : "数量(0-1)",
                angle : "角度(单位:度)"
            },
            optiontypes:{
                amount :1,
                angle : 4
            }
        },
        {   
            name:'锐化3X3',
            effect : "edgeenhance3x3"
        },
        {   
            name:'锐化5X5',
            effect : "edgeenhance5x5"
        },
        {   
            name:'均值滤波3X3',
            effect : "soften3x3",
        }, 
        {   
            name:'均值滤波5X5',
            effect : "soften5x5",
        },
        {   
            name:'Laplace',
            effect : "laplace3x3",
        },{
            name:'色彩分离',
            effect : "posterize",
            options : {
                levels : 5//色阶
            },
            optionnames : {
                levels : "色阶"
            },
            optiontypes:{
                levels : 5
            }
        }
    ]
    var filterBtnUl = document.getElementById("filterBtn"), li;
    for (var i=0;i<filteringBtn.length;i++) {
        li = document.createElement("li");
        li.innerHTML = filteringBtn[i].name;
        li.setAttribute("data-effect", i);
        filterBtnUl.appendChild(li);
    }

    filterBtnUl.addEventListener("click", function(e) {
        //更新历史记录
        imageDataRecord.data=imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate=imageDataRecord.isRotate.slice(0, tmpIndex)

        //关闭滤镜框
        var filteringEffect=document.getElementById('filteringEffect')
        var ctrBtn= filteringEffect.getElementsByTagName('h3')[0]
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", false, false);
        ctrBtn.dispatchEvent(evt);

        var target = e.target || e.srcElement,
            effect;
        if (target.tagName == "LI") {
            filterEffect = filteringBtn[target.getAttribute("data-effect")];
            doEffect(filterEffect);
        }
    }, false);

    //调整
    var oadjustBtns=document.getElementById('adjustBtns')
    var oadjustBtn=[
        {
            name:'垂直翻转',
            effect:'vertical'
        },
        {
            name:'水平翻转',
            effect:'horizontal'
        },
        {
            name:"逆时针旋转",
            effect:'rotate90_1'
        },
        {
            name:"正时针旋转",
            effect:'rotate90_2'
        }
    ]

    for(var i=0;i<oadjustBtn.length;i++){
        li=document.createElement('li')
        li.innerHTML=oadjustBtn[i].name
        li.setAttribute('data-adjust',i)
        oadjustBtns.appendChild(li)
    }
    oadjustBtns.addEventListener('click', function(e){
        var target = e.target || e.srcElement
        if(target.tagName == "LI"){
            var oadjust=oadjustBtn[target.getAttribute("data-adjust")]
            doEffect(oadjust)
        }

    },false)

    function doEffect(filterEffect){
        var width          = context.canvas.width, 
        height             = context.canvas.height,
        outWidth           =width,outHeight=height
        var hasinputOption =true
        var isRotate=false  
        //如果是 旋转 则:
        if(filterEffect.effect=='rotate90_1'||filterEffect.effect=='rotate90_2'){
               outWidth=height
               outHeight=width
               isRotate=true
        }   
        // var inData       = imageData
        var inData       = context.getImageData(0, 0, width, height)
        var inPixelData  = inData.data
        var outData      = context.createImageData(outWidth, outHeight) 
        var outPixelData = outData.data


        if(filterEffect.options&&filterEffect.optionnames){
            set_PopDivoptions() //用js写入控制的参数
            Show_popDiv();//弹出弹窗 输入参数
        }else{
            doFiltering()
        }    
        var submit=document.getElementById('submitPop')//弹窗的确定键
        submit.onclick=function(){
            if(noInputError){
                doFiltering()
            }else{ //当输入错误时
                set_PopDivoptions()
                Show_popDiv();//弹出弹窗输入参数
                noInputError=true
            }
        }
        
        function doFiltering (){
            //在使用滤镜时测试参数的正确与否
            FilteringEffect[filterEffect.effect](inPixelData, outPixelData, width, height, filterEffect.options)
            if(noInputError){
                context.putImageData(outData,0,0,0,0,outData.width,outData.height)
                fDrawHistogram(outData)
                //记录操作
                writeImageDataRecord(outData,isRotate)
            }
        }
    }
/******颜色与画笔大小的控制*******/
    //颜色修改
    ocolor=document.getElementById('color') //设为全局变量
    ocolorCont=document.getElementById('colorContainer')
    ocolorNumber=document.getElementById('colorNumber')
    var rcolorRag=new RegExp('^#[0-9a-fA-F]{6}$')   
    ocolor.onchange=function(e){
        ocolorNumber.value=ocolor.value
        frenewtools(ocolorNumber.value,"color")
        ocolorCont.style.backgroundColor=ocolor.value
    }
    ocolorNumber.onchange=function(e){    
        var rag=rcolorRag.test(ocolorNumber.value)
        if(rag){
            ocolor.value=ocolorNumber.value
            ocolorCont.style.backgroundColor=ocolorNumber.value
        }else{
            ocolorNumber.value="#000000"
            ocolor.value=ocolorNumber.value
            ocolorCont.style.backgroundColor=ocolorNumber.value
        }
        frenewtools(ocolor.value,"color")
    }
    //画笔大小
    var ostrokeSize=document.getElementById('strokeSize')
    var ostrokeSizeNumber=document.getElementById('strokeSizeNumber')
    var rstrokeRag=new RegExp('^([0-9]{1,2}|100)$') //匹配1-100
    ostrokeSize.onchange=function(e){
        ostrokeSizeNumber.value=ostrokeSize.value
        frenewtools(ostrokeSizeNumber.value,"strokeSize")
    }
    ostrokeSizeNumber.onchange=function(e){
        var rag=rstrokeRag.test(ostrokeSizeNumber.value)
        if(rag){
            ostrokeSize.value=ostrokeSizeNumber.value
        }else if(ostrokeSizeNumber.value>100){
            ostrokeSizeNumber.value=100
            ostrokeSize.value=100
        }else if(ostrokeSizeNumber.valu<1){
            ostrokeSizeNumber.value=1
            ostrokeSize.value=1
        }else{
            ostrokeSizeNumber.value=5
            ostrokeSize.value=5
        }
        frenewtools(ostrokeSizeNumber.value,"strokeSize")
    }
/*******工具条*********/

    var otoolsBtns=document.getElementById('toolsBtn')
    var otoolBtn=[
        {
            name:'拾色器',
            tool:'colorPicker',
            counter:0,
            value:false

        },
        {
            name:'画笔',
            tool:'pen',
            counter:0,
            value:false
        },
        {
            name:'方选框',
            tool:'rect',
            counter:0,
            value:false
        },
        {
            name:'圆选框',
            tool:'circle',
            counter:0,
            value:false
        },
        {
            name:'箭头',
            tool:'arrow',
            counter:0,
            value:false
        }, 
        {
            name:'改变位置',
            tool:'changePos',
            counter:0,
            value:false
        }]
    

    for (var i=0;i<otoolBtn.length;i++) {
        li = document.createElement("li");
        li.innerHTML = otoolBtn[i].name;
        li.setAttribute("data-tool", i);
        otoolsBtns.appendChild(li);
    }
    otoolsBtns.addEventListener("click", function(e) {
        //更新历史纪录
        imageDataRecord.data=imageDataRecord.data.slice(0, tmpIndex)
        imageDataRecord.isRotate=imageDataRecord.isRotate.slice(0, tmpIndex)

        
        var target = e.target || e.srcElement,
            effect;
        if (target.tagName == "LI") {

            var otool = otoolBtn[target.getAttribute("data-tool")];
            otool.counter++
            otool.value=otool.counter%2
           // 为按纽添加样式
            var btnLI=this.getElementsByTagName('LI')
            for(var i=0;i<btnLI.length;i++){
                btnLI[i].style.boxShadow="1px 1px 1px"
                btnLI[i].style.border   ="none"
            }
            if(otool.value){
                target.style.boxShadow='2px 2px 2px'
                target.style.border="3px solid #64DD25"
            }

            for(var i=0;i<otoolBtn.length;i++){
                if(i==target.getAttribute("data-tool")){
                    continue;
                }
                var othertool=otoolBtn[i]
                othertool.counter=0
                othertool.value=0
                fdoTool[othertool.tool](othertool.value) 
            }
            fdoTool[otool.tool](otool.value,ocolor.value,ostrokeSize.value) //控制器 toolSwitch=true时 打开tool
         }
    }, false);
}
/*****打开图片*****/
    var uploadBtn=document.getElementById('imgUpload')
    uploadBtn.onchange=function(){
        fuploadingImage(this) 
    }
    function fuploadingImage(file) {
        if (file.files && file.files[0]) {
            var type=file.files[0].type
            if(type!="image/jpeg"&&type!='image/png'&&type!='image/gif'){
                errormsg('请选则正确的文件') //提示打开错误
                Show_popDiv()
                return
            }
            slider.value  = 0
            adjustCanvasPos()
            var message   = document.getElementById('message')
            var message2  = document.getElementById('message2')
            message.style.display = 'none'
            message2.style.display = 'none'

            // 每次打开文件清空历史记录
            tmpIndex = 0
            imageDataRecord={data:[],isRotate:[]} // 每次打开文件清空历史记录

            var reader = new FileReader()
            var img = new Image()
            reader.onload = function(e) {
                img.onload    = function() {
                    canvas.width  = img.width
                    canvas.height = img.height
                    context.drawImage(this, 0, 0, img.width, img.height)  

                    //除去上次的tool的操作坐标
                    sta={x:"",y:""},end={x:'',y:''}
                    
                    imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                    adjustCanvasPos()//调整显示大小
                    fDrawHistogram(imageData)
                    //绘制完成后保存 imagedata记录
                    writeImageDataRecord(imageData)
                }
                img.src = e.target.result //将data移入 img.src
            }
            reader.readAsDataURL(file.files[0])
        }
    }
/*******保存*******/
    var saveBtn=document.getElementById('saveImg')
    saveBtn.onclick= fsavaImage
    // saveBtn.onclick=function(){
    //     Canvas2Image.saveAsImage(canvas, canvas.width, canvas.height);
    // }
    function fsavaImage (){
        // 图片导出为 png 格式
        var type = 'png';
        var imgData = canvas.toDataURL();       //data:image/png;base64,.....
        console.log(imgData)

        /* 获取mimeType
         * @param  {String} type the old mime-type
         * @return the new mime-type
         */
        var _fixType = function(type) {
            type = type.toLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        };
           
        // 加工image data，替换mime type
        imgData = imgData.replace(_fixType(type),'image/octet-stream');

        var filename = '已修改_' + (new Date()).getTime() + '.png';// 下载后的问题名
        // download
        var saveFile = function(data,fileName) {
            if(navigator.userAgent.match(/(iPhone|iPad|Android|ios|Windows Phone)/i)){
                document.location=data
                return 
            }
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                save_link.href = data;
                save_link.download = filename;
               
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
        }
        saveFile(imgData,filename)
    }

    /*****更新所有tools颜色与size******/
    function frenewtools(value,type){
        switch(type){
            case "strokeSize":
                context.lineWidth=value
                break;
            case "color":
                context.strokeStyle=value  
                context.fillStyle=value  
                break;
        }
    }
/*******撤消与恢复**********/
    var recallToBtn=document.getElementById('recallTo')
    var repeatToBtn=document.getElementById('repeatTo')
    var imageDataRecord={data:[],isRotate:[]}
    // console.log(imageDataRecord);
    // console.log(imageDataRecord.data);
    var recordlength=32 //设定记录32个步骤
    var tmpIndex=0

    /*****写入记录******/
    function writeImageDataRecord(imageData,isRotate){

        imageDataRecord.data.push(imageData)//写入记录
        //若存在旋转写入 true
        if(isRotate){
            imageDataRecord.isRotate.push(true)
        }
        else{
            imageDataRecord.isRotate.push(false)
        }    

        if(imageDataRecord.data.length==recordlength+1){
            imageDataRecord.data.shift()
            imageDataRecord.isRotate.shift()
        }
        tmpIndex=imageDataRecord.data.length
    }
    /******撤消方法*****/
    recallToBtn.onclick=function(){
        if(imageDataRecord.data.length==0||tmpIndex==1){ //当退回最后一步或者未写入记录时不执行
            return false 
        }
        imageData=imageDataRecord.data[tmpIndex-2]
        var isRotate=imageDataRecord.isRotate[tmpIndex-1]

        if(isRotate){
            var tmp=canvas.width
            canvas.width=canvas.height
            canvas.height=tmp
            adjustCanvasPos() //调节位置*/
        }
        context.putImageData(imageData,0,0,0,0,imageData.width,imageData.height)
        fDrawHistogram(imageData)
        tmpIndex--
    }
    /*****恢复方法*****/
    repeatToBtn.onclick=function(){
        if(tmpIndex==imageDataRecord.data.length){
            return
        }
        imageData=imageDataRecord.data[tmpIndex]
        var isRotate=imageDataRecord.isRotate[tmpIndex]

        if(isRotate){
            var tmp=canvas.width
            canvas.width=canvas.height
            canvas.height=tmp
            adjustCanvasPos() //调节位置*/
        }
        context.putImageData(imageData,0,0,0,0,imageData.width,imageData.height)
        fDrawHistogram(imageData)
        tmpIndex++
    }
/****放大与缩小***/
    var scale = slider.value  //default=0   

    slider.onchange = function(){
        scale = slider.value
        // console.log(scale);
        ImageByScale( scale )
    }
    
    function ImageByScale( scale ){
        var scaleRel
        //先把图片大小调整为0大小
        var mainRect=mainContainer.getBoundingClientRect()
        var MAXWIDTH=mainRect.width //重新获取maxwidth
        var MAXHEIGHT=mainRect.height
        rect=fclacImgZoomParam(MAXWIDTH, MAXHEIGHT, canvas.width, canvas.height)//调整canvas的显示大小
        canvas.style.width=rect.width+'px'
        canvas.style.height=rect.height+'px'
        
        if(scale<0){
            scale=-scale
            scale+=1
            scaleRel=1/scale       
        }else if(scale>0){
            scaleRel= parseFloat(scale)  + 1
        }else{
        	scaleRel= 1
        }
        //按比例调整
        var wstr=canvas.style.width
        var hstr=canvas.style.height
        var W=wstr.substring(0,wstr.indexOf('px'))
        var H=hstr.substring(0,hstr.indexOf('px'))

        canvas.style.width=W*scaleRel+'px'
        canvas.style.height=H*scaleRel+'px'    

        canvas.style.left = (MAXWIDTH-W*scaleRel)/2+'px'
        canvas.style.top= (MAXHEIGHT-H*scaleRel)/2+'px'
    }