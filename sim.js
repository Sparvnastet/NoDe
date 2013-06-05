// start values
var filesystem = require('fs');
var lazy = require("lazy"); 
var centerX = 0;
var centerY = 0;  
var x = 0, 
	y = 0, 
	line_number = 0,
	adder = 0, 
	line_collection = '',
	z = 1; 
	x_num = 0; 
	y_num = 0;
	
watchingfile(); 

new lazy(filesystem.createReadStream('test/plain_model.gcode'))
.lines
.forEach(function(line){ 
	if(line) {
		if (line != '0' || line != undefined || line != ''){
			line_collection = line_collection + line + ',';  
		}
	}
});

setTimeout(function(){
	line_array = line_collection.split(','); 
	read_next_line() 
}, 2000);

function server(gcode_line, current_postion, status_code) {
	var status = 'default', 
	index_x = 0, 
	index_y = 0,
	index_z = 0; 
	
	splited = gcode_line.split(' '); 
	
	// this is a postion change 
	if (splited[0] == 'G1')	{
		for (i=1; i < splited.length; i++) {
			if (splited[i].indexOf('X') != -1) {
				index_x = i;
			}
			
			if (splited[i].indexOf('Y') != -1) {
				index_y = i;
			}
			
			if (splited[i].indexOf('Z') != -1) {
				index_z = i;
			}
			
		}
		
		if (index_x > 0) {
			//console.log('is x: ', splited[index_x].substring(1)); 
		}
		
		if (index_y > 0) {
			//console.log('is y: ', splited[index_y].substring(1));
		}
	
		if (index_z > 0) {
			//console.log('is z: ', splited[index_z].substring(1));		
		}
	
		status = 'ok'; 
	// this is for other instructions 
	} else {
		console.log('other');	
		status = 'ok'; 
	}	
	
	if (status == 'ok') {
		printer(gcode_line);
	} else {
		read_next_line('resend');
	}

}

function watchingfile() {
	filesystem.watchFile('test/test_printer.gcode', function (curr, prev) {
		//read_next_line();
	});
}

function printer(line) {
    if(line.length > 4){
    filesystem.appendFile('test/test_printer.gcode', line+'\n', function (err) {
        console.log('printer: '+line); 
		setTimeout(function(){
		read_next_line();
		}, 100);
    });
	} else {
		read_next_line();
	}
	
}

function read_next_line(status) {
	if(line_number < line_array.length) {
		if (status == 'resend') {
			line = line_array[line_number]; 
			server(line);
		} else {
		
			line = line_array[line_number];
			current_line = line;  
			if (line.length > 4 && line != undefined) {
			splitde = line.split(' '); 
			
			if (splitde[0] == 'G1' && splitde[1].substring(0,1) != 'Z') {
				radius = get_mouse_data();
				
				g = splitde[0]; 
								
				mod = get_mouse_data();
				
				x_previous = x_num; 
				y_previous = y_num;
				
				x_num = parseFloat(splitde[1].substring(1)); 
				y_num = parseFloat(splitde[2].substring(1));
				
				deltaY = y_num;
				deltaX = x_num;
				 
				if (y_num > 0){
					y_mod = y_num + mod;
				} else {
					y_mod = y_num - mod;
				} 
				if (x_num > 0){
					x_mod = x_num +mod;
				} else {
					x_mod = x_num - mod;
				} 
		
				// var tan_ = Math.round((Math.atan2(y_num, x_num)) * 10) / 10; // tan 
				
				// new_tan = tan_ + mod; 
				// degree = new_tan * 180/Math.PI;
								
				// x_mod = Math.round((Math.cos(degree)) * 100) / 10;
			    //y_mod = Math.round((Math.sin(degree)) * 100) / 10;
	
				// x = Math.round((centerX + radius * Math.sin(line_number * 2 * Math.PI / 10)) * 10) / 10;
				// y = Math.round((centerY + radius * Math.cos(line_number * 2 * Math.PI / 10)) * 10) / 10;

				// x_half = deltaX/2;
				// y_half = deltaY/2;
				
				// x_new = x_previous + x_mod; 
				// y_new = y_previous + y_mod; 
				
				var console_ = ';x_t:' + x_mod + ' y_t ' + y_mod +' when mod: ' + mod;// + ' delta x ' + deltaX + ' tan: '+radius;
				
				new_x = 'X'+x_mod; 
				new_y = 'Y'+y_mod; 
				var new_line = g + ' ' + new_x + ' ' + new_y + ' ' + console_; 
			    var both_lines = new_line;
				} 
			}
			line_number++; 	
			if (both_lines) {
			    server(both_lines);
				both_lines = false;
			} else {
			    server(line); 
				console.log(line)
			}
		}		
	}
}

function get_mouse_data() {
	try {
	  var config = JSON.parse(filesystem.readFileSync("test/mouse.json"));
	} catch (e) {
	  get_mouse_data();
	}
	try {
	  var value = config.observ;
	} catch (e) {
	  get_mouse_data();
	}
	value = (value-280) / 500;
	return value;	
}



	   