
// import the file system modual
var filesystem = require('fs');
var lazy = require("lazy");
var nasty = ''
new lazy(filesystem.createReadStream('data/nasdaq.csv'))
    .lines
    .forEach(function(line){
        if (nasty.length < 16000) {
        splited = line.toString().split(',');
        num = splited[1];
        nasty = nasty + ','+ num.substring(1,5);
        }
    }
);

var key = 0;
var data =  ''; 

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
var file_name = config.file_name;
var dubbling = config.dubbling;
var leading = true; 

var y_size = config.y_size
  , y_1 = y_size*-1 
  , y_2 = y_size-1 
  , y_goal = y_size-1
  , y = y_1;

var x_size = config.x_size
  , x_1 = x_size
  , x_2 = (x_size*-1) 
  , x = x_2
  , x_goal = x_size
  , line = ''
  , i = 1
  , r = 1
  , type = 'xplus';

var write_space_unite = (y_size / frequency) - (lead_value * 2);

if (input == 'list') {
    list_key = -1;
    list = [67, 57, 53.5, 43, 34, 34, 31, 29, 28.2, 28, 27, 26.7, 26.5, 26.3, 26.1, 26, 25.2, 23, 22.8, 21.5, 20.4, 20.3, 20.3, 20, 20, 20, 19.5, 19.2,18.9, 18.2, 17.8, 17.6, 17.4, 17, 17, 17];
}

// init serial port read
if (input == 'serial') {
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
	});

	serial_port.on("error", function (msg) {
		util.puts("error: "+msg);
	});
}

var	collation = ''
  , p = 1
  , c = 0; // dubbling count

			
// write the base rectangle
function new_write() {
	var	list_key = 0;	
	var	old_key = key;
    for ( ;y >= y_1; y--) { 
        line = 'G1 X'+x+' Y'+y+' Z'+z+'\n';
        collation = collation + line;
    }

    for ( ;x <= x_1; x++) { 
        line = 'G1 X'+x+' Y'+y+' Z'+z+'\n';
        collation = collation + line;
    }

    for (; y <= y_2; y++) { 
        line = 'G1 X'+x+' Y'+y+' Z'+z+'\n';
        collation = collation + line;
    }

    for ( ;x >= x_2; x = x - frequency) {
	// if plain pattern else other patterns that need additional points 
	if (pattern == 'plain') {
        mod = get_change();
        line = 'G1 X'+x+' Y'+mod+' Z'+z+'\n';   
	} else {
		if (x >= x_2+frequency) {
        mod = add_changes(x, y ,z);
		newlines = ''; 
        line = mod;
		}
	}
        collation = collation + line;
    }
	
	// copy the lines dubbling times
    if (c < dubbling){
	    key = old_key;
        c++;
    } else {
         c = 0;
    }
    x++;
    line = 'G1 X'+x+' Y'+y+' Z'+z+'\n';
    collation = collation + line;
    w_write(collation);

}

n = 1;

// write the collacion of lines to file
function w_write(collation) {
filesystem.appendFile('test/'+file_name, collation+'\n', function (err) {
        if (p == 20){
        } else {
            z = z + z_adder;
            new_write()
            p++;
            n=1;
        }
	});
}

function split_string(line, data) {
    if (line)
        var splited = clean_split(line.toString());

    if(splited != null)
        add_changes(splited, data);
}

// use this function to make sure that data are written before we continue
function watchingfile() {
	filesystem.watchFile('test/'+file_name, function (curr, prev) {
		new_write();
		filesystem.unwatchFile('test/'+file_name);
	});
}

