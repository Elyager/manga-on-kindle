var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var exports = module.exports = {};

var location;
var volume;
var folder;

exports.getSingleVolume = function(volumeUrl, option){
	getVolume(volumeUrl);
};

exports.getAllManga = function(mangaUrl, option){
		getAllImgLinks(mangaUrl, function(urls){
			// console.log(urls);

			var q = async.queue(function(task, callback){
				console.log('Task Start');
				getVolume(task);
				callback();
			},1);

			q.drain = function(){console.log("ALL FINISHED!");}

			urls.forEach(function(elem, i, array){
				q.push(elem, function(err){
					if(err) return console.error(err);
					console.log('finishing' + elem);
					console.log('--------------------');
				});
			});
		});
};

var getAllImgLinks = function(mangaUrl, callback){
	var links = [];
	var mangaTitle = url.parse(mangaUrl).pathname.split('/')[1];
	//### Request to main page with all volumes
	request(mangaUrl, function(err, resp, body) {
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

var getVolume = function(volumeUrl){
	var volumeUrlParsed = url.parse(volumeUrl);
	var urlSections = url.parse(volumeUrlParsed).pathname.split('/');
	location = urlSections[1];
	volume = urlSections[2];

	folder = "./manga/"+location+'/'+volume

	mkdirp(folder, function (err) {
	    if (err) console.error(err)
	});
	request(volumeUrlParsed.href, getFirstPage);
}

var getFirstPage = function(err, resp, body) {
	    if (err) throw err;
	    $ = cheerio.load(body);
	    var urlFirstPage = $("#l").attr('href');

	    //console.log('urlFirstPage: ' + urlFirstPage);

	    if (urlFirstPage !== undefined){
	    	// console.log('GOOD');
	    	// console.log('---------------------');
			// ### Request first volume page
			request(urlFirstPage, getAllPages);
		}
		// else
			// console.log('urlFirstPage is undefined' + urlFirstPage);
};

var getAllPages = function(err, resp, body) {
	if (err) console.log('ERROR: ' + err);
	$ = cheerio.load(body);
	var imgUrl = $("#ab").find("img").attr('src');
	var urlVolume = url.parse(imgUrl);
	var urlVolumePath = url.parse(urlVolume).pathname.split('/');
	volume = urlVolumePath[2];

	// mkdirp(folder, function (err) {
	//     if (err) console.error(err)
	// });
	var pages = $("#t")
			.children() //one child <tr>
			.children() //four children td and 3 th
			.eq(1).children().eq(0) //select element inside first th
			.children().length; //children of select element
	// console.log('volume: ' + volume);
	// console.log('Pages: ' + pages);


	for (var i = 1; i <= pages; i++) {
		var fileExtension = imgUrl.match(/\.[^.]*$/);
		var fileName = folder + '/' + i + fileExtension;
		var urlBase = imgUrl.slice(0, fileExtension.index)
		var urlReplaced = urlBase.replace(/\d+$/, i);
		// var urlReplaced = urlBase.replace(/\d+$/, function(n){ return ++n });

		imgUrl = urlReplaced + fileExtension;

		// createDummyFile(fileName, function(){
		// 	console.log('DONE');
		// });

		downloadR(imgUrl, fileName, function(){
			console.log(imgUrl);
			console.log('done');
		});
	}
};

var downloadR = function(uri, filename, callback) {
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
}

var createDummyFile = function(filename, callback) {
	fs.createWriteStream(filename).on('close', callback);
}
