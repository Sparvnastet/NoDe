NoDe
====

During this winter Sparvnästet has been experimenting with 3d-printing. After been invited to showcasing our projects at Internetdagarna organized by .SE we have been elaborating on a continuation of this work. 

We are planning to explore the possibility to find a way to encode realtime data into the 3d-model. This project should logically include a relation to internet and therefore we would like to explore the possibilities to encode or use some kind of real time data into the extrusion line for instance stock market data. 

At Internetdagarna the project would draw the attention of a crowd by its animated nature. The project is an interactive real time sculpting project that visualizes facts and real time data into a 3d-model.

Software : Node.js and Arduino. 

There are two files for generating gcode. circle.js and retangle.js
Use the config json file to setup your parameters.

Set the position, radius, segments, scale, height, input and pattern of the model

Input:
* potentiometer with a arduino
* csv file
* lists 
* random

Patterns: 
* spikes
* plain 

Then test the to output some gcode
$ node circle.js 
$ node retangle.js

Use your preferd gcode viewer to look at the model. 
