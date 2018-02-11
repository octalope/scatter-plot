'use strict';

var fs         = require('fs');
const jsdom    = require('jsdom');
const chart    = require('../lib/chart');

function wrapSvgInHtmlDoc(svg) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM('<!DOCTYPE html>');

  var newDiv = dom.window.document.createElement('div');
  newDiv.innerHTML = svg;
  var currentDiv = dom.window.document.getElementById('div1');
  dom.window.document.body.insertBefore(newDiv, currentDiv);

  return dom.window.document.documentElement.outerHTML;
}

fs.writeFile('./src/chart.html', wrapSvgInHtmlDoc(chart.createChart()), function (err){
  if (err) throw err;
});

