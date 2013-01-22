// This module is inspired and a lot is copied from from https://github.com/TooTallNate/node-drone-video
// It does require a recent build of FFMPEG, I followed:
// https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide
// On mac some instructions are given on TooTallNates side

// And error handling ... well...
// Tried to code according to how the PaVE stream in ardrone was written for consistency

var util   = require('util');
var spawn = require('child_process').spawn;
var Stream = require('stream').Stream;

module.exports = RGBAStream;
util.inherits(RGBAStream, Stream);
// Data skal pipes inn i RGBA stream

// This should probably be init options to constructor, refactor later
// Something like options = {height:...
var h = 180;
var w = 320;
// Should make a string of res and put in spawn ffmpeg
var nrOfPixels = w*h;

function RGBAStream() {
   var self = this;
   console.log('RGBA Stream constuctor called');
   Stream.call(this);
   this.writable = true;
   this.readable = true;

   this.videoEncoder = this._initVideoEncoder(); 
   this.rgba = [];
   this._buf = new Buffer(0);
   var nrOfBytesPrImage = nrOfPixels*4; 

   this.videoEncoder.stdout.on('data', function (buffer) {
       console.log('Videoencoder outputting data');
       // Just append the videodata to exising buffer
       self._buf = Buffer.concat([self._buf, buffer]);
       // When there is enough data for one frame, go get it out
       // Should perhaps be while in case enough data is in
       if (self._buf.length > nrOfBytesPrImage) {
           for (var i = 0; i < nrOfPixels-3; i+=4) {
                self.rgba[i] = self._buf.readUInt8(i); 
                self.rgba[i+1] = self._buf.readUInt8(i+1); 
                self.rgba[i+2] = self._buf.readUInt8(i+2); 
                self.rgba[i+3] = 0; // Alpha channel should be 0, no need to parse, even noe need to set it except init
            }
          // Emit the parsed data
          self.emit('data', self.rgba); 
          console.log(self.rgba);
          // Remove the parsed data from the buffer
          self._buf = self._buf.slice(nrOfBytesPrImage);
       };
   });
}
RGBAStream.prototype.write = function (buffer) {
    this.videoEncoder.stdin.write(buffer.payload);
}

//RGBAStream.prototype.pipe = function (stream) {
//    stream.pipe(this.videoEncoder);                
//}

RGBAStream.prototype._initVideoEncoder = function () {
    console.log('init videoencoder'); 
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

