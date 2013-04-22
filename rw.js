// import the file system modual
var filesystem = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: filesystem.createReadStream('test/cyli.gcode'),
    output: process.stdout,
    terminal: false
});

just_copy = 0;

rd.on('line', function(line) {
    // remove line brake
    var line = line.replace(/(\n)/gm,"");
    // splite line
    var splited = line.split(' ');
    var first = splited[0];
    // is it a G1 line
    if (first.substring(0,2) == 'G1') {
        if (just_copy != 1) {
            var type = splited[1].substring(0,1);

            if (type == 'Z') {
               printline(line);
            }
            else if (type == 'X') {
                xyline(splited);
            }
            else {
            }

        } else {
            printline(line);
        }
    // is it a M line
    }  else {
        printline(line);
    }
});

function printline(line) {
    write_line(line);
}

function xyline(splited) {
    var x_num = parseFloat(splited[1].substring(1));
    var r = get_random();
    x_num = r + x_num;
    var y_num = parseFloat(splited[2].substring(1));
    r = get_random();
    y_num = r + y_num;
    line = splited[0] + ' X' + x_num + ' Y' + y_num;
    if (splited[3])
        line = line + ' ' + splited[3];
    if (splited[4])
        line = line + ' ' + splited[4];
    write_line(line);
}


function reset_values() {
    g_value = '';
    x_start = null;
    x_end = null;
    y_start = null;
}

function get_random() {
    r =  Math.floor(Math.random()* 2) - 1;
    return r;
}
function write_line(line) {
    filesystem.appendFile('test/new_c.gcode', line+'\n', function (err) {
        console.log(line)
    });
}

function start_g() {
    filesystem.appendFile('test/new.stl', 'G28\n', function (err) {
        console.log(line)
    });
}

function end_g() {
    filesystem.appendFile('test/new.stl', 'G92 Z10.0\n G28\n M84', function (err) {
        console.log(line)
    });
}

/*
%
G00 X0 Y0 F70
G01 Z-1 F50
G01 X0 Y20 F50
G01 X25 Y20
G01 X25 Y0
G01 X0 Y0
G00 Z0 F70
M30
%*/