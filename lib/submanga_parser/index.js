var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var fs = require('fs');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var exports = module.exports = {};
var location;
var optionSelected;

var volume;

exports.getSingleVolume = function(urlParam, option){
	optionSelected = option;
	getVolume(urlParam);
};

exports.getAllManga = function(urlParam, option){
	optionSelected = option;
	getAllImgLinks(urlParam, function(res){
		res.forEach(function(elem, i, array) {
			getVolume(elem);
		});
	});

};

var getVolume = function(urlParam){
	var urlVolume = url.parse(urlParam);
	var urlVolumePath = url.parse(urlVolume).pathname.split('/');
	location = urlVolumePath[1];
	volume = urlVolumePath[2];

	request(urlVolume.href, getFirstPage);
}

var getFirstPage = function(err, resp, body) {
	    if (err) throw err;
	    $ = cheerio.load(body);
	    var urlFirstPage = $("#l").attr('href');

	    console.log('urlFirstPage: ' + urlFirstPage);

	    if (urlFirstPage !== undefined){
	    	console.log('GOOD');
	    	console.log('---------------------');
			// ### Request first volume page
			request(urlFirstPage, getAllPages);
		}
		else
			console.log('urlFirstPage is undefined' + urlFirstPage);
};

var getAllPages = function(err, resp, body) {
	if (err) console.log('ERROR: ' + err);
	$ = cheerio.load(body);
	var imgUrl = $("#ab").find("img").attr('src');
	var pages = $("#t")
			.children() //one child <tr>
			.children() //four children td and 3 th
			.eq(1).children().eq(0) //select element inside first th
			.children().length; //children of select element
	console.log('volume: ' + volume);
	console.log('Pages: ' + pages);


	for (var i = 1; i <= pages; i++) {
		var fileExtension = imgUrl.match(/\.[^.]*$/);
		var fileName = i + fileExtension;
		var urlBase = imgUrl.slice(0, fileExtension.index)
		var urlReplaced = urlBase.replace(/\d+$/, i);
		// var urlReplaced = urlBase.replace(/\d+$/, function(n){ return ++n });

		imgUrl = urlReplaced + fileExtension;

		download(imgUrl, fileName, function(){
			console.log('done');
		});
	}
};

var download = function(uri, filename, callback){
	var path = location+'/'+volume+'/'+filename;
	var curl =  'curl ' + uri +' -o ' + path + ' --create-dirs';
	if (optionSelected == '-vol'){
		exec(curl, function(err, stdout, stderr) {
		    if (err){ console.log(stderr); throw err; } 
		    else {
		    	console.log(filename + ' downloaded to ' + path);
		    }
		});
	}
	else if (optionSelected == '-all') {
		execSync(curl, function(err, stdout, stderr) {
		    if (err){ console.log(stderr); throw err; } 
		    else {
		    	console.log(filename + ' downloaded to ' + path);
		    }
		});
	}
	else {
		console.log('Wrong option');
	}
};


var getAllImgLinks = function(urlParam, callback){
	var links = [];
	var mangaTitle = url.parse(urlParam).pathname.split('/')[1];
	//### Request to main page with all volumes
	request(urlParam, function(err, resp, body) {
	    if (err) throw err;
	    $ = cheerio.load(body);
	    a = $("#w").children().eq(2)
	    				.children().eq(1)
	    				.children().eq(0)
	    				.children().eq(2)
	    				.children().find("a[href*="+ mangaTitle + "]");
	    a.each(function(i, elem) {       
	    	var urlVolume = url.parse($(this).attr('href'));	
	    	links.push(urlVolume.href);	
	    });
	    return callback(links);
	});
};