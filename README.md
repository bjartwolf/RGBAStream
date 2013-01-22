# RGBA Stream for NodeCopter

It does require a recent build of FFMPEG, I followed:
https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide
On mac some instructions are given on TooTallNate node-drone-video module

And error handling ... well... Non-existent, yes.

Tried to code in a somewhat similar style to how the PaVEstream in the ar-drone module was written for consistency

Thanks to TooTallNate, I took most of the ideas by looking at https://github.com/TooTallNate/node-drone-video


TODO: Optimize the buffer and parsing. It is slow. Should just parse data and throw away, should work...
