(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.libGlobalName = factory();
    }
}(this, function () {
//almond, and your modules will be inlined here

/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/* global define */
define('structures/CAPIError',[],function () {
    

    /**
     * Class describing any error which could be thrown during CAPI workflow
     *
     * @class CAPIError
     * @constructor
     * @param message {String} error message
     * @param additionalInfo {Object} object literal containing any additional error properties
     */
    var CAPIError = function (message, additionalInfo) {
        this.name = "CAPIError";
        this.message = message;
        this.additionalInfo = additionalInfo;
    };

    CAPIError.prototype = new Error();

    CAPIError.prototype.constructor = CAPIError;

    return CAPIError;

});
/* global define */
define('authAgents/SessionAuthAgent',["structures/CAPIError"], function (CAPIError) {
    

    /**
     * Creates an instance of SessionAuthAgent object
     * * Auth agent handles low level implementation of authorization workflow
     *
     * @class SessionAuthAgent
     * @constructor
     * @param credentials {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     */
    var SessionAuthAgent = function (credentials) {
        // is initiated inside CAPI constructor by using setCAPI() method
        this._CAPI = null;

        this._login = credentials.login;
        this._password = credentials.password;

        //TODO: implement storage selection mechanism
        this.sessionName = sessionStorage.getItem('ezpRestClient.sessionName');
        this.sessionId = sessionStorage.getItem('ezpRestClient.sessionId');
        this.csrfToken = sessionStorage.getItem('ezpRestClient.csrfToken');
    };

    /**
     * Called every time a new request cycle is started,
     * to ensure those requests are correctly authenticated.
     *
     * A cycle may contain one or more queued up requests
     *
     * @method ensureAuthentication
     * @param done {Function} Callback function, which is to be called by the implementation to signal the authentication has been completed.
     */
    SessionAuthAgent.prototype.ensureAuthentication = function (done) {
        if (this.sessionId === null) {
            var that = this,
                userService = this._CAPI.getUserService(),
                sessionCreateStruct = userService.newSessionCreateStruct(
                    this._login,
                    this._password
                );

            // TODO: change hardcoded "sessions" path to discovered
            userService.createSession(
                "/api/ezp/v2/user/sessions",
                sessionCreateStruct,
                function (error, sessionResponse) {
                    if (!error) {
                        var session = JSON.parse(sessionResponse.body).Session;

                        that.sessionName = session.name;
                        that.sessionId = session._href;
                        that.csrfToken = session.csrfToken;

                        sessionStorage.setItem('ezpRestClient.sessionName', that.sessionName);
                        sessionStorage.setItem('ezpRestClient.sessionId', that.sessionId);
                        sessionStorage.setItem('ezpRestClient.csrfToken', that.csrfToken);

                        done(false, true);

                    } else {
                        done(
                            new CAPIError(
                                "Failed to create new session.",
                                {sessionCreateStruct: sessionCreateStruct}
                            ),
                            false
                        );
                    }
                }
            );

        } else {
            done(false, true);
        }
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    SessionAuthAgent.prototype.authenticateRequest = function (request, done) {
        if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS" && request.method !== "TRACE" ) {
            request.headers["X-CSRF-Token"] = this.csrfToken;
        }

        done(false, request);
    };

    /**
     * Log out workflow
     * Kills currently active session and resets sessionStorage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param done {function}
     */
    SessionAuthAgent.prototype.logOut = function (done) {
        var userService = this._CAPI.getUserService(),
            that = this;

        userService.deleteSession(
            this.sessionId,
            function (error, response) {
                if (!error) {
                    that.sessionName = null;
                    that.sessionId = null;
                    that.csrfToken = null;

                    sessionStorage.removeItem('ezpRestClient.sessionName');
                    sessionStorage.removeItem('ezpRestClient.sessionId');
                    sessionStorage.removeItem('ezpRestClient.csrfToken');

                    done(false, true);

                } else {
                    done(true, false);
                }
            }
        );
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    SessionAuthAgent.prototype.setCAPI = function (CAPI) {
        this._CAPI = CAPI;
    };

    return SessionAuthAgent;

});
/* global define */
define('authAgents/HttpBasicAuthAgent',[],function () {
    

    /**
     * Creates an instance of HttpBasicAuthAgent object
     * Auth agent handles low level implementation of authorization workflow
     *
     * @class HttpBasicAuthAgent
     * @constructor
     * @param credentials {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     */
    var HttpBasicAuthAgent = function (credentials) {
        this._login = credentials.login;
        this._password = credentials.password;
    };

    /**
     * Called every time a new request cycle is started,
     * to ensure those requests are correctly authenticated.
     *
     * A cycle may contain one or more queued up requests
     *
     * @method ensureAuthentication
     * @param done {Function} Callback function, which is to be called by the implementation
     * to signal the authentication has been completed.
     */
    HttpBasicAuthAgent.prototype.ensureAuthentication = function(done) {
        // ... empty for basic auth?
        done(false, true);
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.authenticateRequest = function (request, done) {
        request.httpBasicAuth = true;
        request.login = this._login;
        request.password = this._password;

        done(false, request);
    };

    /**
     * Log out workflow
     * No actual logic for HTTP Basic Auth
     *
     * @method logOut
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.logOut = function (done) {
        done(false, true);
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     * As HttpBasicAuthAgent has no use for the CAPI, implementation is empty
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    HttpBasicAuthAgent.prototype.setCAPI = function (CAPI) {
    };

    return HttpBasicAuthAgent;

});
/* global define */
define('structures/Response',[],function () {
    

    /**
     * @class Response
     * @constructor
     * @param valuesContainer
     */
    var Response = function (valuesContainer) {
        /**
         * Body of the response (most times JSON string recieved from REST service via a Connection object)
         *
         * @property body
         * @type {String}
         * @default ""
         */
        this.body = "";

        /**
         * Document represents "body" property of the response parsed into structured object
         *
         * @property document
         * @type {Object}
         * @default null
         */
        this.document = null;

        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        if ( this.body ) {
            this.document = JSON.parse(this.body);
        }

        return this;
    };

    return Response;

});
/* global define */
define('structures/Request',[],function () {
    

    /**
     * Request object used for storing all the data, which should be sent to the REST server.
     *
     * @class Request
     * @constructor
     * @param valuesContainer {Object} object literal containing any request properties
     */
    var Request = function (valuesContainer) {
        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    };

    return Request;

});
/* global define */
define('ConnectionManager',["structures/Response", "structures/Request", "structures/CAPIError"],
    function (Response, Request, CAPIError) {
    

    /**
     * Creates an instance of connection manager object
     *
     * @class ConnectionManager
     * @constructor
     * @param endPointUrl {String} url to REST root
     * @param authenticationAgent {object} Instance of one of the AuthAgents (e.g. SessionAuthAgent, HttpBasicAuthAgent)
     * @param connectionFactory {ConnectionFeatureFactory}  the factory which is choosing compatible connection from connections list
     */
    var ConnectionManager = function (endPointUrl, authenticationAgent, connectionFactory) {
        this._endPointUrl = endPointUrl;
        this._authenticationAgent = authenticationAgent;
        this._connectionFactory = connectionFactory;

        this._requestsQueue = [];
        this._authInProgress = false;

        this.logRequests = false;
    };

    /**
     * Basic request function
     *
     * @method request
     * @param [method="GET"] {String} request method ("POST", "GET" etc)
     * @param [url="/"] {String} requested REST resource
     * @param [body=""] {JSON}
     * @param [headers={}] {object}
     * @param callback {function} function, which will be executed on request success
     */
    ConnectionManager.prototype.request = function (method, url, body, headers, callback) {
        var that = this,
            request,
            nextRequest,
            defaultMethod = "GET",
            defaultUrl = "/",
            defaultBody = "",
            defaultHeaders = {};

        // default values for omitted parameters (if any)
        if (arguments.length < 5) {
            if (typeof method == "function") {
                //no optional parameteres are passed
                callback = method;
                method = defaultMethod;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof url == "function") {
                // only first 1 optional parameter is passed
                callback = url;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof body == "function") {
                // only first 2 optional parameters are passed
                callback = body;
                body = defaultBody;
                headers = defaultHeaders;
            } else {
                // only first 3 optional parameters are passed
                callback = headers;
                headers = defaultHeaders;
            }
        }

        request = new Request({
            method : method,
            url : this._endPointUrl + url,
            body : body,
            headers : headers
        });

        // Requests suspending workflow
        // first, put any request in queue anyway (the queue will be emptied after ensuring authentication)
        this._requestsQueue.push(request);

        // if our request is the first one, or authorization is not in progress, go on
        if (!this._authInProgress || (this._requestsQueue.length === 1)) {
            // queue all other requests, until this one is authenticated
            this._authInProgress = true;

            // check if we are already authenticated, make it happen if not
            this._authenticationAgent.ensureAuthentication(
                function (error, success) {
                    if (!error) {
                        that._authInProgress = false;

                        // emptying requests Queue
                        /*jshint boss:true */
                        /*jshint -W083 */
                        while (nextRequest = that._requestsQueue.shift()) {
                            that._authenticationAgent.authenticateRequest(
                                nextRequest,
                                function (error, authenticatedRequest) {
                                    if (!error) {
                                        if (that.logRequests) {
                                            console.dir(request);
                                        }
                                        // Main goal
                                        that._connectionFactory.createConnection().execute(authenticatedRequest, callback);
                                    } else {
                                        callback(
                                            new CAPIError(
                                                "An error occurred during request authentication.",
                                                {request: nextRequest}
                                            ),
                                            false
                                        );
                                    }
                                }
                            );
                        } // while
                        /*jshint +W083 */
                        /*jshint boss:false */

                    } else {
                        that._authInProgress = false;
                        callback(error, false);

                    }
                }
            );
        }
    };

    /**
     * Not authorized request function
     * Used mainly for initial requests (e.g. createSession)
     *
     * @method notAuthorizedRequest
     * @param [method="GET"] {String} request method ("POST", "GET" etc)
     * @param [url="/"] {String} requested REST resource
     * @param [body=""] {JSON}
     * @param [headers={}] {object}
     * @param callback {function} function, which will be executed on request success
     */
    ConnectionManager.prototype.notAuthorizedRequest = function(method, url, body, headers, callback) {
        var request,
            defaultMethod = "GET",
            defaultUrl = "/",
            defaultBody = "",
            defaultHeaders = {};

        // default values for omitted parameters (if any)
        if (arguments.length < 5) {
            if (typeof method == "function") {
                //no optional parameteres are passed
                callback = method;
                method = defaultMethod;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof url == "function") {
                // only first 1 optional parameter is passed
                callback = url;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof body == "function") {
                // only first 2 optional parameters are passed
                callback = body;
                body = defaultBody;
                headers = defaultHeaders;
            } else {
                // only first 3 optional parameters are passed
                callback = headers;
                headers = defaultHeaders;
            }
        }

        request = new Request({
            method: method,
            url: this._endPointUrl + url,
            body: body,
            headers: headers
        });

        if (this.logRequests) {
            console.dir(request);
        }

        // Main goal
        this._connectionFactory.createConnection().execute(request, callback);
    };

    /**
     * Delete - shortcut which handles simple deletion requests in most cases
     *
     * @method delete
     * @param url
     * @param callback
     */
    ConnectionManager.prototype.delete = function (url, callback) {
        // default values for all the parameters
        url = (typeof url === "undefined") ? "/" : url;
        callback = (typeof callback === "undefined") ? function () {} : callback;

        this.request(
            "DELETE",
            url,
            "",
            {},
            callback
        );
    };

    /**
     * logOut - logout workflow
     * Kills currently active session and resets localStorage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param callback {function}
     */
    ConnectionManager.prototype.logOut = function (callback) {
        this._authenticationAgent.logOut(callback);
    };

    return ConnectionManager;

});

/* global define */
define('ConnectionFeatureFactory',[],function () {
    

    /**
     * Creates an instance of connection feature factory. This factory is choosing compatible connection from list of available connections.
     *
     * @class ConnectionFeatureFactory
     * @constructor
     * @param connectionList {array} Array of connections, should be filled-in in preferred order
     */
    var ConnectionFeatureFactory = function (connectionList) {
        this.connectionList = connectionList;

        this.defaultFactory = function (Connection) {
            return new Connection();
        };
    };

    /**
     * Returns instance of the very first compatible connection from the list
     *
     * @method createConnection
     * @return  {Connection}
     */
    ConnectionFeatureFactory.prototype.createConnection = function () {
        var connection = null,
            index = 0;

        // Choosing and creating first compatible connection from connection list
        for (index = 0; index < this.connectionList.length; ++index) {
            if (this.connectionList[index].connection.isCompatible()) {
                if (this.connectionList[index].factory) {
                    connection = this.connectionList[index].factory(this.connectionList[index].connection);
                } else {
                    connection = this.defaultFactory(this.connectionList[index].connection);
                }
                break;
            }
        }

        return connection;
    };

    return ConnectionFeatureFactory;

});
/* global define */
define('connections/XmlHttpRequestConnection',["structures/Response", "structures/CAPIError"], function (Response, CAPIError) {
    

    /**
     * Creates an instance of XmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for generic (non-Microsoft) browsers
     *
     * @class XmlHttpRequestConnection
     * @constructor
     */
    var XmlHttpRequestConnection = function () {
        this._xhr = new XMLHttpRequest();

        /**
         * Basic request implemented via XHR technique
         *
         * @method execute
         * @param request {Request} structure containing all needed params and data
         * @param callback {function} function, which will be executed on request success
         */
        this.execute = function (request, callback) {
            var XHR = this._xhr,
                headerType;

            // Create the state change handler:
            XHR.onreadystatechange = function () {
                if (XHR.readyState != 4) {return;} // Not ready yet
                if (XHR.status >= 400) {
                    callback(
                        new CAPIError("Connection error : " + XHR.status + ".", {
                            errorCode : XHR.status,
                            xhr: XHR
                        }),
                        false
                    );
                    return;
                }
                // Request successful
                callback(
                    false,
                    new Response({
                        status: XHR.status,
                        headers: XHR.getAllResponseHeaders(),
                        body: XHR.responseText
                    })
                );
            };

            if (request.httpBasicAuth) {
                XHR.open(request.method, request.url, true, request.login, request.password);
            } else {
                XHR.open(request.method, request.url, true);
            }

            for (headerType in request.headers) {
                if (request.headers.hasOwnProperty(headerType)) {
                    XHR.setRequestHeader(
                        headerType,
                        request.headers[headerType]
                    );
                }
            }
            XHR.send(request.body);
        };
    };

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @return {boolean} whether the connection is compatible with current environment
     */
    XmlHttpRequestConnection.isCompatible = function () {
        return !!window.XMLHttpRequest;
    };

    return XmlHttpRequestConnection;

});
/* global define */
/* global ActiveXObject */
define('connections/MicrosoftXmlHttpRequestConnection',["structures/Response", "structures/CAPIError"], function (Response, CAPIError) {
    

    /**
     * Creates an instance of MicrosoftXmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for Microsoft browsers
     *
     * @class MicrosoftXmlHttpRequestConnection
     * @constructor
     */
    var MicrosoftXmlHttpRequestConnection = function () {
        this._xhr = new ActiveXObject("Microsoft.XMLHTTP");

        /**
         * Basic request implemented via XHR technique
         *
         * @method execute
         * @param request {Request} structure containing all needed params and data
         * @param callback {function} function, which will be executed on request success
         */
        this.execute = function (request, callback) {
            var XHR = this._xhr,
                headerType;

            // Create the state change handler:
            XHR.onreadystatechange = function () {
                if (XHR.readyState != 4) {return;} // Not ready yet
                if (XHR.status >= 400) {
                    callback(
                        new CAPIError("Connection error : " + XHR.status + ".", {
                            errorCode : XHR.status,
                            xhr: XHR
                        }),
                        false
                    );
                    return;
                }
                // Request successful
                callback(
                    false,
                    new Response({
                        status: XHR.status,
                        headers: XHR.getAllResponseHeaders(),
                        body: XHR.responseText
                    })
                );
            };

            if (request.httpBasicAuth) {
                XHR.open(request.method, request.url, true, request.login, request.password);
            } else {
                XHR.open(request.method, request.url, true);
            }

            for (headerType in request.headers) {
                if (request.headers.hasOwnProperty(headerType)) {
                    XHR.setRequestHeader(
                        headerType,
                        request.headers[headerType]
                    );
                }
            }
            XHR.send(request.body);
        };
    };

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @return {boolean} whether the connection is compatible with current environment
     */
    MicrosoftXmlHttpRequestConnection.isCompatible = function () {
        return !!window.ActiveXObject;
    };

    return MicrosoftXmlHttpRequestConnection;

});
/* global define */
define('services/DiscoveryService',["structures/CAPIError"], function (CAPIError) {
    

    /**
     * Creates an instance of discovery service.
     * Discovery service is used internally to auto-discover and cache misc useful REST objects.
     *
     * @class DiscoveryService
     * @constructor
     * @param rootPath {String} path to Root resource
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function (rootPath, connectionManager) {
        this.connectionManager = connectionManager;
        this.rootPath = rootPath;

        this.cacheObject = {};

        /**
         * discover Root object
         *
         * @method discoverRoot
         * @param rootPath {String} path to Root resource
         * @param callback {Function} callback executed after performing the request
         * @param callback.error {mixed} false or CAPIError object if an error occurred
         * @param callback.response {boolean} true if the root was discovered successfully, false otherwise.
         */
        this.discoverRoot = function (rootPath, callback) {
            if (!this.cacheObject.Root) {
                var that = this;
                this.connectionManager.request(
                    "GET",
                    rootPath,
                    "",
                    {"Accept": "application/vnd.ez.api.Root+json"},
                    function (error, rootJSON) {
                        if (!error) {
                            that.copyToCache(rootJSON.document);
                            callback(false, true);

                        } else {
                            callback(
                                new CAPIError(
                                    "Discover service failed to retrieve root object.",
                                    {rootPath : rootPath}
                                ),
                                false
                            );
                        }
                    }
                );
            } else {
                callback(false, true);
            }
        };

        /**
         * Copy all the properties of a argument object into cache object
         *
         * @method addToCache
         * @param object {Object}
         */
        this.copyToCache = function (object) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    this.cacheObject[property] = object[property];
                }
            }
        };

        /**
         * Get target object from cacheObject by given 'name' and run the discovery process if it is not available.
         *
         * @method getObjectFromCache
         * @param name {String} name of the target object to be retrived (e.g. "Trash")
         * @param callback {Function} callback executed after performing the request
         * @param callback.error {mixed} false or CAPIError object if an error occurred
         * @param callback.response {mixed} the target object if it was found, false otherwise.
         */
        this.getObjectFromCache = function (name, callback) {
            var object = null,
                that = this;
            // Discovering root, if not yet discovered
            // on discovery running the request for same 'name' again
            if (!this.cacheObject.Root) {
                this.discoverRoot(this.rootPath, function () {
                    that.getObjectFromCache(name, callback);
                });
                return;
            }

            // Checking most obvious places for now
            // "Root" object (retrieved during root discovery request) and
            // root of a cache object in case we have cached value from some other request
            if (this.cacheObject.Root.hasOwnProperty(name)) {
                object = this.cacheObject.Root[name];
            } else if (this.cacheObject.hasOwnProperty(name)) {
                object = this.cacheObject[name];
            }

            if (object) {
                callback(
                    false,
                    object
                );
            } else {
                callback(
                    new CAPIError(
                        "Discover service failed to find cached object with name '" + name + "'.",
                        {name: name}
                    ),
                    false
                );
            }
        };
    };

    /**
     * Try to get url of the target object by given 'name'
     *
     * @method getUrl
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the url of the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getUrl = function (name, callback) {
        this.getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject._href
                        );
                    } else {
                        callback(
                            new CAPIError(
                                "Broken cached object returned when searching for '" + name + "'.",
                                {name: name}
                            ),
                            false
                        );
                    }
                } else {
                    callback(
                        error,
                        false
                    );
                }
            }
        );
    };

    /**
     * Try to get media-type of the target object by given 'name'
     *
     * @method getMediaType
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the media-type of the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getMediaType = function (name, callback) {
        this.getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject["_media-type"]
                        );
                    } else {
                        callback(
                            new CAPIError(
                                "Broken cached object returned when searching for '" + name + "'.",
                                {name: name}
                            ),
                            false
                        );
                    }
                } else {
                    callback(
                        error,
                        false
                    );
                }
            }
        );
    };

    /**
     * Try to get the whole target object by given 'name'
     *
     * @method getInfoObject
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getInfoObject = function (name, callback) {
        this.getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject
                        );
                    } else {
                        callback(
                            new CAPIError(
                                "Broken cached object returned when searching for '" + name + "'.",
                                {name: name}
                            ),
                            false
                        );
                    }
                } else {
                    callback(
                        error,
                        false
                    );
                }
            }
        );
    };

    return DiscoveryService;

});
/* global define */
define('structures/ContentCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Content object. See ContentService.createContent() call
     *
     * @class ContentCreateStruct
     * @constructor
     * @param contentTypeId {String} Content Type for new Content object (e.g. "blog")
     * @param locationCreateStruct {LocationCreateStruct} create structure for a Location object, where the new Content object will be situated
     * @param languageCode {String} The language code (e.g. "eng-GB")
     */
    var ContentCreateStruct = function (contentTypeId, locationCreateStruct, languageCode) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentCreate = {};

        this.body.ContentCreate.ContentType = {
                "_href": contentTypeId
            };

        this.body.ContentCreate.mainLanguageCode = languageCode;
        this.body.ContentCreate.LocationCreate = locationCreateStruct.body.LocationCreate;

        this.body.ContentCreate.Section = null;
        this.body.ContentCreate.alwaysAvailable = "true";
        this.body.ContentCreate.remoteId = null;
        this.body.ContentCreate.modificationDate = now;
        this.body.ContentCreate.fields = {};
        this.body.ContentCreate.fields.field = [];

        this.headers = {
            "Accept": "application/vnd.ez.api.Content+json",
            "Content-Type": "application/vnd.ez.api.ContentCreate+json"
        };

        return this;
    };

    return ContentCreateStruct;

});

/* global define */
define('structures/ContentUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Content object. See ContentService.updateContent() call
     *
     * @class ContentUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     */
    var ContentUpdateStruct = function (languageCode) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.VersionUpdate = {};

        this.body.VersionUpdate.modificationDate = now;
        this.body.VersionUpdate.initialLanguageCode = languageCode;
        this.body.VersionUpdate.fields = {
            "field": []
        };

        this.headers = {
            "Accept": "application/vnd.ez.api.Version+json",
            "Content-Type": "application/vnd.ez.api.VersionUpdate+json"
        };

        return this;
    };

    return ContentUpdateStruct;

});

