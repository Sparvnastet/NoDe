
// import the file system modual
var filesystem = require('fs');

var x = 0,
    pass = 1,
    line = '',
    z = 4,
    z_adder = 0.25,
    fill = 233,
    i = 1,
    r = 1,
    type = 'xplus';


    goal = 16;
    y = -16;
    z = z + z_adder;

new_write();

function new_write() {
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
            y = y + 2;
            write_line(line, type);
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
            goal = 16
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

filesystem.watchFile('test/scraper_7.gcode', function (curr, prev) {
    console.log("new line");
    new_write();
});



function write_line(line) {
    filesystem.appendFile('test/scraper_7.gcode', line+'\n', function (err) {

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


// 1:X 2:Y 3:Z 4:F

function add_changes(splited) {
    // 1:X 2:Y 3:Z 4:F

    if (splited[1]) {
        if (type == 'yplus') {
            var old_x_value = parseInt(splited[1].substring(1));
            var old_y_value = parseInt(splited[2].substring(1));

            var l1_y = old_y_value + 0.1; // | 2y
            splited[2] = 'Y'+l1_y;

            var l1 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; start line ";

            var my_random = get_random();
            var l2_x = old_x_value + my_random; // ---> 1x
            splited[1] = 'X'+l2_x

            var l2 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; random up line ";

            var l3_y = old_y_value + 1.4; // | 2y
            splited[2] = 'Y'+l3_y;

            var l3 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; stop line ";

            //var l4_x = old_y_value-parseFloat(my_random.toFixed(2));  // | 2y
            splited[1] = 'X'+old_x_value;

            var l4 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; down line ";

           /* var l5_y = l3_y + 0.1; // |
            splited[2] = 'Y'+l5_y;

            var l5 = splited[0] + ' ' + splited[1] + ' ' + splited[2] + ' ' + splited[3] + ' ' + splited[4] + "; last line "; */


            var newlines = l1 + '\n' + l2 + '\n' + l3 + '\n' + l4;
            write_line(newlines);
        }
    }
}

function get_random() {
    r = Math.round(Math.random() *3);
    return r;
}
