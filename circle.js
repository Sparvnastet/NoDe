console.log('Staring timeout for process'); 

// require npm packages
var filesystem = require('fs');
var lazy = require("lazy");

// import common functions 
var modules = require('./modules.js');

// process config and set initial data in the json file
var config = JSON.parse(filesystem.readFileSync("config_circle.json"));

// set values from config file
var x = config.x; // 
var y = config.y; // 
var centerX = config.center_x; // 100 - place the model in the middle of the print plan
var centerY = config.center_y; // 100 - place the model in the middle of the print plan
var radius = config.radius; // 
var radius_f = radius;
var segments = config.segments; // 
var height = config.total_height; //
var scale_x = config.scale_x;  // 
var scale_y = config.scale_y;  // 
var scale_z = config.scale_z;  //
var xy_factor = config.xy_factor;  // 
var filament_diameter = config.filament_diameter; // 
var spikes = config.spike_length;
filename = config.file_name+'.gcode';  // make it global
var circle = '';
var line = '';
var add_z = filament_diameter+0.1;
var filament_diffrence = config.filament_diffrence; 
var extruder_diffrence = config.extruder_diffrence ;
var extruder_mod = config.extruder_mod; 
var radius_factor = config.radius_factor; 
var input = config.input; 
var filament = config.filament; 


if (input == 'serial') 
	var usb_port = config.usb_port; 
	console.log('Input port: '+usb_port); 
	
if (input == 'csv') {
	var data_file = config.data_file;  
	// 2518 data points
	height = Math.round(2518 / segments); 
	segments = segments * 2;  
	}
 
console.log('Input: '+input); 

var pattern = config.pattern; 

console.log('Pattern: '+pattern); 

var slow_write = config.slow_write; 

scale_factor = false;
the_xy_factor = 1;  

var dubbling =  config.dubbling; 
var data_from_file = ''
var key = 0;
var csv_key = 1;
var i = 0,
    j = 0,  
	z = 0;
var dubble_lines = ''; 


// init data and start writing to file
function init_data() {
	var starting_lines =  '; sparvnastet.org \nG21 ; set units to millimeters \nM107 ; fan off \nM104 S200 ; set temperature \n' +
					'G28 ; home all axes \nG1 Z5 F5000 ; lift nozzle \n\nM109 S200 ; wait for temperature to be reached \n' +
					'G90 ; use absolute coordinates \nG92 E0 ; extrusion zero \nM82 ; use absolute distances for extrusion \n' +
					'G1 F1800.000 E-1.00000 \nG92 E0 ; extrusion zero \nG1 Z0.350 F7800.000\n\n'+
					'G1 X'+centerX+' Y'+centerX+' ; set staring position' +
					'\nG1 F1800.000 E1.00000 ; filament push and extrude start? \nG1 F540.000 ; filament speed \nM101 \n\n' +
					';center x, y: '+ centerX+' , '+ centerY +
					'\n;radius: '+ radius_f + 
					'\n;segments: ' + segments + 
					'\n;height: '+ height + 
					'\n;height per circle: ' + add_z + 
					'\n;dubbling lines: ' + dubbling + 
					'\n;input: ' + input + 
					'\n;pattern: ' + pattern +
					'\n;z add: ' + add_z +  
					'\n;useing filament diffrence: ' + filament_diffrence + 
					'\n;useing extruder diffrence: ' + extruder_diffrence + '\n\n'; 
			
			
console.log('center x, y: '+ centerX+' , '+ centerY + 
			'\nradius: '+ radius_f + 
			'\nsegments: ' + segments + 
			'\ntotal_height: '+ height + 
			'\nheight per circle: ' + add_z + 
			'\nuseing filament diffrence: ' + filament_diffrence + 
			'\nuseing extruder diffrence: ' + extruder_diffrence); 

	setTimeout(function(){
		write_copy(starting_lines);
		first = 0; 
		key_data = data_from_file.toString().split(',');
		console.log('Writing model'); 
		make_circle(centerX, centerY, radius_f, segments, height); 
	}, 2000);
}


