'use strict';

var fs         = require('fs');
const jsdom    = require('jsdom');
const chart    = require('../lib/chart');


// const window   = require('svgdom')
// const SVG      = require('svg.js')(window)
// const svgDoc   = window.document


// function createChart() {
//   // create svg.js instance
//   const draw = SVG(svgDoc.documentElement)

//   // use svg.js as normal
//   draw.rect(30,20).fill('blue').move(50,50);

//   return draw;
// }

// createChart();

function wrapSvgInHtmlDoc(svg) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(`<!DOCTYPE html>`);
  const { document } = dom.window;
  
  var newDiv = dom.window.document.createElement('div'); 
  newDiv.innerHTML = svg;
  var currentDiv = dom.window.document.getElementById("div1"); 
  dom.window.document.body.insertBefore(newDiv, currentDiv); 

  return dom.window.document.documentElement.outerHTML;
}

fs.writeFile('./src/chart.html', wrapSvgInHtmlDoc(chart.createChart()), function (err){
  if (err) throw err;
});