/* global define */
define('structures/SectionInputStruct',[],function () {
    

    /**
     * Returns a structure used to create and update a Section. See for ex. ContentService.createSection() call
     *
     * @class SectionInputStruct
     * @constructor
     * @param identifier {String} unique section identifier
     * @param name {String} section name

     */
    var SectionInputStruct = function (identifier, name) {
        this.body = {};
        this.body.SectionInput = {};

        this.body.SectionInput.identifier = identifier;
        this.body.SectionInput.name = name;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Section+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.SectionInput+json";

        return this;
    };

    return SectionInputStruct;

});
/* global define */
define('structures/LocationCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Location. See ContentService.createLocation() call
     *
     * @class LocationCreateStruct
     * @constructor
     * @param parentLocationId {String} reference to the parent location of the new Location.
     */
    var LocationCreateStruct = function (parentLocationId) {
        this.body = {};
        this.body.LocationCreate = {};

        this.body.LocationCreate.ParentLocation = {
            "_href": parentLocationId
        };

        this.body.LocationCreate.sortField = "PATH";
        this.body.LocationCreate.sortOrder = "ASC";

        this.headers = {
            "Accept": "application/vnd.ez.api.Location+json",
            "Content-Type": "application/vnd.ez.api.LocationCreate+json"
        };

        return this;
    };

    return LocationCreateStruct;

});

/* global define */
define('structures/LocationUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Location. See ContentService.updateLocation() call
     *
     * @class LocationUpdateStruct
     * @constructor
     */
    var LocationUpdateStruct = function () {
        this.body = {};
        this.body.LocationUpdate = {};

        this.body.LocationUpdate.sortField = "PATH";
        this.body.LocationUpdate.sortOrder = "ASC";

        this.headers = {
            "Accept": "application/vnd.ez.api.Location+json",
            "Content-Type": "application/vnd.ez.api.LocationUpdate+json"
        };

        return this;
    };

    return LocationUpdateStruct;

});
/* global define */
define('structures/ContentMetadataUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Content's metadata. See ContentService.updateContentMetadata() call
     *
     * @class ContentMetadataUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     */
    var ContentMetadataUpdateStruct = function (languageCode) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentUpdate = {};

        this.body.ContentUpdate.MainLanguageCode = languageCode;
        this.body.ContentUpdate.Section = null;
        this.body.ContentUpdate.alwaysAvailable = "true";
        this.body.ContentUpdate.remoteId = null;
        this.body.ContentUpdate.modificationDate = now;
        this.body.ContentUpdate.publishDate = null;

        this.headers = {
            "Accept": "application/vnd.ez.api.ContentInfo+json",
            "Content-Type": "application/vnd.ez.api.ContentUpdate+json"
        };

        return this;
    };

    return ContentMetadataUpdateStruct;

});

