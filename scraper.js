// import the file system modual
var pass = 1;
var first = 0;
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB1", {
    baudrate: 57600,
    bytesize:8,
    parit:'N',
    stopbits:1,
    timeout:0.25
});

serialPort.on("open", function () {
    console.log('open');
    serialPort.on('data', function(data) {
        console.log('data received: ' + data);
    });

});



var filesystem = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: filesystem.createReadStream('test/cyli.gcode'),
    output: process.stdout,
    terminal: false
});


just_copy = 0;

rd.on('line', function(line) {
    if (first != 0) {
    var splited = clean_split(line);
    var first = splited[0];
    // is it a G1 line

    if (first.substring(0,2) == 'G1') {
        if (just_copy != 1) {
            var type = splited[1].substring(0,1);

            if (type == 'Z') {
                printline(line);

            }
            else if (type == 'X') {
                xyline(splited, line);
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
    first = 1;
    }
    next = next_line(splited);
});


function next_line(splited) {
    return splited;
}


function clean_split(line) {
    // remove line brake
    var line = line.replace(/(\n)/gm,"");
    // splite line
    var splited = line.split(' ');
    return splited;
}

function printline(line) {
    write_line(line);
    print_data(line);

}

function xyline(splited, line) {
    var x_num = parseFloat(splited[1].substring(1));
    var r = get_random();
    x_num = r + x_num;
    var y_num = parseFloat(splited[2].substring(1));
    r = get_random();
    y_num = r + y_num;
    linenew = splited[0] + ' X' + x_num + ' Y' + y_num;
    if (splited[3])
        linenew = linenew + ' ' + splited[3];
    if (splited[4])
        linenew = linenew + ' ' + splited[4];
    printline(line);
    printline(linenew);
    reset_values();

}



function reset_values() {
    g_value = '';
    x_start = null;
    x_end = null;
    y_start = null;
    linenew = null;
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


function print_data(line) {
    serialPort.write(line, function(err, results) {
        console.log('err ' + err);
        console.log('results ' + results);
    });
}