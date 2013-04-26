
// import the file system modual
var filesystem = require('fs');

// process config and set initial data
var config = JSON.parse(filesystem.readFileSync("config.json"));
var usb_port = config.usb_port;
var z_adder = config.z_height;
var fill = config.filament_speed;
var frequency = config.frequency;
var pattern = config.pattern;
var x = 0,
    line = '',
    z = 0, // z_origin
    i = 1,
    r = 1,
    type = 'xplus',
    goal = 15,
    y = -16,
    watchfile = false,
    lead_value = 0.1;

if (pattern == 'data') {
    list = [67, 57, 53.5, 43, 34, 34, 31, 29, 28.2, 28, 27, 26.7, 26.5, 26.3, 26.1, 26, 25.2, 23, 22.8, 21.5, 20.4, 20.3, 20.3, 20, 20, 20, 19.5, 19.2,18.9, 18.2, 17.8, 17.6, 17.4, 17, 17, 17];
}



var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var util = require("util"), repl = require("repl");

var serial_port = new SerialPort("/dev/tty"+usb_port, {
    parser: serialport.parsers.readline("\n"),
    baudrate: 9600
});

serial_port.on("data", function (data) {
    new_write(data);
})

serial_port.on("error", function (msg) {
    util.puts("error: "+msg);
})
repl.start("=>")




function new_write(data) {

    if (type == 'xplus') {

        if (x <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x + 4;
            write_line(line, type);
        } else {
            type = 'yplus';
            x = 16;
            z = z + z_adder;
            write_line('');
        }
    }

    if (type == 'yplus') {
        if (y <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y + frequency ;
            write_line(line, data);
        }  else {
            y = 16;
            z = z + z_adder;
            goal = 0
            write_line('');
            type = 'xminus'
        }
    }

    if (type == 'xminus') {
        if (x >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x - 4;
            write_line(line, type);
        }  else {
            x = 0;
            z = z + z_adder;
            write_line('');
            type = 'yminus'
        }
    }

    if (type == 'yminus') {
        if (y >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y - 4;
            write_line(line, type);
        }  else {
            y = -16;
            z = z + z_adder;
            goal = 15
            write_line('');
            type = 'xplus'
        }
    }
}


function write_pattern(line, data) {
    if (line)
        var splited = clean_split(line.toString());

    if(splited != null)
        add_changes(splited, data);
}

if (watchfile) {
filesystem.watchFile('test/scraper_12.gcode', function (curr, prev) {
    console.log("new line");
    new_write();
});
}

// write a new set of gode lines
function write_line(line, data) {
    filesystem.appendFile('test/scraper_12.gcode', line+'\n', function (err) {
            if (r == 1) {
                write_pattern(line, data);
                r = 0;
            } else {
               r = 1;
            }
    });
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

                    if (pattern == 'spikes') {

                        var old_x_value = parseInt(splited[1].substring(1));
                        var old_y_value = parseInt(splited[2].substring(1));


                        var l1_y = start_pattern(old_y_value, lead_value);
                        splited[2] = 'Y'+l1_y;

                        var l1 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; start line ";


                        var change = parseInt(data)/100-5;
                        var l2_x = old_x_value + change; // ---> 1x

                        splited[1] = 'X'+l2_x;
                        var l2_y = l1_y + 0.35;
                        splited[2] = 'Y'+l2_y;
                        var l2 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; change line ";


                        var l3_y = l2_y + 0.35; // | 2y
                        splited[2] = 'Y'+l3_y;
                        var l3_x = old_x_value;
                        splited[1] = 'X'+l3_x

                        var l3 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; change back line ";

                        splited[1] = 'X'+old_x_value;

                        var l4_y = l3_y + 0.35;
                        splited[2] = 'Y'+l3_y;
                        var l4 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + ";  line ";

                        var l5_y = end_pattern(current_y, lead_value)

                        splited[2] = 'Y'+l5_y;

                        var l5 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; last line ";


                        var newlines = l1 + '\n' + l2 + '\n' + l3 + '\n' + l4;
                    }  else if (pattern == 'data') {

                        var my_random = list[list_key]/4;
                        var l2_x = old_x_value + my_random; // ---> 1x
                        splited[1] = 'X'+l2_x

                        var l2 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; random up line ";

                        var l3_y = old_y_value + 1.6; // | 2y
                        splited[2] = 'Y'+l3_y;

                        var l3 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; stop line ";

                        //var l4_x = old_y_value-parseFloat(my_random.toFixed(2));  // | 2y
                        splited[1] = 'X'+old_x_value;

                        var l4 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; down line ";

                        var l5_y = l3_y + 0.05;
                        splited[2] = 'Y'+l5_y;

                        var l5 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; last line ";


                        var newlines = l1 + '\n' + l2 + '\n' + l3 + '\n' + l4 + '\n' + l5;

                    }

                    write_line(newlines);

                }

            }
        }
    }
{


    write_line(newlines);

}


function start_pattern(old_y_value, lead_value) {
return old_y_value + lead_value;
}
function end_pattern(current_y, lead_value) {
    return old_y_value + lead_value;
}