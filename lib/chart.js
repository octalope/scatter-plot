'use strict';

const window   = require('svgdom');
const SVG      = require('svg.js')(window);
const svgDoc   = window.document;

var dataRange = (data) => {
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

  return {
    min: min,
    max: max
  };
};

var adjustRange = (min, max) => {
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
}


var bboxMax = (items, draw) => {
  var maxBox;
  items.forEach(item => {
    var text = draw.text(item).move('-100%','-100%');
    var b = text.bbox();

    if(!maxBox) {
      maxBox = b;
    } else if(b.width > maxBox.width || b.height > maxBox.height) {
      maxBox = b;
    }
  });

  return maxBox;
};


function createChart(options) {

  //console.log(JSON.stringify(options));

  // create svg.js instance
  const draw = SVG(svgDoc.documentElement).size(''+options.width,''+options.height);

  let xRange = dataRange(options.data.map(d => d.x));
  let yRange = dataRange(options.data.map(d => d.y));

  let xTickMarks = adjustRange(xRange.min, xRange.max);
  let yTickMarks = adjustRange(yRange.min, yRange.max);

  console.log(JSON.stringify({
    xRange: xRange,
    yRange: yRange,
    xTic: xTickMarks,
    yTic: yTickMarks
  }));

  var chart = draw.group();
  chart
    .rect('100%','100%')
    .stroke({
      color: 'red',
      width: 0.5
    })
    .fill('none')
    .move(0,0);


  var xAxis = chart.group();
  xAxis
    .rect('90%','5%')
    .stroke({
      color: 'none',
      opacity: 0.25,
      width: 0.5
    })
    .fill('#DDD')
    .move('10%','95%');

  var yAxis = chart.group();
  yAxis
    .rect('10%','95%')
    .stroke({
      color: 'none',
      opacity: 0.25,
      width: 0.5
    })
    .fill('#DDD')
    .move(0,0);

  var plotArea = chart.group();
  plotArea
    .rect('90%','95%')
    .stroke({
      color: 'none',
      opacity: 0.25,
      width: 0.5
    })
    .fill('#88F')
    .move('10%','0%');



  return draw.svg();
}

module.exports = {
  createChart: createChart
};
