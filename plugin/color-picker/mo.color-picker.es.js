function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i)
        break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null)
        _i["return"]();
    } finally {
      if (_d)
        throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}
var template = '\n<div class="mo-color-sat-val">\n  <div class="mo-color-thumb" role="slider" tabindex="0">\n    <span></span>\n  </div>\n</div>\n<div class="mo-color-hue">\n  <div class="mo-color-rail"></div>\n  <div class="mo-color-thumb" role="slider" tabindex="0">\n    <span></span>\n  </div>\n</div>\n<div class="mo-color-alpha">\n  <div class="mo-color-rail"></div>\n  <div class="mo-color-thumb" role="slider" tabindex="0">\n    <span></span>\n  </div>\n</div>\n';
var HEX_REG = /^#([a-f\d]{3}|[a-f\d]{6})$/i;
var RGB_REG = /^rgba?\s?\(/i;
var HSL_REG = /^hsla?\s?\(/i;
var HSV_REG = /^hsva?\s?\(/i;
var parseAlpha = function parseAlpha2(a) {
  return a !== void 0 && !isNaN(+a) && 0 <= +a && +a <= 1 ? +a : 1;
};
function boundValue(value, max) {
  value = Math.min(max, Math.max(0, value));
  if (Math.abs(value - max) < 1e-6) {
    return 1;
  }
  return value % max / ~~max;
}
var hsv2rgb = function hsv2rgb2(h, s, v) {
  h = boundValue(h, 360);
  s = boundValue(s * 100, 100);
  v = boundValue(v * 100, 100);
  var i = ~~(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  var r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
  }
  var round = function round2(value) {
    return Math.round(value * 255);
  };
  return {
    r: round(r),
    g: round(g),
    b: round(b)
  };
};
var rgb2hsv = function rgb2hsv2(r, g, b, a) {
  r = boundValue(r, 255);
  g = boundValue(g, 255);
  b = boundValue(b, 255);
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s;
  var v = max;
  var d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: h * 360,
    s,
    v,
    a: parseAlpha(a)
  };
};
var hsv2hsl = function hsv2hsl2(h, s, v) {
  return {
    h,
    s: s * v / ((h = (2 - s) * v) < 1 ? h : 2 - h) || 0,
    l: h / 2
  };
};
var hsl2hsv = function hsl2hsv2(h, s, l, a) {
  var _s;
  var _v;
  l *= 2;
  s *= l <= 1 ? l : 2 - l;
  _v = (l + s) / 2;
  _s = 2 * s / (l + s);
  return {
    h,
    s: _s,
    v: _v,
    a: parseAlpha(a)
  };
};
var hex2rgb = function hex2rgb2(color) {
  color = color.replace(/^#/, "");
  if (color.length === 3) {
    var colors = [];
    for (var i = 0; i < 3; i++) {
      colors.push(color[i], color[i]);
    }
    color = colors.join("");
  }
  var r = parseInt([color[0], color[1]].join(""), 16);
  var g = parseInt([color[2], color[3]].join(""), 16);
  var b = parseInt([color[4], color[5]].join(""), 16);
  return {
    r,
    g,
    b
  };
};
var rgb2hex = function rgb2hex2(r, g, b) {
  var color = "#";
  [r, g, b].forEach(function(v) {
    var hex = v.toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    color += hex;
  });
  return color;
};
var parseColor = function parseColor2(color) {
  if (!color) {
    return;
  }
  if (HEX_REG.test(color)) {
    var _hex2rgb = hex2rgb(color), r = _hex2rgb.r, g = _hex2rgb.g, b = _hex2rgb.b;
    return rgb2hsv(r, g, b);
  }
  if (RGB_REG.test(color)) {
    var colors = color.replace(RGB_REG, "").replace(/\)/, "").trim().split(",").filter(function(v2) {
      return v2.trim() !== "";
    }).map(function(v2, index2) {
      return index2 === 3 ? parseAlpha(v2) : parseInt(v2, 10);
    });
    var _colors = _slicedToArray(colors, 4), _r = _colors[0], _g = _colors[1], _b = _colors[2], a = _colors[3];
    var hsv = rgb2hsv(_r, _g, _b);
    hsv.a = parseAlpha(a);
    return hsv;
  }
  var isHsl;
  if (HSV_REG.test(color) || (isHsl = HSL_REG.test(color))) {
    var reg = isHsl ? HSL_REG : HSV_REG;
    var _colors2 = color.replace(reg, "").replace(/\)/, "").trim().split(",").filter(function(v2) {
      return v2.trim() !== "";
    }).map(function(v2, index2) {
      return index2 === 3 ? parseAlpha(v2) : parseFloat(v2);
    });
    var _colors3 = _slicedToArray(_colors2, 4), h = _colors3[0], s = _colors3[1], v = _colors3[2], _a = _colors3[3];
    if (!isHsl) {
      return {
        h,
        s,
        v,
        a: _a
      };
    } else {
      return hsl2hsv(h, s, v, _a);
    }
  }
  return;
};
var $ = function $2(selector) {
  var context = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : document;
  return context.querySelector(selector);
};
var on = function on2(el, event, listener) {
  return el.addEventListener(event, listener, false);
};
var off = function off2(el, event, listener) {
  return el.removeEventListener(event, listener, false);
};
var isFunction = function isFunction2(value) {
  return typeof value === "function";
};
var defaults$1 = {
  start: function start(event) {
  },
  drag: function drag(coordinate, event) {
  },
  end: function end(coordinate, event) {
  }
};
function handlerStart(event) {
  if (Draggable.dragging)
    return;
  event.preventDefault();
  on(document, "touchmove", this._handlers.drag);
  on(document, "touchend", this._handlers.dragEnd);
  on(document, "mousemove", this._handlers.drag);
  on(document, "mouseup", this._handlers.dragEnd);
  Draggable.dragging = true;
  isFunction(this._props.start) && this._props.start.call(this, event);
}
function handlerDrag(event) {
  isFunction(this._props.drag) && this._props.drag.call(this, getCoordinate(this._$el, event), event);
}
function handlerEnd(event) {
  off(document, "touchmove", this._handlers.drag);
  off(document, "touchend", this._handlers.dragEnd);
  off(document, "mousemove", this._handlers.drag);
  off(document, "mouseup", this._handlers.dragEnd);
  Draggable.dragging = false;
  if (typeof event !== "boolean") {
    isFunction(this._props.end) && this._props.end.call(this, getCoordinate(this._$el, event), event);
  }
}
function handlerClick(event) {
  isFunction(this._props.end) && this._props.end.call(this, getCoordinate(this._$el, event), event);
}
function bindEvents$1() {
  var handlers = this._handlers;
  var $el = this._$el;
  handlers.dragStart = handlerStart.bind(this);
  handlers.drag = handlerDrag.bind(this);
  handlers.dragEnd = handlerEnd.bind(this);
  handlers.click = handlerClick.bind(this);
  on($el, "touchstart", handlers.dragStart);
  on($el, "mousedown", handlers.dragStart);
  on($el, "click", handlers.click);
}
function unbindEvents$1() {
  var handlers = this._handlers;
  var $el = this._$el;
  off($el, "touchstart", handlers.dragStart);
  off($el, "mousedown", handlers.dragStart);
  off($el, "click", handlers.click);
  handlerEnd.call(this, false);
}
function getCoordinate(el, event) {
  var rect = el.getBoundingClientRect();
  var mouseEvent;
  if ("ontouchend" in document) {
    mouseEvent = event.changedTouches[0];
  } else {
    mouseEvent = event;
  }
  var left = mouseEvent.clientX - rect.left;
  var top = mouseEvent.clientY - rect.top;
  return {
    top: Math.min(Math.max(0, top), rect.height),
    left: Math.min(Math.max(0, left), rect.width)
  };
}
var Draggable = /* @__PURE__ */ function() {
  function Draggable2(el, options) {
    _classCallCheck(this, Draggable2);
    this._$el = el;
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._props = Object.assign({}, defaults$1, options);
    bindEvents$1.call(this);
  }
  _createClass(Draggable2, [{
    key: "destroy",
    value: function destroy() {
      unbindEvents$1.call(this);
      this._$el = null;
      this._handlers = null;
    }
  }]);
  return Draggable2;
}();
Draggable.dragging = false;
var index = "";
var UI_NAME = "mo-color-picker";
var defaults = {
  value: null,
  format: "rgb",
  alpha: false,
  change: function change(color, colors) {
  }
};
var Selectors = {
  sat: ".mo-color-sat-val",
  hue: ".mo-color-hue",
  alp: ".mo-color-alpha",
  rail: ".mo-color-rail",
  thumb: ".mo-color-thumb"
};
function render() {
  var props = this._props, states = this._states;
  var $el = document.createElement("div");
  $el.className = UI_NAME;
  $el.innerHTML = template;
  states.$el = $el;
  states.$sat = $(Selectors.sat, $el);
  states.$hue = $(Selectors.hue, $el);
  states.$alp = $(Selectors.alp, $el);
  states.$satThumb = $(Selectors.thumb, states.$sat);
  states.$hueThumb = $(Selectors.thumb, states.$hue);
  states.$alpThumb = $(Selectors.thumb, states.$alp);
  states.$alpRail = $(Selectors.rail, states.$alp);
  states.$wrap.appendChild($el);
  if (!props.alpha) {
    states.$alp.style.display = "none";
  }
  bindEvents.call(this);
}
function bindEvents() {
  var states = this._states;
  var _ = this;
  function satDrag(coordinate) {
    var top = coordinate.top, left = coordinate.left;
    var satWidth = states.satWidth, satHeight = states.satHeight;
    var saturation = Math.round(left / satWidth * 100) / 100;
    var value = Math.round((1 - top / satHeight) * 100) / 100;
    states.s = saturation;
    states.v = value;
    afterSatChange.call(_);
    updateColor.call(_);
  }
  function hueDrag(coordinate) {
    var left = coordinate.left;
    var hueWidth = states.hueWidth;
    states.h = Math.round(left / hueWidth * 360 * 100) / 100;
    afterHueChange.call(_);
    updateColor.call(_);
  }
  function alpDrag(coordinate) {
    var left = coordinate.left;
    var alpWidth = states.alpWidth;
    states.a = Math.round(left / alpWidth * 100) / 100;
    afterAlpChange.call(_, true, false);
    updateColor.call(_);
  }
  states.satDragIns = new Draggable(states.$sat, {
    drag: satDrag,
    end: satDrag
  });
  states.hueDragIns = new Draggable(states.$hue, {
    drag: hueDrag,
    end: hueDrag
  });
  states.alpDragIns = new Draggable(states.$alp, {
    drag: alpDrag,
    end: alpDrag
  });
}
function unbindEvents() {
  var states = this._states;
  states.satDragIns && states.satDragIns.destroy();
  states.hueDragIns && states.hueDragIns.destroy();
  states.alpDragIns && states.alpDragIns.destroy();
}
function afterSatChange() {
  var states = this._states;
  var s = states.s, v = states.v;
  states.satWidth = states.satWidth || states.$sat.offsetWidth;
  states.satHeight = states.satHeight || states.$sat.offsetHeight;
  var top = Math.round((1 - v) * states.satHeight);
  var left = Math.round(s * states.satWidth);
  var color = s <= 0.2 && v >= 0.8 ? "rgba(0,0,0,.7)" : "white";
  states.$satThumb.style.cssText += "top: ".concat(top, "px; left: ").concat(left, "px; color: ").concat(color, ";");
  afterAlpChange.call(this, false, true);
}
function afterHueChange() {
  var states = this._states;
  var h = states.h;
  states.hueWidth = states.hueWidth || states.$hue.offsetWidth;
  var left = Math.round(h / 360 * states.hueWidth);
  states.$hueThumb.style.left = left + "px";
  states.$sat.style.background = "hsl(".concat(h, ", 100%, 50%)");
  afterAlpChange.call(this, false, true);
}
function afterAlpChange() {
  var updateLeft = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
  var updateColor2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
  var props = this._props, states = this._states;
  if (!props.alpha)
    return;
  var h = states.h, s = states.s, v = states.v, a = states.a;
  if (updateLeft) {
    states.alpWidth = states.alpWidth || states.$alp.offsetWidth;
    states.$alpThumb.style.left = a * states.alpWidth + "px";
  }
  if (updateColor2) {
    var hsl = hsv2hsl(h, s, v);
    states.$alpRail.style.background = "linear-gradient(to right, transparent, hsl(".concat(hsl.h, ", ").concat(hsl.s * 100, "%, ").concat(hsl.l * 100, "%))");
  }
}
function afterColorsChange() {
  afterSatChange.call(this);
  afterHueChange.call(this);
  afterAlpChange.call(this, true, true);
}
function checkColor(color) {
  var style = new Option().style;
  style.color = color;
  return (style.color || "").replace(/\s/g, "") === color;
}
function value2Colors(value, init) {
  var states = this._states;
  if (value) {
    var _parseColor = parseColor(value), h = _parseColor.h, s = _parseColor.s, v = _parseColor.v, a = _parseColor.a;
    var _hsv2rgb = hsv2rgb(h, s, v), r = _hsv2rgb.r, g = _hsv2rgb.g, b = _hsv2rgb.b;
    if (h === void 0 || !checkColor("rgb(".concat(r, ",").concat(g, ",").concat(b, ")")))
      ;
    else {
      states.h = h;
      states.s = s;
      states.v = v;
      states.a = a;
      afterColorsChange.call(this);
      return;
    }
  }
  if (init) {
    states.h = 360;
    states.s = 1;
    states.v = 1;
    states.a = 1;
    afterColorsChange.call(this);
  }
}
function updateColor() {
  var props = this._props, states = this._states;
  var h = states.h, s = states.s, v = states.v, a = states.a;
  isFunction(props.change) && props.change.call(this, this.getValue(), {
    h,
    s,
    v,
    a
  });
}
var ColorPicker = /* @__PURE__ */ function() {
  function ColorPicker2(wrapper, options) {
    _classCallCheck(this, ColorPicker2);
    this._states = /* @__PURE__ */ Object.create(null);
    this._props = Object.assign({}, defaults, options);
    this._states.$wrap = wrapper;
    render.call(this);
    value2Colors.call(this, this._props.value, true);
  }
  _createClass(ColorPicker2, [{
    key: "setValue",
    value: function setValue(value) {
      if (value === null) {
        value2Colors.call(this, null, true);
      } else if (value) {
        value2Colors.call(this, value);
      }
    }
  }, {
    key: "getValue",
    value: function getValue(format) {
      var props = this._props, states = this._states;
      var h = states.h, s = states.s, v = states.v, a = states.a;
      var color;
      format = format || props.format;
      switch (format) {
        case "hsl":
          var _hsv2hsl = hsv2hsl(h, s, v), _h = _hsv2hsl.h, _s = _hsv2hsl.s, l = _hsv2hsl.l;
          color = props.alpha ? "hsla(".concat(Math.round(_h), ", ").concat(Math.round(_s * 100), "%, ").concat(Math.round(l * 100), "%, ").concat(a, ")") : "hsl(".concat(Math.round(_h), ", ").concat(Math.round(_s * 100), "%, ").concat(Math.round(l * 100), "%)");
          break;
        case "hsv":
          color = props.alpha ? "hsva(".concat(Math.round(h), ", ").concat(Math.round(s * 100), "%, ").concat(Math.round(v * 100), "%, ").concat(a, ")") : "hsv(".concat(Math.round(h), ", ").concat(Math.round(s * 100), "%, ").concat(Math.round(v * 100), "%)");
          break;
        case "hex":
        case "rgb":
        default:
          var _hsv2rgb2 = hsv2rgb(h, s, v), r = _hsv2rgb2.r, g = _hsv2rgb2.g, b = _hsv2rgb2.b;
          if (format === "hex") {
            color = rgb2hex(r, g, b);
          } else {
            color = props.alpha ? "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")") : "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
          }
      }
      return color;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      unbindEvents.call(this);
      this._states.$el.parentNode.removeChild(this._states.$el);
      this._props = null;
      this._states = null;
    }
  }]);
  return ColorPicker2;
}();
ColorPicker.hex2rgb = hex2rgb;
ColorPicker.rgb2hex = rgb2hex;
export { ColorPicker, ColorPicker as default };
