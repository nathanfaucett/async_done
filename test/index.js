var tape = require("tape"),
    cp = require("child_process"),
    fs = require("fs"),
    through = require("through2"),
    PromisePolyfill = require("@nathanfaucett/promise_polyfill"),
    asyncDone = require("..");


tape("asyncDone(fn, callback) passes all arguments to the completion callback", function(assert) {
    function twoArg(cb) {
        cb(null, 1, 2);
    }
    asyncDone(twoArg, function(error, arg1, arg2) {
        assert.equal(arg1, 1);
        assert.equal(arg2, 2);
        assert.end(error);
    });
});

tape("asyncDone(fn, callback) should handle callbacks", function(assert) {
    function success(cb) {
        cb(null, 2);
    }

    function failure(cb) {
        cb(new Error("Callback Error"));
    }

    function neverDone() {
        return 2;
    }

    asyncDone(success, function(error, result) {
        assert.equal(result, 2);
    });
    asyncDone(failure, function(error) {
        assert.equal(!!error, true);
    });
    asyncDone(neverDone, function() {
        assert.end(new Error("Callback called"));
    });

    setTimeout(function() {
        assert.end();
    });
});

tape("asyncDone(fn, callback) child processes", function(assert) {
    asyncDone(function execSuccess() {
        return cp.exec("echo hello world");
    }, function(error) {
        assert.equal(!error, true);
        assert.end();
    });
});
tape("asyncDone(fn, callback) should handle failing exec", function(assert) {
    asyncDone(function execFail() {
        return cp.exec("foo-bar-baz hello world");
    }, function(error) {
        assert.equal(!!error, true);
        assert.end();
    });
});
tape("asyncDone(fn, callback) should handle successful spawn", function(assert) {
    asyncDone(function spawnSuccess() {
        return cp.spawn("echo", ["hello world"]);
    }, function(error) {
        assert.equal(!error, true);
        assert.end();
    });
});
tape("asyncDone(fn, callback) should handle successful spawn", function(assert) {
    asyncDone(function spawnFail() {
        return cp.spawn("foo-bar-baz", ["hello world"]);
    }, function(error) {
        assert.equal(!!error, true);
        assert.end();
    });
});

tape("asyncDone(fn, callback) should handle a resolved promise", function(assert) {
    asyncDone(function success() {
        return PromisePolyfill.resolve(2);
    }, function(error, result) {
        assert.equal(result, 2);
        assert.end();
    });
});
tape("asyncDone(fn, callback) should handle a rejected promise", function(assert) {
    asyncDone(function success() {
        return PromisePolyfill.reject(new Error("Promise Error"));
    }, function(error) {
        assert.equal(!!error, true);
        assert.end();
    });
});

var EndStream = through.ctor(function(chunk, enc, cb) {
    this.push(chunk);
    cb();
}, function(cb) {
    this.emit('end', 2);
    cb();
});

tape("asyncDone(fn, callback) should handle a successful stream", function(assert) {
    asyncDone(function success() {
        var read = fs.createReadStream(__filename);
        read.pipe(new EndStream());
        return read;
    }, function(error) {
        assert.equal(!error, true);
        assert.end();
    });
});
tape("asyncDone(fn, callback) should handle an errored stream", function(assert) {
    asyncDone(function success() {
        var read = fs.createReadStream(__dirname + "/NO_FILE");
        read.pipe(new EndStream());
        return read;
    }, function(error) {
        assert.equal(!!error, true);
        assert.end();
    });
});
