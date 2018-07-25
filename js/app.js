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
    initDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.doDrag);
        document.body.addEventListener('mouseup',this.stopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.doDrag);
        document.body.addEventListener('touchend',this.stopDrag);
      }
      var targetLeft = e.clientX - this.$el.getBoundingClientRect().left - this.handleCenter.x;
      var targetTop = e.clientY - this.$el.getBoundingClientRect().top - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
    },
    doDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetLeft = e.clientX - this.$el.getBoundingClientRect().left - this.handleCenter.x;
      var targetTop = e.clientY - this.$el.getBoundingClientRect().top - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
    },
    stopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.stopDrag);
        document.body.removeEventListener('mousemove',this.doDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.stopDrag);
        document.body.removeEventListener('touchmove',this.doDrag);
      }
    },
  }
})
Vue.component('point-type-frame', {
  template: '#point-type-frame-template',
  props: {
    cobject: Object,
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
      },
      states: {
        isEditable: false
      }
    };
  },
  computed: {
    css() {
      var axes = this.cobject.properties.variableOptions.axes;
      var cssString = '';
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length-1) {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + ',';
        } else {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue;
        }
      }
      return {
        fontSize: this.cobject.properties.fontSize + 'px',
        fontFamily: this.cobject.properties.cssCodeName,
        fontVariationSettings: cssString
      };
    },
    slantnessControlStyles() {
      var defaultValue;
      var axes = this.cobject.properties.variableOptions.axes;
      var maxAngle, minAngle, maxValue, minValue, defaultValue, skew, left;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) {
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
      var axes = this.cobject.properties.variableOptions.axes;
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
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) return true;
      }
      return false;
    },
    isVFWidthSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          return true;
        }
      }
      return false;
    },
    isVFSlantSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) return true;
      }
      return false;
    },
    isVFXHeightSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) return true;
      }
      return false;
    }
  },
  methods: {
    selectTextFrame: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if(this.cobject.isSelected == false) {
        this.cobject.isSelected = true;
        this.emitValueChangeEvent();
      }
    },
    editTextFrame: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if(this.cobject.isSelected == false) {
        this.cobject.isSelected = true;
      }
      if(this.states.isEditable == false) {
        this.states.isEditable = true;
      }
      var el = this.$el;
      setTimeout(function() {
        el.querySelector('[contenteditable]').focus();
      }, 0);
    },
    deactivateStates: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if(this.states.isEditable == true) {
        this.states.isEditable = false;
      } else {
        this.cobject.isSelected = false;
      }
    },
    emitValueChangeEvent: function() {
      this.$emit('change', this.cobject);
    },
    //  Cancel canvas click when mouseup event fires on controls
    cancelCanvasClick: function(){
      document.body.addEventListener('click', this.captureClick, true);
    },
    captureClick: function(e) {
        e.stopPropagation();
        document.body.removeEventListener('click', this.captureClick, true); 
    },
    //  Event Handlers for moving text frame
    moveTextFrameInitDrag: function (event) {
      event.stopPropagation();
      if(!this.states.isEditable) {
        event.preventDefault();
        var e;
        if (event.type == 'mousedown') {
          e = event;
          document.body.addEventListener('mousemove',this.moveTextFrameDoDrag);
          document.body.addEventListener('mouseup',this.moveTextFrameStopDrag);
        } else if (event.type == 'touchstart') {
          e = event.touches[0];
          document.body.addEventListener('touchmove',this.moveTextFrameDoDrag);
          document.body.addEventListener('touchend',this.moveTextFrameStopDrag);
        }

        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startTop = parseFloat(document.defaultView.getComputedStyle(this.$el).top);
        this.startLeft = parseFloat(document.defaultView.getComputedStyle(this.$el).left);
      }
    },
    moveTextFrameDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }

      this.cobject.properties.left = this.startLeft + e.clientX - this.startX;
      this.cobject.properties.top = this.startTop + e.clientY - this.startY;

      this.emitValueChangeEvent();
    },
    moveTextFrameStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.moveTextFrameStopDrag);
        document.body.removeEventListener('mousemove',this.moveTextFrameDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.moveTextFrameStopDrag);
        document.body.removeEventListener('touchmove',this.moveTextFrameDoDrag);
      }
    },
    // Event Handlers for Font Size Control
    controlFontSizeInitDrag: function (event) {
      event.preventDefault();
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
      this.startFontSize = this.cobject.properties.fontSize;
    },
    controlFontSizeDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if(this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlFontSizeStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlFontSizeStopDrag);
        document.body.removeEventListener('mousemove',this.controlFontSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlFontSizeStopDrag);
        document.body.removeEventListener('touchmove',this.controlFontSizeDoDrag);
      }
      this.cancelCanvasClick();
    },
    // Event Handlers for Variable Optical Size Control
    controlVFOpticalSizeInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFOpticalSizeDoDrag);
        document.body.addEventListener('mouseup',this.controlVFOpticalSizeStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFOpticalSizeDoDrag);
        document.body.addEventListener('touchend',this.controlVFOpticalSizeStopDrag);
      }
      this.startY = e.clientY;
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) {
          this.opticalSizeAxis = axes[i];
        }
      }
    },
    controlVFOpticalSizeDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if(this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;

      if (this.cobject.properties.fontSize > this.opticalSizeAxis.maxValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.maxValue;
      } else if (this.cobject.properties.fontSize < this.opticalSizeAxis.minValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.minValue;
      } else {
        this.opticalSizeAxis.defaultValue = this.cobject.properties.fontSize;
      }

      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFOpticalSizeStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFOpticalSizeStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFOpticalSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFOpticalSizeStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFOpticalSizeDoDrag);
      }
      this.cancelCanvasClick();
    },
    
    //  Event Handlers for Variable Width Control
    controlVFWidthInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFWidthDoDrag);
        document.body.addEventListener('mouseup',this.controlVFWidthStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFWidthDoDrag);
        document.body.addEventListener('touchend',this.controlVFWidthStopDrag);
      }

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }

    },
    controlVFWidthDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetWidth = this.startWidth + e.clientX - this.startX;
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.width = targetWidth + "px";
      this.$el.style.height = targetHeight + "px";
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if(this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;
      
      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthStopDrag: function (event) {
      this.$el.style.width = "";
      this.$el.style.height = "";
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFWidthStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFWidthDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFWidthStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFWidthDoDrag);
      }
      this.cancelCanvasClick();
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
      cssString += "font-size: " + this.cobject.properties.fontSize + 'px; ';
      cssString += "font-family: " + this.cobject.properties.cssCodeName + '; ';
      return cssString;
    },
    fitVFWidth: function(el, nwidth){
      var el = el;
      var nwidth = nwidth;
      
      var axes = this.cobject.properties.variableOptions.axes;

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
    controlVFWidthXInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFWidthXDoDrag);
        document.body.addEventListener('mouseup',this.controlVFWidthXStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFWidthXDoDrag);
        document.body.addEventListener('touchend',this.controlVFWidthXStopDrag);
      }
      
      this.startX = e.clientX;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
    },
    controlVFWidthXDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetWidth = this.startWidth + e.clientX - this.startX;
      this.$el.style.width = targetWidth + "px";

      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthXStopDrag: function (event) {
      this.$el.style.width = "";
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFWidthXStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFWidthXDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFWidthXStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFWidthXDoDrag);
      }
      this.cancelCanvasClick();
    },
    
    //  Event Handlers for Variable Width Y axis Control
    controlVFWidthYInitDrag: function (e) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFWidthYDoDrag);
        document.body.addEventListener('mouseup',this.controlVFWidthYStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFWidthYDoDrag);
        document.body.addEventListener('touchend',this.controlVFWidthYStopDrag);
      }

      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      
      this.$el.style.width = this.startWidth + "px";

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
    },
    controlVFWidthYDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.height = targetHeight + "px";
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if(this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;
      
      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, this.startWidth);
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthYStopDrag: function (event) {
      this.$el.style.width = "";
      this.$el.style.height = "";
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFWidthYStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFWidthYDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFWidthYStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFWidthYDoDrag);
      }
      this.cancelCanvasClick();
    },
    
    //  Event Handlers for Variable Slant Control
    controlVFSlantInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFSlantDoDrag);
        document.body.addEventListener('mouseup',this.controlVFSlantStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFSlantDoDrag);
        document.body.addEventListener('touchend',this.controlVFSlantStopDrag);
      }

      this.handleSlantness = this.$el.querySelector(".vf-slantness-handle");
      this.lineSlantness = this.$el.querySelector(".vf-slantness-line");
      this.startX = e.clientX;
      this.startLeft = parseInt(document.defaultView.getComputedStyle(this.handleSlantness).left, 10);

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) {
          this.slantAxis = axes[i];
        }
      }

      var maxLeft = Math.tan(this.slantAxis.maxAngle * Math.PI/180) * 50;
      var minLeft = Math.tan(this.slantAxis.minAngle * Math.PI/180) * 50;
      this.maxHandleSlantnessLeft = maxLeft>minLeft?maxLeft:minLeft;
      this.minHandleSlantnessLeft = maxLeft>minLeft?minLeft:maxLeft; 
    },
    controlVFSlantDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }

      var targetLeft = this.startLeft + e.clientX - this.startX;
      
      if (targetLeft > this.maxHandleSlantnessLeft) {
        targetLeft = this.maxHandleSlantnessLeft;
      } else if (targetLeft < this.minHandleSlantnessLeft) {
        targetLeft = this.minHandleSlantnessLeft;
      }
      var targetAngle = Math.atan(targetLeft/50)/Math.PI * 180;
      this.slantAxis.defaultValue = roundValueByStep(targetAngle/this.slantAxis.maxAngle*this.slantAxis.maxValue, this.step);
      this.emitValueChangeEvent();
    },
    controlVFSlantStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFSlantStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFSlantDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFSlantStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFSlantDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Variable xHeight Control
    controlVFxHeightInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.controlVFxHeightDoDrag);
        document.body.addEventListener('mouseup',this.controlVFxHeightStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.controlVFxHeightDoDrag);
        document.body.addEventListener('touchend',this.controlVFxHeightStopDrag);
      }
      this.handleXHeight = this.$el.querySelector(".vf-xheight-line");
      this.startY = e.clientY;
      this.startTop = parseFloat(document.defaultView.getComputedStyle(this.handleXHeight).top);

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) {
          this.xHeightAxis = axes[i];
        }
      }
    },
    controlVFxHeightDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetTop = (e.clientY - this.startY + this.startTop) / this.cobject.properties.fontSize;

      if (targetTop > this.xHeightAxis.minPositionY) {
        targetTop = this.xHeightAxis.minPositionY;
      } else if (targetTop < this.xHeightAxis.maxPositionY) {
        targetTop = this.xHeightAxis.maxPositionY;
      }

      var targetXHeight = this.xHeightAxis.minValue + (targetTop - this.xHeightAxis.minPositionY) / (this.xHeightAxis.maxPositionY - this.xHeightAxis.minPositionY) * (this.xHeightAxis.maxValue - this.xHeightAxis.minValue);
      this.xHeightAxis.defaultValue = roundValueByStep(targetXHeight, this.step);
      this.emitValueChangeEvent();
    },
    controlVFxHeightStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.controlVFxHeightStopDrag);
        document.body.removeEventListener('mousemove',this.controlVFxHeightDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.controlVFxHeightStopDrag);
        document.body.removeEventListener('touchmove',this.controlVFxHeightDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers Templates
    initDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove',this.doDrag);
        document.body.addEventListener('mouseup',this.stopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove',this.doDrag);
        document.body.addEventListener('touchend',this.stopDrag);
      }
    },
    doDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
    },
    stopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup',this.stopDrag);
        document.body.removeEventListener('mousemove',this.doDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend',this.stopDrag);
        document.body.removeEventListener('touchmove',this.doDrag);
      }
      this.cancelCanvasClick();
    },
  }
})

