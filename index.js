'use strict';

var stringify = function (value, limit, callback) {
    if (typeof limit === 'function') {
        callback = limit;
        limit    = null;
    }

    if (value === void 0) {
        callback(null, value);
        return;
    }

    switch (typeof value) {
        case 'string':
        case 'number':
            try {
                value = JSON.stringify(value);
            }
            catch (error) {
                callback(error);
                break;
            }
            callback(null, value);
            break;
        case 'boolean':
            callback(null, value ? 'true' : 'false');
            break;
        case 'object':
            if (value === null) {
                callback(null, 'null');
            }
            else if (typeof value.toJSON === 'function') {
                try {
                    value = value.toJSON();
                }
                catch (error) {
                    callback(error);
                    break;
                }
                stringify(value, limit, callback);
            }
            else if (Array.isArray(value)) {
                stringifyArray(value, limit, callback);
            } 
            else if (value.constructor === String || value.constructor === Number || value.constructor === Boolean) {
                try {
                    value = value.valueOf();
                }
                catch (error) {
                    callback(error);
                    break;
                }
                stringify(value, limit, callback);
            }
            else {
                stringifyObject(value, limit, callback);
            }
            break;
        case 'function':
            if (value.length === 0) {
                try {
                    value = value();
                }
                catch (error) {
                    callback(error);
                    break;
                }
                stringify(value, limit, callback);
            }
            else {
                value(function (error, value) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        stringify(value, limit, callback);
                    }
                });
            }
            break;
        default:
            callback(new Error("Unknown object type: " + (typeof value)));
            break;
    }
};

var stringifyArray = function (array, limit, callback) {
    var length = array.length;
    var buffer, next;
    if (length === 0) {
        callback(null, '[]');
        return;
    }
    buffer = '[';
    next   = function (n) {
        if (n === length) {
            buffer += ']';
            callback(null, buffer);
            return false;
        }

        stringify(array[n], function (error, value) {
            if (error) {
                callback(error);
                return;
            }

            if (n > 0) {
                buffer += ',';
            }

            buffer += (value === void 0) ? 'null' : value;

            setImmediate(next, n + 1);
        });
    };
    next(0);
};

var stringifyObject = function (object, callback) {
    var keys   = Object.keys(object);
    var length = keys.length;
    var first, buffer, next;
    if (length === 0) {
        callback(null, '{}');
        return;
    }
    first = true;
    buffer = "{";

    next = function (n) {
        if (n === length) {
            buffer += "}";
            callback(null, buffer);
            return;
        }

        var key = keys[n];
        // asynchronously stringify the nth element in our list of keys
        stringify(object[key], function (error, value) {
            if (error) {
                callback(err);
                return;
            }

            if (value !== void 0) {
                if (first) {
                    first = false;
                }
                else {
                    buffer += ",";
                }

                buffer += JSON.stringify(key);
                buffer += ":";
                buffer += value;
            }

            // go to the next key
            if (synchronous) {
              completedSynchronously = true;
            } else if (n === 0 || n % 200 !== 0) {
              run(n + 1);
            } else {
              setImmediate(run, n + 1);
            }
        });
    };
    next(0);
};

module.exports = stringify;