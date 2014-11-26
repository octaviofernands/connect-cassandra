# connect-cassandra
A Cassandra session store for connect.

This project was forked from [B2MSolutions connect-cassandra](https://github.com/B2MSolutions/connect-cassandra).

## Improvements
 Handle session wit cassandra using Datastax [nodejs-driver](https://github.com/datastax/nodejs-driver).

 Updated for using with express new version.

## Installation
	npm install connect-cassandra

## Usage
	var express = require('express'),
		cassandra = require('cassandra-driver'),
		session = require('express-session'),
    	cassandraStore = require('connect-cassandra')(session);

	var client = new cassandra.Client({contactPoints: ['myhost'], keyspace: 'mykeyspace'});
	client.connect(function(err, result) {
    	if(err == null) {
        	console.log('Connected.');
        	app.use(session({
            	secret: 'supersecretkeygoeshere',
            	store: new cassandraStore({ pool: client })
        	}));
    	} else {
        	console.log('Not Connected');
    	}
	});

## Contributors
 Pair programmed by [Roy Lines](http://roylines.co.uk) and [James Bloomer](https://github.com/jamesbloomer).

 Contributions from [David Wetterau](https://github.com/dwetterau).

 Adapted by [Octavio Fernandes](http://github.com/octaviofernands).