var filesystem = require('fs');

var lazy = require("lazy");

var nasty = ''
key = 1;

new lazy(filesystem.createReadStream('data/nasdaq.csv'))
    .lines
    .forEach(function(line){
        splited = line.toString().split(',');
        num = splited[1];

        nasty = nasty + ','+ num.substring(1,5);
    }
);
var csv_key = 1;


var j = 0;
var i = 0;
var x = 20;
var y = 20;
centerX = 10;
centerY = 10;
radius_f = 7;
segments = 50;
height = 16;
var circle = '';
var line = '';

function getCirclePoints(centerX, centerY, radius_f, segments, height){
    var l = nasty.length;
    if (j < height) {

        var z = j;
        j++;

        for(var i=0; i<segments; i++){
            if (i%2==0) {
                var rand_ = get_change();
                rand_ = parseFloat(rand_, 10);
                rand = rand_ / 1000;
                radius = radius_f + rand -3;
            } else {
                radius = radius_f;
            }
            console.log(radius)
            x = Math.round((centerX + radius * Math.sin(i * 2 * Math.PI / segments)) * 10) / 10;
            y = Math.round((centerY + radius * Math.cos(i * 2 * Math.PI / segments)) * 10) / 10;

            line = 'G1 X'+ x+' Y'+y+' Z'+z+' F200\n';



            circle = circle + line;
        }
        wfile(circle);
        circle = '';
    } else {

    }


}



function wfile(circle) {
    filesystem.appendFile('test/circle_rand_nas.gcode', circle+'\n', function (err) {
        circle = '';

        getCirclePoints(centerX, centerY, radius_f, segments, height);
   });

}




// when we need som random input
function get_random() {
    var r = Math.random();
    return r;
}

function get_change() {
    key++;
    console.log(nasty[key])
    return nasty[key];
}

setTimeout(function(){
    getCirclePoints(centerX, centerY, radius_f, segments, height);
    nasty = nasty.toString().split(',');

}, 3000);

