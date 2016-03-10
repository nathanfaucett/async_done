var once = require("once"),
    apply = require("apply"),
    exhaust = require("stream-exhaust"),
    endOfStream = require("end_of_stream"),
    isFunction = require("is_function");


var endOfStreamOptions = {
    error: true
};


module.exports = asyncDone;


function asyncDone(fn, callback) {
    var cb = once(callback),
        result;

    function onDone() {
        return apply(cb, arguments);
    }

    function onSuccess(result) {
        return cb(undefined, result);
    }

    function onError(error) {
        return cb(error);
    }

    result = fn(onDone);

    if (result && isFunction(result.on)) {
        endOfStream(exhaust(result), endOfStreamOptions, onDone);
    }
    if (result && isFunction(result.then)) {
        result.then(onSuccess, onError);
    }
}
