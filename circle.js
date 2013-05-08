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
var z = config.z;
var model_height = z;  
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
var add_z = filament_diameter-0.1;
var filament_diffrence = config.filament_diffrence; 
var extruder_diffrence = config.extruder_diffrence ;
var extruder_mod = config.extruder_mod; 
var radius_factor = config.radius_factor; 
var input = config.input; 
var filament = config.filament; 
var extra_filament = config.extra_filament; 
var total_distance = 0; 
var temp = config.temperature
 
if (input == 'serial') 
	var usb_port = config.usb_port; 
	console.log('Input port: '+usb_port); 
	
if (input == 'csv') {
	var data_file = config.data_file;  
	// 2518 data points
	height = Math.round((2518 / (segments*2))); 
	}
 
console.log('Input: '+input); 

var pattern = config.pattern; 

console.log('Pattern: '+pattern); 

var slow_write = config.slow_write; 

scale_factor = false;
the_xy_factor = 1;  

var dubbling =  config.dubbling; 
var d = dubbling; 
var data_from_file = ''
var key = 0;


// init data and start writing to file
function init_data() {
	var starting_lines =  '; https://github.com/Sparvnastet/NoDe \n' +
					'\nG21 ; set units to millimeters ' +
					'\nM107 ; fan off ' +
					'\nM104 S'+temp+ ' ; set temperature ' +
					'\nG28 ; home all axes ' +
					'\nG1 Z5 F5000 ; lift nozzle \n' +
					'\nM109 S'+temp+ '; wait for temperature to be reached \n' +
					'\nG90 ; use absolute coordinates ' +
					'\nM82 ; use absolute distances for extrusion \n' +
					'\nG92 X10 E0 ; extrusion zero ' +
					'\nG1 Z'+z+' F7800.000\n'+
					'\nG1 X'+centerX+' Y'+centerX+' ; set staring position' +
					'\nG1 F540.000 ; filament speed ' +
					'\nM101 \n' +
					'\n;center x, y: '+ centerX+' , '+ centerY +
					'\n;radius: '+ radius_f + 
					'\n;segments: ' + segments + 
					'\n;height: '+ height + 
					'\n;height per circle: ' + add_z + 
					'\n;dubbling lines: ' + dubbling + 
					'\n;input: ' + input + 
					'\n;pattern: ' + pattern +
					'\n;z add: ' + add_z +  
					'\n;useing filament diffrence: ' + filament_diffrence + 
					'\n;useing extruder diffrence: ' + extruder_diffrence +
					'\n;start'; 
			
			
console.log('center x, y: '+ centerX+' , '+ centerY + 
			'\nradius: '+ radius_f + 
			'\nsegments: ' + segments + 
			'\ntotal_height: '+ height + 
			'\nheight per circle: ' + add_z + 
			'\nuseing filament diffrence: ' + filament_diffrence + 
			'\nuseing extruder diffrence: ' + extruder_diffrence); 
			
	// set the time out so the file gets process before we start retriving data
	setTimeout(function(){
		write_copy(starting_lines);
		first = 0; 
		key_data = data_from_file.toString().split(',');
		console.log('Writing model'); 
		make_circle(centerX, centerY, radius_f, segments, height); 
	}, 2000);
}


// make the each circle with parameters
function make_circle(centerX, centerY, radius_f, segments, height, data){

    if (z < height) {	
		// for every segment in this circle - makes the turn of new data
        for(var i=0; i<segments; i++){		
		    
			// save previous x and y values to calculate the distance for the extrution value
			old_x = x;
			old_y = y;
			
			// get the a new radius
			radius = get_radius(data, i)
			console.log(radius); 
			
			// getting x and y from specified values 
			x = Math.round((centerX + radius * Math.sin(i * 2 * Math.PI / segments)) * 10) / 10;
			y = Math.round((centerY + radius * Math.cos(i * 2 * Math.PI / segments)) * 10) / 10;

			// scaling from value in config json 
			x = Math.round(((x * scale_x * 10) / 10));
			y = Math.round(((y * scale_y * 10) / 10));
		
			// tranform from value in config json 
			if (xy_factor) {	
				xy_tranform();
			}

			line = 'G1 X'+ x+' Y'+y;
			
			// add filement value if true
			if (filament_diffrence) {
				// if it is the last segment add extra filament
				if (i == segments-1) {
					line = line + ' F'+extra_filament;
				// if it is the first segment normal filament
				} if (i == 0) {
					line = line + ' F'+filament;
				}	
			}	
			
			// add extrud value if true and if it is not the last segment
			if (extruder_diffrence) {
				if (i != segments-1) {
				new_distance = extruction_value();
				total_distance = total_distance + new_distance; 
				line = line + ' E'+Math.round(total_distance* 1000) / 1000; 
				}
			}
			
			// if it is the last segment add the z_move else just add a line break
			if (i == segments-1) {
				the_scaled_z = Math.round(z * scale_z * 10) / 10; 
				var zline = '\nG1 Z'+the_scaled_z+'\n';
				z = z + add_z;
				line = line + zline;	
			} else {
				line = line + '\n'; 
			}
			
		// add the line to the circle		
		circle = circle + line;	
		line = ''; 
		}
	// write the new circle to file	
	write_new_circle_data(circle);
	// reset the circle value
	circle = '';		

	} 

	
}



// write a copy of a circle when we only change the z-axes
function write_copy(circle) {
	filesystem.appendFile('test/'+filename, circle+'\n', function (err) {			
   });
}

// write a copy of a circle with new data
function write_new_circle_data(circle) {
    filesystem.appendFile('test/'+filename, circle+'\n', function (err) {
				
		
		// if we are using the narrow paramater in the config json file
		if (radius_factor) {
			radius_f = radius_f - radius_factor; 
		}
		
		// if it not serial input continue to make a new circle
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
	return Math.round(radius * 10) / 10;
}

// get radius data with or without spikes
function get_radius(data, i) {
	if (pattern == 'spikes') {
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

				var change = parseInt(data)/100;	
				if (change) {
					return change;
					}
				else {
					return 20;
				} 
			
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
			/*if (d == dubbling) {
				key = key - dubbling; 	
				console.log('key: '+key)			
				d = 0; 
			} else {
				d++; 
			}*/
		
			return mod;
			
		} else if (input == 'random') {
			return modules.get_random_with_limit(20);
		} else {
			return data;
		}
		
	
}



// input data ------------------>

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

var read_pot = 1; 
serial_port.on("data", function (data) {
	// slow down the output rate
	setTimeout(function(){
	if (read_pot == 4) {
		console.log(data); 
		make_circle(centerX, centerY, radius_f, segments, height, data);
		read_pot = 1; 
	} else {
		read_pot++;
	}
	
	}, 6000);

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
