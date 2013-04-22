// import the file system modual
var filesystem = require('fs');

filesystem.readFile('test/org.stl', function(error, data) {
    console.log(data);
});
