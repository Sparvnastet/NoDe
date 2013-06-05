var lazy  = require("lazy")
  , filesystem = require("fs")
  , lines = []
  , j = 0
  , x = 1 
  , z = 0 
  , y = 1 
  , i = 0 
  , v
  , line_collection = '' 
  , started = false
  , data = []
  , intersections = 10;

console.log('reading file');

new lazy(filesystem.createReadStream('test/model_potentionmeter_example_2.gcode'))
.lines
.forEach(function(line){ 
	if (started == true) {
		if(line) {
			if (line != '0'){
				line = line.toString(); 
				z = line.indexOf("Z");
				// make a array containing one circle
				// build a create collection of lines with only x, y and z
				if (z > 0) {
					splited = line.split(' ');
					if (splited) {
						line_collection = line_collection + splited[1].substring(1)+ '|';
					}  
				} else {
					splited = line.split(' ');	
					if (splited) {
						line_collection = line_collection + splited[1].substring(1) + ' ' + splited[2].substring(1) + ',';  
					}
				}
			}
		}
	}	
	if (line == ";start") {
		started = true; 	
		console.log('processing...');
	}
});

function write_to_file(blob) {
	console.log('writing to file...')
    filesystem.appendFile('test/data_.gcode', blob, function (err) {
		console.log('writing done.') 
   });
}

function find_diff(line_collection) {
	var new_line_collection = ''; 
	var new_circle = ''; 
	var previous_z = '';
	var current_z = '';
	var new_line_circle = '';
	var previous_x_y_z = '';
	var current_x_y_z = '';
	
	// split on z plane 
	var z_plane = line_collection.split('|')
	
	for (j=0; j < z_plane.length; j++) {
		if (j != 0) {
			// get this and prevoius collection 
			previous_collection_z = z_plane[j-1];
			current_collection_z = z_plane[j]; 
			// split on point
			previous_layer = previous_collection_z.split(',')
			current_layer = current_collection_z.split(',')
			
			for (l=0; l < current_layer.length; l++) {
				current_x_y_z = current_layer[l].split(' '); 
				previous_x_y_z = previous_layer[l].split(' '); 
				
				diff_x = (current_x_y_z[0] - previous_x_y_z[0])/intersections; 
				diff_y = (current_x_y_z[1] - previous_x_y_z[1])/intersections; 
				
				if (l == current_layer.length-1)
					previous_layer[l] = previous_layer[l] + ' ' + diff_x + ' Z';
				else {
					previous_layer[l] = previous_layer[l] + ' ' + diff_x + ' ' + diff_y;		 
				}
				new_line_circle = new_line_circle + previous_layer[l] + ',';
			}					
		}
	new_line_collection = new_line_collection + new_line_circle + '|'; 
	new_line_circle = ''; 
	}	 
	return 	new_line_collection; 
}

var r = 1; 
function interpolation(diff_collection) {
	var lines = '';
	var form = ''; 
	var new_collection = ''; 
	collection = diff_collection.split('|');
	for (n=0; n < collection.length; n++) { 
		points = collection[n].split(',')
		if (points.length > 1) {
			for (q=0; q < intersections; q++) {
				r = r + q; 
				level = r; 
				lines = make_lines(points, q);
				new_collection = new_collection + lines;
			}	
		}	
	}
	write_to_file(new_collection); 
}

var add_z = 1; 
var values = []; 
function make_lines(points, q) {
	var line = ''
	for (p=0; p < points.length; p++){
		x_y_d = points[p].split(' ')
		tran_x = x_y_d[2]; 
		tran_y = x_y_d[3]; 
		if (parseFloat(x_y_d[1])) {
			if (x_y_d[2] == 'Z') {
				current = parseFloat(x_y_d[0]); 
				add = parseFloat(x_y_d[1]);
				z = current + (add * q);
				point = 'G1' + ' Z'+z+'\n'; 
			} else {
				x = parseFloat(x_y_d[0]) + parseFloat((tran_x * q)); 
				y = parseFloat(x_y_d[1]) + parseFloat((tran_y * q));
				point = 'G1' + ' X'+x + ' Y' + y+'\n'; 
			}
			// if is a number
			line = line + point; 
		}
	}
	values[0] = line; 
	values[1] = z; 
	return values; 	
} 
setTimeout(function(){
	diff_collection = find_diff(line_collection);
	setTimeout(function(){ 
		interpolation(diff_collection); 
	}
	, 2000);
}, 2000);
