/**
 * 获取网格的html
 * @param getSvgWidth
 * @param getSvgHeight
 * @param getZoom
 * @returns {string}
 */

function createGridSvg(getSvgWidth,getSvgHeight,getZoom) {
  let svg = "";

  let gridWidth = getSvgWidth / 100;
  let groupNum = 10;
  let lineWidth = 0.3 / getZoom;

  let stageWidth = getSvgWidth;
  let stageHeight = getSvgHeight;
  //获取宽度需要的格子
  let x_grid_num = Math.round(stageWidth / gridWidth);
  let y_grid_num = Math.round(stageHeight / gridWidth);

  //计算垂直和居中偏移
  let offsetX = 0;
  let offsetY = 0;

  let stageCenterX = stageWidth / 2;
  let stageCenterY = stageHeight / 2;

  //获取到最中间的大格子
  let bigXList = [];
  for (var x_i = 0; x_i < x_grid_num; x_i++) {
    if (x_i % groupNum == 0) {
      bigXList.push(x_i * gridWidth);
    }
  }
  if (bigXList.length % 2 == 0) {
    offsetX = -(stageCenterX - bigXList[bigXList.length / 2]);
  } else {
    offsetX = -(stageCenterX - bigXList[(bigXList.length + 1) / 2]);
  }

  let bigYList = [];
  for (var y_i = 0; y_i < y_grid_num; y_i++) {
    if (y_i % groupNum == 0) {
      bigYList.push(y_i * gridWidth);
    }
  }
  if (bigYList.length % 2 == 0) {
    offsetY = -(stageCenterY - bigYList[bigYList.length / 2]);
  } else {
    offsetY = -(stageCenterY - bigYList[(bigYList.length + 1) / 2]);
  }

  //绘制纵向分割线
  for (var x_i = 0; x_i < x_grid_num + groupNum; x_i++) {
    if (x_i % groupNum == 0) {
      svg += `<line x1="${x_i * gridWidth - offsetX}" y1="0" x2="${x_i *
      gridWidth -
      offsetX}" y2="${stageHeight}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.8)"></line>`;
    } else {
      svg += `<line x1="${x_i * gridWidth - offsetX}" y1="0" x2="${x_i *
      gridWidth -
      offsetX}" y2="${stageHeight}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.5)"></line>`;
    }
  }
  //绘制横向分割线
  for (var y_i = 0; y_i < y_grid_num + groupNum; y_i++) {
    if (y_i % groupNum == 0) {
      svg += `<line x1="0" y1="${y_i * gridWidth -
      offsetY}" x2="${stageWidth}" y2="${y_i * gridWidth -
      offsetY}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.8)"></line>`;
    } else {
      svg += `<line x1="0" y1="${y_i * gridWidth -
      offsetY}" x2="${stageWidth}" y2="${y_i * gridWidth -
      offsetY}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.5)"></line>`;
    }
  }

  //绘制横向中线
  svg += `<line x1="0" y1="${stageCenterY}" x2="${stageWidth}" y2="${stageCenterY}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.5)"></line>`;
  //绘制纵向中线
  svg += `<line x1="${stageCenterX}" y1="0" x2="${stageCenterX}" y2="${stageHeight}" stroke-width="${lineWidth}" stroke="rgba(0,0,0,0.5)"></line>`;

  return svg;
};

export {
  createGridSvg,

}