// write a new set of lines
function write_line(line, data) {
    if (pattern == 'nopattern') {
        var splited = clean_split(line);
        var line = get_one_line(splited, data);
        filesystem.appendFile('test/'+file_name, line+'\n', function (err) {
		});
    } else { // no pattern just plot
        filesystem.appendFile('test/'+file_name, line+'\n', function (err) {
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
    var splited = line.split(' ');
	console.log(splited); 
    return splited;
}

// when we need som random input
function get_random() {
    var r = Math.round(Math.random() *3);
    return r;
}

// Filters -----------------------
// take a splited string of gcode and returns a modulation on that
var newlines = '';

function add_changes(x, y, z) {	
    var x_value = x;
    var y_value = y;
	var z_value = z;
    var f_value = '200'; 
	var l0 = set_line('1', x_value, y_value, z_value, f_value, 'leading start');
	newlines = newlines + l0; 
	// if leading part 1
	if (leading == true) {
		var x_value = lead(x_value, lead_value);
		var l1 = set_line('1', x_value, y_value, z_value, f_value, 'leading start');
		newlines = newlines + l1; 
	}

    // if leading part 2
    var change = get_change(data);
    // add the chang to the current x_value
    y_value = Math.round( (y_value + change ) * 10) / 10;
	
	// set spaceing         
    if (pattern == 'spike') {
		space = Math.round( (write_space_unite/2)  * 10) / 10;
	} else if (pattern == 'dubblespike') {
		space = Math.round( (write_space_unite/3)  * 10) / 10;
	} else {
		space = Math.round( (write_space_unite/2)  * 10) / 10;
	}
	x_value = Math.round( (x_value - space)  * 10) / 10;
    var l2 = set_line('1', x_value, y_value, z_value, f_value, 'up');	
	newlines = newlines + l2; 
	
    // if leading part 3
	if (pattern == 'dubblespike') {
	   	x_value = Math.round( (x_value - space)  * 10) / 10;
        y_value = Math.round( (y_value - change*2 ) * 10) / 10;
    	var l3 = set_line('1', x_value, y_value, z_value, f_value, 'dubbel down');	
		newlines = newlines + l3; 
	} else if (pattern == 'rect') {
	   	x_value = Math.round( (x_value - space)  * 10) / 10;
    	var l3 = set_line('1', x_value, y_value, z_value, f_value, 'rect up');	
		newlines = newlines + l3; 
    } else {

	}

	if (pattern == 'spike' || pattern == 'rect') {
		x_value = Math.round( (x_value - space)  * 10) / 10;
        y_value = Math.round( (y_value - change ) * 10) / 10;               
	} else if (pattern == 'dubblespike') {
		x_value = Math.round( (x_value - space)  * 10) / 10;
        y_value = Math.round( (y_value + change ) * 10) / 10;
    } else {
	
	}
	
	var l4 = set_line('1', x_value, y_value, z_value, f_value, 'last');	

    newlines = newlines + l4; 

    if (leading == true) {
		var x_value = lead(x_value, lead_value)
		var l5 = set_line('1', x_value, y_value, z_value, f_value, 'leading end');
		newlines = newlines + l5;
	}	
    return newlines; 
}


// when not using any patterns
function get_one_line(data){
    var change = get_change(data);
    x_value = Math.round( (x + change ) * 10) / 10;
    y_value = Math.round( (y + write_space_unite/2)  * 10) / 10;
    var l2 = set_line('1', x_value, y_value, z, '199', 'up');
    return l2;
}

function lead(current, lead_value) {
    return Math.round( (current - lead_value) * 10) / 10;
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
	line = line + '\n';;
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
        return list[list_key]/5;
		
    // get data from csv file
    } else if (input == 'csv') {
		mod = get_data_by_key();
		mod = mod/2000;
		return mod;

    } else {
        return get_random();
    }

}

// help funnction to make a set of lines
function make_lines(l1, l2, l3, l4) {
    var newlines = l1 + '\n' + l2 + '\n' + l3 + '\n' + l4;
    return newlines;
}

// get csv data
function get_data_by_key() {
    key++;
    return nasty[key];
}

// use this so the data from the csv file is ready
setTimeout(function(){
    nasty = nasty.toString().split(',');
    new_write();
}, 2000);

