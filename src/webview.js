/* eslint-disable no-unused-vars, consistent-return, no-undef, import/named */
import {
  IDENTIFIER,
  PANEL_WIDTH,
  PANEL_HEIGHT,
  TEXT_ALIGNMENT,
} from './constants'

function toArray(object) {
  if (Array.isArray(object)) {
    return object;
  }
  const arr = [];
  for (let j = 0; j < object.count(); j += 1) {
    arr.push(object.objectAtIndex(j));
  }
  return arr;
}

function isOpen() {
  const threadDictionary = NSThread.mainThread().threadDictionary();
  return threadDictionary[IDENTIFIER];
}

function close(context) {
  const threadDictionary = NSThread.mainThread().threadDictionary();
  threadDictionary.removeObjectForKey(IDENTIFIER);
  const contentView = context.document.documentWindow().contentView();
  if (!contentView) {
    return false;
  }
  const stageView = contentView.subviews().objectAtIndex(0);
  const finalViews = toArray(stageView.subviews()).filter(view => String(view.identifier()) !== IDENTIFIER);
  stageView.subviews = finalViews;
  stageView.adjustSubviews();
}

function open(context) {
  const panelWidth = PANEL_WIDTH;
  const panelHeight = PANEL_HEIGHT;

  const threadDictionary = NSThread.mainThread().threadDictionary();
  if (threadDictionary[IDENTIFIER]) return;

  const webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 44));
  const request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("index.html"));
  webView.mainFrame().loadRequest(request);
  webView.setDrawsBackground(false);
  webView.identifier = IDENTIFIER;

  const contentView = context.document.documentWindow().contentView();
  const stageView = contentView.subviews().objectAtIndex(0);
  const views = stageView.subviews();
  const finalViews = [];
  let pushedWebView = false;
  for (let i = 0; i < views.count(); i += 1) {
    const view = views.objectAtIndex(i);
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
  threadDictionary[IDENTIFIER] = webView;
}

export function togglePanel(context) {
  if (isOpen()) {
    close(context);
  } else {
    open(context);
  }
}

export function onCloseDocument(context) {
  if (isOpen()) {
    close(context);
  }
}

function getFontWeight(layer) {
  const font = layer.fontPostscriptName()
  let weight = font.split('-')[1]
  weight = weight && weight.toLowerCase()
  if (weight && FONT_WEIGHT_MAP[weight]) {
    return FONT_WEIGHT_MAP[weight]
  }
  return null
}

export function onSelectionChanged(context) {
  const threadDictionary = NSThread.mainThread().threadDictionary();

  if (threadDictionary[IDENTIFIER]) {
    const webView = threadDictionary[IDENTIFIER];
    if (!webView) {
      return;
    }
    const windowObject = webView.windowScriptObject();

    const selection = context.actionContext.document.selectedLayers().layers();
    if (selection.length >= 1) {
      const layer = selection[0];
      const frame = layer.frame();
      const attributes = layer.CSSAttributes();
      if (layer.class() === "MSTextLayer") {
        const fontWeight = getFontWeight(layer)
        if (fontWeight) {
          attributes.addObject(`font-weight: ${fontWeight};`);
        }
        if (!layer.lineHeight()) {
          attributes.addObject(`line-height: 1.4;`);
        }
        Object.keys(TEXT_ALIGNMENT).forEach((key, index) => {
          if (layer.textAlignment() === TEXT_ALIGNMENT[key]) {
            attributes.addObject(`text-align: ${TEXT_ALIGNMENT_MAP[key]};`);
          }
        });
      }
      attributes.addObject('\n');
      attributes.addObject('/* Size: */');
      attributes.addObject(`width: ${frame.width()}px;`);
      attributes.addObject(`height: ${frame.height()}px;`);
      let params = {}
      if (layer.class() === "MSTextLayer") {
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
