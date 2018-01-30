@import 'constants.js'
var identifier = "com.helkyle.panel";

function toArray (object) {
  if (Array.isArray(object)) {
    return object;
  }
  let arr = [];
  for (let j = 0; j < object.count(); j++) {
    arr.push(object.objectAtIndex(j));
  }
  return arr;
}

function togglePanel (context) {
  if (isOpen()) {
    close(context);
  } else {
    open(context);
  }
}

function isOpen () {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  return threadDictionary[identifier];
}

function close (context) {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  threadDictionary.removeObjectForKey(identifier);
  const contentView = context.document.documentWindow().contentView();
  if (!contentView) {
    return false;
  }
  const stageView = contentView.subviews().objectAtIndex(0);
  const finalViews = toArray(stageView.subviews()).filter(view => {
    return view.identifier() != identifier;
  });
  stageView.subviews = finalViews;
  stageView.adjustSubviews();
}

function open (context) {
  var panelWidth = 340;
  var panelHeight = 646;

  var threadDictionary = NSThread.mainThread().threadDictionary();
  if (threadDictionary[identifier]) return;

  var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 44));
  var request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("webView.html"));
  webView.mainFrame().loadRequest(request);
  webView.setDrawsBackground(false);
  webView.identifier = identifier;

  const contentView = context.document.documentWindow().contentView();
  const stageView = contentView.subviews().objectAtIndex(0);
  const views = stageView.subviews();
  let finalViews = [];
  let pushedWebView = false;
  for (let i = 0; i < views.count(); i++) {
    const view = views.objectAtIndex(i);
    finalViews.push(view);
    if (!pushedWebView && view.identifier() == 'view_canvas') {
      finalViews.push(webView);
      pushedWebView = true;
    }
  }
  if (!pushedWebView) {
    finalViews.push(webView);
  }
  stageView.subviews = finalViews;
  stageView.adjustSubviews();
  threadDictionary[identifier] = webView;
}

var onCloseDocument = function (context) {
  if (isOpen()) {
    close(context);
  }
}

var getFontWeight = function (layer) {
  let font = layer.fontPostscriptName()
  let weight = font.split('-')[1]
  weight = weight && weight.toLowerCase()
  if (weight && FONT_WEIGHT_MAP[weight]) {
    return FONT_WEIGHT_MAP[weight]
  } else {
    log(weight)
  }
  return null
}

var onSelectionChanged = function(context) {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  
  if (threadDictionary[identifier]) {
    var webView = threadDictionary[identifier];
    if (!webView) {
      return;
    }
    var windowObject = webView.windowScriptObject();

    var selection = context.actionContext.document.selectedLayers().layers();
    if (selection.length >= 1) {
      let layer = selection[0];
      var frame = layer.frame();
      var attributes = layer.CSSAttributes();
      if (layer.class() == "MSTextLayer") {
        var fontWeight = getFontWeight(layer)
        if (fontWeight) {
          attributes.addObject(`font-weight: ${fontWeight};`);
        }
        if (!layer.lineHeight()) {
          attributes.addObject(`line-height: 1.4;`);
        }
        for (const key in TEXT_ALIGNMENT) {
          if (layer.textAlignment() === TEXT_ALIGNMENT[key]) {
            attributes.addObject(`text-align: ${TEXT_ALIGNMENT_MAP[key]};`);
          }
        }
      }
      attributes.addObject('\n');
      attributes.addObject('/* Size: */');
      attributes.addObject(`width: ${frame.width()}px;`);
      attributes.addObject(`height: ${frame.height()}px;`);
      let params = {}
      if (layer.class() == "MSTextLayer") {
        params = {
          attributes: attributes.join(" "),
          content: String(layer.stringValue())
        }
      } else {
        params = {
          attributes: attributes.join(" "),
          content: ""
        }
      }
      windowObject.evaluateWebScript(`updatePreview(${JSON.stringify(params)})`);
    } else {
      windowObject.evaluateWebScript("updatePreview(' ')");
    }
  }
};
