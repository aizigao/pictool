//调整大小
    function fclacImgZoomParam( maxWidth, maxHeight, width, height ){ 
        var param = {top:0, left:0, width:width, height:height}; 
        if( width>maxWidth || height>maxHeight ) 
        { 
            rateWidth = width / maxWidth; 
            rateHeight = height / maxHeight; 
             
            if( rateWidth > rateHeight ) 
            { 
                param.width =  maxWidth; 
                param.height = Math.round(height / rateWidth); 
            }else 
            { 
                param.width = Math.round(width / rateHeight); 
                param.height = maxHeight; 
            } 
        } 
         
        param.left = Math.round((maxWidth - param.width) / 2); 
        param.top = Math.round((maxHeight - param.height) / 2); 
        return param; 
    } 
    function adjustCanvasPos(){
        var mainRect=mainContainer.getBoundingClientRect() //为支持响应式 应重新获取大小
        var MAXWIDTH=mainRect.width
        var MAXHEIGHT=mainRect.height

        var rect=fclacImgZoomParam(MAXWIDTH, MAXHEIGHT, canvas.width, canvas.height)//调整canvas的显示大小
        canvas.style.width=rect.width+'px'
        canvas.style.height=rect.height+'px'

        canvas.style.left=rect.left+'px'
        canvas.style.top=rect.top+'px' 
        ImageByScale(slider.value) //保持放大状态

    }
//获取canvas坐标
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        if (evt.touches) {
            return {
                x: (evt.changedTouches[0].clientX - (rect.left)) * (canvas.width / rect.width),
                y: (evt.changedTouches[0].clientY - (rect.top)) * (canvas.height / rect.height)
            }
        }
        return {
            x: (evt.clientX - (rect.left)) * (canvas.width / rect.width),
            y: (evt.clientY - (rect.top)) * (canvas.height / rect.height)
        }
    }
//filterBtnshow
    function filterBtnshow(){
        var filterBtn=document.getElementById('filterBtn')
        var filteringEffect=document.getElementById('filteringEffect')
        var ctrBtn= filteringEffect.getElementsByTagName('h3')[0]
        // console.log(ctrBtn);
        var count=0
        ctrBtn.onclick =function(e){
            count++
            var istoggle=count%2
            if(istoggle){
                filterBtn.style.display = 'block'
                this.style.backgroundColor="#742FEE"
            }else{
                filterBtn.style.display = 'none'
                this.style.backgroundColor="#152669"
            }
        }
    }
//rgb转hex
    // function rgbToHex(r, g, b) { return ((r << 16) | (g << 8) | b).toString(16); } 
    function zero_fill_hex(num, digits) {
      var s = num.toString(16);
      while (s.length < digits)
        s = "0" + s;
      return s;
    }
