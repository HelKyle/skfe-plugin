var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webview = __webpack_require__(1);

Object.defineProperty(exports, 'onSelectionChanged', {
  enumerable: true,
  get: function () {
    function get() {
      return _webview.onSelectionChanged;
    }

    return get;
  }()
});
Object.defineProperty(exports, 'onCloseDocument', {
  enumerable: true,
  get: function () {
    function get() {
      return _webview.onCloseDocument;
    }

    return get;
  }()
});
Object.defineProperty(exports, 'togglePanel', {
  enumerable: true,
  get: function () {
    function get() {
      return _webview.togglePanel;
    }

    return get;
  }()
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.togglePanel = togglePanel;
exports.onCloseDocument = onCloseDocument;
exports.onSelectionChanged = onSelectionChanged;

var _constants = __webpack_require__(2);

function toArray(object) {
  if (Array.isArray(object)) {
    return object;
  }
  var arr = [];
  for (var j = 0; j < object.count(); j += 1) {
    arr.push(object.objectAtIndex(j));
  }
  return arr;
} /* eslint-disable no-unused-vars, consistent-return, no-undef, import/named */


function isOpen() {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  return threadDictionary[_constants.IDENTIFIER];
}

function close(context) {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  threadDictionary.removeObjectForKey(_constants.IDENTIFIER);
  var contentView = context.document.documentWindow().contentView();
  if (!contentView) {
    return false;
  }
  var stageView = contentView.subviews().objectAtIndex(0);
  var finalViews = toArray(stageView.subviews()).filter(function (view) {
    return String(view.identifier()) !== _constants.IDENTIFIER;
  });
  stageView.subviews = finalViews;
  stageView.adjustSubviews();
}

function open(context) {
  var panelWidth = _constants.PANEL_WIDTH;
  var panelHeight = _constants.PANEL_HEIGHT;

  var threadDictionary = NSThread.mainThread().threadDictionary();
  if (threadDictionary[_constants.IDENTIFIER]) return;

  var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 44));
  var request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("index.html"));
  webView.mainFrame().loadRequest(request);
  webView.setDrawsBackground(false);
  webView.identifier = _constants.IDENTIFIER;

  var contentView = context.document.documentWindow().contentView();
  var stageView = contentView.subviews().objectAtIndex(0);
  var views = stageView.subviews();
  var finalViews = [];
  var pushedWebView = false;
  for (var i = 0; i < views.count(); i += 1) {
    var view = views.objectAtIndex(i);
    finalViews.push(view);
    if (!pushedWebView && String(view.identifier()) === 'view_canvas') {
      finalViews.push(webView);
      pushedWebView = true;
    }
  }
  if (!pushedWebView) {
    finalViews.push(webView);
  }
  stageView.subviews = finalViews;
  stageView.adjustSubviews();
  threadDictionary[_constants.IDENTIFIER] = webView;
}

function togglePanel(context) {
  if (isOpen()) {
    close(context);
  } else {
    open(context);
  }
}

function onCloseDocument(context) {
  if (isOpen()) {
    close(context);
  }
}

function getFontWeight(layer) {
  var font = layer.fontPostscriptName();
  var weight = font.split('-')[1];
  weight = weight && weight.toLowerCase();
  if (weight && FONT_WEIGHT_MAP[weight]) {
    return FONT_WEIGHT_MAP[weight];
  }
  return null;
}

function onSelectionChanged(context) {
  var threadDictionary = NSThread.mainThread().threadDictionary();

  if (threadDictionary[_constants.IDENTIFIER]) {
    var webView = threadDictionary[_constants.IDENTIFIER];
    if (!webView) {
      return;
    }
    var windowObject = webView.windowScriptObject();

    var selection = context.actionContext.document.selectedLayers().layers();
    if (selection.length >= 1) {
      var layer = selection[0];
      var frame = layer.frame();
      var attributes = layer.CSSAttributes();
      if (layer['class']() === "MSTextLayer") {
        var fontWeight = getFontWeight(layer);
        if (fontWeight) {
          attributes.addObject('font-weight: ' + String(fontWeight) + ';');
        }
        if (!layer.lineHeight()) {
          attributes.addObject('line-height: 1.4;');
        }
        Object.keys(_constants.TEXT_ALIGNMENT).forEach(function (key, index) {
          if (layer.textAlignment() === _constants.TEXT_ALIGNMENT[key]) {
            attributes.addObject('text-align: ' + String(TEXT_ALIGNMENT_MAP[key]) + ';');
          }
        });
      }
      attributes.addObject('\n');
      attributes.addObject('/* Size: */');
      attributes.addObject('width: ' + String(frame.width()) + 'px;');
      attributes.addObject('height: ' + String(frame.height()) + 'px;');
      var params = {};
      if (layer['class']() === "MSTextLayer") {
        params = {
          attributes: attributes.join(" "),
          content: String(layer.stringValue())
        };
      } else {
        params = {
          attributes: attributes.join(" "),
          content: ""
        };
      }
      windowObject.evaluateWebScript('updatePreview(' + String(JSON.stringify(params)) + ')');
    } else {
      windowObject.evaluateWebScript("updatePreview(' ')");
    }
  }
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
var IDENTIFIER = exports.IDENTIFIER = 'com.helkyle.panel';
var PANEL_WIDTH = exports.PANEL_WIDTH = 340;
var PANEL_HEIGHT = exports.PANEL_HEIGHT = 646;

var TEXT_ALIGNMENT = exports.TEXT_ALIGNMENT = {
  LEFT: 0,
  RIGHT: 1,
  CENTER: 2
};

var TEXT_ALIGNMENT_MAP = exports.TEXT_ALIGNMENT_MAP = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
};

var FONT_WEIGHT_MAP = exports.FONT_WEIGHT_MAP = {
  'thin': 100,
  'hairline': 100,
  'extralight': 200,
  'ultralight': 200,
  'light': 300,
  'book': 300,
  'normal': 400,
  'regular': 400,
  'roman': 400,
  'standard': 400,
  'plain': 400,
  'medium': 500,
  'demi': 500,
  'semibold': 600,
  'semibld': 600,
  'demibold': 600,
  'demibld': 600,
  'bold': 700,
  'bld': 700,
  'extrabold': 800,
  'ultrabold': 800,
  'extrabld': 800,
  'ultrabld': 800,
  'heavy': 900,
  'ultra': 900,
  'fat': 900,
  'poster': 900,
  'ultrablack': 900,
  'black': 900,
  'w3': 300,
  'w5': 500
};

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['togglePanel'] = __skpm_run.bind(this, 'togglePanel');
that['onSelectionChanged'] = __skpm_run.bind(this, 'onSelectionChanged');
that['onRun'] = __skpm_run.bind(this, 'default')