/* global define */
define('structures/ObjectStateGroupCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Object State group. See ContentService.createObjectStateGroup() call
     *
     * @class ObjectStateGroupCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectStateGroup identifier
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} multiLanguageValuesType in JSON format
     * @example
     *      var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
     *          "some-id",
     *          "eng-US",
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Name"
     *              }
     *          ]
     *      );
     */
    var ObjectStateGroupCreateStruct = function (identifier, languageCode, names) {
        this.body = {};
        this.body.ObjectStateGroupCreate = {};

        this.body.ObjectStateGroupCreate.identifier = identifier;
        this.body.ObjectStateGroupCreate.defaultLanguageCode = languageCode;

        this.body.ObjectStateGroupCreate.names = {};
        this.body.ObjectStateGroupCreate.names.value = names;

        this.body.ObjectStateGroupCreate.descriptions = {};
        this.body.ObjectStateGroupCreate.descriptions.value = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupCreate+json";

        return this;
    };

    return ObjectStateGroupCreateStruct;

});
/* global define */
define('structures/ObjectStateGroupUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update an Object State group. See ContentService.updateObjectStateGroup() call
     *
     * @class ObjectStateGroupUpdateStruct
     * @constructor
     */
    var ObjectStateGroupUpdateStruct = function () {
        this.body = {};
        this.body.ObjectStateGroupUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupUpdate+json";

        return this;
    };

    return ObjectStateGroupUpdateStruct;

});
/* global define */
define('structures/ObjectStateCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Object State. See ContentService.createObjectState() call
     *
     * @class ObjectStateCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {int}
     * @param names {Array} Multi language value (see example)
     * @param descriptions {Array} Multi language value (see example)
     * @example
     *      var objectStateCreateStruct = contentService.newObjectStateCreateStruct(
     *          "some-id",
     *          "eng-US",
     *          0,
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Name"
     *              }
     *          ],
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Description"
     *              }
     *          ]
     *      );
     */
    var ObjectStateCreateStruct = function (identifier, languageCode, priority, names, descriptions) {
        this.body = {};
        this.body.ObjectStateCreate = {};

        this.body.ObjectStateCreate.identifier = identifier;
        this.body.ObjectStateCreate.defaultLanguageCode = languageCode;
        this.body.ObjectStateCreate.priority = priority;
        this.body.ObjectStateCreate.names = {};
        this.body.ObjectStateCreate.names.value = names;
        this.body.ObjectStateCreate.descriptions = {};
        this.body.ObjectStateCreate.descriptions.value = descriptions;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateCreate+json";

        return this;
    };

    return ObjectStateCreateStruct;

});
/* global define */
define('structures/ObjectStateUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update an Object State. See ContentService.updateObjectState() call
     *
     * @class ObjectStateUpdateStruct
     * @constructor
     */
    var ObjectStateUpdateStruct = function () {
        this.body = {};
        this.body.ObjectStateUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateUpdate+json";

        return this;
    };

    return ObjectStateUpdateStruct;

});
/* global define */
define('structures/ViewCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new View. See ContentService.createView() call
     *
     * @class ViewCreateStruct
     * @constructor
     * @param identifier {String} unique view identifier
     */
    var ViewCreateStruct = function (identifier) {
        this.body = {};
        this.body.ViewInput = {};

        this.body.ViewInput.identifier = identifier;
        this.body.ViewInput.public = false;
        this.body.ViewInput.Query = {};

        this.body.ViewInput.Query.Criteria = {};
        this.body.ViewInput.Query.offset = 0;
        this.body.ViewInput.Query.FacetBuilders = {};
        this.body.ViewInput.Query.SortClauses = {};
        this.body.ViewInput.Query.spellcheck = false;

        this.headers = {
            "Accept": "application/vnd.ez.api.View+json",
            "Content-Type": "application/vnd.ez.api.ViewInput+json"
        };

        return this;
    };

    return ViewCreateStruct;

});
/* global define */
define('structures/UrlAliasCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new UrlAlias object. See ContentService.createUrlAlias() call
     *
     * @class UrlAliasCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param resource {String} eZ Publish resource you want to create alias for
     * @param path {String} the new alias itself
     * @example
     *     var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
     *         "eng-US",
     *         "content/search",
     *         "findme-alias"
     *     );
     */
    var UrlAliasCreateStruct = function (languageCode, resource, path) {
        this.body = {};
        this.body.UrlAliasCreate = {};

        this.body.UrlAliasCreate._type = "RESOURCE";

        this.body.UrlAliasCreate.resource = resource;
        this.body.UrlAliasCreate.path = path;

        this.body.UrlAliasCreate.alwaysAvailable = "false";
        this.body.UrlAliasCreate.forward = "false";
        this.body.UrlAliasCreate.languageCode = languageCode;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UrlAlias+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UrlAliasCreate+json";

        return this;
    };

    return UrlAliasCreateStruct;

});
/* global define */
define('structures/UrlWildcardCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Url Wildcard object. See ContentService.createUrlWildcard() call
     *
     * @class UrlWildcardCreateStruct
     * @constructor
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {boolean} weather or not the wildcard should redirect to the resource
     */
    var UrlWildcardCreateStruct = function (sourceUrl, destinationUrl, forward) {
        this.body = {};
        this.body.UrlWildcardCreate = {};

        this.body.UrlWildcardCreate.sourceUrl = sourceUrl;
        this.body.UrlWildcardCreate.destinationUrl = destinationUrl;
        this.body.UrlWildcardCreate.forward = forward;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UrlWildcard+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UrlWildcardCreate+json";

        return this;
    };

    return UrlWildcardCreateStruct;

});
/* global define */
define('structures/RelationCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Content object. See ContentService.createRelation() call
     *
     * @class RelationCreateStruct
     * @constructor
     * @param destination {String} reference to the resource we want to make related
     */
    var RelationCreateStruct = function (destination) {
        this.body = {};
        this.body.RelationCreate = {};
        this.body.RelationCreate.Destination = {
            _href: destination
        };

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Relation+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RelationCreate+json";

        return this;
    };

    return RelationCreateStruct;

});
/* global define */
define('services/ContentService',["structures/ContentCreateStruct", "structures/ContentUpdateStruct", "structures/SectionInputStruct",
        "structures/LocationCreateStruct", "structures/LocationUpdateStruct", "structures/ContentMetadataUpdateStruct",
        "structures/ObjectStateGroupCreateStruct", "structures/ObjectStateGroupUpdateStruct", "structures/ObjectStateCreateStruct",
        "structures/ObjectStateUpdateStruct", "structures/ViewCreateStruct", "structures/UrlAliasCreateStruct",
        "structures/UrlWildcardCreateStruct", "structures/RelationCreateStruct"],
    function (ContentCreateStruct, ContentUpdateStruct, SectionInputStruct,
              LocationCreateStruct, LocationUpdateStruct, ContentMetadataUpdateStruct,
              ObjectStateGroupCreateStruct, ObjectStateGroupUpdateStruct, ObjectStateCreateStruct,
              ObjectStateUpdateStruct, ViewCreateStruct, UrlAliasCreateStruct,
              UrlWildcardCreateStruct, RelationCreateStruct) {
    

    /**
     * Creates an instance of Content Service object. Use ContentService to retrieve information and execute operations related to Content.
     *
     * ## Note on the *callbacks* usage
     *
     * The **callback** argument of the service methods always take 2 arguments:
     *
     *    *     **error** either `false` or {{#crossLink "CAPIError"}}CAPIError{{/crossLink}} object when an error occurred
     *
     *    *     **response** the {{#crossLink "Response"}}Response{{/crossLink}} object
     *
     * Example:
     *
     *     contentService.loadRoot("/api/ezp/v2/", function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class ContentService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} is handling REST paths auto-discovery
     * @example
     *     var contentService = jsCAPI.getContentService();
     */
    var ContentService = function (connectionManager, discoveryService) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
    };

    /**
     * List the root resources of the eZ Publish installation. Root resources contain many paths and references to other parts of the REST interface.
     * This call is used by DiscoveryService automatically, whenever needed.
     *
     * @method loadRoot
     * @param rootPath {String} path to Root resource
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadRoot = function loadRoot(rootPath, callback) {
        this._connectionManager.request(
            "GET",
            rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            callback
        );
    };

// ******************************
// Structures
// ******************************

    /**
     * Returns update structure for Content object
     *
     * @method newContentUpdateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return {ContentUpdateStruct}
     *
     */
    ContentService.prototype.newContentUpdateStruct = function newContentUpdateStruct(language) {
        return new ContentUpdateStruct(language);
    };

    /**
     * Returns update structure for Content object metadata
     *
     * @method newContentMetadataUpdateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return ContentMetadataUpdateStruct
     */
    ContentService.prototype.newContentMetadataUpdateStruct = function newContentMetadataUpdateStruct(language) {
        return new ContentMetadataUpdateStruct(language);
    };

    /**
     * Returns create structure for Content object
     *
     * @method newContentCreateStruct
     * @param contentTypeId {String} Content Type for new Content object (e.g.: /api/v2/ezp/content/type/1)
     * @param locationCreateStruct {LocationCreateStruct} create structure for a Location object, where the new Content object will be situated
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return {ContentCreateStruct}
     */
    ContentService.prototype.newContentCreateStruct = function newContentCreateStruct(contentTypeId, locationCreateStruct, language) {
        return new ContentCreateStruct(contentTypeId, locationCreateStruct, language);
    };

    /**
     * Returns input structure for Section object. Input structure is needed while creating and updating the object.
     *
     * @method newSectionInputStruct
     * @param identifier {String} unique section identifier (e.g. "media")
     * @param name {String} section name (e.g. "Media")
     * @return {SectionInputStruct}
     */
    ContentService.prototype.newSectionInputStruct = function newSectionInputStruct(identifier, name) {
        return new SectionInputStruct(identifier, name);
    };

    /**
     * Returns create structure for Location object
     *
     * @method newLocationCreateStruct
     * @param parentLocationId {String} Reference to the parent location of the new Location. (e.g. "/api/ezp/v2/content/locations/1/2/118")
     * @return {LocationCreateStruct}
     */
    ContentService.prototype.newLocationCreateStruct = function newLocationCreateStruct(parentLocationId) {
        return new LocationCreateStruct(parentLocationId);
    };

    /**
     * Returns update structure for Location object
     *
     * @method newLocationUpdateStruct
     * @return {LocationUpdateStruct}
     */
    ContentService.prototype.newLocationUpdateStruct = function newLocationUpdateStruct() {
        return new LocationUpdateStruct();
    };

    /**
     * Returns create structure for View object
     *
     * @method newViewCreateStruct
     * @param identifier {String} unique view identifier (e.g. "my-new-view")
     * @return {ViewCreateStruct}
     */
    ContentService.prototype.newViewCreateStruct = function newViewCreateStruct(identifier) {
        return new ViewCreateStruct(identifier);
    };

    /**
     * Returns create structure for Relation
     *
     * @method newRelationCreateStruct
     * @param destination {String} reference to the resource we want to make related
     * @return {RelationCreateStruct}
     */
    ContentService.prototype.newRelationCreateStruct = function newRelationCreateStruct(destination) {
        return new RelationCreateStruct(destination);
    };

    /**
     * Returns create structure for ObjectStateGroup
     *
     * @method newObjectStateGroupCreateStruct
     * @param identifier {String} unique ObjectStateGroup identifier (e.g. "some-new-group")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} Multi language value (see example)
     * @return {ObjectStateGroupCreateStruct}
     * @example
     *      var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *      );
     */
    ContentService.prototype.newObjectStateGroupCreateStruct = function newObjectStateGroupCreateStruct(identifier, languageCode, names) {
        return new ObjectStateGroupCreateStruct(identifier, languageCode, names);
    };

    /**
     * Returns update structure for ObjectStateGroup
     *
     * @method newObjectStateGroupUpdateStruct
     * @return ObjectStateGroupUpdateStruct
     */
    ContentService.prototype.newObjectStateGroupUpdateStruct = function newObjectStateGroupUpdateStruct() {
        return new ObjectStateGroupUpdateStruct();
    };

    /**
     * Returns create structure for ObjectState
     *
     * @method newObjectStateCreateStruct
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {int}
     * @param names {Array} Multi language value (see example)
     * @param descriptions {Array} Multi language value (see example)
     * @return {ObjectStateCreateStruct}
     * @example
     *      var objectStateCreateStruct = contentService.newObjectStateCreateStruct(
     *          "some-id", "eng-US", 0, [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }], [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Description"
     *          }]
     *      );
     */
    ContentService.prototype.newObjectStateCreateStruct = function (identifier, languageCode, priority, names, descriptions) {
        return new ObjectStateCreateStruct(identifier, languageCode, priority, names, descriptions);
    };

    /**
     * Returns update structure for ObjectState
     *
     * @method newObjectStateUpdateStruct
     * @return {ObjectStateUpdateStruct}
     */
    ContentService.prototype.newObjectStateUpdateStruct = function newObjectStateUpdateStruct() {
        return new ObjectStateUpdateStruct();
    };

    /**
     * Returns create structure for UrlAlias
     *
     * @method newUrlAliasCreateStruct
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param resource {String} eZ Publish resource you want to create alias for
     * @param path {String} the new alias itself
     * @return {UrlAliasCreateStruct}
     * @example
     *     var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
     *         "eng-US",
     *         "content/search",
     *         "findme-alias"
     *     );
     */
    ContentService.prototype.newUrlAliasCreateStruct = function newUrlAliasCreateStruct(languageCode, resource, path) {
        return new UrlAliasCreateStruct(languageCode, resource, path);
    };

    /**
     * Returns create structure for UrlWildcard
     *
     * @method newUrlWildcardCreateStruct
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {boolean} weather or not the wildcard should redirect to the resource
     * @example
     *     var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
     *         "some-new-wildcard",
     *         "/api/ezp/v2/content/locations/1/2/113",
     *         "false"
     *     );
     */
    ContentService.prototype.newUrlWildcardCreateStruct = function newUrlWildcardCreateStruct(sourceUrl, destinationUrl, forward) {
        return new UrlWildcardCreateStruct(sourceUrl, destinationUrl, forward);
    };

// ******************************
// Sections management
// ******************************

    /**
     * Create a new section
     *
     * @method createSection
     * @param sectionInputStruct {SectionInputStruct} object describing section to be created
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createSection = function createSection(sectionInputStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (!error) {
                    that._connectionManager.request(
                        "POST",
                        sections._href,
                        JSON.stringify(sectionInputStruct.body),
                        sectionInputStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update target section
     *
     * @method updateSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param sectionInputStruct {SectionInputStruct} object describing updates to the section
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateSection = function updateSection(sectionId, sectionInputStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            sectionId,
            JSON.stringify(sectionInputStruct.body),
            sectionInputStruct.headers,
            callback
        );
    };

    /**
     * List all available sections of eZ Publish instance
     *
     * @method loadSections
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadSections = function loadSections(callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        sections._href,
                        "",
                        {"Accept": sections["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load single section
     *
     * @method loadSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadSection = function loadSection(sectionId, callback) {
        this._connectionManager.request(
            "GET",
            sectionId,
            "",
            {"Accept": "application/vnd.ez.api.Section+json"},
            callback
        );
    };

    /**
     * Delete target section
     *
     * @method deleteSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteSection = function deleteSection(sectionId, callback) {
        this._connectionManager.delete(
            sectionId,
            callback
        );
    };

// ******************************
// Content management
// ******************************

    /**
     * Creates a new content draft assigned to the authenticated user.
     *
     * @method createContent
     * @param contentCreateStruct {ContentCreateStruct} object describing content to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createContent = function createContent(contentCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "content",
            function (error, contentObjects) {
                if (!error) {
                    that._connectionManager.request(
                        "POST",
                        contentObjects._href,
                        JSON.stringify(contentCreateStruct.body),
                        contentCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update target content metadata.
     *
     * @method updateContentMetadata
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param contentMetadataUpdateStruct {ContentMetadataUpdateStruct} object describing update of the content metadata
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      var updateStruct = contentService.newContentMetadataUpdateStruct("eng-US");
     *
     *      updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
     *      updateStruct.body.ContentUpdate.remoteId = "new-remote-id";
     *
     *      contentService.updateContentMetadata(
     *          "/api/ezp/v2/content/objects/180",
     *          updateStruct,
     *          callback
     *      );
     */
    ContentService.prototype.updateContentMetadata = function updateContentMetadata(contentId, contentMetadataUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentId,
            JSON.stringify(contentMetadataUpdateStruct.body),
            contentMetadataUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load single content by remoteId
     *
     * @method loadContentByRemoteId
     * @param remoteId {String} remote id of target content object (e.g. "30847bec12a8a398777493a4bdb10398")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentByRemoteId = function loadContentByRemoteId(remoteId, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "content",
            function (error, contentObjects) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        contentObjects._href + '?remoteId=' + remoteId,
                        "",
                        {"Accept": contentObjects["_media-type"]},
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load single content info
     *
     * @method loadContentInfo
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentInfo = function loadContentInfo(contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            "",
            {"Accept": "application/vnd.ez.api.ContentInfo+json"},
            callback
        );
    };

    /**
     * Load single content info with embedded current version
     *
     * @method loadContentInfoAndCurrentVersion
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentInfoAndCurrentVersion = function loadContentInfoAndCurrentVersion(contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            "",
            {"Accept": "application/vnd.ez.api.Content+json"},
            callback
        );
    };

    /**
     * Delete target content
     *
     * @method deleteContent
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      contentService.deleteContent(
     *          "/api/ezp/v2/content/objects/116",
     *          callback
     *      );
     */
    ContentService.prototype.deleteContent = function deleteContent(contentId, callback) {
        this._connectionManager.delete(
            contentId,
            callback
        );
    };

    /**
     * Copy content to determined location
     *
     * @method copyContent
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param destinationId {String} A location resource to which the content object should be copied (e.g. "/api/ezp/v2/content/locations/1/2/119")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.copyContent = function copyContent(contentId, destinationId, callback) {
        this._connectionManager.request(
            "COPY",
            contentId,
            "",
            {"Destination": destinationId},
            callback
        );
    };

// ******************************
// Versions management
// ******************************

    /**
     * Load current version for target content
     *
     * @method loadCurrentVersion
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadCurrentVersion = function loadCurrentVersion(contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (!error) {
                    var currentVersion = contentResponse.document.Content.CurrentVersion;

                    that._connectionManager.request(
                        "GET",
                        currentVersion._href,
                        "",
                        {"Accept": currentVersion["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Loads a specific version of target content. This method returns fields and relations
     *
     * @method loadContent
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param [fields] {String} comma separated list of fields which should be returned in the response (see Content)
     * @param [responseGroups] {String}  alternative: comma separated lists of predefined field groups (see REST API Spec v1)
     * @param [languages] {String} (comma separated list) restricts the output of translatable fields to the given languages
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     contentService.loadContent(
     *          "/api/ezp/v2/content/objects/180/versions/1",
     *          null,
     *          null,
     *          "eng-US",
     *          callback
     *     );
     */
    ContentService.prototype.loadContent = function loadContent(versionedContentId, fields, responseGroups, languages, callback) {
        var defaultFields = '',
            defaultResponseGroups = '',
            defaultLanguages = '';

        // default values for omitted parameters (if any)
        if (arguments.length < 5) {
            if (typeof fields == "function") {
                //no optional parameteres are passed
                callback = fields;
                fields = defaultFields;
                responseGroups = defaultResponseGroups;
                languages = defaultLanguages;
            } else if (typeof responseGroups == "function") {
                // only first 1 optional parameter is passed
                callback = responseGroups;
                responseGroups = defaultResponseGroups;
                languages = defaultLanguages;
            } else {
                // only first 2 optional parameters are passed
                callback = languages;
                languages = defaultLanguages;
            }
        }

        if (fields) {
            fields = '?fields=' + fields;
        }
        if (responseGroups) {
            responseGroups = '&responseGroups="' + responseGroups + '"';
        }
        if (languages) {
            languages = '&languages=' + languages;
        }

        this._connectionManager.request(
            "GET",
            versionedContentId + fields + responseGroups + languages,
            "",
            {"Accept": "application/vnd.ez.api.Version+json"},
            callback
        );
    };

    /**
     *  Loads all versions for the target content
     *
     * @method loadVersions
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadVersions = function loadVersions(contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (!error) {
                    var contentVersions = contentResponse.document.Content.Versions;

                    that._connectionManager.request(
                        "GET",
                        contentVersions._href,
                        "",
                        {"Accept": contentVersions["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Updates the fields of a target draft
     *
     * @method updateContent
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param contentUpdateStruct {ContentUpdateStruct} object describing update to the draft
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateContent = function updateContent(versionedContentId, contentUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            versionedContentId,
            JSON.stringify(contentUpdateStruct.body),
            contentUpdateStruct.headers,
            callback
        );
    };

    /**
     * Creates a draft from a published or archived version.
     *
     * @method createContentDraft
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param [versionId] {int} numerical id of the base version for the new draft. If not provided the current version of the content will be used.
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      // Create draft from current version
     *      contentService.createContentDraft(
     *          "/api/ezp/v2/content/objects/107",
     *          null,
     *          callback
     *      );
     *
     *      // Create draft from version #2
     *      contentService.createContentDraft(
     *          "/api/ezp/v2/content/objects/107",
     *          2,
     *          callback
     *      );
     */
    ContentService.prototype.createContentDraft = function createContentDraft(contentId, versionId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                var url = '';

                if (!error) {

                    if (typeof versionId !== "function") {
                        url = contentResponse.document.Content.Versions._href + "/" + versionId;
                    } else {
                        callback = versionId;
                        url = contentResponse.document.Content.CurrentVersion._href;
                    }

                    that._connectionManager.request(
                        "COPY", url, "",
                        {"Accept": "application/vnd.ez.api.Version+json"},
                        callback
                    );
                    
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Deletes target version of the content.
     *
     * @method deleteVersion
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteVersion = function deleteVersion(versionedContentId, callback) {
        this._connectionManager.delete(
            versionedContentId,
            callback
        );
    };

    /**
     * Publishes target version of the content.
     *
     * @method publishVersion
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.publishVersion = function publishVersion(versionedContentId, callback) {
        this._connectionManager.request(
            "PUBLISH",
            versionedContentId,
            "",
            {},
            callback
        );
    };

// ******************************
// Locations management
// ******************************

    /**
     * Creates a new location for target content object
     *
     * @method createLocation
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param locationCreateStruct {LocationCreateStruct} object describing new location to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createLocation = function createLocation(contentId, locationCreateStruct, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (!error) {
                    var locations = contentResponse.document.Content.Locations;

                    that._connectionManager.request(
                        "POST",
                        locations._href,
                        JSON.stringify(locationCreateStruct.body),
                        locationCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads all locations for target content object
     *
     * @method loadLocations
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocations = function loadLocations(contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (!error) {
                    var locations = contentResponse.document.Content.Locations;

                    that._connectionManager.request(
                        "GET",
                        locations._href,
                        "",
                        {"Accept": "application/vnd.ez.api.LocationList+json"},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads target location
     *
     * @method loadLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocation = function loadLocation(locationId, callback) {
        this._connectionManager.request(
            "GET",
            locationId,
            "",
            {"Accept": "application/vnd.ez.api.Location+json"},
            callback
        );
    };

    /**
     *  Loads target location by remote Id
     *
     * @method loadLocationByRemoteId
     * @param locations {String} root locations (will be auto-discovered in near future)
     * @param remoteId {String} remote id of target location (e.g. "0bae96bd419e141ff3200ccbf2822e4f")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocationByRemoteId = function loadLocationByRemoteId(locations, remoteId, callback) {
        this._connectionManager.request(
            "GET",
            locations + '?remoteId=' + remoteId,
            "",
            {Accept: "application/vnd.ez.api.Location+json"},
            callback
        );
    };

    /**
     * Updates target location
     *
     * @method updateLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param locationUpdateStruct {LocationUpdateStruct} object describing changes to target location
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateLocation = function updateLocation(locationId, locationUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            locationId,
            JSON.stringify(locationUpdateStruct.body),
            locationUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Loads children for the target location
     *
     * @method loadLocationChildren
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      contentService.loadLocationChildren(
     *          "/api/ezp/v2/content/locations/1/2/102",
     *          5,
     *          5,
     *          callback
     *      );
     */
    ContentService.prototype.loadLocationChildren = function loadLocationChildren(locationId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadLocation(
            locationId,
            function (error, locationResponse) {
                if (!error) {
                    var location = locationResponse.document.Location;

                    that._connectionManager.request(
                        "GET",
                        location.Children._href + '?offset=' + offset + '&limit=' + limit,
                        "",
                        {"Accept": location.Children["_media-type"]},
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Copies the subtree starting from "subtree" as a new subtree of "targetLocation"
     *
     * @method copySubtree
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location where source subtree should be copied
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.copySubtree = function copySubtree(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "COPY",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Moves the subtree to a new subtree of "targetLocation"
     *  The targetLocation can also be /content/trash, in that case the location is put into the trash.
     *
     * @method moveSubtree
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location where source subtree should be moved
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.moveSubtree = function moveSubtree(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "MOVE",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Swaps the location of the "subtree" with "targetLocation"
     *
     * @method swapLocation
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location with which subtree location should be swapped
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.swapLocation = function swapLocation(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "SWAP",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Deletes the location and all it's subtrees
     *  Every content object is deleted which does not have any other location.
     *  Otherwise the deleted location is removed from the content object.
     *  The children are recursively deleted.
     *
     * @method deleteLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteLocation = function deleteLocation(locationId, callback) {
        this._connectionManager.delete(
            locationId,
            callback
        );
    };

// ******************************
// Views management
// ******************************

    /**
     * Creates a new view
     *
     * @method createView
     * @param viewCreateStruct {ViewCreateStruct} object describing new view to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createView = function createView(viewCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "views",
            function (error, views) {
                if (!error) {
                    that._connectionManager.request(
                        "POST",
                        views._href,
                        JSON.stringify(viewCreateStruct.body),
                        viewCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

// ******************************
// Relations management
// ******************************

    /**
     *  Loads the relations of the target version.
     *
     * @method loadRelations
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadRelations = function loadRelations(versionedContentId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadContent(
            versionedContentId,
            {},
            function (error, versionResponse) {
                if (!error) {
                    var version = versionResponse.document.Version;

                    that._connectionManager.request(
                        "GET",
                        version.Relations._href + '?offset=' + offset + '&limit=' + limit,
                        "",
                        {"Accept": version.Relations["_media-type"]},
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads the relations of the target content's current version
     *
     * @method loadCurrentRelations
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/102")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadCurrentRelations = function loadCurrentRelations(contentId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadCurrentVersion(
            contentId,
            function (error, currentVersionResponse) {
                if (!error) {
                    var currentVersion = currentVersionResponse.document.Version;

                    that._connectionManager.request(
                        "GET",
                        currentVersion.Relations._href + '?offset=' + offset + '&limit=' + limit,
                        "",
                        {"Accept": currentVersion.Relations["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads target relation
     *
     * @method loadRelation
     * @param relationId {String} target relation identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5/relations/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadRelation = function loadRelation(relationId, callback) {
        this._connectionManager.request(
            "GET",
            relationId,
            "",
            {"Accept": "application/vnd.ez.api.Relation+json"},
            callback
        );
    };

    /**
     *  Creates a new relation of type COMMON for the given draft.
     *
     * @method addRelation
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5")
     * @param relationCreateStruct {RelationCreateStruct} object describing new relation to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");
     *      contentService.addRelation(
     *          "/api/ezp/v2/content/objects/102/versions/5",
     *          relationCreateStruct,
     *          callback
     *      );
     */
    ContentService.prototype.addRelation = function addRelation(versionedContentId, relationCreateStruct, callback) {
        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function (error, versionResponse) {
                if (!error) {
                    var version = versionResponse.document.Version;

                    that._connectionManager.request(
                        "POST",
                        version.Relations._href,
                        JSON.stringify(relationCreateStruct.body),
                        relationCreateStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Delete target relation
     *
     * @method deleteRelation
     * @param relationId {String} target relation identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5/relations/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteRelation = function deleteRelation(relationId, callback) {
        this._connectionManager.delete(
            relationId,
            callback
        );
    };

// ******************************
// Thrash management
// ******************************

    /**
     *  Loads all the thrash can items
     *
     * @method loadTrashItems
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadTrashItems = function loadTrashItems(limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 3) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this._discoveryService.getInfoObject(
            "trash",
            function (error, trash) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        trash._href + '?offset=' + offset + '&limit=' + limit,
                        "",
                        {"Accept": trash["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads target thrash can item
     *
     * @method loadTrashItem
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadTrashItem = function loadTrashItem(trashItemId, callback) {
        this._connectionManager.request(
            "GET",
            trashItemId,
            "",
            {"Accept": "application/vnd.ez.api.TrashItem+json"},
            callback
        );
    };

    /**
     *  Restores target trashItem
     *
     * @method recover
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param [destination] {String} if given the trash item is restored under this location otherwise under its original parent location
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.recover = function recover(trashItemId, destination, callback) {

        var headers = {"Accept": "application/vnd.ez.api.TrashItem+json"};

        if ((typeof destination != "function")) {
            headers.Destination = destination;
        } else {
            callback = destination;
        }

        this._connectionManager.request(
            "MOVE",
            trashItemId,
            "",
            headers,
            callback
        );
    };

    /**
     *  Delete target trashItem
     *
     * @method deleteTrashItem
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteTrashItem = function deleteTrashItem(trashItemId, callback) {
        this._connectionManager.delete(
            trashItemId,
            callback
        );
    };

    /**
     *  Empty the trash can
     *
     * @method emptyThrash
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.emptyThrash = function emptyThrash(callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "trash",
            function (error, trash) {
                if (!error) {
                    that._connectionManager.request(
                        "DELETE",
                        trash._href,
                        "",
                        {},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

// ******************************
// ObjectStates management
// ******************************

    /**
     *  Loads all the ObjectState groups
     *
     * @method loadObjectStateGroups
     * @param objectStateGroups {String} path to root objectStateGroups (will be replaced by auto-discovered soon)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectStateGroups = function loadObjectStateGroups(objectStateGroups, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroups,
            "",
            {"Accept": "application/vnd.ez.api.ObjectStateGroupList+json"},
            callback
        );
    };

    /**
     *  Loads target ObjectState group
     *
     * @method loadObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectStateGroup = function loadObjectStateGroup(objectStateGroupId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroupId,
            "",
            {"Accept": "application/vnd.ez.api.ObjectStateGroup+json"},
            callback
        );
    };

    /**
     *  Create a new ObjectState group
     *
     * @method createObjectStateGroup
     * @param objectStateGroups {String} path to root objectStateGroups (will be replaced by auto-discovered soon)
     * @param objectStateGroupCreateStruct {ObjectStateGroupCreateStruct} object describing new ObjectState group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createObjectStateGroup = function createObjectStateGroup(objectStateGroups, objectStateGroupCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectStateGroups,
            JSON.stringify(objectStateGroupCreateStruct.body),
            objectStateGroupCreateStruct.headers,
            callback
        );
    };

    /**
     *  Update target ObjectState group
     *
     * @method updateObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param objectStateGroupUpdateStruct {ObjectStateGroupUpdateStruct} object describing changes to target ObjectState group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateObjectStateGroup = function updateObjectStateGroup(objectStateGroupId, objectStateGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateGroupId,
            JSON.stringify(objectStateGroupUpdateStruct.body),
            objectStateGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete target ObjectState group
     *
     * @method deleteObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteObjectStateGroup = function deleteObjectStateGroup(objectStateGroupId, callback) {
        this._connectionManager.delete(
            objectStateGroupId,
            callback
        );
    };

    /**
     *  Creates a new ObjectState in target group
     *
     * @method createObjectState
     * @param objectStateGroupId {String} target group, where new object state should be created (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param objectStateCreateStruct {ObjectStateCreateStruct} object describing new ObjectState to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createObjectState = function createObjectState(objectStateGroupId, objectStateCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectStateGroupId + "/objectstates",
            JSON.stringify(objectStateCreateStruct.body),
            objectStateCreateStruct.headers,
            callback
        );
    };

    /**
     *  Load target ObjectState
     *
     * @method loadObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectState = function loadObjectState(objectStateId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateId,
            "",
            {"Accept": "application/vnd.ez.api.ObjectState+json"},
            callback
        );
    };

    /**
     *  Update target ObjectState
     *
     * @method updateObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param objectStateUpdateStruct {ObjectStateUpdateStruct} object describing changes to target ObjectState
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateObjectState = function updateObjectState(objectStateId, objectStateUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateId,
            JSON.stringify(objectStateUpdateStruct.body),
            objectStateUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete target ObjectState
     *
     * @method deleteObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteObjectState = function deleteObjectState(objectStateId, callback) {
        this._connectionManager.delete(
            objectStateId,
            callback
        );
    };

    /**
     *  Get ObjectStates of target content
     *
     * @method getContentState
     * @param contentStatesId {String} link to target content's object states (should be auto-discovered from contentId)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.getContentState = function getContentState(contentStatesId, callback) {
        this._connectionManager.request(
            "GET",
            contentStatesId,
            "",
            {"Accept": "application/vnd.ez.api.ContentObjectStates+json"},
            callback
        );
    };

    /**
     *  Set ObjectStates of a content
     *
     * @method setContentState
     * @param contentStatesId {String} link to target content's object states (should be auto-discovered from contentId)
     * @param objectStates {Array}
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     contentService.loadObjectState(
     *          "/api/ezp/v2/content/objectstategroups/4/objectstates/3",
     *          function (error, objectStateResponse) {
     *              // possible error should be handled...
     *
     *              var objectStates = {};
     *              // Extra odd structure, but it works!
     *              objectStates.ObjectState = {};
     *              objectStates.ObjectState.ObjectState = {};
     *              objectStates.ObjectState.ObjectState = JSON.parse(objectStateResponse.body);
     *
     *              contentService.setContentState(
     *                  "/api/ezp/v2/content/objects/17/objectstates",
     *                  objectStates,
     *                  callback
     *              );
     *          }
     *     );
     */
    ContentService.prototype.setContentState = function setContentState(contentStatesId, objectStates, callback) {
        this._connectionManager.request(
            "PATCH",
            contentStatesId,
            JSON.stringify(objectStates),
            {
                "Accept": "application/vnd.ez.api.ContentObjectStates+json",
                "Content-Type": "application/vnd.ez.api.ContentObjectStates+json"
            },
            callback
        );
    };

// ******************************
// URL Aliases management
// ******************************

    /**
     *  Creates a new UrlAlias
     *
     * @method createUrlAlias
     * @param urlAliases {String} link to root UrlAliases resource (should be auto-discovered)
     * @param urlAliasCreateStruct {UrlAliasCreateStruct} object describing new UrlAlias to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createUrlAlias = function createUrlAlias(urlAliases, urlAliasCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            urlAliases,
            JSON.stringify(urlAliasCreateStruct.body),
            urlAliasCreateStruct.headers,
            callback
        );
    };

    /**
     *  Loads all the global UrlAliases
     *
     * @method loadUrlAliases
     * @param urlAliases {String} link to root UrlAliases resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.listGlobalAliases = function listGlobalAliases(urlAliases, callback) {
        this._connectionManager.request(
            "GET",
            urlAliases,
            "",
            {"Accept": "application/vnd.ez.api.UrlAliasRefList+json"},
            callback
        );
    };

    /**
     *  Loads all the UrlAliases for a location
     *
     * @method listLocationAliases
     * @param locationUrlAliases {String} link to target location's UrlAliases (should be auto-discovered from locationId)
     * @param [custom=true] {boolean} this flag indicates weather autogenerated (false) or manual url aliases (true) should be returned
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.listLocationAliases = function listLocationAliases(locationUrlAliases, custom, callback) {

        var parameters;

        // default values for omitted parameters (if any)
        if (arguments.length < 3) {
            callback = custom;
            custom = true;
        }

        parameters = (custom === true) ? "" : "?custom=false";

        this._connectionManager.request(
            "GET",
            locationUrlAliases + '/urlaliases' + parameters,
            "",
            {"Accept": "application/vnd.ez.api.UrlAliasRefList+json"},
            callback
        );
    };

    /**
     *  Load target URL Alias
     *
     * @method loadUrlAlias
     * @param urlAliasId {String} target url alias identifier (e.g. "/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlAlias = function loadUrlAlias(urlAliasId, callback) {
        this._connectionManager.request(
            "GET",
            urlAliasId,
            "",
            {"Accept": "application/vnd.ez.api.UrlAlias+json"},
            callback
        );
    };

    /**
     *  Delete target URL Alias
     *
     * @method deleteUrlAlias
     * @param urlAliasId {String} target url alias identifier (e.g. "/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteUrlAlias = function deleteUrlAlias(urlAliasId, callback) {
        this._connectionManager.delete(
            urlAliasId,
            callback
        );
    };

// ******************************
// URL Wildcards management
// ******************************

    /**
     *  Creates a new UrlWildcard
     *
     * @method createUrlWildcard
     * @param urlWildcards {String} link to root UrlWildcards resource (should be auto-discovered)
     * @param urlWildcardCreateStruct {UrlWildcardCreateStruct} object describing new UrlWildcard to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createUrlWildcard = function createUrlWildcard(urlWildcards, urlWildcardCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            urlWildcards,
            JSON.stringify(urlWildcardCreateStruct.body),
            urlWildcardCreateStruct.headers,
            callback
        );
    };

    /**
     *  Loads all UrlWildcards
     *
     * @method loadUrlWildcards
     * @param urlWildcards {String} link to root UrlWildcards resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlWildcards = function loadUrlWildcards(urlWildcards, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcards,
            "",
            {"Accept": "application/vnd.ez.api.UrlWildcardList+json"},
            callback
        );
    };

    /**
     *  Loads target UrlWildcard
     *
     * @method loadUrlWildcard
     * @param urlWildcardId {String} target url wildcard identifier (e.g. "/api/ezp/v2/content/urlwildcards/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlWildcard = function loadUrlWildcard(urlWildcardId, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcardId,
            "",
            {"Accept": "application/vnd.ez.api.UrlWildcard+json"},
            callback
        );
    };

    /**
     *  Deletes target UrlWildcard
     *
     * @method deleteUrlWildcard
     * @param urlWildcardId {String} target url wildcard identifier (e.g. "/api/ezp/v2/content/urlwildcards/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteUrlWildcard = function deleteUrlWildcard(urlWildcardId, callback) {
        this._connectionManager.delete(
            urlWildcardId,
            callback
        );
    };

    return ContentService;

});

/* global define */
define('structures/ContentTypeGroupInputStruct',[],function () {
    

    /**
     * Returns a structure used to create and update a Content Type group. See ContentTypeService.createContentTypeGroup() call
     *
     * @class ContentTypeGroupInputStruct
     * @constructor
     * @param identifier {String} Unique identifier for the target Content Type group (e.g. "my_new_content_type_group")
     */
    var ContentTypeGroupInputStruct = function (identifier) {
        this.body = {};
        this.body.ContentTypeGroupInput = {};

        this.body.ContentTypeGroupInput.identifier = identifier;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentTypeGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeGroupInput+json";

        return this;
    };

    return ContentTypeGroupInputStruct;

});
/* global define */
define('structures/ContentTypeCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Content Type object. See ContentTypeService.createContentType() call
     *
     * @class ContentTypeCreateStruct
     * @constructor
     * @param identifier {String} Unique identifier for the target Content Type (e.g. "my_new_content_type")
     * @param languageCode {String} The language code (e.g. "eng-GB")
     * @param names {Array} Multi language value (see example in ContentTypeService.newContentTypeCreateStruct() doc)
     */
    var ContentTypeCreateStruct = function (identifier, languageCode, names) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentTypeCreate = {};

        this.body.ContentTypeCreate.identifier = identifier;

        this.body.ContentTypeCreate.names = {};
        this.body.ContentTypeCreate.names.value = names;

        this.body.ContentTypeCreate.nameSchema = "&lt;title&gt;";
        this.body.ContentTypeCreate.urlAliasSchema = "&lt;title&gt;";

        this.body.ContentTypeCreate.remoteId = null;
        this.body.ContentTypeCreate.mainLanguageCode = languageCode;
        this.body.ContentTypeCreate.isContainer = "true";
        this.body.ContentTypeCreate.modificationDate = now;

        this.body.ContentTypeCreate.defalutAlwaysAvailable = "true";
        this.body.ContentTypeCreate.defalutSortField = "PATH";
        this.body.ContentTypeCreate.defalutSortOrder = "ASC";

        this.body.ContentTypeCreate.FieldDefinitions = {};
        this.body.ContentTypeCreate.FieldDefinitions.FieldDefinition = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentType+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeCreate+json";

        return this;
    };

    return ContentTypeCreateStruct;

});
/* global define */
define('structures/ContentTypeUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Content Type object. See ContentTypeService.updateContentType() call
     *
     * @class ContentTypeUpdateStruct
     * @constructor
     */
    var ContentTypeUpdateStruct = function () {
        this.body = {};
        this.body.ContentTypeUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentType+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeUpdate+json";

        return this;
    };

    return ContentTypeUpdateStruct;

});
/* global define */
define('structures/FieldDefinitionCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Field Definition. See ContentTypeService.addFieldDefinition() call
     *
     * @class FieldDefinitionCreateStruct
     * @constructor
     * @param identifier {String} unique field definiton identifer (e.g. "my-field")
     * @param fieldType {String} identifier of existing field type (e.g. "ezstring", "ezdate")
     * @param fieldGroup {String} identifier of existing field group (e.g. "content", "meta")
     * @param names {Array} Multi language value (see example in ContentTypeService.newFieldDefintionCreateStruct() doc)
     */
    var FieldDefinitionCreateStruct = function (identifier, fieldType, fieldGroup, names) {
        this.body = {};
        this.body.FieldDefinitionCreate = {};

        this.body.FieldDefinitionCreate.identifier = identifier;
        this.body.FieldDefinitionCreate.fieldType = fieldType;
        this.body.FieldDefinitionCreate.fieldGroup = fieldGroup;
        this.body.FieldDefinitionCreate.position = 1;

        this.body.FieldDefinitionCreate.isTranslatable = "true";
        this.body.FieldDefinitionCreate.isRequired = "false";
        this.body.FieldDefinitionCreate.isInfoCollector = "false";
        this.body.FieldDefinitionCreate.isSearchable = "false";

        this.body.FieldDefinitionCreate.defaultValue = "false";
        //TODO: find out which can be commented out

        this.body.FieldDefinitionCreate.names = {};
        this.body.FieldDefinitionCreate.names.value = names;

        this.body.FieldDefinitionCreate.descriptions = {};
        this.body.FieldDefinitionCreate.descriptions.value = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.FieldDefinition+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.FieldDefinitionCreate+json";

        return this;
    };

    return FieldDefinitionCreateStruct;

});
/* global define */
define('structures/FieldDefinitionUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Field Definition. See ContentTypeService.updateFieldDefinition() call
     *
     * @class FieldDefinitionUpdateStruct
     * @constructor
     */
    var FieldDefinitionUpdateStruct = function () {
        this.body = {};
        this.body.FieldDefinitionUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.FieldDefinition+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.FieldDefinitionUpdate+json";

        return this;
    };

    return FieldDefinitionUpdateStruct;

});
/* global define */
define('services/ContentTypeService',["structures/ContentTypeGroupInputStruct", "structures/ContentTypeCreateStruct", "structures/ContentTypeUpdateStruct",
        "structures/FieldDefinitionCreateStruct", "structures/FieldDefinitionUpdateStruct"],
    function (ContentTypeGroupInputStruct, ContentTypeCreateStruct, ContentTypeUpdateStruct,
              FieldDefinitionCreateStruct, FieldDefinitionUpdateStruct) {
    

    /**
     * Creates an instance of content type service object. Should be retrieved from CAPI instance (see example).
     *
     * ## Note on the *callbacks* usage
     *
     * The **callback** argument of the service methods always take 2 arguments:
     *
     *    *     **error** either `false` or {{#crossLink "CAPIError"}}CAPIError{{/crossLink}} object when an error occurred
     *
     *    *     **response** the {{#crossLink "Response"}}Response{{/crossLink}} object
     *
     * Example:
     *
     *     var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
     *         "new-group-id"
     *     );
     *
     *     contentTypeService..createContentTypeGroup(
     *         "/api/ezp/v2/content/typegroups",
     *         contentTypeGroupCreateStruct,
     *         function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class ContentTypeService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} discovery service is used for urls auto-discovery automation
     * @example
     *     var contentTypeService = jsCAPI.getContentTypeService();
     */
    var ContentTypeService = function (connectionManager, discoveryService) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
    };

// ******************************
// Structures
// ******************************

    /**
     * Returns content type group create structure
     *
     * @method newContentTypeGroupInputStruct
     * @param identifier {String} unique content type group identifer (e.g. "my-group")
     * @return {ContentTypeGroupInputStruct}
     */
    ContentTypeService.prototype.newContentTypeGroupInputStruct = function newContentTypeGroupInputStruct(identifier) {
        return new ContentTypeGroupInputStruct(identifier);
    };

    /**
     * @method newContentTypeCreateStruct
     * @param identifier {String} unique content type identifer (e.g. "my-type")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} Multi language value (see example)
     * @return {ContentTypeCreateStruct}
     * @example
     *      var contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *      );
     */
    ContentTypeService.prototype.newContentTypeCreateStruct = function newContentTypeCreateStruct(identifier, languageCode, names) {
        return new ContentTypeCreateStruct(identifier, languageCode, names);
    };

    /**
     * @method newContentTypeUpdateStruct
     * @return {ContentTypeUpdateStruct}
     */
    ContentTypeService.prototype.newContentTypeUpdateStruct = function newContentTypeUpdateStruct() {
        return new ContentTypeUpdateStruct();
    };

    /**
     * @method newFieldDefinitionCreateStruct
     * @param identifier {String} unique field definiton identifer (e.g. "my-field")
     * @param fieldType {String} identifier of existing field type (e.g. "ezstring", "ezdate")
     * @param fieldGroup {String} identifier of existing field group (e.g. "content", "meta")
     * @param names {Array} Multi language value (see example)
     * @return {FieldDefinitionCreateStruct}
     * @example
     *     var fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
     *         "my-new-field", "ezstring", "content", [{
     *             "_languageCode":"eng-US",
     *             "#text":"Subtitle"
     *         }]
     *     );
     */
    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function newFieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names) {
        return new FieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);
    };

    /**
     * @method newFieldDefinitionUpdateStruct
     * @return {FieldDefinitionUpdateStruct}
     */
    ContentTypeService.prototype.newFieldDefinitionUpdateStruct = function newFieldDefinitionUpdateStruct() {
        return new FieldDefinitionUpdateStruct();
    };

// ******************************
// Content Types Groups management
// ******************************

    /**
     * Create a content type group
     *
     * @method createContentTypeGroup
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param contentTypeGroupCreateStruct {ContentTypeGroupInputStruct} object describing the new group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *
     *
     *     var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
     *         "new-group-id"
     *     );
     *
     *     contentTypeService.createContentTypeGroup(
     *         "/api/ezp/v2/content/typegroups",
     *         contentTypeGroupCreateStruct,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentTypeGroup = function createContentTypeGroup(contentTypeGroups, contentTypeGroupCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeGroups,
            JSON.stringify(contentTypeGroupCreateStruct.body),
            contentTypeGroupCreateStruct.headers,
            callback
        );
    };

    /**
     * Load all content type groups
     *
     * @method loadContentTypeGroups
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroups = function loadContentTypeGroups(contentTypeGroups, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroupList+json"},
            callback
        );
    };

    /**
     * Load single content type group
     *
     * @method loadContentTypeGroup
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/types/100")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroup = function loadContentTypeGroup(contentTypeGroupId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroupId,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroup+json"},
            callback
        );
    };

    /**
     * Update a content type group
     *
     * @method updateContentTypeGroup
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/types/100")
     * @param contentTypeGroupUpdateStruct {ContentTypeGroupInputStruct} object describing changes to the content type group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateContentTypeGroup = function updateContentTypeGroup(
        contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentTypeGroupId,
            JSON.stringify(contentTypeGroupUpdateStruct.body),
            contentTypeGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete content type group
     *
     * @method deleteContentTypeGroup
     * @param contentTypeGroupId {String}
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentTypeGroup = function deleteContentTypeGroup(contentTypeGroupId, callback) {
        this._connectionManager.delete(
            contentTypeGroupId,
            callback
        );
    };

    /**
     * List content for a content type group
     *
     * @method loadContentTypes
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypes = function loadContentTypes(contentTypeGroupId, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (!error) {
                    var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup;

                    that._connectionManager.request(
                        "GET",
                         contentTypeGroup.ContentTypes._href,
                        "",
                        {"Accept": contentTypeGroup.ContentTypes["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * @method loadContentTypeGroupByIdentifier
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param identifier {String} target content type group identifier (e.g. "content")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroupByIdentifier = function loadContentTypeGroupByIdentifier(
        contentTypeGroups, identifier, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups + "?identifier=" + identifier,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroup+json"},
            callback
        );
    };

// ******************************
// Content Types management
// ******************************

    /**
     * Create a content type
     *
     * @method createContentType
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/1")
     * @param contentTypeCreateStruct {ContentTypeCreateStruct} object describing the new content type to be created
     * @param publish {Boolean} weather the content type should be immediately published or not
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *
     *     var contentTypeCreateStruct, fieldDefinition;
     *
     *     contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *     );
     *
     *     fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
     *         "my-new-field", "ezstring", "content", [{
     *             "_languageCode":"eng-US",
     *             "#text":"Subtitle"
     *         }]
     *     );
     *
     *     contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);
     *
     *     contentTypeService.createContentType(
     *         "/api/ezp/v2/content/typegroups/1",
     *         contentTypeCreateStruct,
     *         true,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentType = function createContentType(contentTypeGroupId, contentTypeCreateStruct, publish, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (!error) {
                    var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup,
                        parameters = (publish === true) ? "?publish=true": "";

                    that._connectionManager.request(
                        "POST",
                        contentTypeGroup.ContentTypes._href + parameters,
                        JSON.stringify(contentTypeCreateStruct.body),
                        contentTypeCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Make a copy of the target content type
     *
     * @method copyContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.copyContentType = function copyContentType(contentTypeId, callback) {
        this._connectionManager.request(
            "COPY",
            contentTypeId,
            "",
            {},
            callback
        );
    };

    /**
     * Load the target content type
     *
     * @method loadContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentType = function loadContentType(contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId,
            "",
            {"Accept": "application/vnd.ez.api.ContentType+json"},
            callback
        );
    };

    /**
     * Load content type by the string identifier
     *
     * @method loadContentTypeByIdentifier
     * @param identifier {String} target content type string identifier (e.g. "blog")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeByIdentifier = function loadContentTypeByIdentifier(identifier, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "contentTypes",
            function (error, contentTypes) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        contentTypes._href + "?identifier=" + identifier,
                        "",
                        {"Accept": contentTypes["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Delete the target content type
     *
     * @method deleteContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentType = function deleteContentType(contentTypeId, callback) {
        this._connectionManager.delete(
            contentTypeId,
            callback
        );
    };

    /**
     * Load content type groups of the target content type
     *
     * @method loadGroupsOfContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadGroupsOfContentType = function loadGroupsOfContentType(contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId + '/groups',
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroupRefList+json"},
            callback
        );
    };

    /**
     * Assign the target content type to the target content type group
     *
     * @method assignContentTypeGroup
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param groupId{String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.assignContentTypeGroup = function assignContentTypeGroup(contentTypeId, groupId, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeId + "/groups" + "?group=" + groupId,
            "",
            {},
            callback
        );
    };

    /**
     * Remove content type assignment to the target content type group
     *
     * @method unassignContentTypeGroup
     * @param contentTypeAssignedGroupId {String} target content type group assignment  (e.g. "/api/ezp/v2/content/types/18/groups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.unassignContentTypeGroup = function unassignContentTypeGroup(contentTypeAssignedGroupId, callback) {
        this._connectionManager.delete(
            contentTypeAssignedGroupId,
            callback
        );
    };

// ******************************
// Drafts management
// ******************************

    /**
     * Create a new content type draft based on the target content type
     *
     * @method createContentTypeDraft
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param contentTypeUpdateStruct {ContentTypeUpdateStruct} object describing changes to the content type
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct();
     *
     *     contentTypeUpdateStruct.names = {};
     *     contentTypeUpdateStruct.names.value = [{
     *         "_languageCode":"eng-US",
     *         "#text":"My changed content type"
     *     }]
     *
     *     contentTypeService.createContentTypeDraft(
     *         "/api/ezp/v2/content/types/18",
     *         contentTypeUpdateStruct,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentTypeDraft = function createContentTypeDraft(contentTypeId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load draft of the target content type
     *
     * @method loadContentTypeDraft
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeDraft = function loadContentTypeDraft(contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId + "/draft",
            "",
            {"Accept": "application/vnd.ez.api.ContentType+json"},
            callback
        );
    };

    /**
     * Update the target content type draft metadata. This method does not handle field definitions
     *
     * @method updateContentTypeDraftMetadata
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param contentTypeUpdateStruct {ContentTypeUpdateStruct} object describing changes to the draft
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateContentTypeDraftMetadata = function updateContentTypeDraftMetadata(
        contentTypeDraftId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentTypeDraftId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Publish the target content type draft
     *
     * @method publishContentTypeDraft
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.publishContentTypeDraft = function publishContentTypeDraft(contentTypeDraftId, callback) {
        this._connectionManager.request(
            "PUBLISH",
            contentTypeDraftId,
            "",
            {},
            callback
        );
    };

    /**
     * Delete the target content type draft
     *
     * @method deleteContentTypeDraft
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentTypeDraft = function deleteContentTypeDraft(contentTypeDraftId, callback) {
        this._connectionManager.delete(
            contentTypeDraftId,
            callback
        );
    };

// ******************************
// Field Definitions management
// ******************************

    /**
     * Add a new field definition to the target Content Type draft
     *
     * @method addFieldDefinition
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param fieldDefinitionCreateStruct {FieldDefinitionCreateStruct} object describing the new field definition to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.addFieldDefinition = function addFieldDefinition(contentTypeId, fieldDefinitionCreateStruct, callback) {
        var that = this;

        this.loadContentTypeDraft(
            contentTypeId,
            function (error, contentTypeDraftResponse) {
                if (!error) {
                    var contentTypeDraftFieldDefinitions = contentTypeDraftResponse.document.ContentType.FieldDefinitions;

                    that._connectionManager.request(
                        "POST",
                        contentTypeDraftFieldDefinitions._href,
                        JSON.stringify(fieldDefinitionCreateStruct.body),
                        fieldDefinitionCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load the target field definition
     *
     * @method loadFieldDefinition
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadFieldDefinition = function loadFieldDefinition(fieldDefinitionId, callback) {
        this._connectionManager.request(
            "GET",
            fieldDefinitionId,
            "",
            {"Accept": "application/vnd.ez.api.FieldDefinition+json"},
            callback
        );
    };

    /**
     * Update the target (existing) field definition
     *
     * @method updateFieldDefinition
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param fieldDefinitionUpdateStruct {FieldDefinitionUpdateStruct} object describing changes to the target field definition
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateFieldDefinition = function updateFieldDefinition(fieldDefinitionId, fieldDefinitionUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            fieldDefinitionId,
            JSON.stringify(fieldDefinitionUpdateStruct.body),
            fieldDefinitionUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete existing field definition
     *
     * @method deleteFieldDefinition
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteFieldDefinition = function deleteFieldDefinition(fieldDefinitionId, callback) {
        this._connectionManager.delete(
            fieldDefinitionId,
            callback
        );
    };

    return ContentTypeService;

});

/* global define */
define('structures/SessionCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Session. See UserService.createSession() call
     *
     * @class SessionCreateStruct
     * @constructor
     * @param login {String} login for a user, which wants to start a session
     * @param password {String} password for a user, which wants to start a session
     */
    var SessionCreateStruct = function (login, password) {
        this.body = {};
        this.body.SessionInput = {};

        this.body.SessionInput.login = login;
        this.body.SessionInput.password = password;

        this.headers = {
            "Accept": "application/vnd.ez.api.Session+json",
            "Content-Type": "application/vnd.ez.api.SessionInput+json"
        };

        return this;
    };

    return SessionCreateStruct;

});
/* global define */
define('structures/UserCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new User. See UserService.createUser() call
     *
     * @class UserCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param login {String} login for a new user
     * @param email {String} email for a new user
     * @param password {String} password for a new user
     * @param fields {Array} fields array (see example for "newUserGroupCreateStruct")
     */
    var UserCreateStruct = function (languageCode, login, email, password, fields) {
        this.body = {};
        this.body.UserCreate = {};

        this.body.UserCreate.mainLanguageCode = languageCode;
        this.body.UserCreate.login = login;
        this.body.UserCreate.email = email;
        this.body.UserCreate.password = password;

        this.body.UserCreate.fields = {};
        this.body.UserCreate.fields.field = fields;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserCreate+json";

        return this;
    };

    return UserCreateStruct;

});
/* global define */
define('structures/UserUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a User. See UserService.updateUser() call
     *
     * @class UserUpdateStruct
     * @constructor
     */
    var UserUpdateStruct = function () {
        this.body = {};
        this.body.UserUpdate = {};

        this.body.UserUpdate.fields = {};
        this.body.UserUpdate.fields.field = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserUpdate+json";

        return this;
    };

    return UserUpdateStruct;

});
/* global define */
define('structures/UserGroupCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new User group. See UserService.createUserGroup() call
     *
     * @class UserGroupCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in UserService.newUserGroupCreateStruct() doc)
     */
    var UserGroupCreateStruct = function (languageCode, fields) {
        this.body = {};
        this.body.UserGroupCreate = {};

        this.body.UserGroupCreate.mainLanguageCode = languageCode;

        this.body.UserGroupCreate.fields = {};
        this.body.UserGroupCreate.fields.field = fields;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UserGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserGroupCreate+json";

        return this;
    };

    return UserGroupCreateStruct;

});
/* global define */
define('structures/UserGroupUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a User group. See UserService.updateUserGroup() call
     *
     * @class UserGroupUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in UserService.newUserGroupCreateStruct() doc)
     */
    var UserGroupUpdateStruct = function (languageCode, fields) {
        this.body = {};
        this.body.UserGroupUpdate = {};

        this.body.UserGroupUpdate.fields = {};
        this.body.UserGroupUpdate.fields.field = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UserGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserGroupUpdate+json";

        return this;
    };

    return UserGroupUpdateStruct;

});
/* global define */
define('structures/PolicyCreateStruct',[],function () {
    

    /**
     * Returns a structure used to create a new Policy. See UserService.createPolicy() call
     *
     * @class PolicyCreateStruct
     * @constructor
     * @param module {String} name of the module for which new policy should be active
     * @param theFunction {String} name of the function for which the new policy should be active
     * @param limitations {Object} object describing limitations for new policy
     */
    var PolicyCreateStruct = function (module, theFunction, limitations) {
        this.body = {};
        this.body.PolicyCreate = {};

        this.body.PolicyCreate.module = module;
        this.body.PolicyCreate.function = theFunction;

        this.body.PolicyCreate.limitations = {};
        this.body.PolicyCreate.limitations.limitation = limitations;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Policy+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.PolicyCreate+json";

        return this;
    };

    return PolicyCreateStruct;

});
/* global define */
define('structures/PolicyUpdateStruct',[],function () {
    

    /**
     * Returns a structure used to update a Policy. See UserService.updatePolicy() call
     *
     * @class PolicyUpdateStruct
     * @constructor
     * @param limitations {Object} object describing limitations change for the policy
     */
    var PolicyUpdateStruct = function (limitations) {
        this.body = {};
        this.body.PolicyUpdate = {};

        this.body.PolicyUpdate.limitations = {};
        this.body.PolicyUpdate.limitations.limitation = limitations;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Policy+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.PolicyUpdate+json";

        return this;
    };

    return PolicyUpdateStruct;

});
/* global define */
define('structures/RoleInputStruct',[],function () {
    

    /**
     * Returns a structure used to create and update a Role. See UserService.createRole() call
     *
     * @class RoleInputStruct
     * @constructor
     * @param identifier {String} unique Role identifier
     */
    var RoleInputStruct = function (identifier) {
        this.body = {};
        this.body.RoleInput = {};

        this.body.RoleInput.identifier = identifier;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Role+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleInput+json";

        return this;
    };

    return RoleInputStruct;

});
/* global define */
define('structures/RoleAssignInputStruct',[],function () {
    

    /**
     * Returns a structure used to create and update a Role Assign object. See for ex. UserService.assignRoleToUser() call
     *
     * @class RoleAssignInputStruct
     * @constructor
     * @param role {Object} object representing the target role (see example)
     * @param limitation {Object} object representing limitations for assignment (see example in UserService.newRoleAssignInputStruct() doc)
     */
    var RoleAssignInputStruct = function (role, limitation) {
        this.body = {};
        this.body.RoleAssignInput = {};

        this.body.RoleAssignInput.Role = role;

        this.body.RoleAssignInput.limitation = limitation;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.RoleAssignmentList+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleAssignInput+json";

        return this;
    };

    return RoleAssignInputStruct;

});
/* global define */
define('services/UserService',['structures/SessionCreateStruct', 'structures/UserCreateStruct', 'structures/UserUpdateStruct',
        'structures/UserGroupCreateStruct', 'structures/UserGroupUpdateStruct', 'structures/PolicyCreateStruct',
        'structures/PolicyUpdateStruct', 'structures/RoleInputStruct', 'structures/RoleAssignInputStruct'],
    function (SessionCreateStruct, UserCreateStruct, UserUpdateStruct,
              UserGroupCreateStruct, UserGroupUpdateStruct, PolicyCreateStruct,
              PolicyUpdateStruct, RoleInputStruct, RoleAssignInputStruct) {
    

    /**
     * Creates an instance of user service object. Should be retrieved from CAPI instance (see example).
     *
     * ## Note on the *callbacks* usage
     *
     * The **callback** argument of the service methods always take 2 arguments:
     *
     *    *     **error** either `false` or {{#crossLink "CAPIError"}}CAPIError{{/crossLink}} object when an error occurred
     *
     *    *     **response** the {{#crossLink "Response"}}Response{{/crossLink}} object
     *
     * Example:
     *
     *     userService.loadRootUserGroup(function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class UserService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} discovery service is used for urls auto-discovery automation
     * @example
     *     var userService = jsCAPI.getUserService();
     */
    var UserService = function (connectionManager, discoveryService) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
    };

// ******************************
// Structures
// ******************************

    /**
     * Returns session create structure
     *
     * @method newSessionCreateStruct
     * @param login {String} login for a user, which wants to start a session
     * @param password {String} password for a user, which wants to start a session
     * @return {SessionCreateStruct}
     */
    UserService.prototype.newSessionCreateStruct = function newSessionCreateStruct(login, password) {
        return new SessionCreateStruct(login, password);
    };

    /**
     * Returns user group create structure
     *
     * @method newUserGroupCreateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example)
     * @return {UserGroupCreateStruct}
     * @example
     *     var userGroupCreateStruct = userService.newUserGroupCreateStruct(
     *         "eng-US",[{
     *             fieldDefinitionIdentifier: "name",
     *             languageCode: "eng-US",
     *             fieldValue: "UserGroup"
     *         }, {
     *             fieldDefinitionIdentifier: "description",
     *             languageCode: "eng-US",
     *             fieldValue: "This is the description of the user group"
     *         }]
     *     );
     */
    UserService.prototype.newUserGroupCreateStruct = function newUserGroupCreateStruct(language, fields) {
        return new UserGroupCreateStruct(language, fields);
    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     * @return {UserGroupCreateStruct}
     */
    UserService.prototype.newUserGroupUpdateStruct = function newUserGroupUpdateStruct() {
        return new UserGroupUpdateStruct();
    };

    /**
     * User create structure
     *
     * @method newUserCreateStruct
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param login {String} login for a new user
     * @param email {String} email for a new user
     * @param password {String} password for a new user
     * @param fields {Array} fields array (see example for "newUserGroupCreateStruct")
     * @return {UserCreateStruct}
     */
    UserService.prototype.newUserCreateStruct = function newUserCreateStruct(languageCode, login, email, password, fields) {
        return new UserCreateStruct(languageCode, login, email, password, fields);
    };

    /**
     * Returns user update structure
     *
     * @method newUserUpdateStruct
     * @return {UserUpdateStruct}
     */
    UserService.prototype.newUserUpdateStruct = function newUserUpdateStruct() {
        return new UserUpdateStruct();
    };

    /**
     * Returns role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {String} unique identifier for the new role (e.g. "editor")
     * @return {RoleInputStruct}
     */
    UserService.prototype.newRoleInputStruct = function newRoleInputStruct(identifier) {
        return new RoleInputStruct(identifier);
    };

    /**
     * Returns target role assignment input structure
     *
     * @method newRoleAssignInputStruct
     * @param role {Object} object representing the target role (see example)
     * @param limitation {Object} object representing limitations for assignment (see example)
     * @return {RoleAssignInputStruct}
     * @example
     *     var roleAssignCreateStruct = userService.newRoleAssignInputStruct(
     *         {
     *             "_href": "/api/ezp/v2/user/roles/7",
     *             "_media-type": "application/vnd.ez.api.RoleAssignInput+json"
     *         }, {
     *             "_identifier": "Section",
     *             "values": {
     *                 "ref": [{
     *                     "_href": "/api/ezp/v2/content/sections/1",
     *                     "_media-type": "application/vnd.ez.api.Section+json"
     *                 }, {
     *                     "_href": "/api/ezp/v2/content/sections/4",
     *                     "_media-type": "application/vnd.ez.api.Section+json"
     *                 }]
     *             }
     *         });
     *
     */
    UserService.prototype.newRoleAssignInputStruct = function newRoleAssignInputStruct(role, limitation) {
        return new RoleAssignInputStruct(role, limitation);
    };

    /**
     * Returns policy create structure
     *
     * @method newPolicyCreateStruct
     * @param module {String} name of the module for which new policy should be active
     * @param theFunction {String} name of the function for which the new policy should be active
     * @param limitations {Object} object describing limitations for new policy
     * @return {PolicyCreateStruct}
     * @example
     *     var policyCreateStruct = userService.newPolicyCreateStruct(
     *         "content", "publish", [{
     *             limitation: [{
     *                 "_identifier": "Section",
     *                 "values": {
     *                     "ref": [{
     *                         "_href": "5"
     *                     }, {
     *                         "_href": "4"
     *                     }]
     *                 }
     *             }]
     *         }]
     *     );
     */
    UserService.prototype.newPolicyCreateStruct = function newPolicyCreateStruct(module, theFunction, limitations) {
        return new PolicyCreateStruct(module, theFunction, limitations);
    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object} object describing limitations change for the policy (see "newPolicyCreateStruct" example)
     * @return {PolicyUpdateStruct}
     */
    UserService.prototype.newPolicyUpdateStruct = function newPolicyUpdateStruct(limitations) {
        return new PolicyUpdateStruct(limitations);
    };

// ******************************
// User groups management
// ******************************

    /**
     * Load the root user group
     *
     * @method loadRootUserGroup
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadRootUserGroup = function loadRootUserGroup(callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "rootUserGroup",
            function (error, rootUserGroup) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        rootUserGroup._href,
                        "",
                        {"Accept": rootUserGroup["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            });
    };

    /**
     * Load the target user group
     *
     * @method loadUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroup = function loadUserGroup(userGroupId, callback) {
        this._connectionManager.request(
            "GET",
            userGroupId,
            "",
            {"Accept": "application/vnd.ez.api.UserGroup+json"},
            callback
        );
    };

    /**
     * Load the target user group by remoteId
     *
     * @method loadUserGroupByRemoteId
     * @param userGroups {String} link to root UserGroups resource (should be auto-discovered)
     * @param remoteId {String} target user group remote identifier (e.g. "f5c88a2209584891056f987fd965b0ba")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroupByRemoteId = function loadUserGroupByRemoteId(userGroups, remoteId, callback) {
        this._connectionManager.request(
            "GET",
            userGroups + '?remoteId=' + remoteId,
            "",
            {"Accept": "application/vnd.ez.api.UserGroupList+json"},
            callback
        );
    };

    /**
     * Delete the target user group
     *
     * @method deleteUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteUserGroup = function deleteUserGroup(userGroupId, callback) {
        this._connectionManager.delete(
            userGroupId,
            callback
        );
    };

    /**
     * Move the target user group to the destination
     *
     * @method moveUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param destination {String} destination identifier (e.g. "/api/ezp/v2/user/groups/1/5/110")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.moveUserGroup = function moveUserGroup(userGroupId, destination, callback) {
        this._connectionManager.request(
            "MOVE",
            userGroupId,
            "",
            {"Destination": destination},
            callback
        );
    };

    /**
     * Create a new user group in the provided parent user group
     *
     * @method createUserGroup
     * @param parentGroupId {String} target parent user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userGroupCreateStruct {UserGroupCreateStruct} object describing new user group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createUserGroup = function createUserGroup(parentGroupId, userGroupCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                    that._connectionManager.request(
                        "POST",
                        subGroups._href,
                        JSON.stringify(userGroupCreateStruct.body),
                        userGroupCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update the target user group
     *
     * @method updateUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userGroupUpdateStruct {UserGroupUpdateStruct} object describing changes to the target user group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.updateUserGroup = function updateUserGroup(userGroupId, userGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            userGroupId,
            JSON.stringify(userGroupUpdateStruct.body),
            userGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load subgroups of the target user group
     *
     * @method loadSubUserGroups
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadSubUserGroups = function loadSubUserGroups(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                    that._connectionManager.request(
                        "GET",
                        subGroups._href,
                        "",
                        {"Accept": subGroups["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load users of the target user group
     *
     * @method loadUsersOfUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUsersOfUserGroup = function loadUsersOfUserGroup(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var users = userGroupResponse.document.UserGroup.Users;

                    that._connectionManager.request(
                        "GET",
                        users._href,
                        "",
                        {"Accept": users["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load user groups for the target user
     *
     * @method loadUserGroupsOfUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/14")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroupsOfUser = function loadUserGroupsOfUser(userId, callback) {
        this._connectionManager.request(
            "GET",
            userId + '/groups',
            "",
            {"Accept": "application/vnd.ez.api.UserGroupRefList+json"},
            callback
        );
    };

// ******************************
// Users management
// ******************************

    /**
     * Create a new user
     *
     * @method createUser
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userCreateStruct {UserCreateStruct} object describing new user to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createUser = function createUser(userGroupId, userCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var users = userGroupResponse.document.UserGroup.Users;

                    that._connectionManager.request(
                        "POST",
                        users._href,
                        JSON.stringify(userCreateStruct.body),
                        userCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load users and usergroups for the target roleId
     *
     * @method getRoleAssignments
     * @param userList {String} link to root UserList resource (should be auto-discovered)
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignments = function getRoleAssignments(userList, roleId, callback) {
        this._connectionManager.request(
            "GET",
            userList + '?roleId=' + roleId,
            "",
            {"Accept": "application/vnd.ez.api.UserList+json"},
            callback
        );
    };

    /**
     * Load the target user
     *
     * @method loadUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUser = function loadUser(userId, callback) {
        this._connectionManager.request(
            "GET",
            userId,
            "",
            {"Accept": "application/vnd.ez.api.User+json"},
            callback
        );
    };

    /**
     * Update the target user
     *
     * @method updateUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param userUpdateStruct {UserUpdateStruct} object describing changes to the user
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var userUpdateStruct = userService.newUserUpdateStruct();
     *     userUpdateStruct.body.UserUpdate.email = "somenewemail@nowhere.no";
     *     userService.updateUser(
     *         "/api/ezp/v2/user/users/144",
     *         userUpdateStruct,
     *         callback
     *     );
     */
    UserService.prototype.updateUser = function updateUser(userId, userUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            userId,
            JSON.stringify(userUpdateStruct.body),
            userUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete the target user
     *
     * @method deleteUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteUser = function deleteUser(userId, callback) {
        this._connectionManager.delete(
            userId,
            callback
        );
    };

// ******************************
// Users and groups relation management
// ******************************

    /**
     * Assign the target user to the target user group
     *
     * @method loadUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.assignUserToUserGroup = function assignUserToUserGroup(userId, userGroupId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userGroups = userResponse.document.User.UserGroups;

                    that._connectionManager.request(
                        "POST",
                        userGroups._href + "?group=" + userGroupId,
                        "",
                        {"Accept": userGroups["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Remove target assignment (of a user to a user group)
     *
     * @method unassignUserFromUserGroup
     * @param userAssignedGroupId {String} target assignment identifier (e.g. "/api/ezp/v2/user/users/146/groups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.unassignUserFromUserGroup = function unassignUserFromUserGroup(userAssignedGroupId, callback) {
        this._connectionManager.delete(
            userAssignedGroupId,
            callback
        );
    };

// ******************************
// Roles management
// ******************************

    /**
     * Create a new role
     *
     * @method createRole
     * @param roleCreateStruct {RoleCreateStruct} object describing new role to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createRole = function createRole(roleCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (!error) {
                    that._connectionManager.request(
                    "POST",
                    roles._href,
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load the target role
     *
     * @method loadRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadRole = function loadRole(roleId, callback) {
        this._connectionManager.request(
            "GET",
            roleId,
            "",
            {"Accept": "application/vnd.ez.api.Role+json"},
            callback
        );
    };

    /**
     * Search roles by string identifier and apply certain limit and offset on the result set
     *
     * @method loadRoles
     * @param [identifier] {String} string identifier of the roles to search (e.g. "admin")
     * @param [limit=-1] {int} the limit of the result set
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     userService.loadRoles("admin", 5, 5, callback);
     */
    UserService.prototype.loadRoles = function loadRoles(identifier, limit, offset, callback) {

        var that = this,
            identifierQuery,
            defaultIdentifier = "",
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof identifier == "function") {
                // no optional params are passed
                callback = identifier;
                identifier = defaultIdentifier;
                limit = defaultLimit;
                offset = defaultOffset;
            } else if (typeof limit == "function") {
                // only identifier is passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // identifier and limit are passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        identifierQuery = (identifier === "") ? "" : "&identifier=" + identifier;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        roles._href + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                        "",
                        {"Accept": roles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update the target role
     *
     * @method updateRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param roleUpdateStruct {RoleUpdateStruct} object describing changes to the role
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.updateRole = function updateRole(roleId, roleUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            roleId,
            JSON.stringify(roleUpdateStruct.body),
            roleUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete the target role
     *
     * @method deleteRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteRole = function deleteRole(roleId, callback) {
        this._connectionManager.delete(
            roleId,
            callback
        );
    };

    /**
     * Get role assignments for the target user
     *
     * @method getRoleAssignmentsForUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/8")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignmentsForUser = function getRoleAssignmentsForUser(userId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userRoles = userResponse.document.User.Roles;

                    that._connectionManager.request(
                        "GET",
                        userRoles._href,
                        "",
                        {"Accept": userRoles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Get role assignments for the target user group
     *
     * @method getRoleAssignmentsForUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignmentsForUserGroup = function getRoleAssignmentsForUserGroup(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                    that._connectionManager.request(
                        "GET",
                        userGroupRoles._href,
                        "",
                        {"Accept": userGroupRoles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Get RoleAssignment object for the target assignment (of a user to a role)
     *
     * @method getUserAssignmentObject
     * @param userAssignmentId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/13/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getUserAssignmentObject = function getUserAssignmentObject(userAssignmentId, callback) {
        this._connectionManager.request(
            "GET",
            userAssignmentId,
            "",
            {"Accept": "application/vnd.ez.api.RoleAssignment+json"},
            callback
        );
    };

    /**
     * Get RoleAssignment object for the target assignment (of a user group to a role)
     *
     * @method getUserGroupAssignmentObject
     * @param userGroupAssignmentId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/groups/1/5/110/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getUserGroupAssignmentObject = function getUserGroupAssignmentObject(userGroupAssignmentId, callback) {
        this._connectionManager.request(
            "GET",
            userGroupAssignmentId,
            "",
            {"Accept": "application/vnd.ez.api.RoleAssignment+json"},
            callback
        );
    };

    /**
     * Assign a role to user
     *
     * @method assignRoleToUser
     * @param userId {String}  target user identifier (e.g. "/api/ezp/v2/user/users/8")
     * @param roleAssignInputStruct {RoleAssignInputStruct} object describing the new role assignment (see "newRoleAssignInputStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     *
     */
    UserService.prototype.assignRoleToUser = function assignRoleToUser(userId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userRoles = userResponse.document.User.Roles;

                    that._connectionManager.request(
                        "POST",
                        userRoles._href,
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Assign a role to user group
     *
     * @method assignRoleToUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param roleAssignInputStruct {RoleAssignInputStruct} object describing the new role assignment (see "newRoleAssignInputStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.assignRoleToUserGroup = function assignRoleToUserGroup(userGroupId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                    that._connectionManager.request(
                        "POST",
                        userGroupRoles._href,
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Remove target assignment (of a user to a role)
     *
     * @method unassignRoleFromUser
     * @param userRoleId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/users/110/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.unassignRoleFromUser = function unassignRoleFromUser(userRoleId, callback) {
        this._connectionManager.delete(
            userRoleId,
            callback
        );
    };

    /**
     * Remove target assignment (of a user group to a role)
     *
     * @method unassignRoleFromUserGroup
     * @param userGroupRoleId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/groups/2/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.unassignRoleFromUserGroup = function unassignRoleFromUserGroup(userGroupRoleId, callback) {
        this._connectionManager.delete(
            userGroupRoleId,
            callback
        );
    };

// ******************************
// Policies management
// ******************************

    /**
     * Add the new policy to the target role
     *
     * @method addPolicy
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/7")
     * @param policyCreateStruct {PolicyCreateStruct} object describing new policy to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var policyCreateStruct = userService.newPolicyCreateStruct(
     *     "content",
     *     "create",
     *     [{  _identifier: "Class",
     *         values: {
     *             ref: [{
     *                 _href: "18"
     *             }]
     *         }
     *     }]);
     *
     *     userService.addPolicy(
     *     "/api/ezp/v2/user/roles/7",
     *     policyCreateStruct,
     *     callback);
     */
    UserService.prototype.addPolicy = function addPolicy(roleId, policyCreateStruct, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (!error) {
                    var rolePolicies = roleResponse.document.Role.Policies;

                    that._connectionManager.request(
                        "POST",
                        rolePolicies._href,
                        JSON.stringify(policyCreateStruct.body),
                        policyCreateStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load policies of the target role
     *
     * @method loadPolicies
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPolicies = function loadPolicies(roleId, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (!error) {
                    var rolePolicies = roleResponse.document.Role.Policies;

                    that._connectionManager.request(
                        "GET",
                        rolePolicies._href,
                        "",
                        {"Accept": rolePolicies["_media-type"]},
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load the target policy
     *
     * @method loadPolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPolicy = function loadPolicy(policyId, callback) {
        this._connectionManager.request(
            "GET",
            policyId,
            "",
            {"Accept": "application/vnd.ez.api.Policy+json"},
            callback
        );
    };

    /**
     * Update the target policy
     *
     * @method updatePolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param policyUpdateStruct {PolicyUpdateStruct} object describing changes to the policy
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.updatePolicy = function updatePolicy(policyId, policyUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            policyId,
            JSON.stringify(policyUpdateStruct.body),
            policyUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete the target policy
     *
     * @method deletePolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deletePolicy = function deletePolicy(policyId, callback) {
        this._connectionManager.delete(
            policyId,
            callback
        );
    };

    /**
     * Load policies for the target user
     *
     * @method loadPoliciesByUserId
     * @param userPolicies {String} link to root UserPolicies resource (should be auto-discovered)
     * @param userId {String} target user numerical identifier (e.g. 110)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPoliciesByUserId = function loadPoliciesByUserId(userPolicies, userId, callback) {
        this._connectionManager.request(
            "GET",
            userPolicies + "?userId=" + userId,
            "",
            {"Accept": "application/vnd.ez.api.PolicyList+json"},
            callback
        );
    };

// ******************************
// Sessions management
// ******************************

    /**
     * Create a session (login a user)
     *
     * @method createSession
     * @param sessions {String} link to root Sessions resource (should be auto-discovered)
     * @param sessionCreateStruct {SessionCreateStruct} object describing new session to be created (see "newSessionCreateStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createSession = function createSession(sessions, sessionCreateStruct, callback) {
        this._connectionManager.notAuthorizedRequest(
            "POST",
            sessions,
            JSON.stringify(sessionCreateStruct.body),
            sessionCreateStruct.headers,
            callback
        );
    };

    /**
     * Delete the target session (without actual client logout)
     *
     * @method deleteSession
     * @param sessionId {String} target session identifier (e.g. "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteSession = function deleteSession(sessionId, callback) {
        this._connectionManager.delete(
            sessionId,
            callback
        );
    };

    /**
     * Actual client logout (based on deleteSession)
     * Implemented by ConnectionManager. Depends on current system configuration.
     * Kills currently active session and resets storage (e.g. LocalStorage) params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.logOut = function logOut(callback) {
        this._connectionManager.logOut(callback);
    };

    return UserService;

});

/* global define */
define('CAPI',['authAgents/SessionAuthAgent', 'authAgents/HttpBasicAuthAgent', 'ConnectionManager',
        'ConnectionFeatureFactory', 'connections/XmlHttpRequestConnection', 'connections/MicrosoftXmlHttpRequestConnection',
        'services/DiscoveryService', 'services/ContentService', 'services/ContentTypeService',
        'services/UserService'],
    function (SessionAuthAgent, HttpBasicAuthAgent, ConnectionManager,
              ConnectionFeatureFactory, XmlHttpRequestConnection, MicrosoftXmlHttpRequestConnection,
              DiscoveryService, ContentService, ContentTypeService,
              UserService) {
    

    /**
     * Creates an instance of CAPI - main object which handles the API initialization and gives ability to retrieve various services.
     * Could be created only in one instance. Handles connections, authorization and REST paths discovery automatically.
     *
     * @class CAPI
     * @constructor
     * @param endPointUrl {String} url pointing to REST root
     * @param authenticationAgent {Object} Instance of one of the AuthAgents (e.g. SessionAuthAgent, HttpBasicAuthAgent)
     * @param [options] {Object} Object containing different options for the CAPI (see example)
     * @example
     *     var   authAgent = new SessionAuthAgent({
               login: "admin",
               password: "admin"
           }),
           jsCAPI = new CAPI(
               'http://ez.git.local', authAgent, {
               logRequests: true, // Whether we should log each request to the js console or not
               rootPath: '/api/ezp/v2/', // Path to the REST root
               connectionStack: [ // Array of connections, should be filled-in in preferred order
                    {connection: XmlHttpRequestConnection},
                    {connection: MicrosoftXmlHttpRequestConnection}
               ]
           });
     */
    var CAPI = function (endPointUrl, authenticationAgent, options) {
        var defaultOptions = {
                logRequests: false, // Whether we should log each request to the js console or not
                rootPath: '/api/ezp/v2/', // Path to the REST root
                connectionStack: [ // Array of connections, should be filled-in in preferred order
                    {connection: XmlHttpRequestConnection},
                    {connection: MicrosoftXmlHttpRequestConnection}
                ]
            },
            mergedOptions = defaultOptions,
            option,
            connectionFactory,
            connectionManager,
            discoveryService;

        this._contentService = null;
        this._contentTypeService = null;
        this._userService = null;

        authenticationAgent.setCAPI(this);

        // Merging provided options (if any) with defaults
        if (typeof options == "object") {
            for (option in options) {
                if (options.hasOwnProperty(option)) {
                    mergedOptions[option] = options[option];
                }
            }
        }

        connectionFactory = new ConnectionFeatureFactory(mergedOptions.connectionStack);
        connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory);
        connectionManager.logRequests = mergedOptions.logRequests;
        discoveryService = new DiscoveryService(mergedOptions.rootPath, connectionManager);

        /**
         * Get instance of Content Service. Use ContentService to retrieve information and execute operations related to Content.
         *
         * @method getContentService
         * @return {ContentService}
         * @example
         *      var contentService = jsCAPI.getContentService();
         *      contentService.loadRoot(
         *          '/api/ezp/v2/',
         *          callback
         *      );
         */
        this.getContentService = function getContentService() {
            if  (!this._contentService)  {
                this._contentService  =  new ContentService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentService;
        };

        /**
         * Get instance of Content Type Service. Use ContentTypeService to retrieve information and execute operations related to ContentTypes.
         *
         * @method getContentTypeService
         * @return {ContentTypeService}
         * @example
         *      var contentTypeService = jsCAPI.getContentTypeService();
         *      contentTypeService.loadContentType(
         *          '/api/ezp/v2/content/types/18',
         *          callback
         *      );
         */
        this.getContentTypeService = function getContentTypeService() {
            if  (!this._contentTypeService)  {
                this._contentTypeService  =  new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentTypeService;
        };

        /**
         * Get instance of User Service. Use UserService to retrieve information and execute operations related to Users.
         *
         * @method getUserService
         * @return {UserService}
         * @example
         *      var userService = jsCAPI.getUserService();
         *      userService.loadRootUserGroup(
         *          callback
         *      );
         */
        this.getUserService = function getUserService() {
            if  (!this._userService)  {
                this._userService  =  new UserService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._userService;
        };
    };

    return CAPI;

});

// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define('services/../../node_modules/q/q',definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {


var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this does have the nice side-effect of reducing the size
// of the code by reducing x.call() to merely x(), eliminating many
// hard-to-minify characters.
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = deprecate(function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    }, "valueOf", "inspect");

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = deprecate(function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        });
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        !window.Touch &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        console.warn("Unhandled rejection reason:", reason);
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

/* global define */
define('services/PromiseService',["../../node_modules/q/q","structures/CAPIError"], function (q, CAPIError) {
    

    /**
     * Creates an instance of promise-based service object based on original service
     *
     * @class PromiseService
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version (e.g. ContentService)
     */
    var PromiseService = function (originalService) {
        var key;

        this._generatePromiseFunction = function (originalFunction) {

            return function () {
                var toBeCalledArguments = Array.prototype.slice.call(arguments),
                    deferred = q.defer();

                if (originalFunction.length - 1 !== arguments.length) {
                    throw new CAPIError("Wrong number of arguments provided for promise-based function.");
                }

                toBeCalledArguments.push(function (error, result) {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(result);
                    }

                });

                originalFunction.apply(originalService, toBeCalledArguments);

                return deferred.promise;
            };
        };

        // Auto-generating promise-based functions based on every existing service function
        // taking into account all the functions with signature different from "new....Struct"
        for(key in originalService) {
            if ( (typeof originalService[key] === "function") && !(/^function\s*(new[^\s(]+Struct)/).test(originalService[key].toString()) ) {
                this[key] = this._generatePromiseFunction(originalService[key]);
            }
        }
    };

    return PromiseService;

});


/* global define */
define('PromiseCAPI',["CAPI", "services/PromiseService"], function (CAPI, PromiseService) {
    

    /**
     * Creates an instance of PromiseCAPI object based on existing CAPI object
     *
     * @class PromiseCAPI
     * @constructor
     * @param CAPI {CAPI} main REST client object
     */
    var PromiseCAPI = function (CAPI) {
        var key;

        /**
         * Convert any CAPI service into Promise-based service (if needed).
         *
         * @method getPromiseService
         * @param serviceFactoryName {String} name of the function which returns one of the CAPI services
         * @return {function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         */
        this._getPromiseService = function (serviceFactoryName) {
            var singletonId = "_" + serviceFactoryName;

            return function () {
                if (!this[singletonId]) {
                    this[singletonId] = new PromiseService(CAPI[serviceFactoryName].call(CAPI));
                }
                return this[singletonId];
            };
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        for (key in CAPI) {
            if ( (typeof CAPI[key] === "function") && (/^function\s*(get[^\s(]+Service)/).test(CAPI[key].toString()) ) {
                this[key] = this._getPromiseService(key);
            }
        }
    };

    return PromiseCAPI;

});    // Exporting needed parts of the CAPI to public

    window.eZ = window.eZ || {};

    window.eZ.HttpBasicAuthAgent = require('authAgents/HttpBasicAuthAgent');
    window.eZ.SessionAuthAgent = require('authAgents/SessionAuthAgent');
    window.eZ.CAPI = require('CAPI');
    window.eZ.PromiseCAPI = require('PromiseCAPI');

}));