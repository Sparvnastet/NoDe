
// import the file system modual
var filesystem = require('fs');
var lazy = require("lazy");
var nasty = []
new lazy(filesystem.createReadStream('data/nasdaq_cut.csv'))
    .lines
    .forEach(function(line){
        splited = line.toString().split(',');
        nasty = nasty + splited[1];
    }
);
var csv_key = 1;


// process config and set initial data in the json file
var config = JSON.parse(filesystem.readFileSync("config.json"));
var usb_port = config.usb_port;
var z_adder = config.z_height;
var fill = config.filament_speed;
var frequency = config.frequency;
var pattern = config.pattern;           // pattern can be; nopattern, spike, wave, square
var input = config.input;               // input can be; list, json, tcp, http, pot (serial potentiometer), random
var z = config.z_origin;
var lead_value = config.lead_value;

var y_size = config.y_size,
    y_goal = y_size-1,
    y = (y_goal * -1);

var x_size = config.x_size,
    x = x_size;
    x_goal = x_size;
    line = '',
    i = 1,
    r = 1,
    type = 'xplus';

var write_space_unite = ( y_size/((y_size*2)/frequency))-(lead_value*2);


if (input == 'list') {
    list_key = -1;
    list = [67, 57, 53.5, 43, 34, 34, 31, 29, 28.2, 28, 27, 26.7, 26.5, 26.3, 26.1, 26, 25.2, 23, 22.8, 21.5, 20.4, 20.3, 20.3, 20, 20, 20, 19.5, 19.2,18.9, 18.2, 17.8, 17.6, 17.4, 17, 17, 17];

}

// init serial port read
if (input = 'serial') {
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var util = require("util"), repl = require("repl");

var serial_port = new SerialPort("/dev/tty"+usb_port, {
    parser: serialport.parsers.readline("\n"),
    baudrate: 9600
});

serial_port.on("data", function (data) {
    // slow down the output rate
    if (i == 5) {
    new_write(data);
        i = 1
    } else {
        i++;
    }
})

serial_port.on("error", function (msg) {
    util.puts("error: "+msg);
})
} else {
    new_write(data);
}



// write the base rectangle
function new_write(data) {

    if (type == 'xplus') {

        if (x <= y_goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x + 1;
            write_line(line, type);
        } else {
            type = 'yplus';
            x = x_goal;
            write_line('');
        }
    }

    if (type == 'yplus') {
        if (y <= y_goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y + frequency;
            write_line(line, data);
        }  else {
            y = y_size;
            goal = x_goal
            write_line('');
            type = 'xminus'
        }
    }

    if (type == 'xminus') {
        if (x >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x - 1;
            write_line(line, type);
        }  else {
            x = 0;
            write_line('');
            type = 'yminus'
        }
    }

    if (type == 'yminus') {
        if (y >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y - 1;
            write_line(line, type);
        }  else {
            y = -16;
            z = z + z_adder;
            goal = y_goal
            write_line('');
            type = 'xplus'
            list_key = 0;
            watchingfile();
        }
    }
}


function write_pattern(line, data) {
    if (line)
        var splited = clean_split(line.toString());

    if(splited != null)
        add_changes(splited, data);
}

// use this function to make sure that data are written before we continue
function watchingfile() {
filesystem.watchFile('test/scraper_13.gcode', function (curr, prev) {
    console.log("new set");
    new_write();
    filesystem.unwatchFile('test/scraper_13.gcode');
});
}

// write a new set of gode lines
function write_line(line, data) {
    if (pattern == 'nopattern') {
        var splited = clean_split(line);
        var line = get_one_line(splited, data);

        filesystem.appendFile('test/scraper_13.gcode', line+'\n', function (err) {

        });

    } else { // no pattern just plot
        filesystem.appendFile('test/scraper_13.gcode', line+'\n', function (err) {
            if (r == 1) {
                write_pattern(line, data);
                r = 0;
            } else {
                r = 1;

            }
        });


    }
}


// help function per line
function clean_split(line) {
    if (line == '0') {
        return null;
    } else {
        // splite line
        var splited = line.split(' ');
        return splited;
    }
}

// when we need som random input
function get_random() {
    var r = Math.round(Math.random() *3);
    return r;
}


// Filters -----------------------

function add_changes(splited, data) {
    // 1:X 2:Y 3:Z 4:F
    if (data) {
        if (splited[1]) {
            if (type == 'yplus') {

                var g_value = parseInt(splited[0].substring(1));
                var x_value = parseInt(splited[1].substring(1));
                var y_value = parseInt(splited[2].substring(1));
                var z_value = parseInt(splited[3].substring(1));
                var f_value = parseInt(splited[4].substring(1));

                var base = x_value;

                var y_value = lead(y_value, lead_value);
                var l1 = set_line(g_value, base, y_value, z, f_value, 'leading start');

                var change = get_change(data);
                x_value = Math.round( (x_value + change ) * 10) / 10;
                y_value = Math.round( (y_value + write_space_unite/2)  * 10) / 10;

                var l2 = set_line(g_value, x_value, y_value, z, f_value, 'up');

                x_value = Math.round( (x_value - change ) * 10) / 10;
                y_value = Math.round( (y_value + write_space_unite/2)  * 10) / 10;
                var l3 = set_line(g_value, base, y_value, z, f_value, 'down');

                var y_value = lead(y_value, lead_value)
                var l4 = set_line(g_value, x_value, y_value, z, f_value, 'leading end');


                var newlines =  make_lines(l1, l2, l3, l4);

                console.log(newlines);
                write_line(newlines);

            }
        }
    }
}

// when not using any patterns
function get_one_line(data){
    var change = get_change(data);
    x_value = Math.round( (x + change ) * 10) / 10;
    y_value = Math.round( (y + write_space_unite/2)  * 10) / 10;
    var l2 = set_line('1', x_value, y_value, z, '199', 'up');
    return l2;
}
function lead(current_y, lead_value) {
    return Math.round( (current_y + lead_value) * 10) / 10;
}


// help function to set construct a line
function set_line(g, x, y, z, fill, comment) {
    var line = 'G'+ g + ' X' + x + ' Y' + y +' Z' + z;

    if (fill){
        line = line + ' F' + fill;
    }

    if (comment) {
        line = line + ' ;' + comment;
    }

    return line;
}

function get_change(data) {
    // get data from potentiometer
    if (input == 'pot') {
        var change = parseInt(data)/100-5;
        return change;
     // get data from list
    } else if (input == 'list') {
        list_key = list_key + 1;
        return list[list_key]/10;

    } else if (input == 'csv') {
    csv_key = csv_key + 1;
    console.log("sss");
    return nasty[csv_key]/500;


    } else {
        return get_random();
    }

}
// help funnction to make a set of lines
function make_lines(l1, l2, l3, l4) {
    var newlines = l1 + '\n' + l2 + '\n' + l3 + '\n' + l4;
    return newlines;
}
