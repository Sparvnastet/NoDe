
// import the file system modual
var filesystem = require('fs');

var x = -15,
    pass = 1,
    line = '',
    z = 4,
    z_adder = 0.25,
    fill = 233,
    i = 1;


    goal = 15;
    y = -15;
    z = z + z_adder;

new_write();

function new_write() {
    if (pass == 1) {
        if (x <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x + 5;
            write_line(line);
        } else {
            pass = 2
            x = 15;
            z = z + z_adder;
            line = '';
            write_line(line);
        }
    }

    if ( pass == 2) {
        if (y <= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y + 5;
            write_line(line);
        }  else {
            pass = 3
            y = 15;
            z = z + z_adder;
            line = '';
            goal = -15
            write_line(line);
        }
    }

    if ( pass == 3) {
        if (x >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            x = x - 5;
            write_line(line);
        }  else {
            pass = 4
            x = -15;
            z = z + z_adder;
            line = '';
            write_line(line);
        }
    }

    if ( pass == 4) {
        if (y >= goal) {
            line = 'G1 X'+x+' Y'+y+' Z'+z+' F'+fill;
            y = y - 5;
            write_line(line);
        }  else {
            pass = 1
            y = -15;
            z = z + z_adder;
            line = '';
            goal = 15
            write_line(line);
        }
    }
}

filesystem.watchFile('test/scraper.gcode', function (curr, prev) {
    console.log("new line");
    new_write();
});

function write_line(line) {
    filesystem.appendFile('test/scraper.gcode', line+'\n', function (err) {
    });
}
