'use strict';

const window   = require('svgdom')
const SVG      = require('svg.js')(window)
const svgDoc   = window.document

function createChart() {
  // create svg.js instance
  const draw = SVG(svgDoc.documentElement)

  // use svg.js as normal
  draw.rect(30,10).fill('blue').move(50,50);

  return draw.svg();
}


module.exports = {
  createChart: createChart
};
