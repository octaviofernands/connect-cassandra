/* jshint proto:false */
var util = require('util');

module.exports = function (connect) {
    //var Store = connect.session.Store;
    var Store = connect.Store || connect.session.Store;
    var columnFamily = 'connect_session';
    var existingColumnFamilyException = 'Cannot add already existing column family';
    var colId = 'mysession'

    function CassandraStore(options) {
        var self = this;
        Store.call(self, options);
        self.pool = options.pool;
        self.pool.execute(util.format('create table %s (id varchar PRIMARY KEY, key map<text,text>)', columnFamily), [], function(e) {
            if(e && e.toString().indexOf(existingColumnFamilyException) == -1) {
                throw e;
            } else if(!e) {
                self.pool.execute(util.format('create index on %s (key);',columnFamily), function (e) {
                    self.pool.execute(util.format('insert into %s (id, key) VALUES (\'%s\', {\'\':\'\'})', columnFamily, colId), function (e) {
                    });
                });
            }
        });
    }

    CassandraStore.prototype.__proto__ = Store.prototype;

    CassandraStore.prototype.get = function (sid, callback) {
        var cql = util.format('select key from %s where id = \'%s\'', columnFamily, colId);
        this.pool.execute(cql, function(err, result) {
            
            if(err) {
                return callback(err);
            }

            if(!result || result.rows.length != 1) {
                return callback();
            }

            var sidColumn = result.rows[0].key[sid];
            if(sidColumn === undefined) {
                return callback();
            }

            return callback(null, JSON.parse(sidColumn));
        });
    };

    CassandraStore.prototype.set = function (sid, session, callback) {
        var maxAge = session.cookie.maxAge;
        var ttl = ('number' == typeof maxAge ? maxAge / 1000 | 0 : 86400);
        session = JSON.stringify(session);
        
        var cql = util.format('update %s USING TTL %d set key = key + {\'%s\':\'%s\'} where id = \'%s\'', columnFamily, ttl, sid, session, colId);
        this.pool.execute(cql, function(err) {
            callback(err);
        });
    };

    CassandraStore.prototype.destroy = function (sid, callback) {
        this.pool.execute(util.format('delete key[\'%s\'] from %s', sid, columnFamily), [], function(err) {
            callback(err);
        });
    };

    return CassandraStore;
};