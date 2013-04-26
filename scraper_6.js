
// import the file system modual
var filesystem = require('fs');

var x = -15,
    pass = 1,
    line = '',
    z = 4,
    z_adder = 0.25,
    fill = 233,
    i = 1,
    r = 1,
    type = 'xplus';


    goal = 15;
    y = -15;
    z = z + z_adder;

new_write();

function new_write() {
    if (type == 'xplus') {
        if (x <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x + 5;
            write_line(line, type);
        } else {
            type = 'yplus';
            x = 15;
            z = z + z_adder;
            write_line('');
        }
    }

    if (type == 'yplus') {
        if (y <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y + 5;
            write_line(line, type);
        }  else {
            y = 15;
            z = z + z_adder;
            goal = -15
            write_line('');
            type = 'xminus'
        }
    }

    if (type == 'xminus') {
        if (x >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x - 5;
            write_line(line, type);
        }  else {
            x = -15;
            z = z + z_adder;
            write_line('');
            type = 'yminus'
        }
    }

    if (type == 'yminus') {
        if (y >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y - 5;
            write_line(line, type);
        }  else {
            y = -15;
            z = z + z_adder;
            goal = 15
            write_line('');
            type = 'xplus'
        }
    }
}


function write_random(line) {
    if (line)
        var splited = clean_split(line.toString())

    if(splited != null)
        add_changes(splited);
}

filesystem.watchFile('test/scraper_5.gcode', function (curr, prev) {
    console.log("new line");
    new_write();
});



function write_line(line) {
    filesystem.appendFile('test/scraper_5.gcode', line+'\n', function (err) {

            if (r == 1) {
                write_random(line);
                r = 0;
            } else {
               r = 1;
            }
    });
}


function clean_split(line) {
    if (line == '0') {
        return null;
    } else {
        // splite line
        var splited = line.split(' ');
        return splited;
    }
}

function add_changes(splited) {
    if (splited[1]) {
        if (type == 'yplus') {
        var old_value = parseInt(splited[1].substring(1));
        var random = get_random();
        var new_value = old_value + parseFloat(random);
        splited[1] = 'X'+new_value;
        var newline = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; random line ";
        write_line(newline);
        }
    }
}

function get_random() {
    r =  Math.random().toFixed(2);
    return r;
}
