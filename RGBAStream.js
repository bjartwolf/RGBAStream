// This module is in many ways a rip-off from https://github.com/TooTallNate/node-drone-video
// It does require a recent build of FFMPEG, I followed:
// https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide

var spawn = require('child_process').spawn;
var Stream = require('stream');

// Data skal pipes inn i RGBA stream

var h = 180;
var w = 320;
// Should make a string of res and put in spawn ffmpeg
var nrOfPixels = w*h;

var RGBAStream = function RGBAStream() {
   var videoEncoder = this._initVideoEncoder(); 
   var rgba = [];
   var _buf = new Buffer(0);
   var nrOfBytesPrImage = nrOfPixels*4; 

   var rgbaStream = new Stream();
   rgbaStream.writable = true;
   rgbaStream.pipe = function (stream) {
        stream.pipe(videoEncoder);                
   }

   videoEncoder.stdout.on('data', function (buffer) {
       _buf = Buffer.concat([_buf, buffer]);
         if (_buf.length > nrOfBytesPrImage) {
            for (var i = 0; i < nrOfPixels-3; i+=4) {
                rgba[i] = _buf.readUInt8(i); 
                rgba[i+1] = _buf.readUInt8(i+1); 
                rgba[i+2] = _buf.readUInt8(i+2); 
                rgba[i+3] = 0; // Alpha channel should be 0, no need to parse, even noe need to set it except init
            }
         rgbaStream.emit('data', this.rgba); 
         _buf = _buf.slice(nrOfBytesPrImage);
        };
   });
   return rgbaStream;
}

RGBAStream.prototype._initVideoEncoder = function () {
    return spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'rawvideo',
    '-analyzeduration', '0',
    '-s', '320x180',
    '-pix_fmt', 'rgba',
    '-r', '29.97', 
    'pipe:1'
  ]);
};

module.exports = RGBAStream;
