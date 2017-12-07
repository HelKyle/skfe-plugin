// Disable the context menu
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

let codeBlock = document.querySelector(".code");
let unitInput = document.querySelector('.scss-unit');
let miniPixelInput = document.querySelector('.mini-pixel');
let previewItem = document.querySelector(".preview__item");

unitInput.addEventListener('input', update);
miniPixelInput.addEventListener('input', update);

let codeBeforeFilter = '';
let originStyle = '';

function removeBlackListAttributes (codeString) {
  var blackList = ['font-family', 'letter-spacing']
  for (let i = 0; i < blackList.length; i ++) {
    codeString = codeString.replace(new RegExp(`${blackList[i]}(.*)\n`, 'ig', ''), '');
  }
  return codeString
}

function filterCode (codeString) {
  var unitsFunc = (match, val) => {
    let unit = unitInput.value
    let miniPixel = miniPixelInput.value
    if (val <= parseInt(miniPixel)) {
      return `${val}px`
    }
    return `${unit}(${val})`
  }
  let result = codeString.replace(/([0-9]+)px/ig, unitsFunc)
  result = removeBlackListAttributes(result)
  return result
}

function updatePreview(params) {
  let style = params.attributes;
  previewItem.innerHTML = params.content || '';
  let displayCode = `${style.replace(/(;)/g, '$1\n')}`;
  displayCode = `${displayCode.replace(/(\*\/)/g, '$1\n')}`;
  displayCode = displayCode.split('\n').map((item) => {
    return item.trim();
  }).join('\n');
  originStyle = style
  codeBeforeFilter = displayCode;
  update();
}

function update () {
  codeBlock.innerHTML = filterCode(codeBeforeFilter);
  hljs.highlightBlock(codeBlock);
  previewItem.style.cssText = originStyle;
}

update();