var app = new Vue({
  el: '#font-playground-app',
  data: {
    search: '',
    fontFamilies: [
      {
        "fontFamilyName": "Adobe VF Prototype",
        "isActive": true,
        "fontFileName": "AdobeVFPrototype.woff2",
        "cssCodeName": "Adobe Prototype",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 389,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "CNTR",
              "name": "Contrast",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 100,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Black High Contrast",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "CNTR": 100
              }
            },
            {
              "name": "Black Medium Contrast",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "CNTR": 50
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "CNTR": 0
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "CNTR": 0
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "CNTR": 0
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "CNTR": 0
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "CNTR": 0
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "CNTR": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Frank Grießhammer",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/adobe-variable-font-prototype",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Amstelvar",
        "isActive": false,
        "fontFileName": "AmstelvarAlpha-VF.woff2",
        "cssCodeName": "Amstelvar",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 35,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 10,
              "defaultValue": 14,
              "maxValue": 72,
              "isSelected": 0
            },
            {
              "tag": "XOPQ",
              "name": "x opaque",
              "minValue": 5,
              "defaultValue": 88,
              "maxValue": 500,
              "isSelected": 0
            },
            {
              "tag": "XTRA",
              "name": "x transparent",
              "minValue": 42,
              "defaultValue": 402,
              "maxValue": 402,
              "isSelected": 0
            },
            {
              "tag": "YOPQ",
              "name": "y opaque",
              "minValue": 4,
              "defaultValue": 50,
              "maxValue": 85,
              "isSelected": 0
            },
            {
              "tag": "YTLC",
              "name": "lc y transparent",
              "minValue": 445,
              "defaultValue": 500,
              "maxValue": 600,
              "isSelected": 0
            },
            {
              "tag": "YTSE",
              "name": "Serif height",
              "minValue": 0,
              "defaultValue": 18,
              "maxValue": 48,
              "isSelected": 0
            },
            {
              "tag": "GRAD",
              "name": "Grade",
              "minValue": 25,
              "defaultValue": 88,
              "maxValue": 150,
              "isSelected": 0
            },
            {
              "tag": "XTCH",
              "name": "x transparent Chinese",
              "minValue": 800,
              "defaultValue": 1000,
              "maxValue": 1200,
              "isSelected": 0
            },
            {
              "tag": "YTCH",
              "name": "y transparent Chinese",
              "minValue": 800,
              "defaultValue": 1000,
              "maxValue": 1200,
              "isSelected": 0
            },
            {
              "tag": "YTAS",
              "name": "y transparent ascender",
              "minValue": 650,
              "defaultValue": 750,
              "maxValue": 850,
              "isSelected": 0
            },
            {
              "tag": "YTDE",
              "name": "y transparent descender",
              "minValue": 150,
              "defaultValue": 250,
              "maxValue": 350,
              "isSelected": 0
            },
            {
              "tag": "YTUC",
              "name": "y transparent uppercase",
              "minValue": 650,
              "defaultValue": 750,
              "maxValue": 950,
              "isSelected": 0
            },
            {
              "tag": "YTRA",
              "name": "y transparent",
              "minValue": 800,
              "defaultValue": 1000,
              "maxValue": 1200,
              "isSelected": 0
            },
            {
              "tag": "PWGT",
              "name": "Para Weight",
              "minValue": 38,
              "defaultValue": 88,
              "maxValue": 250,
              "isSelected": 0
            },
            {
              "tag": "PWDT",
              "name": "Para Width",
              "minValue": 60,
              "defaultValue": 402,
              "maxValue": 402,
              "isSelected": 0
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "David Berlow",
          "publisher": "Font Bureau",
          "urlText": "github.com",
          "url": "https://github.com/TypeNetwork/Amstelvar/releases",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Avenir Next",
        "isActive": false,
        "fontFileName": "AvenirNext_Variable.woff2",
        "cssCodeName": "Avenir Next",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 400,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 75,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 100
              }
            },
            {
              "name": "Heavy Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 75
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100
              }
            },
            {
              "name": "Bold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 75
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100
              }
            },
            {
              "name": "Medium Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 75
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100
              }
            },
            {
              "name": "Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 75
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Adrian Frutiger, Akira Kobayashi",
          "publisher": "Monotype",
          "urlText": "github.com",
          "url": "https://github.com/Monotype/Monotype_prototype_variable_fonts/tree/master/AvenirNext",
          "license": "Free for non-commercial use"
        }
      },
      {
        "fontFamilyName": "Bahnschrift",
        "isActive": false,
        "fontFileName": "Bahnschrift.woff2",
        "cssCodeName": "Bahnschrift",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 400,
              "maxValue": 700,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 75,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100
              }
            },
            {
              "name": "Bold SemiCondensed",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Bold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 75
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 100
              }
            },
            {
              "name": "SemiBold SemiCondensed",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "SemiBold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 75
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100
              }
            },
            {
              "name": "SemiCondensed",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 75
              }
            },
            {
              "name": "SemiLight",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "wdth": 100
              }
            },
            {
              "name": "SemiLight SemiCondensed",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "SemiLight Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "wdth": 75
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100
              }
            },
            {
              "name": "Light SemiCondensed",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Light Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 75
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Microsoft",
          "publisher": "Microsoft",
          "urlText": "microsoft.com",
          "url": "https://developer.microsoft.com/en-us/microsoft-edge/testdrive/demos/variable-fonts/",
          "license": "Bundled"
        }
      },
      {
        "fontFamilyName": "Barlow",
        "isActive": false,
        "fontFileName": "BarlowGX.woff2",
        "cssCodeName": "Barlow",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 22,
              "defaultValue": 22,
              "maxValue": 188,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 500,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 500
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 500
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 400
              }
            },
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 400
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 300
              }
            },
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 188,
                "wdth": 300
              }
            },
            {
              "name": "ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 500
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 500
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 400
              }
            },
            {
              "name": "ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 400
              }
            },
            {
              "name": "ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 300
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 166,
                "wdth": 300
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 500
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 500
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 400
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 400
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 300
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 141,
                "wdth": 300
              }
            },
            {
              "name": "SemiBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 500
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 500
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 400
              }
            },
            {
              "name": "SemiBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 400
              }
            },
            {
              "name": "SemiBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 300
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 116,
                "wdth": 300
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 500
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 500
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 400
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 400
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 300
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 96,
                "wdth": 300
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 500
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 500
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 400
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 400
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 300
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 71,
                "wdth": 300
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 500
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 500
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 400
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 300
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 53,
                "wdth": 300
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 500
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 500
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 400
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 400
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 300
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 39,
                "wdth": 300
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 500
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 500
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 400
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 400
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 300
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 30,
                "wdth": 300
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Jeremy Tribby",
          "publisher": "Tribby Type Co.",
          "urlText": "tribby.com",
          "url": "https://tribby.com/fonts/barlow/",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Buffalo Gals",
        "isActive": false,
        "fontFileName": "BuffaloGals_Var.woff2",
        "cssCodeName": "Buffalo Gals",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "CK  ",
              "name": "Cookies",
              "minValue": -1,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 1
            },
            {
              "tag": "FR  ",
              "name": "Fringe\n",
              "minValue": -1,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 2
            },
            {
              "tag": "HV  ",
              "name": "Hooves\n",
              "minValue": -1,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 0
            },
            {
              "tag": "CN  ",
              "name": "Concavity\n",
              "minValue": -1,
              "defaultValue": 0,
              "maxValue": 0,
              "isSelected": 0
            },
            {
              "tag": "BR  ",
              "name": "Bracketing\n",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 0
            },
            {
              "tag": "TC  ",
              "name": "Toggle Cookies\n",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Test1\n",
              "isActive": false,
              "coordinates": {
                "CK  ": 1,
                "FR  ": 1,
                "HV  ": 0,
                "CN  ": 0,
                "BR  ": 0,
                "TC  ": 1
              }
            },
            {
              "name": "Cookies-1\n",
              "isActive": false,
              "coordinates": {
                "CK  ": 0,
                "FR  ": 0,
                "HV  ": 0,
                "CN  ": 0,
                "BR  ": 0,
                "TC  ": 1
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Thomas Rickner",
          "publisher": "Rickner Type",
          "urlText": "github.com",
          "url": "https://github.com/TrueTyper/BuffaloGals",
          "license": "Free for non-commercial use"
        }
      },
      {
        "fontFamilyName": "Cheee",
        "isActive": false,
        "fontFileName": "Cheee_Variable.woff2",
        "cssCodeName": "Cheee",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "yest",
              "name": "Yeast",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "gvty",
              "name": "Gravity",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Hi Yeast Hi Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 1000,
                "gvty": 1000
              }
            },
            {
              "name": "Hi Yeast Med Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 1000,
                "gvty": 500
              }
            },
            {
              "name": "Hi Yeast Low Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 1000,
                "gvty": 0
              }
            },
            {
              "name": "Med Yeast Hi Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 500,
                "gvty": 1000
              }
            },
            {
              "name": "Med Yeast Med Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 500,
                "gvty": 500
              }
            },
            {
              "name": "Med Yeast Low Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 500,
                "gvty": 0
              }
            },
            {
              "name": "Low Yeast Hi Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 0,
                "gvty": 1000
              }
            },
            {
              "name": "Low Yeast Med Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 0,
                "gvty": 500
              }
            },
            {
              "name": "Low Yeast Low Gravity",
              "isActive": false,
              "coordinates": {
                "yest": 0,
                "gvty": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "James T. Edmondson",
          "publisher": "OH no Type Co.",
          "urlText": "futurefonts.xyz",
          "url": "https://www.futurefonts.xyz/ohno/cheee",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Compressa",
        "isActive": false,
        "fontFileName": "CompressaPRO-GX.woff2",
        "cssCodeName": "Compressa",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 100,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 10,
              "defaultValue": 10,
              "maxValue": 200,
              "isSelected": 2
            },
            {
              "tag": "ital",
              "name": "Italic",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 0,
              "minAngle": 0,
              "maxAngle": 10
            }
          ],
          "instances": [
            {
              "name": "ExtraExp Heavy It",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Heavy It",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Heavy It",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Heavy It",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Heavy It",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Black It",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Black",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Black It",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Black",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Black It",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Black",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Black It",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Black",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Black It",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Black",
              "isActive": false,
              "coordinates": {
                "wght": 850,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Bold",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Bold",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Bold",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Bold It",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Bold",
              "isActive": false,
              "coordinates": {
                "wght": 680,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Medium It",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Medium",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Medium It",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Medium",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Medium It",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Medium",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Medium It",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Medium",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Medium It",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Medium",
              "isActive": false,
              "coordinates": {
                "wght": 510,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Regular It",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Regular",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Regular It",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Regular",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Regular It",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Regular",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Regular It",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Regular",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Regular It",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Regular",
              "isActive": false,
              "coordinates": {
                "wght": 360,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Light It",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Light",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Light It",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Light",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Light It",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Light",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Light It",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Light",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Light It",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Light",
              "isActive": false,
              "coordinates": {
                "wght": 240,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp UltraLight It",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp UltraLight",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp UltraLight It",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp UltraLight",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral UltraLight It",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral UltraLight",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn UltraLight It",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn UltraLight",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn UltraLight It",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn UltraLight",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "wdth": 10,
                "ital": 0
              }
            },
            {
              "name": "ExtraExp Thin It",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 200,
                "ital": 1
              }
            },
            {
              "name": "ExtraExp Thin",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 200,
                "ital": 0
              }
            },
            {
              "name": "Exp Thin It",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 140,
                "ital": 1
              }
            },
            {
              "name": "Exp Thin",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 140,
                "ital": 0
              }
            },
            {
              "name": "Neutral Thin It",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Neutral Thin",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Cn Thin It",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 60,
                "ital": 1
              }
            },
            {
              "name": "Cn Thin",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 60,
                "ital": 0
              }
            },
            {
              "name": "ExtraCn Thin It",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 10,
                "ital": 1
              }
            },
            {
              "name": "ExtraCn Thin",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 10,
                "ital": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Ingo Preuss",
          "publisher": "Ingo Preuss",
          "urlText": "preusstype.com",
          "url": "https://compressa.preusstype.com/",
          "license": "Paid/commercial, Trial"
        }
      },
      {
        "fontFamilyName": "dT Jakob",
        "isActive": false,
        "fontFileName": "dTJakobVariableConceptGX.woff2",
        "cssCodeName": "dT Jakob",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 10,
              "defaultValue": 10,
              "maxValue": 40,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Weight 40",
              "isActive": false,
              "coordinates": {
                "wght": 40
              }
            },
            {
              "name": "Weight 30",
              "isActive": false,
              "coordinates": {
                "wght": 30
              }
            },
            {
              "name": "Weight 20",
              "isActive": false,
              "coordinates": {
                "wght": 20
              }
            },
            {
              "name": "Weight 10",
              "isActive": false,
              "coordinates": {
                "wght": 10
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Eduilson Coan, Gustavo Soares",
          "publisher": "dooType",
          "urlText": "dootype.com",
          "url": "http://home.dootype.com/dt-jakob-variable-concept",
          "license": "Free for personal and commercial use"
        }
      },
      {
        "fontFamilyName": "Decovar",
        "isActive": false,
        "fontFileName": "DecovarAlpha-VF.woff2",
        "cssCodeName": "Decovar",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "BLDA",
              "name": "Inline",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "TRMD",
              "name": "Shearded",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 2
            },
            {
              "tag": "TRMC",
              "name": "Rounded Slab",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "SKLD",
              "name": "Stripes",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRML",
              "name": "Worm Terminal",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "SKLA",
              "name": "Inline Skeleton",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRMF",
              "name": "Open Inline Terminal",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRMK",
              "name": "Inline Terminal",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "BLDB",
              "name": "Worm",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "WMX2",
              "name": "Weight",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRMB",
              "name": "Flared",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRMA",
              "name": "Rounded",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "SKLB",
              "name": "Worm Skeleton",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRMG",
              "name": "Slab",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "TRME",
              "name": "Bifurcated",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Open",
              "isActive": false,
              "coordinates": {
                "BLDA": 1000,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Sheared",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 1000,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Rounded Slab",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 1000,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Mayhem",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 750,
                "SKLD": 0,
                "TRML": 250,
                "SKLA": 1000,
                "TRMF": 250,
                "TRMK": 250,
                "BLDB": 1000,
                "WMX2": 750,
                "TRMB": 500,
                "TRMA": 500,
                "SKLB": 1000,
                "TRMG": 750,
                "TRME": 500
              }
            },
            {
              "name": "Striped",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 500,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Fancy",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 1000,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 1000,
                "TRMB": 1000,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Flared Open",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 1000,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 1000,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Checkered",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 1000,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Inline",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 500,
                "TRMF": 500,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Checkered Reverse",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 1000,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Worm",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 1000,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Contrast",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 1000,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Flared",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 1000,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Rounded",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 1000,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            },
            {
              "name": "Slab",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 1000,
                "TRME": 0
              }
            },
            {
              "name": "Bifurcated",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 1000
              }
            },
            {
              "name": "Default",
              "isActive": false,
              "coordinates": {
                "BLDA": 0,
                "TRMD": 0,
                "TRMC": 0,
                "SKLD": 0,
                "TRML": 0,
                "SKLA": 0,
                "TRMF": 0,
                "TRMK": 0,
                "BLDB": 0,
                "WMX2": 0,
                "TRMB": 0,
                "TRMA": 0,
                "SKLB": 0,
                "TRMG": 0,
                "TRME": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Berlow",
          "publisher": "Font Bureau",
          "urlText": "github.com",
          "url": "https://github.com/TypeNetwork/Decovar",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Dunbar",
        "isActive": false,
        "fontFileName": "Dunbar_Series-VF.woff2",
        "cssCodeName": "Dunbar",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 500,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "XHGT",
              "name": "xHeight",
              "minValue": 353,
              "defaultValue": 500,
              "maxValue": 574,
              "isSelected": 2,
              "minPositionY": 0.571,
              "maxPositionY": 0.35,
              "baselinePostionY": 0.924
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 10,
              "defaultValue": 36,
              "maxValue": 36,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Tall Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Tall Extra Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Text Extra Bold",
              "isActive": false,
              "coordinates": {
                "wght": 738.908262760357,
                "XHGT": 500,
                "opsz": 10
              }
            },
            {
              "name": "Tall Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "XHGT": 378,
                "opsz": 36
              }
            },
            {
              "name": "Text Bold",
              "isActive": false,
              "coordinates": {
                "wght": 651.5151598382544,
                "XHGT": 500,
                "opsz": 10
              }
            },
            {
              "name": "Tall Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Text Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "XHGT": 500,
                "opsz": 10
              }
            },
            {
              "name": "Low Medium",
              "isActive": false,
              "coordinates": {
                "wght": 492.5925993743801,
                "XHGT": 363,
                "opsz": 36
              }
            },
            {
              "name": "Tall Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "XHGT": 358,
                "opsz": 36
              }
            },
            {
              "name": "Text Regular",
              "isActive": false,
              "coordinates": {
                "wght": 369.2307774471656,
                "XHGT": 500,
                "opsz": 10
              }
            },
            {
              "name": "Tall Book",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Book",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "XHGT": 353,
                "opsz": 36
              }
            },
            {
              "name": "Tall Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "XHGT": 353,
                "opsz": 36
              }
            },
            {
              "name": "Tall Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "XHGT": 353,
                "opsz": 36
              }
            },
            {
              "name": "Tall Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "XHGT": 574,
                "opsz": 36
              }
            },
            {
              "name": "Low Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "XHGT": 353,
                "opsz": 36
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "CJ Dunn",
          "publisher": "CJ Type",
          "urlText": "cjtype.com",
          "url": "http://cjtype.com/dunbar/variablefonts/info.html",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Extraordinaire",
        "isActive": false,
        "fontFileName": "ExtraordinaireVariable-VF.woff2",
        "cssCodeName": "Extraordinaire",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 700,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            },
            {
              "name": "Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/notes/extraordinaire-font-of-the-month/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Extraordinaire Shade",
        "isActive": false,
        "fontFileName": "ExtraordinaireVariableShade-VF.woff2",
        "cssCodeName": "Extraordinaire Shade",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 400,
              "isSelected": 1
            },
            {
              "tag": "SHDW",
              "name": "Shade Distance",
              "minValue": 30,
              "defaultValue": 30,
              "maxValue": 60,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Regular 2",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "SHDW": 60
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "SHDW": 30
              }
            },
            {
              "name": "Light 2",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "SHDW": 60
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "SHDW": 30
              }
            },
            {
              "name": "Thin 2",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "SHDW": 60
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "SHDW": 30
              }
            },
            {
              "name": "Hairline 2",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "SHDW": 60
              }
            },
            {
              "name": "Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "SHDW": 30
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/notes/extraordinaire-font-of-the-month/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Fit",
        "isActive": false,
        "fontFileName": "Fit-Variable.woff2",
        "cssCodeName": "Fit",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 0,
              "defaultValue": 110,
              "maxValue": 1000,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Ultra Extended",
              "isActive": false,
              "coordinates": {
                "wdth": 1000
              }
            },
            {
              "name": "Extra Extended",
              "isActive": false,
              "coordinates": {
                "wdth": 825
              }
            },
            {
              "name": "Extended",
              "isActive": false,
              "coordinates": {
                "wdth": 580
              }
            },
            {
              "name": "Extra Wide",
              "isActive": false,
              "coordinates": {
                "wdth": 335
              }
            },
            {
              "name": "Wide",
              "isActive": false,
              "coordinates": {
                "wdth": 191
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wdth": 110
              }
            },
            {
              "name": "Condensed",
              "isActive": false,
              "coordinates": {
                "wdth": 56
              }
            },
            {
              "name": "Extra Condensed",
              "isActive": false,
              "coordinates": {
                "wdth": 27
              }
            },
            {
              "name": "Compressed",
              "isActive": false,
              "coordinates": {
                "wdth": 10
              }
            },
            {
              "name": "Skyline",
              "isActive": false,
              "coordinates": {
                "wdth": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross, Oded Ezer",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/fit/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Gimlet Beta",
        "isActive": false,
        "fontFileName": "Gimlet_Romans-VF.woff2",
        "cssCodeName": "Gimlet Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 800,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 64,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 8,
              "defaultValue": 48,
              "maxValue": 48,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Display Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Display Narrow Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Condensed Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Narrow Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Display Condensed Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Black",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Display Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Condensed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Narrow Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Narrow Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 8
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/gimlet/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Gimlet Italic Beta",
        "isActive": false,
        "fontFileName": "Gimlet_Italics-VF.woff2",
        "cssCodeName": "Gimlet Italic Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 800,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 64,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 8,
              "defaultValue": 48,
              "maxValue": 48,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Display Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Display Narrow Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Condensed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Narrow Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Display Condensed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Display Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Condensed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Narrow Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Narrow Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Condensed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Narrow Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 64,
                "opsz": 8
              }
            },
            {
              "name": "Display Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 48
              }
            },
            {
              "name": "Text Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 12
              }
            },
            {
              "name": "Micro Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "opsz": 8
              }
            },
            {
              "name": "Display Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 48
              }
            },
            {
              "name": "Text Narrow Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Text Condensed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 12
              }
            },
            {
              "name": "Micro Narrow Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Micro Condensed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 88,
                "opsz": 8
              }
            },
            {
              "name": "Display Condensed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 76,
                "opsz": 48
              }
            },
            {
              "name": "Display Compressed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 48
              }
            },
            {
              "name": "Text Compressed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 12
              }
            },
            {
              "name": "Micro Compressed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 64,
                "opsz": 8
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/gimlet/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Gingham",
        "isActive": false,
        "fontFileName": "Gingham.woff2",
        "cssCodeName": "Gingham",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 700,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 1,
              "defaultValue": 1,
              "maxValue": 150,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Wide Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 150
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100
              }
            },
            {
              "name": "Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 1
              }
            },
            {
              "name": "Wide Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 150
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100
              }
            },
            {
              "name": "Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 1
              }
            },
            {
              "name": "Wide Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 150
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100
              }
            },
            {
              "name": "Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 1
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Christoph Koeberlin",
          "publisher": "Christoph Koeberlin",
          "urlText": "koe.berlin",
          "url": "http://koe.berlin/variablefont/",
          "license": "Free for non-commercial use"
        }
      },
      {
        "fontFamilyName": "Gnomon*",
        "isActive": false,
        "fontFileName": "Gnomon-Web.woff2",
        "cssCodeName": "Gnomon",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "TOTD",
              "name": "Time of Day",
              "minValue": 0,
              "defaultValue": 750,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "DIST",
              "name": "Shadow Distance",
              "minValue": 0,
              "defaultValue": 333.33000686655987,
              "maxValue": 1000,
              "isSelected": 2
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "Owen Earl",
          "publisher": "indestructible type*",
          "urlText": "indestructibletype.com",
          "url": "http://indestructibletype.com/Gnomon.html",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Input Mono Beta",
        "isActive": false,
        "fontFileName": "Input_Mono-VF.woff2",
        "cssCodeName": "Input Mono Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 0,
              "defaultValue": 400,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 100,
              "defaultValue": 500,
              "maxValue": 500,
              "isSelected": 2
            },
            {
              "tag": "slnt",
              "name": "Slant",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 8,
              "isSelected": 0,
              "minAngle": 0,
              "maxAngle": 8
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Black",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Black",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Black",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Bold",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 820,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Light",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Light",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 320,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Extra Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Extra Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Extra Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Extra Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 0,
                "wdth": 33
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 13,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 13,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 13,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 13,
                "wdth": 33
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 0,
                "wdth": 500
              }
            },
            {
              "name": "Compressed Thin",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 0,
                "wdth": 100
              }
            },
            {
              "name": "Narrow Thin",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 0,
                "wdth": 66
              }
            },
            {
              "name": "Condensed Thin",
              "isActive": false,
              "coordinates": {
                "wght": 0,
                "slnt": 0,
                "wdth": 33
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR, Font Bureau",
          "urlText": "djr.com",
          "url": "https://djr.com/input/",
          "license": "Free for private use in code editors, Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Jabin",
        "isActive": false,
        "fontFileName": "Jabin-VF.woff2",
        "cssCodeName": "Jabin",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 40,
              "defaultValue": 40,
              "maxValue": 120,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "XXXX",
              "name": "Custom",
              "minValue": 1,
              "defaultValue": 1,
              "maxValue": 100,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Bold Swash 2",
              "isActive": false,
              "coordinates": {
                "wght": 120,
                "wdth": 0,
                "XXXX": 100
              }
            },
            {
              "name": "Bold Swash",
              "isActive": false,
              "coordinates": {
                "wght": 120,
                "wdth": 0,
                "XXXX": 50
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 120,
                "wdth": 0,
                "XXXX": 1
              }
            },
            {
              "name": "Medium Swash 2",
              "isActive": false,
              "coordinates": {
                "wght": 90,
                "wdth": 100,
                "XXXX": 100
              }
            },
            {
              "name": "Medium Swash",
              "isActive": false,
              "coordinates": {
                "wght": 90,
                "wdth": 100,
                "XXXX": 50
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 90,
                "wdth": 100,
                "XXXX": 1
              }
            },
            {
              "name": "Regular Swash 2",
              "isActive": false,
              "coordinates": {
                "wght": 60,
                "wdth": 100,
                "XXXX": 100
              }
            },
            {
              "name": "Regular Swash",
              "isActive": false,
              "coordinates": {
                "wght": 60,
                "wdth": 100,
                "XXXX": 50
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 60,
                "wdth": 100,
                "XXXX": 1
              }
            },
            {
              "name": "Light Swash 2",
              "isActive": false,
              "coordinates": {
                "wght": 40,
                "wdth": 0,
                "XXXX": 100
              }
            },
            {
              "name": "Light Swash",
              "isActive": false,
              "coordinates": {
                "wght": 40,
                "wdth": 0,
                "XXXX": 50
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 40,
                "wdth": 0,
                "XXXX": 1
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Frida Medrano",
          "publisher": "Frida Medrano",
          "urlText": "fridamedrano.com",
          "url": "http://www.fridamedrano.com/jabin.html",
          "license": "Free for non-commercial use, Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Kairos Sans",
        "isActive": false,
        "fontFileName": "KairosSans_Variable.woff2",
        "cssCodeName": "Kairos Sans",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 250,
              "defaultValue": 500,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 75,
              "defaultValue": 75,
              "maxValue": 125,
              "isSelected": 2
            },
            {
              "tag": "ital",
              "name": "Italic",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 0,
              "minAngle": 0,
              "maxAngle": 10
            }
          ],
          "instances": [
            {
              "name": "Extended Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended Regular Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Regular",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Regular Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Regular Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Regular",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Light",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Light",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 75,
                "ital": 0
              }
            },
            {
              "name": "Extended Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 125,
                "ital": 1
              }
            },
            {
              "name": "Extended Thin",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 125,
                "ital": 0
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 100,
                "ital": 1
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 100,
                "ital": 0
              }
            },
            {
              "name": "Condensed Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 75,
                "ital": 1
              }
            },
            {
              "name": "Condensed Thin",
              "isActive": false,
              "coordinates": {
                "wght": 250,
                "wdth": 75,
                "ital": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Terrance Weinzierl",
          "publisher": "Monotype",
          "urlText": "github.com",
          "url": "https://github.com/Monotype/Monotype_prototype_variable_fonts/tree/master/KairosSans",
          "license": "Free for non-commercial use"
        }
      },
      {
        "fontFamilyName": "Lab",
        "isActive": false,
        "fontFileName": "LabDJR-VF.woff2",
        "cssCodeName": "Lab",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "BEVL",
              "name": "Bevel",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "OVAL",
              "name": "Oval",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 2
            },
            {
              "tag": "QUAD",
              "name": "Quad",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            },
            {
              "tag": "SIZE",
              "name": "Size",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Fancy",
              "isActive": false,
              "coordinates": {
                "BEVL": 1000,
                "OVAL": 1000,
                "QUAD": 1000,
                "SIZE": 200
              }
            },
            {
              "name": "Ghost",
              "isActive": false,
              "coordinates": {
                "BEVL": 1000,
                "OVAL": 0,
                "QUAD": 1000,
                "SIZE": 1000
              }
            },
            {
              "name": "Pixel",
              "isActive": false,
              "coordinates": {
                "BEVL": 200,
                "OVAL": 0,
                "QUAD": 0,
                "SIZE": 200
              }
            },
            {
              "name": "Dot",
              "isActive": false,
              "coordinates": {
                "BEVL": 0,
                "OVAL": 1000,
                "QUAD": 1000,
                "SIZE": 500
              }
            },
            {
              "name": "Floret",
              "isActive": false,
              "coordinates": {
                "BEVL": 0,
                "OVAL": 1000,
                "QUAD": 500,
                "SIZE": 250
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "BEVL": 0,
                "OVAL": 0,
                "QUAD": 0,
                "SIZE": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/lab-variable/",
          "license": "By request"
        }
      },
      {
        "fontFamilyName": "League Mono",
        "isActive": false,
        "fontFileName": "LeagueMonoVariable.woff2",
        "cssCodeName": "League Mono",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 100,
              "maxValue": 800,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 50,
              "defaultValue": 100,
              "maxValue": 200,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "ExtraBold Extended",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 200
              }
            },
            {
              "name": "ExtraBold Wide",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 150
              }
            },
            {
              "name": "ExtraBold Normal",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 115
              }
            },
            {
              "name": "ExtraBold Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 80
              }
            },
            {
              "name": "ExtraBold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 50
              }
            },
            {
              "name": "Bold Extended",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 200
              }
            },
            {
              "name": "Bold Wide",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 150
              }
            },
            {
              "name": "Bold Normal",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 115
              }
            },
            {
              "name": "Bold Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 80
              }
            },
            {
              "name": "Bold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 50
              }
            },
            {
              "name": "SemiBold Extended",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 200
              }
            },
            {
              "name": "SemiBold Wide",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 150
              }
            },
            {
              "name": "SemiBold Normal",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 115
              }
            },
            {
              "name": "SemiBold Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 80
              }
            },
            {
              "name": "SemiBold Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "wdth": 50
              }
            },
            {
              "name": "Medium Extended",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 200
              }
            },
            {
              "name": "Medium Wide",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 150
              }
            },
            {
              "name": "Medium Normal",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 115
              }
            },
            {
              "name": "Medium Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 80
              }
            },
            {
              "name": "Medium Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 50
              }
            },
            {
              "name": "Regular Extended",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 200
              }
            },
            {
              "name": "Regular Wide",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 150
              }
            },
            {
              "name": "Regular Normal",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 115
              }
            },
            {
              "name": "Regular Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 80
              }
            },
            {
              "name": "Regular Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 50
              }
            },
            {
              "name": "Light Extended",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 200
              }
            },
            {
              "name": "Light Wide",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 150
              }
            },
            {
              "name": "Light Normal",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 115
              }
            },
            {
              "name": "Light Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 80
              }
            },
            {
              "name": "Light Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 50
              }
            },
            {
              "name": "UltraLight Extended",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "wdth": 200
              }
            },
            {
              "name": "UltraLight Wide",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "wdth": 150
              }
            },
            {
              "name": "UltraLight Normal",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "wdth": 115
              }
            },
            {
              "name": "UltraLight Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "wdth": 80
              }
            },
            {
              "name": "UltraLight Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "wdth": 50
              }
            },
            {
              "name": "Thin Extended",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 200
              }
            },
            {
              "name": "Thin Wide",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 150
              }
            },
            {
              "name": "Thin Normal",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 115
              }
            },
            {
              "name": "Thin Narrow",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 80
              }
            },
            {
              "name": "Thin Condensed",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "wdth": 50
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Tyler Finck",
          "publisher": "The League of Moveable Type, Tyler Finck",
          "urlText": "tylerfinck.com",
          "url": "http://tylerfinck.com/leaguemonovariable/",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Libre Franklin",
        "isActive": false,
        "fontFileName": "LibreFranklinGX-Romans.woff2",
        "cssCodeName": "Libre Franklin",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 40,
              "defaultValue": 40,
              "maxValue": 200,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 178
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 154
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 130
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 106
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 84
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 66
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 50
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 40
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Pablo Impallari, Rodrigo Fuenzalida, Nhung Nguyen",
          "publisher": "Impallari Type",
          "urlText": "github.com",
          "url": "https://github.com/impallari/Libre-Franklin",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Libre Franklin Italic",
        "isActive": false,
        "fontFileName": "LibreFranklinGX-Italics.woff2",
        "cssCodeName": "Libre Franklin Italic",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 40,
              "defaultValue": 40,
              "maxValue": 200,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            },
            {
              "name": "ExtraBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 178
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 154
              }
            },
            {
              "name": "SemiBold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 130
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 106
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 84
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 66
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 50
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 40
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Pablo Impallari, Rodrigo Fuenzalida, Nhung Nguyen",
          "publisher": "Impallari Type",
          "urlText": "github.com",
          "url": "https://github.com/impallari/Libre-Franklin",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Louvette Beta",
        "isActive": false,
        "fontFileName": "LouvetteBETA-VF.woff2",
        "cssCodeName": "Louvette Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "yopq",
              "name": "Hairline",
              "minValue": 14,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "ytde",
              "name": "Descender",
              "minValue": 14,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Headline-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 14,
                "ytde": 14
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "CJ Dunn",
          "publisher": "CJ Type",
          "urlText": "CJType.com",
          "url": "http://CJType.com",
          "license": "Not released yet."
        }
      },
      {
        "fontFamilyName": "Louvette Italic Beta",
        "isActive": false,
        "fontFileName": "LouvetteBETA_Italic-VF.woff2",
        "cssCodeName": "Louvette Italic Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 300,
              "maxValue": 1000,
              "isSelected": 1
            },
            {
              "tag": "yopq",
              "name": "Hairline",
              "minValue": 14,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 2
            },
            {
              "tag": "ytde",
              "name": "Descender",
              "minValue": 14,
              "defaultValue": 100,
              "maxValue": 100,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Headline-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Ultra",
              "isActive": false,
              "coordinates": {
                "wght": 1000,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Semi Bold",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "yopq": 14,
                "ytde": 14
              }
            },
            {
              "name": "Headline-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 100,
                "ytde": 100
              }
            },
            {
              "name": "Display-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 72,
                "ytde": 72
              }
            },
            {
              "name": "Deck-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 36,
                "ytde": 36
              }
            },
            {
              "name": "Text-Regular",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "yopq": 14,
                "ytde": 14
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "CJ Dunn",
          "publisher": "CJ Type",
          "urlText": "CJType.com",
          "url": "http://CJType.com",
          "license": "Not released yet."
        }
      },
      {
        "fontFamilyName": "Markazi Text",
        "isActive": false,
        "fontFileName": "MarkaziText-VF.woff2",
        "cssCodeName": "Markazi Text",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 400,
              "defaultValue": 400,
              "maxValue": 700,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 608.3333333333334
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 491.6666819256886
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Borna Izadpanah (Arabic designer), Fiona Ross (Arabic design director) and Florian Runge (Latin designer)",
          "publisher": "Borna Izadpanah, Florian Runge, Google",
          "urlText": "github.com",
          "url": "https://github.com/BornaIz/markazitext",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Merit Badge",
        "isActive": false,
        "fontFileName": "MeritBadge-VF.woff2",
        "cssCodeName": "Merit Badge",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "SANS",
              "name": "Sans serif forms",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 1
            },
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 400,
              "maxValue": 500,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Sans Bold",
              "isActive": false,
              "coordinates": {
                "SANS": 1,
                "wght": 500
              }
            },
            {
              "name": "Sans Regular",
              "isActive": false,
              "coordinates": {
                "SANS": 1,
                "wght": 400
              }
            },
            {
              "name": "Sans Light",
              "isActive": false,
              "coordinates": {
                "SANS": 1,
                "wght": 300
              }
            },
            {
              "name": "Sans Thin",
              "isActive": false,
              "coordinates": {
                "SANS": 1,
                "wght": 200
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "SANS": 0,
                "wght": 500
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "SANS": 0,
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "SANS": 0,
                "wght": 300
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "SANS": 0,
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/merit-badge/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "FF Meta",
        "isActive": false,
        "fontFileName": "MetaVariableDemo-Set.woff2",
        "cssCodeName": "Meta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "ital",
              "name": "Italic",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 2,
              "minAngle": 0,
              "maxAngle": 10
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "ital": 1
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "ital": 0
              }
            },
            {
              "name": "Extra Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "ital": 1
              }
            },
            {
              "name": "Extra Bold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "ital": 0
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "ital": 1
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "ital": 0
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "ital": 1
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 600,
                "ital": 0
              }
            },
            {
              "name": "Book Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "ital": 1
              }
            },
            {
              "name": "Book",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "ital": 0
              }
            },
            {
              "name": "Regular Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "ital": 1
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "ital": 0
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "ital": 1
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 350,
                "ital": 0
              }
            },
            {
              "name": "Thin Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "ital": 1
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "ital": 0
              }
            },
            {
              "name": "Hairline Italic",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "ital": 1
              }
            },
            {
              "name": "Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "ital": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Erik Spiekermann",
          "publisher": "Monotype",
          "urlText": "monotype.com",
          "url": "https://www.monotype.com/fonts/variable-fonts/",
          "license": "Free for personal and commercial use"
        }
      },
      {
        "fontFamilyName": "Nunito Beta",
        "isActive": false,
        "fontFileName": "NunitoVFBeta.woff2",
        "cssCodeName": "Nunito Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 54,
              "defaultValue": 54,
              "maxValue": 156,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 156
              }
            },
            {
              "name": "ExtraBold",
              "isActive": false,
              "coordinates": {
                "wght": 151
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 125
              }
            },
            {
              "name": "SemiBold",
              "isActive": false,
              "coordinates": {
                "wght": 101
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 81
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 61
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 54
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Vernon Adams",
          "publisher": "Google",
          "urlText": "fonts.google.com",
          "url": "https://fonts.google.com/earlyaccess#Nunito+VF+Beta",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Output Sans Beta",
        "isActive": false,
        "fontFileName": "Output_Sans-VF.woff2",
        "cssCodeName": "Output Sans Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "slnt",
              "name": "Slant",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 8,
              "isSelected": 2,
              "minAngle": 0,
              "maxAngle": 8
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "slnt": 8
              }
            },
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900,
                "slnt": 0
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "slnt": 8
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "slnt": 0
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "slnt": 8
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "slnt": 0
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 8
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "slnt": 0
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "slnt": 8
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "slnt": 0
              }
            },
            {
              "name": "Extra Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 8
              }
            },
            {
              "name": "Extra Light",
              "isActive": false,
              "coordinates": {
                "wght": 200,
                "slnt": 0
              }
            },
            {
              "name": "Thin_Italic",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "slnt": 8
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 150,
                "slnt": 0
              }
            },
            {
              "name": "Hairline Italic",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "slnt": 8
              }
            },
            {
              "name": "Hairline",
              "isActive": false,
              "coordinates": {
                "wght": 100,
                "slnt": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/output/",
          "license": "By request"
        }
      },
      {
        "fontFamilyName": "Output Sans Hairlines",
        "isActive": false,
        "fontFileName": "Output_Sans_Hairlines-VF.woff2",
        "cssCodeName": "Output Sans Hairlines",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 34,
              "defaultValue": 72,
              "maxValue": 166,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Banner",
              "isActive": false,
              "coordinates": {
                "opsz": 166
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "opsz": 72
              }
            },
            {
              "name": "Deck",
              "isActive": false,
              "coordinates": {
                "opsz": 34
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/output/",
          "license": "By request"
        }
      },
      {
        "fontFamilyName": "Pappardelle",
        "isActive": false,
        "fontFileName": "Pappardelle-VF.woff2",
        "cssCodeName": "Pappardelle",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "XOPQ",
              "name": "X Opaque",
              "minValue": -500,
              "defaultValue": 0,
              "maxValue": 0,
              "isSelected": 1
            },
            {
              "tag": "CTST",
              "name": "Contrast",
              "minValue": -500,
              "defaultValue": 0,
              "maxValue": 0,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "XOPQ": 0,
                "CTST": 0
              }
            },
            {
              "name": "Fine",
              "isActive": false,
              "coordinates": {
                "XOPQ": -250,
                "CTST": 0
              }
            },
            {
              "name": "Extra Fine",
              "isActive": false,
              "coordinates": {
                "XOPQ": -500,
                "CTST": 0
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/notes/pappardelle-font-of-the-month/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Renner*",
        "isActive": false,
        "fontFileName": "renner-VF.woff2",
        "cssCodeName": "Renner",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 100,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            },
            {
              "tag": "ital",
              "name": "Italic",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1,
              "isSelected": 2,
              "minAngle": 0,
              "maxAngle": 10
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "Owen Earl",
          "publisher": "indestructible type*",
          "urlText": "indestructibletype.com",
          "url": "http://indestructibletype.com/Renner.html",
          "license": "Open source, Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Rhody",
        "isActive": false,
        "fontFileName": "RhodyVariable-VF.woff2",
        "cssCodeName": "Rhody",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "DESC",
              "name": "Descenders",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 300,
              "isSelected": 1
            },
            {
              "tag": "ASCN",
              "name": "Ascenders",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 300,
              "isSelected": 2
            },
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 400,
              "maxValue": 800,
              "isSelected": 0
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "DESC": 0,
                "ASCN": 0,
                "wght": 800
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "DESC": 0,
                "ASCN": 0,
                "wght": 700
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "DESC": 0,
                "ASCN": 0,
                "wght": 500
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "DESC": 0,
                "ASCN": 0,
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "DESC": 0,
                "ASCN": 0,
                "wght": 300
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/notes/rhody-font-of-the-month/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "Roslindale Beta",
        "isActive": false,
        "fontFileName": "RoslindaleVariableBeta-VF.woff2",
        "cssCodeName": "Roslindale Beta",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 400,
              "maxValue": 700,
              "isSelected": 1
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 12,
              "defaultValue": 12,
              "maxValue": 48,
              "isSelected": 2
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "David Jonathan Ross",
          "publisher": "DJR",
          "urlText": "djr.com",
          "url": "https://djr.com/notes/roslindale-font-of-the-month/",
          "license": "Paid/commercial"
        }
      },
      {
        "fontFamilyName": "San Francisco Display",
        "isActive": false,
        "fontFileName": "SFNSDisplay.woff2",
        "cssCodeName": "San Francisco Display",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 1,
              "defaultValue": 400,
              "maxValue": 1000,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 1000
              }
            },
            {
              "name": "Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 858.8482795452811
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700.3024338139925
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 590.9791409170672
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 508.10467689021135
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 276.2988326848249
              }
            },
            {
              "name": "Thin",
              "isActive": false,
              "coordinates": {
                "wght": 112.7196154726482
              }
            },
            {
              "name": "Ultralight",
              "isActive": false,
              "coordinates": {
                "wght": 28.92083619439994
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Apple",
          "publisher": "Apple",
          "urlText": "developer.apple.com",
          "url": "https://developer.apple.com/fonts/",
          "license": "Bundled"
        }
      },
      {
        "fontFamilyName": "San Francisco Text",
        "isActive": false,
        "fontFileName": "SFNSText.woff2",
        "cssCodeName": "San Francisco Text",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 1,
              "defaultValue": 400,
              "maxValue": 1000,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Heavy",
              "isActive": false,
              "coordinates": {
                "wght": 858.8482795452811
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700.3024338139925
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 590.9791409170672
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 508.10467689021135
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 276.2988326848249
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Apple",
          "publisher": "Apple",
          "urlText": "developer.apple.com",
          "url": "https://developer.apple.com/fonts/",
          "license": "Bundled"
        }
      },
      {
        "fontFamilyName": "San Francisco Text Italic",
        "isActive": false,
        "fontFileName": "SFNSTextItalic.woff2",
        "cssCodeName": "San Francisco Text Italic",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 1,
              "defaultValue": 400,
              "maxValue": 1000,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Heavy Italic",
              "isActive": false,
              "coordinates": {
                "wght": 858.8482795452811
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700.3024338139925
              }
            },
            {
              "name": "Semibold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 590.9791409170672
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 508.10467689021135
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 276.2988326848249
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Apple",
          "publisher": "Apple",
          "urlText": "developer.apple.com",
          "url": "https://developer.apple.com/fonts/",
          "license": "Bundled"
        }
      },
      {
        "fontFamilyName": "Selawik",
        "isActive": false,
        "fontFileName": "Selawik-variable.woff2",
        "cssCodeName": "Selawik",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 400,
              "maxValue": 700,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Semilight",
              "isActive": false,
              "coordinates": {
                "wght": 350
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Aaron Bell",
          "publisher": "Microsoft",
          "urlText": "github.com",
          "url": "https://github.com/unicode-org/text-rendering-tests/blob/master/fonts/Selawik-README.md",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Slovic",
        "isActive": false,
        "fontFileName": "Slovic_Demo_VarGX.woff2",
        "cssCodeName": "Slovic",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "STLE",
              "name": "Style",
              "minValue": 10,
              "defaultValue": 10,
              "maxValue": 100,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Sans Serif",
              "isActive": false,
              "coordinates": {
                "STLE": 100
              }
            },
            {
              "name": "Semi Serif",
              "isActive": false,
              "coordinates": {
                "STLE": 76
              }
            },
            {
              "name": "Slab Serif",
              "isActive": false,
              "coordinates": {
                "STLE": 60
              }
            },
            {
              "name": "Serif",
              "isActive": false,
              "coordinates": {
                "STLE": 32
              }
            },
            {
              "name": "Historic",
              "isActive": false,
              "coordinates": {
                "STLE": 10
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Plamen Motev",
          "publisher": "Fontfabric",
          "urlText": "fontfabric.com",
          "url": "https://www.fontfabric.com/slovic/",
          "license": "Free for personal and commercial use"
        }
      },
      {
        "fontFamilyName": "Source Code",
        "isActive": false,
        "fontFileName": "SourceCodeVariable-Roman.woff2",
        "cssCodeName": "Source Code Variable",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Paul D. Hunt, Teo Tuominen",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/source-code-pro/releases/tag/variable-fonts",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Source Code Italic",
        "isActive": false,
        "fontFileName": "SourceCodeVariable-Italic.woff2",
        "cssCodeName": "Source Code Italic Variable",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 400,
              "maxValue": 900,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Medium Italic",
              "isActive": false,
              "coordinates": {
                "wght": 500
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Paul D. Hunt, Teo Tuominen",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/source-code-pro/releases/tag/variable-fonts",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Source Sans",
        "isActive": false,
        "fontFileName": "SourceSansVariable-Roman.woff2",
        "cssCodeName": "Source Sans Variable",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 200,
              "maxValue": 900,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Paul D. Hunt",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/source-sans-pro/releases/tag/variable-fonts",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Source Sans Italic",
        "isActive": false,
        "fontFileName": "SourceSansVariable-Italic.woff2",
        "cssCodeName": "Source Sans Italic Variable",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 200,
              "maxValue": 900,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black Italic",
              "isActive": false,
              "coordinates": {
                "wght": 900
              }
            },
            {
              "name": "Bold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold Italic",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Italic",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light Italic",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "ExtraLight Italic",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Paul D. Hunt",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/source-sans-pro/releases/tag/variable-fonts",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Source Serif",
        "isActive": false,
        "fontFileName": "SourceSerifVariable-Roman.woff2",
        "cssCodeName": "Source Serif Variable",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 200,
              "defaultValue": 389.34425879301136,
              "maxValue": 900,
              "isSelected": 1
            }
          ],
          "instances": [
            {
              "name": "Black",
              "isActive": false,
              "coordinates": {
                "wght": 900
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700
              }
            },
            {
              "name": "Semibold",
              "isActive": false,
              "coordinates": {
                "wght": 600
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300
              }
            },
            {
              "name": "ExtraLight",
              "isActive": false,
              "coordinates": {
                "wght": 200
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Frank Grießhammer",
          "publisher": "Adobe",
          "urlText": "github.com",
          "url": "https://github.com/adobe-fonts/source-serif-pro/releases/tag/variable-fonts",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Venn",
        "isActive": false,
        "fontFileName": "VennVF.woff2",
        "cssCodeName": "Venn",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 300,
              "defaultValue": 500,
              "maxValue": 800,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 75,
              "defaultValue": 100,
              "maxValue": 125,
              "isSelected": 2
            }
          ],
          "instances": [
            {
              "name": "Ex XBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 125
              }
            },
            {
              "name": "SemiEx XBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 112.50000762951095
              }
            },
            {
              "name": "XBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 100
              }
            },
            {
              "name": "SemiCd XBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Cd XBold",
              "isActive": false,
              "coordinates": {
                "wght": 800,
                "wdth": 75
              }
            },
            {
              "name": "Ex Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 125
              }
            },
            {
              "name": "SemiEx Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 112.50000762951095
              }
            },
            {
              "name": "Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 100
              }
            },
            {
              "name": "SemiCd Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Cd Bold",
              "isActive": false,
              "coordinates": {
                "wght": 700,
                "wdth": 75
              }
            },
            {
              "name": "Ex Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 125
              }
            },
            {
              "name": "SemiEx Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 112.50000762951095
              }
            },
            {
              "name": "Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 100
              }
            },
            {
              "name": "SemiCd Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Cd Medium",
              "isActive": false,
              "coordinates": {
                "wght": 500,
                "wdth": 75
              }
            },
            {
              "name": "Ex Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 125
              }
            },
            {
              "name": "SemiEx Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 112.50000762951095
              }
            },
            {
              "name": "Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 100
              }
            },
            {
              "name": "SemiCd Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Cd Regular",
              "isActive": false,
              "coordinates": {
                "wght": 400,
                "wdth": 75
              }
            },
            {
              "name": "Ex Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 125
              }
            },
            {
              "name": "SemiEx Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 112.50000762951095
              }
            },
            {
              "name": "Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 100
              }
            },
            {
              "name": "SemiCd Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 87.50000762951095
              }
            },
            {
              "name": "Cd Light",
              "isActive": false,
              "coordinates": {
                "wght": 300,
                "wdth": 75
              }
            }
          ]
        },
        "fontInfo": {
          "designer": "Dalton Maag",
          "publisher": "Dalton Maag",
          "urlText": "daltonmaag.com",
          "url": "https://daltonmaag.com/library/venn",
          "license": "Free for personal and commercial use"
        }
      },
      {
        "fontFamilyName": "Voto Serif",
        "isActive": false,
        "fontFileName": "VotoSerifGX.woff2",
        "cssCodeName": "Voto Serif",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "wght",
              "name": "Weight",
              "minValue": 28,
              "defaultValue": 28,
              "maxValue": 194,
              "isSelected": 1
            },
            {
              "tag": "wdth",
              "name": "Width",
              "minValue": 50,
              "defaultValue": 130,
              "maxValue": 130,
              "isSelected": 2
            },
            {
              "tag": "opsz",
              "name": "Optical Size",
              "minValue": 12,
              "defaultValue": 12,
              "maxValue": 72,
              "isSelected": 0
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "Monotype Design Team, Adam Twardoch",
          "publisher": "Monotype",
          "urlText": "github.com",
          "url": "https://github.com/twardoch/varfonts-ofl/tree/master/VotoSerifGX-OFL",
          "license": "Open source"
        }
      },
      {
        "fontFamilyName": "Zinzin",
        "isActive": false,
        "fontFileName": "ZinzinVF.woff2",
        "cssCodeName": "Zinzin",
        "previewText": {
          "isCustom": false,
          "customText": ""
        },
        "isVariableFont": true,
        "variableOptions": {
          "axes": [
            {
              "tag": "SWSH",
              "name": "Swash",
              "minValue": 0,
              "defaultValue": 0,
              "maxValue": 1000,
              "isSelected": 1
            }
          ],
          "instances": []
        },
        "fontInfo": {
          "designer": "Natanael Gama, Adam Twardoch",
          "publisher": "Adam Twardoch",
          "urlText": "github.com",
          "url": "https://github.com/twardoch/varfonts-ofl/tree/master/ZinzinVF-OFL",
          "license": "Open source"
        }
      }
    ],
    canvasObjects: [
      {
        type: "Point Type Frame",
        isSelected: false,
        properties: {
          "left": 0,
          "top": 0,
          "text": "Heading One",
          "fontSize": 100,
          "cssCodeName": "Dunbar",
          "isVariableFont": true,
          "variableOptions": {
            "axes": [
              {
                "tag": "wght",
                "name": "Weight",
                "minValue": 100,
                "defaultValue": 500,
                "maxValue": 900,
                "isSelected": 1
              },
              {
                "tag": "XHGT",
                "name": "xHeight",
                "minValue": 353,
                "defaultValue": 353,
                "maxValue": 574,
                "isSelected": 2,
                "minPositionY": 0.571,
                "maxPositionY": 0.35,
                "baselinePostionY": 0.924
              },
              {
                "tag": "opsz",
                "name": "Optical Size",
                "minValue": 10,
                "defaultValue": 36,
                "maxValue": 36,
                "isSelected": 0
              }
            ]
          }
        }
      },
      {
        type: "Point Type Frame",
        isSelected: false,
        properties: {
          "left": 0,
          "top": 300,
          "text": "Paragraph One",
          "fontSize": 20,
          "cssCodeName": "Amstelvar",
          "isVariableFont": true,
          "variableOptions": {
            "axes": [
              {
                "tag": "wght",
                "name": "Weight",
                "minValue": 100,
                "defaultValue": 400,
                "maxValue": 900,
                "isSelected": 1
              },
              {
                "tag": "wdth",
                "name": "Width",
                "minValue": 35,
                "defaultValue": 100,
                "maxValue": 100,
                "isSelected": 2
              },
              {
                "tag": "opsz",
                "name": "Optical Size",
                "minValue": 10,
                "defaultValue": 14,
                "maxValue": 72,
                "isSelected": 0
              },
              {
                "tag": "XOPQ",
                "name": "x opaque",
                "minValue": 5,
                "defaultValue": 88,
                "maxValue": 500,
                "isSelected": 0
              },
              {
                "tag": "XTRA",
                "name": "x transparent",
                "minValue": 42,
                "defaultValue": 402,
                "maxValue": 402,
                "isSelected": 0
              },
              {
                "tag": "YOPQ",
                "name": "y opaque",
                "minValue": 4,
                "defaultValue": 50,
                "maxValue": 85,
                "isSelected": 0
              },
              {
                "tag": "YTLC",
                "name": "lc y transparent",
                "minValue": 445,
                "defaultValue": 500,
                "maxValue": 600,
                "isSelected": 0
              },
              {
                "tag": "YTSE",
                "name": "Serif height",
                "minValue": 0,
                "defaultValue": 18,
                "maxValue": 48,
                "isSelected": 0
              },
              {
                "tag": "GRAD",
                "name": "Grade",
                "minValue": 25,
                "defaultValue": 88,
                "maxValue": 150,
                "isSelected": 0
              },
              {
                "tag": "XTCH",
                "name": "x transparent Chinese",
                "minValue": 800,
                "defaultValue": 1000,
                "maxValue": 1200,
                "isSelected": 0
              },
              {
                "tag": "YTCH",
                "name": "y transparent Chinese",
                "minValue": 800,
                "defaultValue": 1000,
                "maxValue": 1200,
                "isSelected": 0
              },
              {
                "tag": "YTAS",
                "name": "y transparent ascender",
                "minValue": 650,
                "defaultValue": 750,
                "maxValue": 850,
                "isSelected": 0
              },
              {
                "tag": "YTDE",
                "name": "y transparent descender",
                "minValue": 150,
                "defaultValue": 250,
                "maxValue": 350,
                "isSelected": 0
              },
              {
                "tag": "YTUC",
                "name": "y transparent uppercase",
                "minValue": 650,
                "defaultValue": 750,
                "maxValue": 950,
                "isSelected": 0
              },
              {
                "tag": "YTRA",
                "name": "y transparent",
                "minValue": 800,
                "defaultValue": 1000,
                "maxValue": 1200,
                "isSelected": 0
              },
              {
                "tag": "PWGT",
                "name": "Para Weight",
                "minValue": 38,
                "defaultValue": 88,
                "maxValue": 250,
                "isSelected": 0
              },
              {
                "tag": "PWDT",
                "name": "Para Width",
                "minValue": 60,
                "defaultValue": 402,
                "maxValue": 402,
                "isSelected": 0
              }
            ]
          }
        }
      }
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
    filteredFontFamilies() {
      return this.fontFamilies.filter(fontFamily => {
        var isIncluded = false;
        if (fontFamily.fontFamilyName.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.cssCodeName.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.designer.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.publisher.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.license.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if(fontFamily.hasOwnProperty('variableOptions')) {
          axes = fontFamily.variableOptions.axes;
          for (var i =0; i < axes.length; i++){
            if (axes[i]['tag'].toLowerCase().includes(this.search.toLowerCase())) {
              isIncluded = true;
            } else if (axes[i]['name'].toLowerCase().includes(this.search.toLowerCase())) {
              isIncluded = true;
            }
          }
        }
        return isIncluded;
      })
    },
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
    selectedCanvasObjects: function() {
      var selectedCanvasObjects = [];
      for (var i = 0; i < this.canvasObjects.length; i++) {
        if(this.canvasObjects[i].isSelected == true) {
          selectedCanvasObjects.push(this.canvasObjects[i]);
        }
      }
      return selectedCanvasObjects;
    },
    isSlider2dActive: function() {
      if (this.selectedAxes.length >= 2) {
        return true;
      } else {
        return false;
      }
    },
    cssCode: function() {
      var fontFaces = [];
      var cssFontFaces = "";
      var cssCanvasObjects = [];

      for (var i = 0; i < this.canvasObjects.length; i++) {
        var cssString = "";
        var id = "#text" + (i+1);
        // cssString += "@font-face {\n";
        // cssString += "  src: url('[Your url to woff2 file here.]');\n";
        // cssString += "  font-family:'" + this.canvasObjects[i].properties.cssCodeName + "';\n";
        // cssString += "  font-style: normal;\n";
        // cssString += "}\n";
        if (!fontFaces.includes(this.canvasObjects[i].properties.cssCodeName)) {
          fontFaces.push(this.canvasObjects[i].properties.cssCodeName);
        }
        cssString += id + " {\n";
        cssString += "  font-family: '" + this.canvasObjects[i].properties.cssCodeName + "';\n";
        cssString += "  font-size: " + this.canvasObjects[i].properties.fontSize + "px; \n";
        cssString += "  position: absolute; \n";
        cssString += "  left: " + this.canvasObjects[i].properties.left + "px; \n";
        cssString += "  top: " + this.canvasObjects[i].properties.top + "px; \n";
        cssString += "  font-variation-settings:\n";
        if (this.canvasObjects[i].properties.isVariableFont) {
          var axes = this.canvasObjects[i].properties.variableOptions.axes;
          for (var j = 0; j < axes.length; j++) {
            if (j < axes.length-1) {
              cssString += "    '" + axes[j].tag + "' " + axes[j].defaultValue + ",\n";
            } else {
              cssString += "    '" + axes[j].tag + "' " + axes[j].defaultValue + "; \n";
            }
          }
        }
        cssString += "}\n";
        var cssCanvasObject = {
            "id": id,
            "cssString": cssString
        }
        cssCanvasObjects.push(cssCanvasObject);
      }
      for (var k = 0; k < fontFaces.length; k++) {
        cssFontFaces += "@font-face {\n";
        cssFontFaces += "  src: url('[Your url to woff2 file here.]');\n";
        cssFontFaces += "  font-family:'" + fontFaces[k] + "';\n";
        cssFontFaces += "  font-style: normal;\n";
        cssFontFaces += "}\n";
      }
      
      return {
        "cssFontFaces": cssFontFaces,
        "cssCanvasObjects": cssCanvasObjects
      };
    },
    fontFaces: function() {
      var fontFamilies = this.fontFamilies;
      // var assetAddress = 'https://s3.us-east-2.amazonaws.com/font-playground/';
      // var assetAddress = '../fonts/';
      var assetAddress = 'https://fonts.typedetail.com/';
      var cssString = '';
      for (var i = 0; i < this.fontFamilies.length; i++) {
        cssString += "@font-face {\n";
        cssString += "  src: url('"+assetAddress+this.fontFamilies[i].fontFileName+"');\n";
        cssString += "  font-family:'" + this.fontFamilies[i].cssCodeName + "';\n";
        cssString += "  font-style: normal;\n";
        cssString += "}\n";
      }
      return cssString;
    },
  },
  mounted: function() {
    if (this.selectedCanvasObjects.length > 0) {
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if(this.fontFamilies[i].cssCodeName == this.selectedCanvasObjects[0].properties.cssCodeName) {
          this.fontFamilies[i].isActive = true;
          if (this.selectedCanvasObjects[0].properties.isVariableFont) {
            this.fontFamilies[i].variableOptions.axes = this.selectedCanvasObjects[0].properties.variableOptions.axes;
          }
        } else {
          this.fontFamilies[i].isActive = false;
        }
      }
    }

    const self = this;
    document.body.addEventListener('keydown', function(e){
      if (e.key == "Backspace" || e.key == "Delete") {
        for (var i = self.canvasObjects.length - 1; i >= 0; i--) {
          if (self.canvasObjects[i].isSelected) {
            self.canvasObjects.splice(i,1);
          }
        }
      } 
    });
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
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        var newFontFamily = JSON.parse(JSON.stringify(fontFamily));
        this.selectedCanvasObjects[i].properties.cssCodeName = newFontFamily.cssCodeName;
        if (newFontFamily.isVariableFont) {
          this.selectedCanvasObjects[i].properties.variableOptions.axes = newFontFamily.variableOptions.axes;
        }
      }
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
      this.handleActiveFontChange();
    },
    handleCanvasObjectChange: function(canvasObject){
      let newCanvasObject = JSON.parse(JSON.stringify(canvasObject));
      this.fontSize = newCanvasObject.properties.fontSize;
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if(this.fontFamilies[i].cssCodeName == newCanvasObject.properties.cssCodeName) {
          this.fontFamilies[i].isActive = true;
          this.fontFamilies[i].variableOptions.axes = newCanvasObject.properties.variableOptions.axes
        } else {
          this.fontFamilies[i].isActive = false;
        }
      }
    },
    handleActiveFontChange: function(){
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        var newActiveFont = JSON.parse(JSON.stringify(this.activeFont));
        this.selectedCanvasObjects[i].properties.cssCodeName = newActiveFont.cssCodeName;
        if (newActiveFont.isVariableFont) {
          this.selectedCanvasObjects[i].properties.variableOptions.axes = newActiveFont.variableOptions.axes;
        }
      }
    },
    handleFontSizeChange: function(){
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        this.selectedCanvasObjects[i].properties.fontSize = this.fontSize;
      }
    },
    selectCanvasObject: function(canvasObject) {
      for (var i = 0; i < this.canvasObjects.length; i++) {
        this.canvasObjects[i].isSelected = false;
      }
      canvasObject.isSelected = true;
      this.handleCanvasObjectChange(canvasObject);
    },
    deselectAllCanvasObject: function(){
      var canvasObjects = this.canvasObjects;
      for (var i = 0; i < canvasObjects.length; i++) {
        canvasObjects[i].isSelected = false;
      }
    },
    instanceStyles: function(instance){
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
    addPointType: function() {
      var left, top;
      if (this.selectedCanvasObjects.length > 0) {
        left = 20 + this.selectedCanvasObjects[this.selectedCanvasObjects.length - 1].properties.left;
        top = 20 + this.selectedCanvasObjects[this.selectedCanvasObjects.length - 1].properties.top;
      } else if (this.canvasObjects.length > 0) {
        left = 20 + this.canvasObjects[this.canvasObjects.length-1].properties.left;
        top = 20 + this.canvasObjects[this.canvasObjects.length-1].properties.top;
      } else {
        left = 0;
        top = 0;
      }
      var canvasObject = {
        type: "Point Type Frame",
        isSelected: true,
        properties: {
          "left": left,
          "top": top,
          "text": "Heading One",
          "fontSize": this.fontSize,
          "cssCodeName": this.activeFont.cssCodeName,
          "isVariableFont": this.activeFont.isVariableFont,
        }
      };
      if (this.activeFont.isVariableFont) {
        canvasObject.properties.variableOptions = {
          "axes": this.activeFont.variableOptions.axes
        }
      }
      this.canvasObjects.push(canvasObject);
    },
    highLightCanvasObject: function(id) {
      document.body.querySelector(id).classList.add('highlight');
      console.log(document.body.querySelector(id));
    },
    unHighLightCanvasObject: function(id) {
      document.body.querySelector(id).classList.remove('highlight');
      console.log(document.body.querySelector(id));
    }
  }
})
