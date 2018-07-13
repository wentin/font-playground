Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}
var roundValueByStep = function(value, step){
  var result;
  var value = value;
  var step = step;
  if (value%step < step/2) {
    result = step * Math.floor(value / step);
  } else {
    result = step * Math.ceil(value / step);
  }
  return result.toFixed(step.countDecimals());
}

Vue.component('slider-2d', {
  template: '#slider-2d-template',
  props: {
    axes: {
      type: Array,
      default: function () {
        return [
          {
            tag: 'wght',
            name: 'Weight',
            minValue: 400,
            defaultValue: 400,
            maxValue: 700
          },
          {
            tag: 'wdth',
            name: 'Width',
            minValue: 0,
            defaultValue: 5,
            maxValue: 10
          }
        ]
      }
    },
  },
  data: function () {
    return {
      step: {
        x: 0.01,
        y: 0.01
      },
      maxPos: {
        left: 200,
        top: 200
      },
      handleCenter: {
        x: 8,
        y: 8
      }
    }
  },
  mounted: function () {
  },
  computed: {
    min() {
      return {
        x: this.axes[0].minValue,
        y: this.axes[1].minValue
      };
    },
    max() {
      return {
        x: this.axes[0].maxValue,
        y: this.axes[1].maxValue
      };
    },
    val() {
      return {
        x: this.axes[0].defaultValue,
        y: this.axes[1].defaultValue
      };
    },
    left () {
      var left = (this.val.x - this.min.x) / (this.max.x - this.min.x) * this.maxPos.left;
      return left;
    },
    top () {
      var top = (this.val.y - this.min.y) / (this.max.y - this.min.y) * this.maxPos.top;
      return top;
    }
  },
  methods: {
    updateValueByPosition: function(left, top) {
      var left = left, top = top;
      this.axes[0].defaultValue = (left * (this.max.x - this.min.x) / this.maxPos.left + this.min.x);
      this.axes[0].defaultValue = roundValueByStep(this.val.x, this.step.x);
      this.axes[1].defaultValue = (top * (this.max.y - this.min.y) / this.maxPos.top + this.min.y);
      this.axes[1].defaultValue = roundValueByStep(this.val.y, this.step.y);
      this.$emit('input', this.axes);
    },
    initDrag: function (e) {
      e.stopPropagation();
      this.position = this.$el.getBoundingClientRect();
      var targetLeft = e.clientX - this.position.x - this.handleCenter.x;
      var targetTop = e.clientY - this.position.y - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
      document.body.addEventListener('mousemove',this.doDrag);
      document.body.addEventListener('mouseup',this.stopDrag);
    },
    stopDrag: function () {
      document.body.removeEventListener('mousemove',this.doDrag);
      document.body.removeEventListener('mouseup',this.stopDrag);
    },
    doDrag: function (e) {
      e.stopPropagation();
      var targetLeft = e.clientX - this.$el.getBoundingClientRect().x - this.handleCenter.x;
      var targetTop = e.clientY - this.$el.getBoundingClientRect().y - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
    },
  }
})
Vue.component('text-frame', {
  template: '#text-frame-template',
  props: {
    fontSize: {
      type: Number
    },
    fontSettings: {
      type: Object
    }
  },
  data: function () {
    return {
      step: 0.01,
      startX: 0, 
      startY: 0, 
      startWidth: 0, 
      startHeight: 0, 
      startFontSize: 0, 
      startLeft: 0, 
      startTop: 0,
      startSkewXHeight: 0,
      supportedTags: {
        opticalSize: 'opsz',
        width: 'wdth',
        xHeight: 'XHGT',
        slant: 'slnt',
        italic: 'ital'
      }
    };
  },
  created: function() {
  },
  computed: {
    css() {
      var axes = this.fontSettings.variableOptions.axes;
      var cssString = '';
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length-1) {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + ',';
        } else {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue;
        }
      }
      return {
        fontSize: this.fontSize + 'px',
        fontFamily: this.fontSettings.cssCodeName,
        fontVariationSettings: cssString
      };
    },
    slantnessControlStyles() {
      var defaultValue;
      var axes = this.fontSettings.variableOptions.axes;
      var maxAngle, minAngle, maxValue, minValue, defaultValue, skew, left;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic) {
          maxAngle = axes[i].maxAngle;
          minAngle = axes[i].minAngle;
          maxValue = axes[i].maxValue;
          minValue = axes[i].minValue;
          defaultValue =  parseFloat(axes[i].defaultValue);
        }
      }
      skew = - (defaultValue - minValue)/(maxValue - minValue) * (maxAngle - minAngle);
      left = Math.round(Math.tan((defaultValue - minValue) / (maxValue - minValue) * (maxAngle - minAngle) * Math.PI / 180) * 50);

      return {
        left: left + 'px',
        skew: 'skew(' + skew + 'deg)',
      };
    },
    xHeightControlStyles() {
      var defaultValue;
      var axes = this.fontSettings.variableOptions.axes;
      var maxPositionY, minPositionY, baselinePostionY, maxValue, minValue, defaultValue, xHeightTop, baselineTop;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) {
          maxPositionY = axes[i].maxPositionY;
          minPositionY = axes[i].minPositionY;
          baselinePostionY = axes[i].baselinePostionY;
          maxValue = axes[i].maxValue;
          minValue = axes[i].minValue;
          defaultValue =  parseFloat(axes[i].defaultValue);
        }
      }
      xHeightTop = minPositionY + (defaultValue - minValue)/(maxValue - minValue) * (maxPositionY - minPositionY);
      baselineTop = baselinePostionY;

      return {
        xHeightTop: xHeightTop + 'em',
        baselineTop: baselineTop + 'em',
      };
    },
    isVFOpticalSizeSupported() {
      // return false;
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) return true;
      }
      return false;
    },
    isVFWidthSupported() {
      // return false;
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) return true;
      }
      return false;
    },
    isVFSlantSupported() {
      // return false;
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic) return true;
      }
      return false;
    },
    isVFXHeightSupported() {
      // return false;
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) return true;
      }
      return false;
    }
  },
  methods: {
    // Event Handlers for Font Size Control
    controlFontSizeInitDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlFontSizeDoDrag);
        document.body.addEventListener('mouseup',this.controlFontSizeStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlFontSizeDoDrag);
        document.body.addEventListener('touchend',this.controlFontSizeStopDrag);
      }
      this.startY = e.clientY;
      
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.fontSize;
    },
    controlFontSizeDoDrag: function (event) {
      event.stopPropagation();
      if (event.type == 'mousemove') {
        var e = event;
      } else if (event.type == 'touchmove') {
        var e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.fontSize = this.fontSize.toFixed(0);
      if(this.fontSize < 1) this.fontSize = 1;
      this.$emit('fzchange', this.fontSize);
    },
    controlFontSizeStopDrag: function (event) {
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlFontSizeStopDrag);
        document.body.removeEventListener('mousemove',this.controlFontSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlFontSizeStopDrag);
        document.body.removeEventListener('touchmove',this.controlFontSizeDoDrag);
      }
    },
    
    // Event Handlers for Variable Optical Size Control
    controlVFOpticalSizeInitDrag: function (e) {
      e.stopPropagation();
      this.startY = e.clientY;
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.fontSize;
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) {
          this.opticalSizeAxis = axes[i];
        }
      }
      document.body.addEventListener('mousemove',this.controlVFOpticalSizeDoDrag);
      document.body.addEventListener('mouseup',this.controlVFOpticalSizeStopDrag);
    },
    controlVFOpticalSizeDoDrag: function (e) {
      e.stopPropagation();
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.fontSize = this.fontSize.toFixed(0);
      if(this.fontSize < 1) this.fontSize = 1;

      if (this.fontSize > this.opticalSizeAxis.maxValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.maxValue;
      } else if (this.fontSize < this.opticalSizeAxis.minValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.minValue;
      } else {
        this.opticalSizeAxis.defaultValue = this.fontSize;
      }

      this.$emit('fzchange', this.fontSize);
    },
    controlVFOpticalSizeStopDrag: function () {
      document.body.removeEventListener('mouseup',this.controlVFOpticalSizeStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFOpticalSizeDoDrag);
    },
    
    //  Event Handlers for Variable Width Control
    controlVFWidthInitDrag: function (e) {
      e.stopPropagation();

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.fontSize;
      
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }

      document.body.addEventListener('mousemove',this.controlVFWidthDoDrag);
      document.body.addEventListener('mouseup',this.controlVFWidthStopDrag);
    },
    controlVFWidthDoDrag: function (e) {
      e.stopPropagation();
      var targetWidth = this.startWidth + e.clientX - this.startX;
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.width = targetWidth + "px";
      this.$el.style.height = targetHeight + "px";
      this.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.fontSize = this.fontSize.toFixed(0);
      if(this.fontSize < 1) this.fontSize = 1;
      
      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);
      this.$emit('fzchange', this.fontSize);
    },
    controlVFWidthStopDrag: function () {
      this.$el.style.width = "";
      this.$el.style.height = "";
      document.body.removeEventListener('mouseup',this.controlVFWidthStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFWidthDoDrag);
    },
    generateVFCSS: function(axes) {
      var cssString = 'font-variation-settings: ';
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length-1) {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + ',';
        } else {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + '; ';
        }
      }
      cssString += "font-size: " + this.fontSize + 'px; ';
      cssString += "font-family: " + this.fontSettings.cssCodeName + '; ';
      return cssString;
    },
    fitVFWidth: function(el, nwidth){
      var el = el;
      var nwidth = nwidth;
      
      var axes = this.fontSettings.variableOptions.axes;

      // var axesClone = axes.map(a => ({...a}));
      var axesClone = JSON.parse(JSON.stringify(axes));

      var widthAxis;
      for (var i = 0; i < axesClone.length; i++) {
        if (axesClone[i].tag == this.supportedTags.width) widthAxis = axesClone[i];
      }

      widthAxis.defaultValue = parseFloat(widthAxis.defaultValue);
      var maxVFWidth = widthAxis.maxValue; 
      var minVFWidth = widthAxis.minValue;

      var dupEl = el.cloneNode(true);
      el.parentNode.insertBefore(dupEl, el.nextSibling);
      var dupTextEl = dupEl.querySelector('.text');

      dupEl.style.visibility = "hidden";
      dupEl.style.width = "";
      while (maxVFWidth - minVFWidth > 1) {
        dupTextEl.setAttribute("style", this.generateVFCSS(axesClone));
        var currentWidth = dupEl.clientWidth;
        if (currentWidth >= nwidth) {
          maxVFWidth = widthAxis.defaultValue;
          widthAxis.defaultValue = (widthAxis.defaultValue + minVFWidth)/2;
        } else {
          minVFWidth = widthAxis.defaultValue;
          widthAxis.defaultValue = (widthAxis.defaultValue + maxVFWidth)/2;
        }
      }
      dupEl.parentNode.removeChild(dupEl);
      return roundValueByStep(minVFWidth, this.step);
    },
    
    //  Event Handlers for Variable Width X axis Control
    controlVFWidthXInitDrag: function (e) {
      e.stopPropagation();
      
      this.startX = e.clientX;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.fontSize;
      
      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
      document.body.addEventListener('mousemove',this.controlVFWidthXDoDrag);
      document.body.addEventListener('mouseup',this.controlVFWidthXDoDragStopDrag);
    },
    controlVFWidthXDoDrag: function (e) {
      e.stopPropagation();
      var targetWidth = this.startWidth + e.clientX - this.startX;
      this.$el.style.width = targetWidth + "px";

      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);
      this.$emit('fzchange', this.fontSize);
    },
    controlVFWidthXDoDragStopDrag: function () {
      this.$el.style.width = "";
      
      document.body.removeEventListener('mouseup',this.controlVFWidthXDoDragStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFWidthXDoDrag);
    },
    
    //  Event Handlers for Variable Width Y axis Control
    controlVFWidthYInitDrag: function (e) {
      e.stopPropagation();

      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.fontSize;
      
      this.$el.style.width = this.startWidth + "px";

      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
      
      document.body.addEventListener('mousemove',this.controlVFWidthYDoDrag);
      document.body.addEventListener('mouseup',this.controlVFWidthYStopDrag);
    },
    controlVFWidthYDoDrag: function (e) {
      e.stopPropagation();
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.height = targetHeight + "px";
      this.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.fontSize = this.fontSize.toFixed(0);
      if(this.fontSize < 1) this.fontSize = 1;
      
      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, this.startWidth);
      this.$emit('fzchange', this.fontSize);
    },
    controlVFWidthYStopDrag: function () {
      this.$el.style.width = "";
      this.$el.style.height = "";
      document.body.removeEventListener('mouseup',this.controlVFWidthYStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFWidthYDoDrag);
    },
    
    //  Event Handlers for Variable Slant Control
    controlVFSlantInitDrag: function (e) {
      e.stopPropagation();

      this.handleSlantness = this.$el.querySelector(".vf-slantness-handle");
      this.lineSlantness = this.$el.querySelector(".vf-slantness-line");
      this.startX = e.clientX;
      this.startLeft = parseInt(document.defaultView.getComputedStyle(this.handleSlantness).left, 10);

      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) {
          this.slantAxis = axes[i];
        }
      }

      var maxLeft = Math.tan(this.slantAxis.maxAngle * Math.PI/180) * 50;
      var minLeft = Math.tan(this.slantAxis.minAngle * Math.PI/180) * 50;
      this.maxHandleSlantnessLeft = maxLeft>minLeft?maxLeft:minLeft;
      this.minHandleSlantnessLeft = maxLeft>minLeft?minLeft:maxLeft; 

      document.body.addEventListener('mousemove',this.controlVFSlantDoDrag);
      document.body.addEventListener('mouseup',this.controlVFSlantStopDrag);
    },
    controlVFSlantDoDrag: function (e) {
      e.stopPropagation();

      var targetLeft = this.startLeft + e.clientX - this.startX;
      
      if (targetLeft > this.maxHandleSlantnessLeft) {
        targetLeft = this.maxHandleSlantnessLeft;
      } else if (targetLeft < this.minHandleSlantnessLeft) {
        targetLeft = this.minHandleSlantnessLeft;
      }
      var targetAngle = Math.atan(targetLeft/50)/Math.PI * 180;
      this.slantAxis.defaultValue = roundValueByStep(targetAngle/this.slantAxis.maxAngle*this.slantAxis.maxValue, this.step);
    },
    controlVFSlantStopDrag: function () {
      document.body.removeEventListener('mouseup',this.controlVFSlantStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFSlantDoDrag);
    },

    //  Event Handlers for Variable xHeight Control
    controlVFxHeightInitDrag: function (e) {
      e.stopPropagation();
      this.handleXHeight = this.$el.querySelector(".vf-xheight-line");
      this.startY = e.clientY;
      this.startTop = parseFloat(document.defaultView.getComputedStyle(this.handleXHeight).top);

      var axes = this.fontSettings.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) {
          this.xHeightAxis = axes[i];
        }
      }

      document.body.addEventListener('mousemove',this.controlVFxHeightDoDrag);
      document.body.addEventListener('mouseup',this.controlVFxHeightStopDrag);
    },
    controlVFxHeightDoDrag: function (e) {
      e.stopPropagation();
      var targetTop = (e.clientY - this.startY + this.startTop) / this.fontSize;

      if (targetTop > this.xHeightAxis.minPositionY) {
        targetTop = this.xHeightAxis.minPositionY;
      } else if (targetTop < this.xHeightAxis.maxPositionY) {
        targetTop = this.xHeightAxis.maxPositionY;
      }

      var targetXHeight = this.xHeightAxis.minValue + (targetTop - this.xHeightAxis.minPositionY) / (this.xHeightAxis.maxPositionY - this.xHeightAxis.minPositionY) * (this.xHeightAxis.maxValue - this.xHeightAxis.minValue);
      this.xHeightAxis.defaultValue = roundValueByStep(targetXHeight, this.step);
    },
    controlVFxHeightStopDrag: function () {
      document.body.removeEventListener('mouseup',this.controlVFxHeightStopDrag);
      document.body.removeEventListener('mousemove',this.controlVFxHeightDoDrag);
    },

    //  Event Handlers Templates
    initDrag: function (e) {
      e.stopPropagation();
      document.body.addEventListener('mousemove',this.doDrag);
      document.body.addEventListener('mouseup',this.stopDrag);
    },
    doDrag: function (e) {
      e.stopPropagation();
    },
    stopDrag: function () {
      document.body.removeEventListener('mouseup',this.stopDrag);
      document.body.removeEventListener('mousemove',this.doDrag);
    },
  }
})

