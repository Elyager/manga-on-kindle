#!/usr/bin/env node
var utils = require('./lib/submanga_parser');
var chalk = require('chalk')
var program = require('commander')

program
  .arguments('<url>')
  .option('-v, --volume', 'The volume url')
  .option('-a, --all', 'The all manga url')
  .action(function(url) {
		if (program.volume) {
			console.log(chalk.blue('one volume'));
			utils.getSingleVolume(url);
		}
		else if (program.all) {
			console.log(chalk.blue('all'));
			console.log(chalk.red('working on it...'))
			// 	utils.getAllManga(url);
		}
	})
 .parse(process.argv);

 if (program.volume === undefined && program.all === undefined) {
	 console.log('Incorrect command, please use -h for more information')
	 process.exit(1);
 }