// make the each circle with parameters and dubble it if specified
function make_circle(centerX, centerY, radius_f, segments, height, data){
 
    if (j < height) {	
		s_add = 1;
		
		// for every segment in each circle - makes a turn of new data
        for(var i=0; i<segments; i++){		
		    
			// save previous x and y values to calculate the distance
			old_x = x;
			old_y = y;
			
			radius = get_radius(data, i)
			
			// getting x and y from specified values 
			x = Math.round((centerX + radius * Math.sin(i * 2 * Math.PI / segments)) * 10) / 10;
			y = Math.round((centerY + radius * Math.cos(i * 2 * Math.PI / segments)) * 10) / 10;

			// scaling
			x = Math.round(((x * scale_x * 10) / 10));
			y = Math.round(((y * scale_y * 10) / 10));
		
			if (xy_factor) {	
				xy_tranform();
			}

			line = 'G1 X'+ x+' Y'+y;

			if (filament_diffrence) {
				line = line + ' F'+filament;
			}

			if (extruder_diffrence) {
				distance = extruction_value();
				line = line + ' E'+distance; 
			}
			
			line = line + '\n';
		
			circle = circle + line;		
			
		} 
		save_circle = circle;
	
		for (var n=0; n<dubbling; n++) {
			z = j;
			z = Math.round(z * scale_z * 10) / 10; 
			var zline = 'G1 Z'+z+'\n';
			j = j + add_z;
			circle = zline + save_circle; 
			write_copy(circle);
		}
		 write_new_data(circle);
		circle = '';
		
    }

}

// write a copy of a circle when we only change the z-axes
function write_copy(circle) {
	filesystem.appendFile('test/'+filename, circle+'\n', function (err) {			
   });
}

// write a copy of a circle with new data
function write_new_data(circle) {
    filesystem.appendFile('test/'+filename, circle+'\n', function (err) {
		circle = '';
				
		// narrow model
		if (radius_factor) {
		radius_f = radius_f - radius_factor; 
		}
		
		if (input != 'serial') {
			make_circle(centerX, centerY, radius_f, segments, height, key_data);
		}
	
   });
}

// functions of circle ------------->

// get new data
function new_data(data) {
	var new_value = get_change(data);
	old_radius = radius;				
	new_value = parseFloat(new_value, 10);
	radius = radius_f + new_value + spikes;
	console.log(radius); 	
	return Math.round(radius * 10) / 10;
}

// get radius data with or without spikes
function get_radius(data, i) {
	if (pattern == 'spikes') {
		console.log(i)
		if (i%2==0) {
			radius = new_data(data);
		} else {
			radius = radius_f;
		}
	
	} else {
		 radius = new_data(data);
	}
	return radius; 
}

// tranform the model along the xy axel for each new data set
function xy_tranform() {
	x = x - the_xy_factor;
	y = y - the_xy_factor;
	the_xy_factor = the_xy_factor + xy_factor;
}

// find the distance of the points to know how much we need to extrude
function extruction_value(){
	distance = modules.line_distance( old_x, x, old_y, y);
	distance = distance * extruder_mod;
	distance = Math.round(distance*100)/100;
	return distance; 
}

// get change depedning on input 
function get_change(data, key_data, key) {
    // get data from potentiometer
    if (input == 'serial') {
        var change = parseInt(data)/100-5;	
        return change;
    // get data from list
    } else if (input == 'list') {
		list_key = list_key + 1;
        if (list_key == segments) 
			list_key = 0;
		return list[list_key]/2;
    // get data from csv file
    } else if (input == 'csv') {
		mod = get_data_by_key();
		mod = mod/500;
		return mod;
    } else if (input == 'random') {
       	return modules.near(old_radius, radius_f);
    } else {
		return data;
	}

}



// input data ------------------

if (input == 'list') {
	list_key = -1;
	list = [67, 57, 53.5, 43, 34, 34, 31, 29, 28.2, 28, 27, 26.7, 26.5, 26.3, 26.1, 26, 25.2, 23, 22.8, 21.5, 20.4, 20.3, 20.3, 20, 20, 20, 19.5, 19.2,18.9, 18.2, 17.8, 17.6, 17.4, 17, 17, 17, 16, 15, 14, 13, 13, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1];

}

// serial port read
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
	setTimeout(function(){
	if (i == 40) {
		getCirclePoints(centerX, centerY, radius_f, segments, height, data);
		i = 1; 
	} else {
		i++;
	}
	
	}, 4000);

	}); 

	serial_port.on("error", function (msg) {
		util.puts("error: "+msg);
	}); 
}

// input from csv
if (input == 'csv') {
var data_from_file = ''; 
var key_data = ''; 
new lazy(filesystem.createReadStream('data/'+data_file))
	.lines

	.forEach(function(line){
		splited = line.toString().split(',');
		num = splited[1];
		data_from_file = data_from_file + ','+ num.substring(1,5);
	});

}

// functions of input ------------->

function get_data_by_key() {
    key++;
    data_from_key = key_data[key];
    return data_from_key;
}

// init process
init_data(); 
