var utils = require('./lib/submanga_parser');
var optionSelected = process.argv[2];
var urlParam = process.argv[3];


if (optionSelected == '-vol'){
	console.log('one volume');
	utils.getSingleVolume(urlParam, optionSelected);
}
else if (optionSelected == '-all') {
	console.log('all volumes')
	utils.getAllManga(urlParam, optionSelected);
}
else {
	console.log('Please use -all (all volumes) or -vol (shigle volume) an a valid url');
	console.log('Example: node index.js -vol http://submanga.com/Nanatsu_no_Taizai/1/233906');
	console.log('Example: node index.js -all http://submanga.com/Nanatsu_no_Taizai/completa');
}