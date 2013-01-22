var PaVEParser = require('ar-drone/lib/video/PaVEParser');
var net = require('net');
var RGBAStream = require('./RGBAStream.js');

var parser = new PaVEParser();
var RGBA = new RGBAStream();
parser.pipe(RGBA);

var socket = net.connect({ host: '192.168.1.1', port: 5555});
socket.pipe(parser);