//弹出窗口
    var ootool         = document.getElementById('tools')
    var optionPop      = document.getElementById('optionPop')
    var optionPopBg    = document.getElementById('optionPopbg')
    var optionPopClose = document.getElementById('submitPop')
    var optionPopcancel = document.getElementById('cancelPop')
    optionPopcancel.addEventListener('click', Close_popDiv)
    optionPopClose.addEventListener('click', Close_popDiv)
    function Close_popDiv(){
        optionPop.style.display   = "none"
        optionPopBg.style.display = "none"
        var oinputOptions = document.getElementById('filterOptions')
        oinputOptions.innerHTML = ""
        isshow=false//////////////
    }
    function Show_popDiv(){
        isshow=true///////////////////////
        var bgsize=windowSizeParam() //得到窗口大小在各种游览器下的尺寸
        var bgWidth = bgsize.width
        var bgHeight = bgsize.height
        var bgTop = bgsize.top
        var bgLeft = bgsize.left
         //背景样式
        optionPopBg.style.display    ='block'
        optionPopBg.style.position   = "absolute";
        optionPopBg.style.top        = bgTop+"px";
        optionPopBg.style.left       = bgLeft+"px";
        optionPopBg.style.width      = bgWidth + "px";
        optionPopBg.style.height     = bgHeight + "px";
        optionPopBg.style.zIndex     = "10000";
        optionPopBg.style.background = "#eee";
        optionPopBg.style.filter     = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=60,finishOpacity=30);"; 
        optionPopBg.style.opacity    = "0.3";

        optionPop.style.display  ="block"
        var popWidth  = optionPop.scrollWidth;
        var popHeight = optionPop.scrollHeight;
        var popTop    = bgsize.top+Math.round( (bgsize.height-popHeight)/2  )
        var popLeft   = bgsize.left+Math.round( (bgsize.width-popWidth)/2  )
        //设置样式
        optionPop.style.position        = "absolute";
        optionPop.style.top             = popTop+"px";
        optionPop.style.left            = popLeft+"px";
        optionPop.style.zIndex          = "10001";
    }
    function windowSizeParam(){
        var param = {width:0,height:0,top:0,left:0}; 

            param.width=document.documentElement.clientWidth ||document.body.clientWidth || 0;
            param.height=document.documentElement.clientHeight || document.body.clientHeight || 0;
            param.top=window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            param.left=window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

        return param
    }
    function errormsg(msg){
        var oinputOptions =document.getElementById('filterOptions')
        errorMsg=document.createElement('p')
        errorMsg.setAttribute('class', 'errorMsg')
        errorMsg.innerHTML=msg
        oinputOptions.appendChild(errorMsg)
    }
    function set_PopDivoptions(){
        hasinputOption    =false

        var options     =filterEffect.options
        var names =filterEffect.optionnames
        var types=filterEffect.optiontypes

        var oinputOptions =document.getElementById('filterOptions')
        for(var i in options){

            var setRange = function(obj, min, max, step) {
                obj.setAttribute('min', min)
                obj.setAttribute('max', max)
                obj.setAttribute('step', step)
            }

            var label=document.createElement('label')
            label.innerHTML=names[i]+":"
            oinputOptions.appendChild(label)
            var rangeInput=document.createElement('input')
            rangeInput.setAttribute('type', 'range')
            rangeInput.setAttribute('id', "r"+i)

            var textInput=document.createElement('input')
            textInput.setAttribute('type', 'text')
            textInput.setAttribute('id',"t"+i)
            var typeNumber=types[i]
            switch(typeNumber){
                case 0:    //-1~1     
                    setRange(rangeInput,-1,1,0.02)
                    break;
                case 1:   //0~1
                    setRange(rangeInput,0,1,0.02)
                    break;
                case 2:  //int
                    setRange(rangeInput,0,100,1)
                    break;
                case 3:  //bool
                    setRange(rangeInput,0,1,1)
                    break;
                case 4:   //angle
                    setRange(rangeInput,0,360,1)
                    break;
                case 5:   //level 2-256
                    setRange(rangeInput,2,256,1)
                    break;
            }
            rangeInput.setAttribute('value', options[i])
            textInput.setAttribute('value', options[i])
            oinputOptions.appendChild(rangeInput)
            oinputOptions.appendChild(textInput)
            // //输入值   
            rangeInput.addEventListener('change', (function (num) { //有闭包 //更新可选参数
                return function (e){
                    e.preventDefault();
                    var ftname      = num
                    var influTextInP=document.getElementById( "t"+ftname)
                    influTextInP.value = this.value                    
                    options[ftname] = this.value
                    hasinputOption  = true          
                }                
            })(i), false);
            textInput.addEventListener('change', (function (num) { //有闭包 //更新可选参数
                return function (e){
                    e.preventDefault();
                    var ftname      = num
                    var influRangeInP=document.getElementById( "r"+ftname)
                    influRangeInP.value = this.value                    
                    options[ftname] = this.value
                    hasinputOption  = true                       
                }                
            })(i), false);
        } 
    }
    /*    function saveSet(saveMSg){
        var oinputOptions =document.getElementById('filterOptions')
        var select=document.createElement('select')
        var type=['jpeg','png','gif']

        for (var i=0;i<type.length;i++) {
            option = document.createElement("option");
            option.innerHTML = type[i]
            option.setAttribute("data-type", type[i]);
            select.appendChild(option);
        }

        oinputOptions.appendChild(select)
    }*/

    var isshow=false
    window.onresize=function(){
        // console.log('resize');
        if (isshow){
            Show_popDiv()
        }
        adjustCanvasPos()        
    }
    window.scroll=function(){
        console.log('resize');
        if (isshow){
            Show_popDiv()
        }
    }