var app = new Vue({
  el: '#font-playground-app',
  data: {
    fontFamilies: [
      {
        fontFamilyName: 'Dunbar',
        isActive: true,
        fontFileName: 'Dunbar_Series-VF.woff2',
        cssCodeName: 'Dunbar',
        previewText: {
          isCustom: false,
          customText: ''
        },
        isVariableFont: true,
        variableOptions: {
          axes: [
            {
              tag: 'wght',
              name: 'Weight',
              minValue: 100,
              defaultValue: 500,
              maxValue: 900,
              isSelected: 1
            },
            {
              tag: 'XHGT',
              name: 'x Height',
              minValue: 353,
              defaultValue: 500,
              maxValue: 574,
              minPositionY: 0.571,
              maxPositionY: 0.350,
              baselinePostionY: 0.924,
              isSelected: 2
            },
            {
              tag: 'opsz',
              name: 'Optical Size',
              minValue: 10,
              defaultValue: 36,
              maxValue: 36,
              isSelected: 0
            }
          ],
          instances: [
            {
              name: 'Tall Ultra',
              isActive: false,
              coordinates:{
                'wght': 900, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Extra Bold',
              isActive: false,
              coordinates:{
                'wght': 800, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Bold',
              isActive: false,
              coordinates:{
                'wght': 700, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Medium',
              isActive: false,
              coordinates:{
                'wght': 500, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Regular',
              isActive: false,
              coordinates:{
                'wght': 400, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Book',
              isActive: false,
              coordinates:{
                'wght': 350, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Light',
              isActive: false,
              coordinates:{
                'wght': 300, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Extra Light',
              isActive: false,
              coordinates:{
                'wght': 200, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Tall Hairline',
              isActive: false,
              coordinates:{
                'wght': 100, 'XHGT': 574, 'opsz': 36
              }
            },
            {
              name: 'Low Bold',
              isActive: false,
              coordinates:{
                'wght': 700, 'XHGT': 378, 'opsz': 36
              }
            },
            {
              name: 'Low Medium',
              isActive: false,
              coordinates:{
                'wght': 492.59259033203125, 'XHGT': 363, 'opsz': 36
              }
            },
            {
              name: 'Low Regular',
              isActive: false,
              coordinates:{
                'wght': 400, 'XHGT': 358, 'opsz': 36
              }
            },
            {
              name: 'Low Book',
              isActive: false,
              coordinates:{
                'wght': 350, 'XHGT': 353, 'opsz': 36
              }
            },
            {
              name: 'Low Light',
              isActive: false,
              coordinates:{
                'wght': 300, 'XHGT': 353, 'opsz': 36
              }
            },
            {
              name: 'Low Extra Light',
              isActive: false,
              coordinates:{
                'wght': 200, 'XHGT': 353, 'opsz': 36
              }
            },
            {
              name: 'Low Hairline',
              isActive: false,
              coordinates:{
                'wght': 100, 'XHGT': 353, 'opsz': 36
              }
            },
            {
              name: 'Text Regular',
              isActive: false,
              coordinates:{
                'wght': 369.23077392578125, 'XHGT': 500, 'opsz': 10
              }
            },
            {
              name: 'Text Bold',
              isActive: false,
              coordinates:{
                'wght': 651.5151519775391, 'XHGT': 500, 'opsz': 10
              }
            },
            {
              name: 'Text Medium',
              isActive: false,
              coordinates:{
                'wght': 500, 'XHGT': 500, 'opsz': 10
              }
            },
            {
              name: 'Text Extra Bold',
              isActive: false,
              coordinates:{
                'wght': 738.9082489013672, 'XHGT': 500, 'opsz': 10
              }
            }
          ]
        },
        fontInfo: {
          designer: 'CJ Dunn',
          publisher: 'CJ Type',
          urlText: 'cjtype.com',
          url: 'cjtype.com',
          license: 'Paid/commercial',
          description: ''
        }
      },
      {
        fontFamilyName: 'Compressa',
        isActive: false,
        fontFileName: 'CompressaPRO-GX.woff2',
        cssCodeName: 'Compressa',
        previewText: {
          isCustom: false,
          customText: ''
        },
        isVariableFont: true,
        variableOptions: {
          axes: [
            {
              tag: 'wght',
              name: 'Weight',
              minValue: 100,
              defaultValue: 100,
              maxValue: 1000,
              isSelected: 1
            },
            {
              tag: 'wdth',
              name: 'Width',
              minValue: 10,
              defaultValue: 10,
              maxValue: 200,
              isSelected: 2
            },
            {
              tag: 'ital',
              name: 'Italic',
              minValue: 0,
              defaultValue: 0,
              maxValue: 1,
              minAngle: 0,
              maxAngle: 10,
              isSelected: 0
            }
          ],
          instances: [
          ]
        },
        fontInfo: {
          designer: 'Ingo Preuß',
          publisher: 'PreussType',
          urlText: 'preusstype.com',
          url: 'preusstype.com',
          license: 'Paid/commercial, Trial',
          description: ''
        }
      },
      {
        fontFamilyName: 'Amstelvar',
        isActive: false,
        fontFileName: 'AmstelvarAlpha-VF.woff2',
        cssCodeName: 'Amstelvar',
        previewText: {
          isCustom: false,
          customText: ''
        },
        isVariableFont: true,
        variableOptions: {
          axes: [
            {
              tag: 'wght',
              name: 'Weight',
              minValue: 100,
              defaultValue: 400,
              maxValue: 900,
              isSelected: 1
            },
            {
              tag: 'wdth',
              name: 'Width',
              minValue: 35,
              defaultValue: 100,
              maxValue: 100,
              isSelected: 2
            },
            {
              tag: 'opsz',
              name: 'Optical Size',
              minValue: 10,
              defaultValue: 14,
              maxValue: 72,
              isSelected: 0
            },
            {
              tag: 'XOPQ',
              name: 'x opaque',
              minValue: 5,
              defaultValue: 88,
              maxValue: 500,
              isSelected: 0
            },
            {
              tag: 'XTRA',
              name: 'x transparent',
              minValue: 42,
              defaultValue: 402,
              maxValue: 402,
              isSelected: 0
            },
            {
              tag: 'YOPQ',
              name: 'y opaque',
              minValue: 4,
              defaultValue: 50,
              maxValue: 85,
              isSelected: 0
            },
            {
              tag: 'YTLC',
              name: 'lc y transparent',
              minValue: 445,
              defaultValue: 500,
              maxValue: 600,
              isSelected: 0
            },
            {
              tag: 'YTSE',
              name: 'Serif height',
              minValue: 0,
              defaultValue: 18,
              maxValue: 48,
              isSelected: 0
            },
            {
              tag: 'GRAD',
              name: 'Grade',
              minValue: 25,
              defaultValue: 88,
              maxValue: 150,
              isSelected: 0
            },
            {
              tag: 'XTCH',
              name: 'x transparent Chinese',
              minValue: 800,
              defaultValue: 1000,
              maxValue: 1200,
              isSelected: 0
            },
            {
              tag: 'YTCH',
              name: 'y transparent Chinese',
              minValue: 800,
              defaultValue: 1000,
              maxValue: 1200,
              isSelected: 0
            },
            {
              tag: 'YTAS',
              name: 'y transparent ascender',
              minValue: 650,
              defaultValue: 750,
              maxValue: 850,
              isSelected: 0
            },
            {
              tag: 'YTDE',
              name: 'y transparent descender',
              minValue: 150,
              defaultValue: 250,
              maxValue: 350,
              isSelected: 0
            },
            {
              tag: 'YTUC',
              name: 'y transparent uppercase',
              minValue: 650,
              defaultValue: 750,
              maxValue: 950,
              isSelected: 0
            },
            {
              tag: 'YTRA',
              name: 'y transparent',
              minValue: 800,
              defaultValue: 1000,
              maxValue: 1200,
              isSelected: 0
            },
            {
              tag: 'PWGT',
              name: 'Para Weight',
              minValue: 38,
              defaultValue: 88,
              maxValue: 250,
              isSelected: 0
            },
            {
              tag: 'PWDT',
              name: 'Para Width',
              minValue: 60,
              defaultValue: 402,
              maxValue: 402,
              isSelected: 0
            }
          ],
          instances: [
          ]
        },
        fontInfo: {
          designer: 'David Berlow',
          publisher: 'Font Bureau',
          urlText: 'Github Repo',
          url: 'https://github.com/TypeNetwork/Amstelvar/releases',
          license: 'Open source',
          description: ''
        }
      },
    ],
    fontSize: 100,
    appStates: {
      drawer: {
        fontMenu: {
          isActive: true
        },
      },
      tabs: {
        design: {
          name: 'Design',
          isActive: true
        },
        code: {
          name: 'Code',
          isActive: false
        },
        about: {
          name: 'About',
          isActive: false
        },
      }
    }
  },
  computed: {
    activeFont: function() {
      var activeFont;
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if (this.fontFamilies[i].isActive == true) {
          activeFont = this.fontFamilies[i];
          return activeFont;
        }
      }
    },
    selectedAxes: function() {
      var selectedAxes = [];
      var axes = this.activeFont.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].isSelected > 0) {
          selectedAxes.push(axes[i])
        }
      }
      return selectedAxes;
    },
    isSlider2dActive: function() {
      if (this.selectedAxes.length >= 2) {
        return true;
      } else {
        return false;
      }
    },
    cssCode: function() {
      var cssString = "@font-face {\n";
      cssString += "  src: url('[Your Url Here.]');\n";
      cssString += "  font-family:'" + this.activeFont.cssCodeName + "';\n";
      cssString += "  font-style: normal;\n";
      cssString += "}\n";
      cssString += "div {\n";
      cssString += "  font-family: '" + this.activeFont.cssCodeName + ";\n";
      cssString += "  font-size: " + this.fontSize + "px; \n";
      cssString += "  font-variation-settings:\n";
      var axes = this.activeFont.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length-1) {
          cssString += "    '" + axes[i].tag + "' " + axes[i].defaultValue + ",\n";
        } else {
          cssString += "    '" + axes[i].tag + "' " + axes[i].defaultValue + "; \n";
        }
      }
      cssString += "}\n";
      return cssString;
    },
  },
  methods: {
    activateTab: function(tab) {
      for (var key in this.appStates.tabs) {
        this.appStates.tabs[key].isActive = false;
      }
      tab.isActive = true;
    },
    toggleDrawer: function(drawer) {
      drawer.isActive = !drawer.isActive;
    },
    activateFamily: function(fontFamily) {
      for (var i = 0; i < this.fontFamilies.length; i++) {
        this.fontFamilies[i].isActive = false;
      }
      fontFamily.isActive = true;
    },
    activateAxis: function(axis) {
      if (axis.isSelected == 0) {
        var axes = this.activeFont.variableOptions.axes;
        for (var i = 0; i < axes.length; i++) {
          if (axes[i].isSelected == 2) {
            axes[i].isSelected = 0;
          }
          if (axes[i].isSelected == 1) {
            axes[i].isSelected = 2;
          }
        }
        axis.isSelected = 1;
      }
    },
    activateInstance: function(instance) {
      var axes = this.activeFont.variableOptions.axes;
      for (var tag in instance.coordinates) {
        if( instance.coordinates.hasOwnProperty(tag) ) {
          for (var i =0; i < axes.length; i++){
            if (axes[i]['tag'] == tag) {
              axes[i]['defaultValue'] = instance.coordinates[tag];
            }
          }
        } 
      }
      var instances = this.activeFont.variableOptions.instances;
      for (var i = 0; i < instances.length; i++) {
          instances[i].isActive = 0;
      }
      instance.isActive = 1;
    },
    changeFontSize: function(e){
      this.fontSize = e;
    },
    instanceStyles: function(instance) {
      var fontVariationSettings = [];
      for (var tag in instance.coordinates) {
        if( instance.coordinates.hasOwnProperty(tag) ) {
            fontVariationSettings.push("'" + tag + "' " + instance.coordinates[tag]);
        }
      }
      return {
        fontFamily: this.activeFont.cssCodeName,
        fontVariationSettings: fontVariationSettings.join()
      };
    },
  }
})
