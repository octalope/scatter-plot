'use strict';

const window   = require('svgdom');
const SVG      = require('svg.js')(window);
const svgDoc   = window.document;

const axisFont = {
  family: 'Helvetica',
  size: 10,
  //anchor: 'middle'
};

const dataRange = (data) => {
  var min;
  var max;

  data.forEach(x => {
    if(typeof min === 'undefined') {
      min = x;
    } else if(x < min) {
      min = x;
    }

    if(typeof max === 'undefined') {
      max = x;
    } else if(x > max) {
      max = x;
    }
  });

  let extraBorder = (max - min) * 0.001;

  return {
    min: min - extraBorder,
    max: max + extraBorder
  };
};

const adjustRange = (min, max) => {
  if(min >= max) {
    throw new Error('min >= max');
  }

  let range = Math.abs(min - max);	        // Calculate range of data.
  let logb10 = Math.log10(range);	          // Determine order of magnitude of range.

  let power = 0;
  if(logb10 >= 0) {									        // Correct for magnitudes of fractions.
    power = Math.trunc(logb10);				      // i.e. 0 < numbers < 1.
  } else {
    power = Math.trunc(logb10)-1;
  }

  let norm = Math.pow(10.0, logb10-power);	// Calculate normalized mantissa.

  let tics = 1.0;
  if(norm <= 2.0)	{                         // Determine closest 'pretty number' for mantissa.
    tics = 0.2;                             // 1/5,
  } else if(norm <= 2.5) {
    tics = 0.25;                            // 1/4,
  } else if(norm <= 5.0) {
    tics = 0.5;                             // 1/2,
  } else {
    tics = 1.0;											        // or 1.
  }

  let mag = Math.pow(10.0, Math.abs(power));// Calculate original order of magnitude.

  mag = (power < 0) ? (1.0/mag) : mag;      // Correct for magnitudes of fractions.

  let step = tics * mag;                    // Calculate increment.

  let start = Math.floor(Math.abs(min/step))*(step);	// Calculate lower limit.

  start *= (min < 0) ? -1 : 1;              // Fix negative numbers.

  while(start > min) {                      // Verify start is less than min.
    start -= step;
  }

  let stop = start;
  while((stop+step) <= max) {               // Calculate upper limit.
    stop+=step;
  }

  if(max > stop) {                          // verify min is within the range.
    stop += step;
  }

  if(min < start) {                         // verify max is within the range.
    start -= step;
  }

  return {
    min: start,
    max: stop,
    inc: step,
  };
};

const makeTicLabels = (min, max, inc) => {
  var labels = [];
  var tic = min;

  while(tic <= max) {
    labels.push({
      value: tic,
      label: tic.toFixed(2)
    });
    tic += inc;
  }

  return labels;
};

const bboxMax = (items, draw) => {
  var maxBox;
  items.forEach(item => {
    var text = draw.text(item).move('-100%','-100%')
      .font(axisFont);
    var b = text.bbox();

    if(!maxBox) {
      maxBox = b;
    } else if(b.width > maxBox.width || b.height > maxBox.height) {
      maxBox = b;
    }
  });

  return maxBox;
};

const mapValue = (datum, dataRect, plotRect) => {
  var p = {
    x: plotRect.x0 + Math.round(((plotRect.x1 - plotRect.x0) * ((datum.x - dataRect.x0) / (dataRect.x1 - dataRect.x0)))),
    y: plotRect.y1 - Math.round(((plotRect.y1 - plotRect.y0) * ((datum.y - dataRect.y0) / (dataRect.y1 - dataRect.y0))))
  };

  console.log(JSON.stringify({
    datum: datum,
    dataRect: dataRect,
    plotRect: plotRect,
    p: p
  }, null, 2));

  return p;
};


function createChart(options) {

  const draw = SVG(svgDoc.documentElement)
    .size(options.width, options.height);

  let xRange = dataRange(options.data.map(d => d.x));
  let yRange = dataRange(options.data.map(d => d.y));

  let xTickMarks = adjustRange(xRange.min, xRange.max);
  let yTickMarks = adjustRange(yRange.min, yRange.max);

  let xLabels = makeTicLabels(xTickMarks.min, xTickMarks.max, xTickMarks.inc);
  let yLabels = makeTicLabels(yTickMarks.min, yTickMarks.max, yTickMarks.inc);

  let xBoxMax = bboxMax(xLabels.map(l => l.label), draw);
  let yBoxMax = bboxMax(yLabels.map(l => l.label), draw);

  let dataRect = {
    x0: xTickMarks.min,
    y0: yTickMarks.min,
    x1: xTickMarks.max,
    y1: yTickMarks.max
  };

  let plotRect = {
    x0: xBoxMax.width * 2,
    y0: (yBoxMax.height / 2),
    x1: options.width - (xBoxMax.width / 2),
    y1: options.height - (yBoxMax.height * 2)
  };

  let pointRadius = 3;

  console.log(JSON.stringify({
    options: options,
    xRange: xRange,
    yRange: yRange,
    xTic: xTickMarks,
    yTic: yTickMarks,
    xLabels: xLabels,
    yLabels: yLabels,
    xBoxMax: xBoxMax,
    yBoxMax: yBoxMax,
    dataRect: dataRect,
    plotRect: plotRect
  }, null, 2));

  var chart = draw.group();

  chart
    .rect(plotRect.x1-plotRect.x0, plotRect.y1-plotRect.y0)
    .stroke({
      color: 'black',
      width: 1
    })
    .fill('#fff')
    .move(plotRect.x0, plotRect.y0);

  let halfPointRadius = pointRadius / 2;
  options.data.forEach(datum => {
    let point = mapValue(datum, dataRect, plotRect);

    chart.circle(pointRadius)
      .fill('blue')
      .stroke({
        color: 'blue',
        width: 1
      })
      .move(point.x-halfPointRadius, point.y-halfPointRadius);
  });

  yLabels.forEach(label => {
    let point = mapValue({
      x: 0,
      y: label.value
    }, dataRect, plotRect);

    chart.text(label.label)
      .font(axisFont)
      .move(yBoxMax.width/2, point.y-(yBoxMax.height/2));

    chart.line((yBoxMax.width * 2), point.y, (yBoxMax.width * 2.5) - (yBoxMax.width/5), point.y)
      .stroke({ width: 1 });

    chart.line((yBoxMax.width * 2), point.y, plotRect.x1, point.y)
      .stroke({
        fill: '#eee',
        width: 0.1
      });

  });

  xLabels.forEach(label => {
    let point = mapValue({
      x: label.value,
      y: 0
    }, dataRect, plotRect);

    chart.text(label.label)
      .font(axisFont)
      .move(point.x-(xBoxMax.width / 2), plotRect.y1 + (xBoxMax.height*3/4));

    chart.line(point.x, plotRect.y1, point.x, plotRect.y1 + (xBoxMax.height / 2))
      .stroke({ width: 1 });

    chart.line(point.x, plotRect.y0, point.x, plotRect.y1)
      .stroke({
        fill: '#eee',
        width: 0.1
      })
  });

  chart.rect(plotRect)
    .stroke({
      color: 'red',
      width: 1
    });

  return draw.transform({
    scale: 1.00,
  }).svg();
}

module.exports = {
  createChart: createChart
};
