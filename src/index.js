'use strict';

const fs       = require('fs');
const jsdom    = require('jsdom');
const chart    = require('../lib/chart');

var indices    = Array.apply(null, {length: 10}).map(Number.call, Number);
var data = indices.map(i => {
  var f = x => Math.sin(x);
  var x = (i/(indices.length-1)) * Math.PI;
  return { x: x, y: f(x) };
});

function wrapSvgInHtmlDoc(svg) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM('<!DOCTYPE html>');

  var newDiv = dom.window.document.createElement('div');
  newDiv.innerHTML = svg;
  var currentDiv = dom.window.document.getElementById('div1');
  dom.window.document.body.insertBefore(newDiv, currentDiv);

  return dom.window.document.documentElement.outerHTML;
}

fs.writeFile('./src/chart.html', wrapSvgInHtmlDoc(chart.createChart({
  width: 600,
  height: 400,
  data: data
})), function (err){
  if (err) throw err;
});

