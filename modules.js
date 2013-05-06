var filesystem = require('fs');


// a random number 
function get_random() {
    var r = Math.random();
    return r;
}

// get random with a specified number from zero to number
function get_random_with_limit(to) {
    var r =  Math.random()*to+1;
    return r;
}

// get a number near a number
function make_near_number(old_limit, how_near) {
    do {
        new_limit = get_random();
        check_limit = old_limit - new_limit;
		check_limit = Math.abs(check_limit);
    } while (check_limit > how_near);

    return new_limit
}


function line_distance( p1x, p2x, p1y, p2y ) {
	var xs = 0;
	var ys = 0;
 
	xs = p1x - p2x;
	xs = xs * xs;
 
	ys = p1y - p2y;
	ys = ys * ys;
 
	return Math.sqrt( xs + ys );
}

module.exports.near = make_near_number;
module.exports.line_distance = line_distance;


