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
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
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
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

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
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
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
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

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
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
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

            ret = callback ? callback.apply(defined[name], args) : undefined;

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
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

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
        return req(cfg);
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
    "use strict";

    /**
     * Class describing any error which could be thrown during CAPI workflow
     *
     * @class CAPIError
     * @constructor
     * @param message {String} error message
     * @param details {Object} object literal containing any additional error properties
     */
    var CAPIError = function (message, details) {
        this.name = "CAPIError";
        this.message = message;
        this.details = details;
    };

    CAPIError.prototype = new Error();

    CAPIError.prototype.constructor = CAPIError;

    return CAPIError;

});

/* global define */
define('storages/LocalStorage',["structures/CAPIError"], function(CAPIError) {
    /**
     * Implementation of the storage abstraction utilizing a window.localStorage
     *
     * If the localStorage is not available an error is thrown during construction
     *
     * Usability of this storage can be checked using the static isCompatible method.
     *
     * In addition of providing compatibility checking stored data will automatically be converted between
     * object and string representation to allow the storage of arbitrary datastructures
     *
     * @class LocalStorage
     * @extends {StorageAbstraction}
     * @constructor
     */
    var LocalStorage = function () {
        if (!LocalStorage.isCompatible()) {
            throw new CAPIError("LocalStorage abstraction can not be used: window.localStorage is not available.");
        }

        /**
         * Session storage which is internally used to store and retrieve data
         *
         * @property _storage
         * @type {Storage}
         * @private
         */
        this._storage = window.localStorage;
    };

    /**
     * Retrieve an item from the storage
     *
     * @method getItem
     * @param {string} key
     * @return {*}
     */
    LocalStorage.prototype.getItem = function(key) {
        return JSON.parse(this._storage.getItem(key));
    };

    /**
     * Store an item in storage
     *
     * @method setItem
     * @param {string} key
     * @param {*} value
     */
    LocalStorage.prototype.setItem = function(key, value) {
        this._storage.setItem(key, JSON.stringify(value));
    };

    /**
     * Remove an item from storage
     *
     * @method removeItem
     * @param {string} key
     */
    LocalStorage.prototype.removeItem = function(key) {
        this._storage.removeItem(key);
    };

    /**
     * Check whether this storage implementation is compatible with the current environment.
     *
     * @method isComaptible
     * @static
     * @return {Boolean}
     */
    LocalStorage.isCompatible = function () {
        var t = "__featuredetection__";

        if (!window.localStorage || !window.localStorage.setItem) {
            return false;
        }

        // Unfortunately some browsers have a localStorage object but don't have a working localStorage ;)
        try {
            window.localStorage.setItem(t, t);
            window.localStorage.removeItem(t);
            // localStorage is available everything is fine
            return true;
        } catch(e) {
            // localStorage does not work
            return false;
        }
    };

    return LocalStorage;
});

/* global define */
define('authAgents/SessionAuthAgent',["structures/CAPIError", "storages/LocalStorage"], function (CAPIError, LocalStorage) {
    "use strict";

    /**
     * Creates an instance of SessionAuthAgent object
     *
     * Auth agent handles low level implementation of authorization workflow.
     * By providing a `login` and a `password` in the `authInfo` object, the
     * auth agent will try to create a session:
     *
     *     var SessionAuthAgent({login: "admin", password: "publish"});
     *
     * The session auth agent is also able to reuse an existing session, to do
     * that it needs to receive an object with the session info:
     *
     *     var new SessionAuthAgent({
     *            name: "eZSESSID",
     *            identifier: "sessionidentifier",
     *            href: "/api/ezp/v2/users/session/sessionidentifier",
     *            csrfToken: "longCsrfToken",
     *        });
     *
     * @class SessionAuthAgent
     * @constructor
     * @param authInfo {Object} object literal containg the credentials (`login`
     * and `password`) or the session info of an already existing one (`name`,
     * `identifier`, `href` and `csrfToken`)
     * @param authInfo.login {String} user login
     * @param authInfo.password {String} user password
     * @param authInfo.name {String} name of the session
     * @param authInfo.identifier {String} identifier of the session
     * @param authInfo.href {String} refresh resource URI for the session
     * @param authInfo.csrfToken {String} CSRF Token
     * @param storage {StorageAbstraction?} storage to be used. By default a LocalStorage will be utilized
     */
    var SessionAuthAgent = function (authInfo, storage) {
            /**
             * The CAPI instance. It is set by the call to setCAPI() done while
             * instantiating the CAPI.
             *
             * @property _CAPI
             * @type CAPI
             * @protected
             */
            this._CAPI = null;

            /**
             * The login
             *
             * @property _login
             * @type {String}
             * @default ""
             * @protected
             */
            this._login = '';

            /**
             * The password
             *
             * @property _password
             * @type {String}
             * @default ""
             * @protected
             */
            this._password = '';

            /**
             * The storage to use to store the session info.
             *
             * @property _storage
             * @type {StorageAbstraction}
             * @default LocalStorage
             * @protected
             */
            this._storage = storage || new LocalStorage();

            if ( authInfo ) {
                if ( authInfo.login && authInfo.password ) {
                    this.setCredentials(authInfo);
                } else if ( authInfo.csrfToken && authInfo.identifier && authInfo.name && authInfo.href ) {
                    this._storeSessionInfo(authInfo);
                } else {
                    throw new CAPIError("Invalid authInfo parameter");
                }
            }
        },
        SAFE_METHODS = {'GET': 1, 'HEAD': 1, 'OPTIONS': 1, 'TRACE': 1};

    /**
     * Constant to be used as storage key for the sessionName
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_NAME = 'ezpRestClient.sessionName';

    /**
     * Constant to be used as storage key for the sessionId
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_ID = 'ezpRestClient.sessionId';

    /**
     * Constant to be used as storage key for the sessionHref
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_HREF = 'ezpRestClient.sessionHref';

    /**
     * Constant to be used as storage key for the csrfToken
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_CSRF_TOKEN = 'ezpRestClient.csrfToken';

    /**
     * Checks that the current user is still logged in. To be considered as
     * logged in, the storage should have a session id and the refresh calls
     * should be successful.
     * If the storage does not contain any session info, the callback is called
     * with `true` as its first argument, otherwise, the callback is called
     * with the `error` and `result` from {{#crossLink
     * "UserService/refreshSession:method"}}UserService.refreshSession{{/crossLink}}.
     *
     * @param {Function} callback
     * @method isLoggedIn
     */
    SessionAuthAgent.prototype.isLoggedIn = function (callback) {
        var that = this,
            userService = this._CAPI.getUserService(),
            sessionId = this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID);

        if ( sessionId === null) {
            callback(true, false);
            return;
        }
        userService.refreshSession(sessionId, function (error, result) {
            if ( error ) {
                that._resetStorage();
            }
            callback(error, result);
        });
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
        if (this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID) !== null) {
            done(false, true);
            return;
        }

        var that = this,
            userService = this._CAPI.getUserService(),
            sessionCreateStruct = userService.newSessionCreateStruct(
                this._login,
                this._password
            );

        userService.createSession(
            sessionCreateStruct,
            function (error, sessionResponse) {
                var session;

                if (error) {
                    done(error, sessionResponse);
                    return;
                }

                session = sessionResponse.document.Session;
                that._storeSessionInfo({
                    name: session.name,
                    href: session._href,
                    identifier: session.identifier,
                    csrfToken: session.csrfToken,
                });

                done(false, sessionResponse);
            }
        );
    };

    /**
     * Tries to log in in the REST API. If the storage already contains a
     * session id, first it tries to log out before doing the log in.
     *
     * @method logIn
     * @param {Function} callback
     */
    SessionAuthAgent.prototype.logIn = function (callback) {
        var that = this;

        if ( this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID) !== null ) {
            this.logOut(function (error, result) {
                that.ensureAuthentication(callback);
            });
        } else {
            this.ensureAuthentication(callback);
        }
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {Function}
     */
    SessionAuthAgent.prototype.authenticateRequest = function (request, done) {
        var token = this._storage.getItem(SessionAuthAgent.KEY_CSRF_TOKEN);

        if ( SAFE_METHODS[request.method.toUpperCase()] !== 1 && token !== null ) {
            request.headers["X-CSRF-Token"] = token;
        }

        done(false, request);
    };

    /**
     * Log out. If the client did not logged in yet, the callback is called with
     * `false` and `true` as arguments, otherwise the callback is called with the
     * `error` and the `result` from {{#crossLink
     * "UserService/deleteSession:method"}}userService.deleteSession{{/crossLink}}.
     *
     * @method logOut
     * @param done {Function}
     */
    SessionAuthAgent.prototype.logOut = function (done) {
        var userService = this._CAPI.getUserService(),
            sessionHref = this._storage.getItem(SessionAuthAgent.KEY_SESSION_HREF),
            that = this;

        if ( sessionHref === null ) {
            done(false, true);
            return;
        }

        userService.deleteSession(
            sessionHref,
            function (error, response) {
                if ( !error ) {
                    that._resetStorage();
                }
                done(error, response);
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

    /**
     * Set the credentials
     *
     * @method setCredentials
     * @param {Object} credentials
     * @param {String} credentials.login
     * @param {String} credentials.password
     */
    SessionAuthAgent.prototype.setCredentials = function (credentials) {
        this._login = credentials.login;
        this._password = credentials.password;
    };

    /**
     * Resets the storage associated with this auth agent
     *
     * @method _resetStorage
     * @protected
     */
    SessionAuthAgent.prototype._resetStorage = function () {
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_NAME);
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_ID);
        this._storage.removeItem(SessionAuthAgent.KEY_SESSION_HREF);
        this._storage.removeItem(SessionAuthAgent.KEY_CSRF_TOKEN);
    };

    /**
     * Stores the session information in the storage
     *
     * @method _storeSessionInfo
     * @param {Object} session an object describing the session
     * @param session.name {String} the name of the session
     * @param session.identifier {String} the identifier of the session
     * @param session.href {String} the resource uri to refresh the session
     * @param session.csrfToken {String} the CSRF Token associated with the
     * session
     * @protected
     */
    SessionAuthAgent.prototype._storeSessionInfo = function (session) {
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_NAME, session.name);
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_HREF, session.href);
        this._storage.setItem(SessionAuthAgent.KEY_SESSION_ID, session.identifier);
        this._storage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, session.csrfToken);
    };

    return SessionAuthAgent;
});

/* global define */
define('authAgents/HttpBasicAuthAgent',[],function () {
    "use strict";

    /**
     * Creates an instance of HttpBasicAuthAgent object
     * Auth agent handles low level implementation of authorization workflow
     *
     * @class HttpBasicAuthAgent
     * @constructor
     * @param [credentials] {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     */
    var HttpBasicAuthAgent = function (credentials) {
        /**
         * The login
         *
         * @property _login
         * @type {String}
         * @default ""
         * @protected
         */
        this._login = '';

        /**
         * The password
         *
         * @property _password
         * @type {String}
         * @default ""
         * @protected
         */
        this._password = '';

        if ( credentials ) {
            this.setCredentials(credentials);
        }
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
    HttpBasicAuthAgent.prototype.ensureAuthentication = function (done) {
        // ... empty for basic auth?
        done(false, true);
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {Function}
     */
    HttpBasicAuthAgent.prototype.authenticateRequest = function (request, done) {
        request.httpBasicAuth = true;
        request.login = this._login;
        request.password = this._password;

        done(false, request);
    };

    /**
     * Log out
     * No actual logic for HTTP Basic Auth
     *
     * @method logOut
     * @param done {Function}
     */
    HttpBasicAuthAgent.prototype.logOut = function (done) {
        done(false, true);
    };

    /**
     * Checks whether the user is logged in. For HttpBasicAuthAgent, it actually
     * tries to load the root resource with the provided credentials.
     *
     * @method isLoggedIn
     * @param {Function} done
     */
    HttpBasicAuthAgent.prototype.isLoggedIn = function (done) {
        if ( !this._login || !this._password ) {
            done(true, false);
            return;
        }
        this._CAPI.getContentService().loadRoot(done);
    };

    /**
     * Logs in the user by trying to load the root resource, it is the same as
     * {{#crossLink
     * "HttpBasicAuthAgent/isLoggedIn:method"}}HttpBasicAuthAgent.isLoggedIn{{/crossLink}}
     *
     * @method logIn
     * @param {Function} done
     */
    HttpBasicAuthAgent.prototype.logIn = function (done) {
        this.isLoggedIn(done);
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    HttpBasicAuthAgent.prototype.setCAPI = function (CAPI) {
        this._CAPI = CAPI;
    };

    /**
     * Set the credentials
     *
     * @method setCredentials
     * @param {Object} credentials
     * @param {String} credentials.login
     * @param {String} credentials.password
     */
    HttpBasicAuthAgent.prototype.setCredentials = function (credentials) {
        this._login = credentials.login;
        this._password = credentials.password;
    };

    return HttpBasicAuthAgent;
});

/* global define */
define('structures/Response',[],function () {
    "use strict";

    /**
     * @class Response
     * @constructor
     * @param valuesContainer
     */
    var Response = function (valuesContainer) {
        /**
         * The XMLHttpRequest object
         *
         * @property xhr
         * @type {XMLHttpRequest}
         * @default null
         */
        this.xhr = null;

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
            try {
                this.document = JSON.parse(this.body);
            } catch(e) {
                this.document = null;
            }
        }

        return this;
    };

    Response.prototype.getHeader = function (header) {
        return this.xhr.getResponseHeader(header);
    };

    return Response;

});

/* global define */
define('structures/Request',[],function () {
    "use strict";

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
    "use strict";

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
     * @param [body=""] {String} a string which should be passed in request body to the REST service
     * @param [headers={}] {object} object literal describing request headers
     * @param callback {Function} function, which will be executed on request success
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
                    if (error) {
                        that._authInProgress = false;
                        callback(error, false);
                        return;
                    }

                    that._authInProgress = false;

                    // emptying requests Queue
                    /*jshint boss:true */
                    /*jshint -W083 */
                    while (nextRequest = that._requestsQueue.shift()) {
                        that._authenticationAgent.authenticateRequest(
                            nextRequest,
                            function (error, authenticatedRequest) {
                                if (error) {
                                    callback(
                                        new CAPIError(
                                            "An error occurred during request authentication.",
                                            {request: nextRequest}
                                        ),
                                        false
                                    );
                                    return;
                                }

                                if (that.logRequests) {
                                    console.dir(request);
                                }
                                // Main goal
                                that._connectionFactory.createConnection().execute(authenticatedRequest, callback);
                            }
                        );
                    } // while
                    /*jshint +W083 */
                    /*jshint boss:false */
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
     * @param [body=""] {String} a string which should be passed in request body to the REST service
     * @param [headers={}] {object} object literal describing request headers
     * @param callback {Function} function, which will be executed on request success
     */
    ConnectionManager.prototype.notAuthorizedRequest = function (method, url, body, headers, callback) {
        var request, that = this,
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

        this._authenticationAgent.authenticateRequest(request, function (err, request) {
            that._connectionFactory.createConnection().execute(request, callback);
        });
    };

    return ConnectionManager;
});

/* global define */
define('ConnectionFeatureFactory',[],function () {
    "use strict";

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
            index;

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
    "use strict";

    /**
     * Creates an instance of XmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for generic (non-Microsoft) browsers
     *
     * @class XmlHttpRequestConnection
     * @constructor
     */
    var XmlHttpRequestConnection = function () {
        this._xhr = new XMLHttpRequest();
    };

    /**
     * Basic request implemented via XHR technique
     *
     * @method execute
     * @param request {Request} structure containing all needed params and data
     * @param callback {Function} function, which will be executed on request success
     */
    XmlHttpRequestConnection.prototype.execute = function (request, callback) {
        var XHR = this._xhr,
            headerType;

        // Create the state change handler:
        XHR.onreadystatechange = function () {
            var response;

            if (XHR.readyState != 4) {return;} // Not ready yet

            response = new Response({
                status: XHR.status,
                headers: XHR.getAllResponseHeaders(),
                body: XHR.responseText,
                xhr: XHR,
            });
            if (XHR.status >= 400 || !XHR.status) {
                callback(
                    new CAPIError("Connection error : " + XHR.status + ".", {request: request}),
                    response
                );
                return;
            }
            callback(false, response);
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

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @return {Boolean} whether the connection is compatible with current environment
     */
    XmlHttpRequestConnection.isCompatible = function () {
        return !!window.XMLHttpRequest;
    };

    return XmlHttpRequestConnection;
});

/* global define */
/* global ActiveXObject */
define('connections/MicrosoftXmlHttpRequestConnection',["structures/Response", "structures/CAPIError"], function (Response, CAPIError) {
    "use strict";

    /**
     * Creates an instance of MicrosoftXmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for Microsoft browsers
     *
     * @class MicrosoftXmlHttpRequestConnection
     * @constructor
     */
    var MicrosoftXmlHttpRequestConnection = function () {
        this._xhr = new ActiveXObject("Microsoft.XMLHTTP");
    };

    /**
     * Basic request implemented via XHR technique
     *
     * @method execute
     * @param request {Request} structure containing all needed params and data
     * @param callback {Function} function, which will be executed on request success
     */
    MicrosoftXmlHttpRequestConnection.prototype.execute = function (request, callback) {
        var XHR = this._xhr,
            headerType;

        // Create the state change handler:
        XHR.onreadystatechange = function () {
            var response;

            if (XHR.readyState != 4) {return;} // Not ready yet

            response = new Response({
                status: XHR.status,
                headers: XHR.getAllResponseHeaders(),
                body: XHR.responseText,
                xhr: XHR,
            });

            if (XHR.status >= 400 || !XHR.status) {
                callback(
                    new CAPIError("Connection error : " + XHR.status + ".", {request: request}),
                    response
                );
                return;
            }
            callback(false, response);
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

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @return {Boolean} whether the connection is compatible with current environment
     */
    MicrosoftXmlHttpRequestConnection.isCompatible = function () {
        return !!window.ActiveXObject;
    };

    return MicrosoftXmlHttpRequestConnection;
});

/* global define */
define('services/DiscoveryService',["structures/CAPIError"], function (CAPIError) {
    "use strict";

    /**
     * Creates an instance of discovery service.  Discovery service is used
     * internally to discover resources URI and media type provided in the root
     * resource.
     *
     * @class DiscoveryService
     * @constructor
     * @param rootPath {String} path to Root resource
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function (rootPath, connectionManager) {
        this._connectionManager = connectionManager;
        this._rootPath = rootPath;
        this._cacheObject = {};
    };

    /**
     * Get the information for given object name (located under the root).
     * The information is provided as the second argument of the callback unless there's a
     * network issue while loading the REST root resource or if there's no resource
     * associated with the given name.
     *
     * @method getInfoObject
     *
     * @param name {String} name of the target object (located under the root, e.g. "Trash")
     * @param callback {Function}
     * @param callback.error {Boolean|CAPIError} false or CAPIError object if an
     * error occurred
     * @param callback.response {Object|Response|Boolean} the target object if
     * it was found, the Response object if an error occurred while loading the
     * REST root or false if the name does not match any object.
     */
    DiscoveryService.prototype.getInfoObject = function (name, callback) {
        var that = this;

        // Discovering root, if not yet discovered
        // on discovery running the request for same 'name' again
        if (!this._cacheObject.Root) {
            this._discoverRoot(this._rootPath, function (error, response) {
                if (error) {
                    callback(error, response);
                    return;
                }
                that.getInfoObject(name, callback);
            });
            return;
        }

        if (this._cacheObject.Root.hasOwnProperty(name)) {
            callback(false, this._cacheObject.Root[name]);
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

    /**
     * Load the REST root resource
     *
     * @method _discoverRoot
     * @protected
     *
     * @param rootPath {String} path to Root resource
     * @param callback {Function} callback executed after performing the request
     * @param callback.error {Boolean|CAPIError} false or CAPIError object if an
     * error occurred
     * @param callback.response {Boolean|Response} true if the root was
     * successfully loaded, the Response otherwise
     */
    DiscoveryService.prototype._discoverRoot = function (rootPath, callback) {
        var that = this;

        this._connectionManager.request(
            "GET",
            rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            function (error, response) {
                if (error) {
                    callback(error, response);
                    return;
                }

                that._copyToCache(response.document);
                callback(false, true);
            }
        );
    };

    /**
     * Copy all the properties of the target object into the cache
     *
     * @method _copyToCache
     * @protected
     *
     * @param object {Object} the object to cache
     */
    DiscoveryService.prototype._copyToCache = function (object) {
        var property;

        // disabling hasOwnProperty check as it is useless here, we are caching
        // literal object coming from the root resource
        /*jslint forin:false */
        for (property in object) {
            this._cacheObject[property] = object[property];
        }
        /*jslint forin:true */
    };

    return DiscoveryService;
});

/* global define */
define('structures/ContentCreateStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to create a new Content object. See
     * {{#crossLink "ContentService/createContent"}}ContentService.createContent{{/crossLink}}
     *
     * @class ContentCreateStruct
     * @constructor
     * @param contentTypeId {String} Content Type id (e.g. "/api/ezp/v2/content/types/16")
     * @param locationCreateStruct {LocationCreateStruct} create structure for a Location object, where the new Content object will be situated
     * @param languageCode {String} The language code (e.g. "eng-GB")
     */
    var ContentCreateStruct = function (contentTypeId, locationCreateStruct, languageCode, alwaysAvailable) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentCreate = {};

        this.body.ContentCreate.ContentType = {
            "_href": contentTypeId
        };

        this.body.ContentCreate.mainLanguageCode = languageCode;
        this.body.ContentCreate.LocationCreate = locationCreateStruct.body.LocationCreate;

        this.body.ContentCreate.Section = null;
        this.body.ContentCreate.alwaysAvailable = alwaysAvailable;
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

    /**
     * Adds a new field and its value into the structure
     *
     * @method addField
     * @param id {Number}  field id
     * @param fieldIdentifer {String} field identifier
     * @param fieldValue {Mixed} field value
     *
     * @return {ContentCreateStruct}
     */
    ContentCreateStruct.prototype.addField = function (fieldIdentifer, fieldValue) {
        this.body.ContentCreate.fields.field.push({
            fieldDefinitionIdentifier: fieldIdentifer,
            fieldValue: fieldValue,
        });

        return this;
    };

    return ContentCreateStruct;
});

/* global define */
define('structures/ContentUpdateStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to update a Content object. See
     * {{#crossLink "ContentService/updateContent"}}ContentService.updateContent{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create and update a Section. See for ex.
     * {{#crossLink "ContentService/createSection"}}ContentService.createSection{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new Location. See
     * {{#crossLink "ContentService/createLocation"}}ContentService.createLocation{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to update a Location. See
     * {{#crossLink "ContentService/updateLocation"}}ContentService.updateLocation{{/crossLink}}
     *
     * @class LocationUpdateStruct
     * @constructor
     */
    var LocationUpdateStruct = function () {
        this.body = {};
        this.body.LocationUpdate = {};

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
    "use strict";

    /**
     * The Content Update structure that can be used with {{#crossLink
     * "ContentService/updateContentMetadata"}}ContentService.updateContentMetadata{{/crossLink}}
     *
     * @class ContentMetadataUpdateStruct
     * @constructor
     */
    var ContentMetadataUpdateStruct = function () {
            this.body = {'ContentUpdate': {}};

            this.headers = {
                "Accept": "application/vnd.ez.api.ContentInfo+json",
                "Content-Type": "application/vnd.ez.api.ContentUpdate+json"
            };
        };

    /**
     * Sets the section id
     *
     * @method setSection
     * @param {String} sectionId the Section REST id
     */
    ContentMetadataUpdateStruct.prototype.setSection = function (sectionId) {
        this.body.ContentUpdate.Section = {_href: sectionId};
    };

    /**
     * Sets the main location id
     *
     * @method setMainLocation
     * @param {String} locationId the Location REST id
     */
    ContentMetadataUpdateStruct.prototype.setMainLocation = function (locationId) {
        this.body.ContentUpdate.MainLocation = {_href: locationId};
    };

    return ContentMetadataUpdateStruct;
});

/* global define */
define('structures/ObjectStateGroupCreateStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to create a new Object State group. See
     * {{#crossLink "ContentService/createObjectStateGroup"}}ContentService.createObjectStateGroup{{/crossLink}}
     *
     * @class ObjectStateGroupCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectStateGroup identifier
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} Multi language value (see the example)
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
    "use strict";

    /**
     * Returns a structure used to update an Object State group. See
     * {{#crossLink "ContentService/updateObjectStateGroup"}}ContentService.updateObjectStateGroup{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new Object State. See
     * {{#crossLink "ContentService/createObjectState"}}ContentService.createObjectState{{/crossLink}}
     *
     * @class ObjectStateCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {Number}
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
    "use strict";

    /**
     * Returns a structure used to update an Object State. See
     * {{#crossLink "ContentService/updateObjectState"}}ContentService.updateObjectState{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new REST View. See
     * {{#crossLink "ContentService/createView"}}ContentService.createView{{/crossLink}}
     *
     * @class ViewCreateStruct
     * @constructor
     * @param identifier {String} unique view identifier
     * @param [type="ContentQuery"] {String} the view type to create, the REST API currently
     * supports only "ContentQuery" or "LocationQuery".
     */
    var ViewCreateStruct = function (identifier, type) {
        var query = {
                "Criteria": {},
                "FacetBuilders": {},
                "SortClauses": {},
            };

        if ( !type ) {
            type = "ContentQuery";
        }
        /**
         * Holds the body of the view create structs
         *
         * @property body
         * @type {Object}
         * @default {
         *     ViewInput: {
         *         identifier: <identifier>,
         *         public: false,
         *         <type>: {
         *             Criteria: {},
         *             SortClauses: {},
         *             FacetBuilders: {},
         *         },
         *     }
         * }
         */
        this.body = {ViewInput: {"identifier": identifier, "public": false}};
        this.body.ViewInput[type] = query;

        /**
         * Holds the headers sent when creating a view
         *
         * @property headers
         * @type {Object}
         * @default {
         *  "Accept": "application/vnd.ez.api.View+json; version=1.1",
         *  "Content-Type": "application/vnd.ez.api.ViewInput+json; version=1.1"
         * }
         */
        this.headers = {
            "Accept": "application/vnd.ez.api.View+json; version=1.1",
            "Content-Type": "application/vnd.ez.api.ViewInput+json; version=1.1"
        };
    };

    return ViewCreateStruct;
});

/* global define */
define('structures/UrlAliasCreateStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to create a new UrlAlias object. See
     * {{#crossLink "ContentService/createUrlAlias"}}ContentService.createUrlAlias{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new Url Wildcard object. See
     * {{#crossLink "ContentService/createUrlWildcard"}}ContentService.createUrlWildcard{{/crossLink}}
     *
     * @class UrlWildcardCreateStruct
     * @constructor
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {Boolean} weather or not the wildcard should redirect to the resource
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
    "use strict";

    /**
     * Returns a structure used to create a new Content object. See
     * {{#crossLink "ContentService/addRelation"}}ContentService.addRelation{{/crossLink}}
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
/*global unescape, module, define, window, global*/

/*
 UriTemplate Copyright (c) 2012-2013 Franz Antesberger. All Rights Reserved.
 Available via the MIT license.
*/

(function (exportCallback) {
    "use strict";

var UriTemplateError = (function () {

    function UriTemplateError (options) {
        this.options = options;
    }

    UriTemplateError.prototype.toString = function () {
        if (JSON && JSON.stringify) {
            return JSON.stringify(this.options);
        }
        else {
            return this.options;
        }
    };

    return UriTemplateError;
}());

var objectHelper = (function () {
    function isArray (value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    function isString (value) {
        return Object.prototype.toString.apply(value) === '[object String]';
    }
    
    function isNumber (value) {
        return Object.prototype.toString.apply(value) === '[object Number]';
    }
    
    function isBoolean (value) {
        return Object.prototype.toString.apply(value) === '[object Boolean]';
    }
    
    function join (arr, separator) {
        var
            result = '',
            first = true,
            index;
        for (index = 0; index < arr.length; index += 1) {
            if (first) {
                first = false;
            }
            else {
                result += separator;
            }
            result += arr[index];
        }
        return result;
    }

    function map (arr, mapper) {
        var
            result = [],
            index = 0;
        for (; index < arr.length; index += 1) {
            result.push(mapper(arr[index]));
        }
        return result;
    }

    function filter (arr, predicate) {
        var
            result = [],
            index = 0;
        for (; index < arr.length; index += 1) {
            if (predicate(arr[index])) {
                result.push(arr[index]);
            }
        }
        return result;
    }

    function deepFreezeUsingObjectFreeze (object) {
        if (typeof object !== "object" || object === null) {
            return object;
        }
        Object.freeze(object);
        var property, propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                property = object[propertyName];
                // be aware, arrays are 'object', too
                if (typeof property === "object") {
                    deepFreeze(property);
                }
            }
        }
        return object;
    }

    function deepFreeze (object) {
        if (typeof Object.freeze === 'function') {
            return deepFreezeUsingObjectFreeze(object);
        }
        return object;
    }


    return {
        isArray: isArray,
        isString: isString,
        isNumber: isNumber,
        isBoolean: isBoolean,
        join: join,
        map: map,
        filter: filter,
        deepFreeze: deepFreeze
    };
}());

var charHelper = (function () {

    function isAlpha (chr) {
        return (chr >= 'a' && chr <= 'z') || ((chr >= 'A' && chr <= 'Z'));
    }

    function isDigit (chr) {
        return chr >= '0' && chr <= '9';
    }

    function isHexDigit (chr) {
        return isDigit(chr) || (chr >= 'a' && chr <= 'f') || (chr >= 'A' && chr <= 'F');
    }

    return {
        isAlpha: isAlpha,
        isDigit: isDigit,
        isHexDigit: isHexDigit
    };
}());

var pctEncoder = (function () {
    var utf8 = {
        encode: function (chr) {
            // see http://ecmanaut.blogspot.de/2006/07/encoding-decoding-utf8-in-javascript.html
            return unescape(encodeURIComponent(chr));
        },
        numBytes: function (firstCharCode) {
            if (firstCharCode <= 0x7F) {
                return 1;
            }
            else if (0xC2 <= firstCharCode && firstCharCode <= 0xDF) {
                return 2;
            }
            else if (0xE0 <= firstCharCode && firstCharCode <= 0xEF) {
                return 3;
            }
            else if (0xF0 <= firstCharCode && firstCharCode <= 0xF4) {
                return 4;
            }
            // no valid first octet
            return 0;
        },
        isValidFollowingCharCode: function (charCode) {
            return 0x80 <= charCode && charCode <= 0xBF;
        }
    };

    /**
     * encodes a character, if needed or not.
     * @param chr
     * @return pct-encoded character
     */
    function encodeCharacter (chr) {
        var
            result = '',
            octets = utf8.encode(chr),
            octet,
            index;
        for (index = 0; index < octets.length; index += 1) {
            octet = octets.charCodeAt(index);
            result += '%' + (octet < 0x10 ? '0' : '') + octet.toString(16).toUpperCase();
        }
        return result;
    }

    /**
     * Returns, whether the given text at start is in the form 'percent hex-digit hex-digit', like '%3F'
     * @param text
     * @param start
     * @return {boolean|*|*}
     */
    function isPercentDigitDigit (text, start) {
        return text.charAt(start) === '%' && charHelper.isHexDigit(text.charAt(start + 1)) && charHelper.isHexDigit(text.charAt(start + 2));
    }

    /**
     * Parses a hex number from start with length 2.
     * @param text a string
     * @param start the start index of the 2-digit hex number
     * @return {Number}
     */
    function parseHex2 (text, start) {
        return parseInt(text.substr(start, 2), 16);
    }

    /**
     * Returns whether or not the given char sequence is a correctly pct-encoded sequence.
     * @param chr
     * @return {boolean}
     */
    function isPctEncoded (chr) {
        if (!isPercentDigitDigit(chr, 0)) {
            return false;
        }
        var firstCharCode = parseHex2(chr, 1);
        var numBytes = utf8.numBytes(firstCharCode);
        if (numBytes === 0) {
            return false;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(chr, 3*byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(chr, 3*byteNumber + 1))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Reads as much as needed from the text, e.g. '%20' or '%C3%B6'. It does not decode!
     * @param text
     * @param startIndex
     * @return the character or pct-string of the text at startIndex
     */
    function pctCharAt(text, startIndex) {
        var chr = text.charAt(startIndex);
        if (!isPercentDigitDigit(text, startIndex)) {
            return chr;
        }
        var utf8CharCode = parseHex2(text, startIndex + 1);
        var numBytes = utf8.numBytes(utf8CharCode);
        if (numBytes === 0) {
            return chr;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(text, startIndex + 3 * byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(text, startIndex + 3 * byteNumber + 1))) {
                return chr;
            }
        }
        return text.substr(startIndex, 3 * numBytes);
    }

    return {
        encodeCharacter: encodeCharacter,
        isPctEncoded: isPctEncoded,
        pctCharAt: pctCharAt
    };
}());

var rfcCharHelper = (function () {

    /**
     * Returns if an character is an varchar character according 2.3 of rfc 6570
     * @param chr
     * @return (Boolean)
     */
    function isVarchar (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '_' || pctEncoder.isPctEncoded(chr);
    }

    /**
     * Returns if chr is an unreserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isUnreserved (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '-' || chr === '.' || chr === '_' || chr === '~';
    }

    /**
     * Returns if chr is an reserved character according 1.5 of rfc 6570
     * or the percent character mentioned in 3.2.1.
     * @param chr
     * @return {Boolean}
     */
    function isReserved (chr) {
        return chr === ':' || chr === '/' || chr === '?' || chr === '#' || chr === '[' || chr === ']' || chr === '@' || chr === '!' || chr === '$' || chr === '&' || chr === '(' ||
            chr === ')' || chr === '*' || chr === '+' || chr === ',' || chr === ';' || chr === '=' || chr === "'";
    }

    return {
        isVarchar: isVarchar,
        isUnreserved: isUnreserved,
        isReserved: isReserved
    };

}());

/**
 * encoding of rfc 6570
 */
var encodingHelper = (function () {

    function encode (text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = text.charAt(index);
            result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    function encodeLiteralCharacter (literal, index) {
        var chr = pctEncoder.pctCharAt(literal, index);
        if (chr.length > 1) {
            return chr;
        }
        else {
            return rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
        }
    }

    function encodeLiteral (literal) {
        var
            result = '',
            index,
            chr = '';
        for (index = 0; index < literal.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(literal, index);
            if (chr.length > 1) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
            }
        }
        return result;
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved,
        encodeLiteral: encodeLiteral,
        encodeLiteralCharacter: encodeLiteralCharacter
    };

}());


// the operators defined by rfc 6570
var operators = (function () {

    var
        bySymbol = {};

    function create (symbol) {
        bySymbol[symbol] = {
            symbol: symbol,
            separator: (symbol === '?') ? '&' : (symbol === '' || symbol === '+' || symbol === '#') ? ',' : symbol,
            named: symbol === ';' || symbol === '&' || symbol === '?',
            ifEmpty: (symbol === '&' || symbol === '?') ? '=' : '',
            first: (symbol === '+' ) ? '' : symbol,
            encode: (symbol === '+' || symbol === '#') ? encodingHelper.encodePassReserved : encodingHelper.encode,
            toString: function () {
                return this.symbol;
            }
        };
    }

    create('');
    create('+');
    create('#');
    create('.');
    create('/');
    create(';');
    create('?');
    create('&');
    return {
        valueOf: function (chr) {
            if (bySymbol[chr]) {
                return bySymbol[chr];
            }
            if ("=,!@|".indexOf(chr) >= 0) {
                return null;
            }
            return bySymbol[''];
        }
    };
}());


/**
 * Detects, whether a given element is defined in the sense of rfc 6570
 * Section 2.3 of the RFC makes clear defintions:
 * * undefined and null are not defined.
 * * the empty string is defined
 * * an array ("list") is defined, if it is not empty (even if all elements are not defined)
 * * an object ("map") is defined, if it contains at least one property with defined value
 * @param object
 * @return {Boolean}
 */
function isDefined (object) {
    var
        propertyName;
    if (object === null || object === undefined) {
        return false;
    }
    if (objectHelper.isArray(object)) {
        // Section 2.3: A variable defined as a list value is considered undefined if the list contains zero members
        return object.length > 0;
    }
    if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
        // falsy values like empty strings, false or 0 are "defined"
        return true;
    }
    // else Object
    for (propertyName in object) {
        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
            return true;
        }
    }
    return false;
}

var LiteralExpression = (function () {
    function LiteralExpression (literal) {
        this.literal = encodingHelper.encodeLiteral(literal);
    }

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());

var parse = (function () {

    function parseExpression (expressionText) {
        var
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = '';

        function closeVarname () {
            var varname = expressionText.substring(varnameStart, index);
            if (varname.length === 0) {
                throw new UriTemplateError({expressionText: expressionText, message: "a varname must be specified", position: index});
            }
            varspec = {varname: varname, exploded: false, maxLength: null};
            varnameStart = null;
        }

        function closeMaxLength () {
            if (maxLengthStart === index) {
                throw new UriTemplateError({expressionText: expressionText, message: "after a ':' you have to specify the length", position: index});
            }
            varspec.maxLength = parseInt(expressionText.substring(maxLengthStart, index), 10);
            maxLengthStart = null;
        }

        operator = (function (operatorText) {
            var op = operators.valueOf(operatorText);
            if (op === null) {
                throw new UriTemplateError({expressionText: expressionText, message: "illegal use of reserved operator", position: index, operator: operatorText});
            }
            return op;
        }(expressionText.charAt(0)));
        index = operator.symbol.length;

        varnameStart = index;

        for (; index < expressionText.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(expressionText, index);

            if (varnameStart !== null) {
                // the spec says: varname =  varchar *( ["."] varchar )
                // so a dot is allowed except for the first char
                if (chr === '.') {
                    if (varnameStart === index) {
                        throw new UriTemplateError({expressionText: expressionText, message: "a varname MUST NOT start with a dot", position: index});
                    }
                    continue;
                }
                if (rfcCharHelper.isVarchar(chr)) {
                    continue;
                }
                closeVarname();
            }
            if (maxLengthStart !== null) {
                if (index === maxLengthStart && chr === '0') {
                    throw new UriTemplateError({expressionText: expressionText, message: "A :prefix must not start with digit 0", position: index});
                }
                if (charHelper.isDigit(chr)) {
                    if (index - maxLengthStart >= 4) {
                        throw new UriTemplateError({expressionText: expressionText, message: "A :prefix must have max 4 digits", position: index});
                    }
                    continue;
                }
                closeMaxLength();
            }
            if (chr === ':') {
                if (varspec.maxLength !== null) {
                    throw new UriTemplateError({expressionText: expressionText, message: "only one :maxLength is allowed per varspec", position: index});
                }
                if (varspec.exploded) {
                    throw new UriTemplateError({expressionText: expressionText, message: "an exploeded varspec MUST NOT be varspeced", position: index});
                }
                maxLengthStart = index + 1;
                continue;
            }
            if (chr === '*') {
                if (varspec === null) {
                    throw new UriTemplateError({expressionText: expressionText, message: "exploded without varspec", position: index});
                }
                if (varspec.exploded) {
                    throw new UriTemplateError({expressionText: expressionText, message: "exploded twice", position: index});
                }
                if (varspec.maxLength) {
                    throw new UriTemplateError({expressionText: expressionText, message: "an explode (*) MUST NOT follow to a prefix", position: index});
                }
                varspec.exploded = true;
                continue;
            }
            // the only legal character now is the comma
            if (chr === ',') {
                varspecs.push(varspec);
                varspec = null;
                varnameStart = index + 1;
                continue;
            }
            throw new UriTemplateError({expressionText: expressionText, message: "illegal character", character: chr, position: index});
        } // for chr
        if (varnameStart !== null) {
            closeVarname();
        }
        if (maxLengthStart !== null) {
            closeMaxLength();
        }
        varspecs.push(varspec);
        return new VariableExpression(expressionText, operator, varspecs);
    }

    function parse (uriTemplateText) {
        // assert filled string
        var
            index,
            chr,
            expressions = [],
            braceOpenIndex = null,
            literalStart = 0;
        for (index = 0; index < uriTemplateText.length; index += 1) {
            chr = uriTemplateText.charAt(index);
            if (literalStart !== null) {
                if (chr === '}') {
                    throw new UriTemplateError({templateText: uriTemplateText, message: "unopened brace closed", position: index});
                }
                if (chr === '{') {
                    if (literalStart < index) {
                        expressions.push(new LiteralExpression(uriTemplateText.substring(literalStart, index)));
                    }
                    literalStart = null;
                    braceOpenIndex = index;
                }
                continue;
            }

            if (braceOpenIndex !== null) {
                // here just { is forbidden
                if (chr === '{') {
                    throw new UriTemplateError({templateText: uriTemplateText, message: "brace already opened", position: index});
                }
                if (chr === '}') {
                    if (braceOpenIndex + 1 === index) {
                        throw new UriTemplateError({templateText: uriTemplateText, message: "empty braces", position: braceOpenIndex});
                    }
                    try {
                        expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex + 1, index)));
                    }
                    catch (error) {
                        if (error.prototype === UriTemplateError.prototype) {
                            throw new UriTemplateError({templateText: uriTemplateText, message: error.options.message, position: braceOpenIndex + error.options.position, details: error.options});
                        }
                        throw error;
                    }
                    braceOpenIndex = null;
                    literalStart = index + 1;
                }
                continue;
            }
            throw new Error('reached unreachable code');
        }
        if (braceOpenIndex !== null) {
            throw new UriTemplateError({templateText: uriTemplateText, message: "unclosed brace", position: braceOpenIndex});
        }
        if (literalStart < uriTemplateText.length) {
            expressions.push(new LiteralExpression(uriTemplateText.substr(literalStart)));
        }
        return new UriTemplate(uriTemplateText, expressions);
    }

    return parse;
}());

var VariableExpression = (function () {
    // helper function if JSON is not available
    function prettyPrint (value) {
        return (JSON && JSON.stringify) ? JSON.stringify(value) : value;
    }

    function isEmpty (value) {
        if (!isDefined(value)) {
            return true;
        }
        if (objectHelper.isString(value)) {
            return value === '';
        }
        if (objectHelper.isNumber(value) || objectHelper.isBoolean(value)) {
            return false;
        }
        if (objectHelper.isArray(value)) {
            return value.length === 0;
        }
        for (var propertyName in value) {
            if (value.hasOwnProperty(propertyName)) {
                return false;
            }
        }
        return true;
    }

    function propertyArray (object) {
        var
            result = [],
            propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                result.push({name: propertyName, value: object[propertyName]});
            }
        }
        return result;
    }

    function VariableExpression (templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    function expandSimpleValue(varspec, operator, value) {
        var result = '';
        value = value.toString();
        if (operator.named) {
            result += encodingHelper.encodeLiteral(varspec.varname);
            if (value === '') {
                result += operator.ifEmpty;
                return result;
            }
            result += '=';
        }
        if (varspec.maxLength !== null) {
            value = value.substr(0, varspec.maxLength);
        }
        result += operator.encode(value);
        return result;
    }

    function valueDefined (nameValue) {
        return isDefined(nameValue.value);
    }

    function expandNotExploded(varspec, operator, value) {
        var
            arr = [],
            result = '';
        if (operator.named) {
            result += encodingHelper.encodeLiteral(varspec.varname);
            if (isEmpty(value)) {
                result += operator.ifEmpty;
                return result;
            }
            result += '=';
        }
        if (objectHelper.isArray(value)) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, operator.encode);
            result += objectHelper.join(arr, ',');
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, valueDefined);
            arr = objectHelper.map(arr, function (nameValue) {
                return operator.encode(nameValue.name) + ',' + operator.encode(nameValue.value);
            });
            result += objectHelper.join(arr, ',');
        }
        return result;
    }

    function expandExplodedNamed (varspec, operator, value) {
        var
            isArray = objectHelper.isArray(value),
            arr = [];
        if (isArray) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, function (listElement) {
                var tmp = encodingHelper.encodeLiteral(varspec.varname);
                if (isEmpty(listElement)) {
                    tmp += operator.ifEmpty;
                }
                else {
                    tmp += '=' + operator.encode(listElement);
                }
                return tmp;
            });
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, valueDefined);
            arr = objectHelper.map(arr, function (nameValue) {
                var tmp = encodingHelper.encodeLiteral(nameValue.name);
                if (isEmpty(nameValue.value)) {
                    tmp += operator.ifEmpty;
                }
                else {
                    tmp += '=' + operator.encode(nameValue.value);
                }
                return tmp;
            });
        }
        return objectHelper.join(arr, operator.separator);
    }

    function expandExplodedUnnamed (operator, value) {
        var
            arr = [],
            result = '';
        if (objectHelper.isArray(value)) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, operator.encode);
            result += objectHelper.join(arr, operator.separator);
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, function (nameValue) {
                return isDefined(nameValue.value);
            });
            arr = objectHelper.map(arr, function (nameValue) {
                return operator.encode(nameValue.name) + '=' + operator.encode(nameValue.value);
            });
            result += objectHelper.join(arr, operator.separator);
        }
        return result;
    }


    VariableExpression.prototype.expand = function (variables) {
        var
            expanded = [],
            index,
            varspec,
            value,
            valueIsArr,
            oneExploded = false,
            operator = this.operator;

        // expand each varspec and join with operator's separator
        for (index = 0; index < this.varspecs.length; index += 1) {
            varspec = this.varspecs[index];
            value = variables[varspec.varname];
            // if (!isDefined(value)) {
            // if (variables.hasOwnProperty(varspec.name)) {
            if (value === null || value === undefined) {
                continue;
            }
            if (varspec.exploded) {
                oneExploded = true;
            }
            valueIsArr = objectHelper.isArray(value);
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                expanded.push(expandSimpleValue(varspec, operator, value));
            }
            else if (varspec.maxLength && isDefined(value)) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + prettyPrint(value));
            }
            else if (!varspec.exploded) {
                if (operator.named || !isEmpty(value)) {
                    expanded.push(expandNotExploded(varspec, operator, value));
                }
            }
            else if (isDefined(value)) {
                if (operator.named) {
                    expanded.push(expandExplodedNamed(varspec, operator, value));
                }
                else {
                    expanded.push(expandExplodedUnnamed(operator, value));
                }
            }
        }

        if (expanded.length === 0) {
            return "";
        }
        else {
            return operator.first + objectHelper.join(expanded, operator.separator);
        }
    };

    return VariableExpression;
}());

var UriTemplate = (function () {
    function UriTemplate (templateText, expressions) {
        this.templateText = templateText;
        this.expressions = expressions;
        objectHelper.deepFreeze(this);
    }

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
        // this.expressions.map(function (expression) {return expression.expand(variables);}).join('');
        var
            index,
            result = '';
        for (index = 0; index < this.expressions.length; index += 1) {
            result += this.expressions[index].expand(variables);
        }
        return result;
    };

    UriTemplate.parse = parse;
    UriTemplate.UriTemplateError = UriTemplateError;
    return UriTemplate;
}());

    exportCallback(UriTemplate);

}(function (UriTemplate) {
        "use strict";
        // export UriTemplate, when module is present, or pass it to window or global
        if (typeof module !== "undefined") {
            module.exports = UriTemplate;
        }
        else if (typeof define === "function") {
            define('uritemplate',[],function() {
                return UriTemplate;
            });
        }
        else if (typeof window !== "undefined") {
            window.UriTemplate = UriTemplate;
        }
        else {
            global.UriTemplate = UriTemplate;
        }
    }
));

/* global define */
define('utils/uriparse',["uritemplate"], function (uriTemplateLib) {
    "use strict";
    /**
     * Provides the parseUriTemplate function
     *
     * @class parseUriTemplate
     * @static
     */

    /**
     * Parses an URI Template according to the RFC 6570.
     *
     * @method parse
     * @static
     * @param {String} template the template to interpret
     * @param {Object} the parameters
     * @return {String}
     */
    var parseUriTemplate = function (template, params) {
        return uriTemplateLib.parse(template).expand(params);
    };

    return parseUriTemplate;
});

/* global define */
define('services/ContentService',["structures/ContentCreateStruct", "structures/ContentUpdateStruct", "structures/SectionInputStruct",
        "structures/LocationCreateStruct", "structures/LocationUpdateStruct", "structures/ContentMetadataUpdateStruct",
        "structures/ObjectStateGroupCreateStruct", "structures/ObjectStateGroupUpdateStruct", "structures/ObjectStateCreateStruct",
        "structures/ObjectStateUpdateStruct", "structures/ViewCreateStruct", "structures/UrlAliasCreateStruct",
        "structures/UrlWildcardCreateStruct", "structures/RelationCreateStruct", "utils/uriparse"],
    function (ContentCreateStruct, ContentUpdateStruct, SectionInputStruct,
              LocationCreateStruct, LocationUpdateStruct, ContentMetadataUpdateStruct,
              ObjectStateGroupCreateStruct, ObjectStateGroupUpdateStruct, ObjectStateCreateStruct,
              ObjectStateUpdateStruct, ViewCreateStruct, UrlAliasCreateStruct,
              UrlWildcardCreateStruct, RelationCreateStruct, parseUriTemplate) {
    "use strict";

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
     *     contentService.loadRoot(function (error, response) {
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
     * @param rootPath {String} path to Root resource
     * @example
     *     var contentService = jsCAPI.getContentService();
     */
    var ContentService = function (connectionManager, discoveryService, rootPath) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
        this._rootPath = rootPath;
    };

    /**
     * List the root resources of the eZ Publish installation. Root resources contain many paths and references to other parts of the REST interface.
     * This call is used by DiscoveryService automatically, whenever needed.
     *
     * @method loadRoot
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadRoot = function (callback) {
        this._connectionManager.request(
            "GET",
            this._rootPath,
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
    ContentService.prototype.newContentUpdateStruct = function (language) {
        return new ContentUpdateStruct(language);
    };

    /**
     * Returns update structure for Content object metadata
     *
     * @method newContentMetadataUpdateStruct
     * @return ContentMetadataUpdateStruct
     */
    ContentService.prototype.newContentMetadataUpdateStruct = function () {
        return new ContentMetadataUpdateStruct();
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
    ContentService.prototype.newContentCreateStruct = function (contentTypeId, locationCreateStruct, language, alwaysAvailable) {
        return new ContentCreateStruct(contentTypeId, locationCreateStruct, language, alwaysAvailable);
    };

    /**
     * Returns input structure for Section object. Input structure is needed while creating and updating the object.
     *
     * @method newSectionInputStruct
     * @param identifier {String} unique section identifier (e.g. "media")
     * @param name {String} section name (e.g. "Media")
     * @return {SectionInputStruct}
     */
    ContentService.prototype.newSectionInputStruct = function (identifier, name) {
        return new SectionInputStruct(identifier, name);
    };

    /**
     * Returns create structure for Location object
     *
     * @method newLocationCreateStruct
     * @param parentLocationId {String} Reference to the parent location of the new Location. (e.g. "/api/ezp/v2/content/locations/1/2/118")
     * @return {LocationCreateStruct}
     */
    ContentService.prototype.newLocationCreateStruct = function (parentLocationId) {
        return new LocationCreateStruct(parentLocationId);
    };

    /**
     * Returns update structure for Location object
     *
     * @method newLocationUpdateStruct
     * @return {LocationUpdateStruct}
     */
    ContentService.prototype.newLocationUpdateStruct = function () {
        return new LocationUpdateStruct();
    };

    /**
     * Returns create structure for View object
     *
     * @method newViewCreateStruct
     * @param identifier {String} unique view identifier (e.g. "my-new-view")
     * @param [type="ContentQuery"] {String} the view type to create
     * @return {ViewCreateStruct}
     */
    ContentService.prototype.newViewCreateStruct = function (identifier, type) {
        return new ViewCreateStruct(identifier, type);
    };

    /**
     * Returns create structure for Relation
     *
     * @method newRelationCreateStruct
     * @param destination {String} reference to the resource we want to make related
     * @return {RelationCreateStruct}
     */
    ContentService.prototype.newRelationCreateStruct = function (destination) {
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
    ContentService.prototype.newObjectStateGroupCreateStruct = function (identifier, languageCode, names) {
        return new ObjectStateGroupCreateStruct(identifier, languageCode, names);
    };

    /**
     * Returns update structure for ObjectStateGroup
     *
     * @method newObjectStateGroupUpdateStruct
     * @return ObjectStateGroupUpdateStruct
     */
    ContentService.prototype.newObjectStateGroupUpdateStruct = function () {
        return new ObjectStateGroupUpdateStruct();
    };

    /**
     * Returns create structure for ObjectState
     *
     * @method newObjectStateCreateStruct
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {Number}
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
    ContentService.prototype.newObjectStateUpdateStruct = function () {
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
    ContentService.prototype.newUrlAliasCreateStruct = function (languageCode, resource, path) {
        return new UrlAliasCreateStruct(languageCode, resource, path);
    };

    /**
     * Returns create structure for UrlWildcard
     *
     * @method newUrlWildcardCreateStruct
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {Boolean} weather or not the wildcard should redirect to the resource
     * @example
     *     var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
     *         "some-new-wildcard",
     *         "/api/ezp/v2/content/locations/1/2/113",
     *         "false"
     *     );
     */
    ContentService.prototype.newUrlWildcardCreateStruct = function (sourceUrl, destinationUrl, forward) {
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
    ContentService.prototype.createSection = function (sectionInputStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (error) {
                    callback(error, sections);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    sections._href,
                    JSON.stringify(sectionInputStruct.body),
                    sectionInputStruct.headers,
                    callback
                );
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
    ContentService.prototype.updateSection = function (sectionId, sectionInputStruct, callback) {
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
    ContentService.prototype.loadSections = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (error) {
                    callback(error, sections);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    sections._href,
                    "",
                    {"Accept": sections["_media-type"]},
                    callback
                );
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
    ContentService.prototype.loadSection = function (sectionId, callback) {
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
    ContentService.prototype.deleteSection = function (sectionId, callback) {
        this._connectionManager.request(
            "DELETE",
            sectionId,
            "",
            {},
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
    ContentService.prototype.createContent = function (contentCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "content",
            function (error, contentObjects) {
                if (error) {
                    callback(error, contentObjects);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    contentObjects._href,
                    JSON.stringify(contentCreateStruct.body),
                    contentCreateStruct.headers,
                    callback
                );
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
    ContentService.prototype.updateContentMetadata = function (contentId, contentMetadataUpdateStruct, callback) {
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
    ContentService.prototype.loadContentByRemoteId = function (remoteId, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "contentByRemoteId",
            function (error, contentByRemoteId) {
                if (error) {
                    callback(error, contentByRemoteId);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(contentByRemoteId._href, {remoteId: remoteId}),
                    "",
                    {"Accept": "application/vnd.ez.api.ContentInfo+json"},
                    callback
                );
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
    ContentService.prototype.loadContentInfo = function (contentId, callback) {
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
     * @param [languageCodes=false] {String} comma separated list of language codes
     * (ie "fre-FR,eng-GB")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentInfoAndCurrentVersion = function (contentId, languageCodes, callback) {
        if ( typeof languageCodes === "function" ) {
            callback = languageCodes;
            languageCodes = false;
        }
        this._connectionManager.request(
            "GET",
            contentId + (languageCodes ? '?languages=' + languageCodes : ''),
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
    ContentService.prototype.deleteContent = function (contentId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentId,
            "",
            {},
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
    ContentService.prototype.copyContent = function (contentId, destinationId, callback) {
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
    ContentService.prototype.loadCurrentVersion = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var currentVersion = contentResponse.document.Content.CurrentVersion;

                that._connectionManager.request(
                    "GET",
                    currentVersion._href,
                    "",
                    {"Accept": currentVersion["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Loads a specific version of target content. This method returns fields and relations
     *
     * @method loadContent
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param [languages=''] {String} (comma separated list) restricts the output of translatable fields to the given languages.
     * @param [fields=''] {String} comma separated list of fields which should be returned in the response (see Content).
     * @param [responseGroups=''] {String}  alternative: comma separated lists of predefined field groups (see REST API Spec v1).
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     contentService.loadContent(
     *          '/api/ezp/v2/content/objects/180/versions/1',
     *          'eng-US',
     *          '',
     *          '',
     *          callback
     *     );
     */
    ContentService.prototype.loadContent = function (versionedContentId, languages, responseGroups, fields, callback) {
        var query;

        if ( !callback && !fields && !responseGroups ) {
            callback = languages;
            languages = '';
        } else if ( !callback && !fields ) {
            callback = responseGroups;
            responseGroups = '';
        } else if ( !callback ) {
            callback = fields;
            fields = '';
        }

        query = languages ? '?languages=' + languages : '';

        if ( responseGroups ) {
            query += query ? '&' : '?';
            query += 'responseGroups=' + responseGroups;
        }
        if ( fields ) {
            query += query ? '&' : '?';
            query += 'fields=' + fields;
        }

        this._connectionManager.request(
            "GET",
            versionedContentId + query,
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
    ContentService.prototype.loadVersions = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var contentVersions = contentResponse.document.Content.Versions;

                that._connectionManager.request(
                    "GET",
                    contentVersions._href,
                    "",
                    {"Accept": contentVersions["_media-type"]},
                    callback
                );
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
    ContentService.prototype.updateContent = function (versionedContentId, contentUpdateStruct, callback) {
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
     * @param [versionId] {Number} numerical id of the base version for the new draft.
     * If not provided the current version of the content will be used.
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
    ContentService.prototype.createContentDraft = function (contentId, versionId, callback) {
        var that = this;

        if ( !callback ) {
            callback = versionId;
            versionId = false;
        }
        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                var url = '';

                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                if ( versionId ) {
                    url = contentResponse.document.Content.Versions._href + "/" + versionId;
                } else {
                    url = contentResponse.document.Content.CurrentVersion._href;
                }

                that._connectionManager.request(
                    "COPY", url, "",
                    {"Accept": "application/vnd.ez.api.Version+json"},
                    callback
                );
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
    ContentService.prototype.deleteVersion = function (versionedContentId, callback) {
        this._connectionManager.request(
            "DELETE",
            versionedContentId,
            "",
            {},
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
    ContentService.prototype.publishVersion = function (versionedContentId, callback) {
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
    ContentService.prototype.createLocation = function (contentId, locationCreateStruct, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var locations = contentResponse.document.Content.Locations;

                that._connectionManager.request(
                    "POST",
                    locations._href,
                    JSON.stringify(locationCreateStruct.body),
                    locationCreateStruct.headers,
                    callback
                );
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
    ContentService.prototype.loadLocations = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var locations = contentResponse.document.Content.Locations;

                that._connectionManager.request(
                    "GET",
                    locations._href,
                    "",
                    {"Accept": "application/vnd.ez.api.LocationList+json"},
                    callback
                );
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
    ContentService.prototype.loadLocation = function (locationId, callback) {
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
     * @param remoteId {String} remote id of target location (e.g. "0bae96bd419e141ff3200ccbf2822e4f")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocationByRemoteId = function (remoteId, callback) {
        var that = this;
        this._discoveryService.getInfoObject(
            "locationByRemoteId",
            function (error, locationByRemoteId) {
                if (error) {
                    callback(error, locationByRemoteId);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(locationByRemoteId._href, {remoteId: remoteId}),
                    "",
                    {"Accept": "application/vnd.ez.api.Location+json"},
                    callback
                );
            }
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
    ContentService.prototype.updateLocation = function (locationId, locationUpdateStruct, callback) {
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
     * @param [limit=-1] {Number} the number of results returned
     * @param [offset=0] {Number} the offset of the result set
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
    ContentService.prototype.loadLocationChildren = function (locationId, limit, offset, callback) {

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
                if (error) {
                    callback(error, locationResponse);
                    return;
                }

                var location = locationResponse.document.Location;

                that._connectionManager.request(
                    "GET",
                    location.Children._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": location.Children["_media-type"]},
                    callback
                );
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
    ContentService.prototype.copySubtree = function (subtree, targetLocation, callback) {
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
    ContentService.prototype.moveSubtree = function (subtree, targetLocation, callback) {
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
    ContentService.prototype.swapLocation = function (subtree, targetLocation, callback) {
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
    ContentService.prototype.deleteLocation = function (locationId, callback) {
        this._connectionManager.request(
            "DELETE",
            locationId,
            "",
            {},
            callback
        );
    };

// ******************************
// Views management
// ******************************

    /**
     * Creates a new view. Views are used to perform content queries by certain criteria.
     *
     * @method createView
     * @param viewCreateStruct {ViewCreateStruct} object describing new view to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var viewCreateStruct = contentService.newViewCreateStruct('some-test-id');
     *     viewCreateStruct.body.ViewInput.Query.Criteria = {
     *         FullTextCriterion : "title"
     *     };
     *     contentService.createView(
     *         viewCreateStruct,
     *         callback
     *     );
     */
    ContentService.prototype.createView = function (viewCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "views",
            function (error, views) {
                if (error) {
                    callback(error, views);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    views._href,
                    JSON.stringify(viewCreateStruct.body),
                    viewCreateStruct.headers,
                    callback
                );
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
     * @param [limit=-1] {Number} the number of results returned
     * @param [offset=0] {Number} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadRelations = function (versionedContentId, limit, offset, callback) {

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
                if (error) {
                    callback(error, versionResponse);
                    return;
                }

                var version = versionResponse.document.Version;

                that._connectionManager.request(
                    "GET",
                    version.Relations._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": version.Relations["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     *  Loads the relations of the target content's current version
     *
     * @method loadCurrentRelations
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/102")
     * @param [limit=-1] {Number} the number of results returned
     * @param [offset=0] {Number} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadCurrentRelations = function (contentId, limit, offset, callback) {

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
                if (error) {
                    callback(error, currentVersionResponse);
                    return;
                }

                var currentVersion = currentVersionResponse.document.Version;

                that._connectionManager.request(
                    "GET",
                    currentVersion.Relations._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": currentVersion.Relations["_media-type"]},
                    callback
                );
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
    ContentService.prototype.loadRelation = function (relationId, callback) {
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
    ContentService.prototype.addRelation = function (versionedContentId, relationCreateStruct, callback) {
        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function (error, versionResponse) {
                if (error) {
                    callback(error, versionResponse);
                    return;
                }

                var version = versionResponse.document.Version;

                that._connectionManager.request(
                    "POST",
                    version.Relations._href,
                    JSON.stringify(relationCreateStruct.body),
                    relationCreateStruct.headers,
                    callback
                );
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
    ContentService.prototype.deleteRelation = function (relationId, callback) {
        this._connectionManager.request(
            "DELETE",
            relationId,
            "",
            {},
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
     * @param [limit=-1] {Number} the number of results returned
     * @param [offset=0] {Number} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadTrashItems = function (limit, offset, callback) {

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
                if (error) {
                    callback(error, trash);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    trash._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": trash["_media-type"]},
                    callback
                );
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
    ContentService.prototype.loadTrashItem = function (trashItemId, callback) {
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
    ContentService.prototype.recover = function (trashItemId, destination, callback) {

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
    ContentService.prototype.deleteTrashItem = function (trashItemId, callback) {
        this._connectionManager.request(
            "DELETE",
            trashItemId,
            "",
            {},
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
    ContentService.prototype.emptyThrash = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "trash",
            function (error, trash) {
                if (error) {
                    callback(error, trash);
                    return;
                }

                that._connectionManager.request(
                    "DELETE",
                    trash._href,
                    "",
                    {},
                    callback
                );
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
    ContentService.prototype.loadObjectStateGroups = function (objectStateGroups, callback) {
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
    ContentService.prototype.loadObjectStateGroup = function (objectStateGroupId, callback) {
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
    ContentService.prototype.createObjectStateGroup = function (objectStateGroups, objectStateGroupCreateStruct, callback) {
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
    ContentService.prototype.updateObjectStateGroup = function (objectStateGroupId, objectStateGroupUpdateStruct, callback) {
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
    ContentService.prototype.deleteObjectStateGroup = function (objectStateGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            objectStateGroupId,
            "",
            {},
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
    ContentService.prototype.createObjectState = function (objectStateGroupId, objectStateCreateStruct, callback) {
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
    ContentService.prototype.loadObjectState = function (objectStateId, callback) {
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
    ContentService.prototype.updateObjectState = function (objectStateId, objectStateUpdateStruct, callback) {
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
    ContentService.prototype.deleteObjectState = function (objectStateId, callback) {
        this._connectionManager.request(
            "DELETE",
            objectStateId,
            "",
            {},
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
    ContentService.prototype.getContentState = function (contentStatesId, callback) {
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
    ContentService.prototype.setContentState = function (contentStatesId, objectStates, callback) {
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
    ContentService.prototype.createUrlAlias = function (urlAliases, urlAliasCreateStruct, callback) {
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
    ContentService.prototype.listGlobalAliases = function (urlAliases, callback) {
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
     * @param [custom=true] {Boolean} this flag indicates weather autogenerated (false) or manual url aliases (true) should be returned
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.listLocationAliases = function (locationUrlAliases, custom, callback) {

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
    ContentService.prototype.loadUrlAlias = function (urlAliasId, callback) {
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
    ContentService.prototype.deleteUrlAlias = function (urlAliasId, callback) {
        this._connectionManager.request(
            "DELETE",
            urlAliasId,
            "",
            {},
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
    ContentService.prototype.createUrlWildcard = function (urlWildcards, urlWildcardCreateStruct, callback) {
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
    ContentService.prototype.loadUrlWildcards = function (urlWildcards, callback) {
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
    ContentService.prototype.loadUrlWildcard = function (urlWildcardId, callback) {
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
    ContentService.prototype.deleteUrlWildcard = function (urlWildcardId, callback) {
        this._connectionManager.request(
            "DELETE",
            urlWildcardId,
            "",
            {},
            callback
        );
    };

    /**
     * Loads an image variation
     *
     * @method loadImageVariation
     * @param variation {String} The variation REST id
     * @param callback {Function} Callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadImageVariation = function (variation, callback) {
        this._connectionManager.request(
            "GET",
            variation,
            "",
            {"Accept": "application\/vnd.ez.api.ContentImageVariation+json"},
            callback
        );
    };

    return ContentService;

});

/* global define */
define('structures/ContentTypeGroupInputStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to create and update a Content Type group. See
     * {{#crossLink "ContentTypeService/createContentTypeGroup"}}ContentTypeService.createContentTypeGroup{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new Content Type object. See
     * {{#crossLink "ContentTypeService/createContentType"}}ContentTypeService.createContentType{{/crossLink}}
     *
     * @class ContentTypeCreateStruct
     * @constructor
     * @param identifier {String} Unique identifier for the target Content Type (e.g. "my_new_content_type")
     * @param languageCode {String} The language code (e.g. "eng-GB")
     * @param names {Array} Multi language value (see example in
     * {{#crossLink "ContentTypeService/newContentTypeCreateStruct"}}ContentTypeService:newContentTypeCreateStruct{{/crossLink}})
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
    "use strict";

    /**
     * Returns a structure used to update a Content Type object. See for ex.
     * {{#crossLink "ContentTypeService/createContentTypeDraft"}}ContentTypeService.createContentTypeDraft{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new Field Definition. See
     * {{#crossLink "ContentTypeService/addFieldDefinition"}}ContentTypeService.addFieldDefinition{{/crossLink}}
     *
     * @class FieldDefinitionCreateStruct
     * @constructor
     * @param identifier {String} unique field definiton identifer (e.g. "my-field")
     * @param fieldType {String} identifier of existing field type (e.g. "ezstring", "ezdate")
     * @param fieldGroup {String} identifier of existing field group (e.g. "content", "meta")
     * @param names {Array} Multi language value (see example in
     * {{#crossLink "ContentTypeService/newFieldDefinitionCreateStruct"}}ContentTypeService.newFieldDefintionCreateStruct{{/crossLink}})
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
    "use strict";

    /**
     * Returns a structure used to update a Field Definition. See
     * {{#crossLink "ContentTypeService/updateFieldDefinition"}}ContentTypeService.updateFieldDefinition{{/crossLink}}
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
        "structures/FieldDefinitionCreateStruct", "structures/FieldDefinitionUpdateStruct", "utils/uriparse"],
    function (ContentTypeGroupInputStruct, ContentTypeCreateStruct, ContentTypeUpdateStruct,
              FieldDefinitionCreateStruct, FieldDefinitionUpdateStruct, parseUriTemplate) {
    "use strict";

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
    ContentTypeService.prototype.newContentTypeGroupInputStruct = function (identifier) {
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
    ContentTypeService.prototype.newContentTypeCreateStruct = function (identifier, languageCode, names) {
        return new ContentTypeCreateStruct(identifier, languageCode, names);
    };

    /**
     * @method newContentTypeUpdateStruct
     * @return {ContentTypeUpdateStruct}
     */
    ContentTypeService.prototype.newContentTypeUpdateStruct = function () {
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
    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function (identifier, fieldType, fieldGroup, names) {
        return new FieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);
    };

    /**
     * @method newFieldDefinitionUpdateStruct
     * @return {FieldDefinitionUpdateStruct}
     */
    ContentTypeService.prototype.newFieldDefinitionUpdateStruct = function () {
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
    ContentTypeService.prototype.createContentTypeGroup = function (contentTypeGroups, contentTypeGroupCreateStruct, callback) {
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
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroups = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject('contentTypeGroups', function (error, xhr) {
            if (error) {
                callback(error);
                return;
            }

            that._connectionManager.request(
                "GET",
                xhr._href,
                "",
                {"Accept": "application/vnd.ez.api.ContentTypeGroupList+json"},
                callback
            );
        });
    };

    /**
     * Load single content type group
     *
     * @method loadContentTypeGroup
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/types/100")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroup = function (contentTypeGroupId, callback) {
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
    ContentTypeService.prototype.updateContentTypeGroup = function (contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
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
    ContentTypeService.prototype.deleteContentTypeGroup = function (contentTypeGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeGroupId,
            "",
            {},
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
    ContentTypeService.prototype.loadContentTypes = function (contentTypeGroupId, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (error) {
                    callback(error, contentTypeGroupResponse);
                    return;
                }

                var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup;

                that._connectionManager.request(
                    "GET",
                     contentTypeGroup.ContentTypes._href,
                    "",
                    {"Accept": contentTypeGroup.ContentTypes["_media-type"]},
                    callback
                );
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
    ContentTypeService.prototype.loadContentTypeGroupByIdentifier = function (contentTypeGroups, identifier, callback) {
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
    ContentTypeService.prototype.createContentType = function (contentTypeGroupId, contentTypeCreateStruct, publish, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (error) {
                    callback(error, contentTypeGroupResponse);
                    return;
                }

                var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup,
                    parameters = (publish === true) ? "?publish=true": "";

                that._connectionManager.request(
                    "POST",
                    contentTypeGroup.ContentTypes._href + parameters,
                    JSON.stringify(contentTypeCreateStruct.body),
                    contentTypeCreateStruct.headers,
                    callback
                );
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
    ContentTypeService.prototype.copyContentType = function (contentTypeId, callback) {
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
    ContentTypeService.prototype.loadContentType = function (contentTypeId, callback) {
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
    ContentTypeService.prototype.loadContentTypeByIdentifier = function (identifier, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "contentTypeByIdentifier",
            function (error, contentTypeByIdentifier) {
                if (error) {
                    callback(error, contentTypeByIdentifier);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(contentTypeByIdentifier._href, {identifier: identifier}),
                    "",
                    {"Accept": "application/vnd.ez.api.ContentTypeInfoList+json"},
                    callback
                );
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
    ContentTypeService.prototype.deleteContentType = function (contentTypeId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeId,
            "",
            {},
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
    ContentTypeService.prototype.loadGroupsOfContentType = function (contentTypeId, callback) {
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
    ContentTypeService.prototype.assignContentTypeGroup = function (contentTypeId, groupId, callback) {
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
    ContentTypeService.prototype.unassignContentTypeGroup = function (contentTypeAssignedGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeAssignedGroupId,
            "",
            {},
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
    ContentTypeService.prototype.createContentTypeDraft = function (contentTypeId, contentTypeUpdateStruct, callback) {
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
    ContentTypeService.prototype.loadContentTypeDraft = function (contentTypeId, callback) {
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
    ContentTypeService.prototype.updateContentTypeDraftMetadata = function (contentTypeDraftId, contentTypeUpdateStruct, callback) {
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
    ContentTypeService.prototype.publishContentTypeDraft = function (contentTypeDraftId, callback) {
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
    ContentTypeService.prototype.deleteContentTypeDraft = function (contentTypeDraftId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeDraftId,
            "",
            {},
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
    ContentTypeService.prototype.addFieldDefinition = function (contentTypeId, fieldDefinitionCreateStruct, callback) {
        var that = this;

        this.loadContentTypeDraft(
            contentTypeId,
            function (error, contentTypeDraftResponse) {
                if (error) {
                    callback(error, contentTypeDraftResponse);
                    return;
                }

                var contentTypeDraftFieldDefinitions = contentTypeDraftResponse.document.ContentType.FieldDefinitions;

                that._connectionManager.request(
                    "POST",
                    contentTypeDraftFieldDefinitions._href,
                    JSON.stringify(fieldDefinitionCreateStruct.body),
                    fieldDefinitionCreateStruct.headers,
                    callback
                );
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
    ContentTypeService.prototype.loadFieldDefinition = function (fieldDefinitionId, callback) {
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
    ContentTypeService.prototype.updateFieldDefinition = function (fieldDefinitionId, fieldDefinitionUpdateStruct, callback) {
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
    ContentTypeService.prototype.deleteFieldDefinition = function (fieldDefinitionId, callback) {
        this._connectionManager.request(
            "DELETE",
            fieldDefinitionId,
            "",
            {},
            callback
        );
    };

    return ContentTypeService;

});

/* global define */
define('structures/SessionCreateStruct',[],function () {
    "use strict";

    /**
     * Returns a structure used to create a new Session. See
     * {{#crossLink "UserService/createSession"}}UserService.createSession{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new User. See
     * {{#crossLink "UserService/createUser"}}UserService.createUser{{/crossLink}}
     *
     * @class UserCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param login {String} login for a new user
     * @param email {String} email for a new user
     * @param password {String} password for a new user
     * @param fields {Array} fields array (see example in
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
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
    "use strict";

    /**
     * Returns a structure used to update a User. See
     * {{#crossLink "UserService/updateUser"}}UserService.updateUser{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create a new User group. See
     * {{#crossLink "UserService/createUserGroup"}}UserService.createUserGroup{{/crossLink}}
     *
     * @class UserGroupCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
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
    "use strict";

    /**
     * Returns a structure used to update a User group. See
     * {{#crossLink "UserService/updateUserGroup"}}UserService.updateUserGroup{{/crossLink}}
     *
     * @class UserGroupUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
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
    "use strict";

    /**
     * Returns a structure used to create a new Policy. See
     * {{#crossLink "UserService/addPolicy"}}UserService.addPolicy{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to update a Policy. See
     * {{#crossLink "UserService/updatePolicy"}}UserService.updatePolicy{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create and update a Role. See
     * {{#crossLink "UserService/createRole"}}UserService.createRole{{/crossLink}}
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
    "use strict";

    /**
     * Returns a structure used to create and update a Role Assign object. See for ex.
     * {{#crossLink "UserService/assignRoleToUser"}}UserService.assignRoleToUser{{/crossLink}}
     *
     * @class RoleAssignInputStruct
     * @constructor
     * @param role {Object} object representing the target role
     * @param limitation {Object} object representing limitations for assignment (see example in
     * {{#crossLink "UserService/newRoleAssignInputStruct"}}UserService.newRoleAssignInputStruct{{/crossLink}})
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
        'structures/PolicyUpdateStruct', 'structures/RoleInputStruct', 'structures/RoleAssignInputStruct',
        "utils/uriparse"],
    function (SessionCreateStruct, UserCreateStruct, UserUpdateStruct,
              UserGroupCreateStruct, UserGroupUpdateStruct, PolicyCreateStruct,
              PolicyUpdateStruct, RoleInputStruct, RoleAssignInputStruct,
              parseUriTemplate) {
    "use strict";

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
    var UserService = function (connectionManager, discoveryService, rootPath) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
        this._rootPath = rootPath;
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
    UserService.prototype.newSessionCreateStruct = function (login, password) {
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
    UserService.prototype.newUserGroupCreateStruct = function (language, fields) {
        return new UserGroupCreateStruct(language, fields);
    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     * @return {UserGroupCreateStruct}
     */
    UserService.prototype.newUserGroupUpdateStruct = function () {
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
     * @param fields {Array} fields array (see example for
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
     * @return {UserCreateStruct}
     */
    UserService.prototype.newUserCreateStruct = function (languageCode, login, email, password, fields) {
        return new UserCreateStruct(languageCode, login, email, password, fields);
    };

    /**
     * Returns user update structure
     *
     * @method newUserUpdateStruct
     * @return {UserUpdateStruct}
     */
    UserService.prototype.newUserUpdateStruct = function () {
        return new UserUpdateStruct();
    };

    /**
     * Returns role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {String} unique identifier for the new role (e.g. "editor")
     * @return {RoleInputStruct}
     */
    UserService.prototype.newRoleInputStruct = function (identifier) {
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
    UserService.prototype.newRoleAssignInputStruct = function (role, limitation) {
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
    UserService.prototype.newPolicyCreateStruct = function (module, theFunction, limitations) {
        return new PolicyCreateStruct(module, theFunction, limitations);
    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object} object describing limitations change for the policy (see "newPolicyCreateStruct" example)
     * @return {PolicyUpdateStruct}
     */
    UserService.prototype.newPolicyUpdateStruct = function (limitations) {
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
    UserService.prototype.loadRootUserGroup = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "rootUserGroup",
            function (error, rootUserGroup) {
                if (error) {
                    callback(error, rootUserGroup);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    rootUserGroup._href,
                    "",
                    {"Accept": rootUserGroup["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUserGroup = function (userGroupId, callback) {
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
    UserService.prototype.loadUserGroupByRemoteId = function (userGroups, remoteId, callback) {
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
    UserService.prototype.deleteUserGroup = function (userGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            userGroupId,
            "",
            {},
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
    UserService.prototype.moveUserGroup = function (userGroupId, destination, callback) {
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
    UserService.prototype.createUserGroup = function (parentGroupId, userGroupCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                that._connectionManager.request(
                    "POST",
                    subGroups._href,
                    JSON.stringify(userGroupCreateStruct.body),
                    userGroupCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.updateUserGroup = function (userGroupId, userGroupUpdateStruct, callback) {
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
    UserService.prototype.loadSubUserGroups = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                that._connectionManager.request(
                    "GET",
                    subGroups._href,
                    "",
                    {"Accept": subGroups["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUsersOfUserGroup = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var users = userGroupResponse.document.UserGroup.Users;

                that._connectionManager.request(
                    "GET",
                    users._href,
                    "",
                    {"Accept": users["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUserGroupsOfUser = function (userId, callback) {
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
    UserService.prototype.createUser = function (userGroupId, userCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var users = userGroupResponse.document.UserGroup.Users;

                that._connectionManager.request(
                    "POST",
                    users._href,
                    JSON.stringify(userCreateStruct.body),
                    userCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Load users and usergroups for the target roleId
     *
     * @method getRoleAssignments
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignments = function (roleId, callback) {
        var that = this;
        this._discoveryService.getInfoObject(
            "users",
            function (error, users) {
                if (error) {
                    callback(error, users);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    users._href + '?roleId=' + roleId,
                    "",
                    {"Accept": "application/vnd.ez.api.UserList+json"},
                    callback
                );
            }
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
    UserService.prototype.loadUser = function (userId, callback) {
        this._connectionManager.request(
            "GET",
            userId,
            "",
            {"Accept": "application/vnd.ez.api.User+json"},
            callback
        );
    };

    /**
     * Checks if the given login is available.
     *
     * @method isLoginAvailable
     * @param {String} login
     * @param {Function} callback
     * @param {CAPIError|Boolean} callback.available
     */
    UserService.prototype.isLoginAvailable = function (login, callback) {
        var that = this;

        this._discoveryService.getInfoObject("usersByLogin", function (error, usersByLogin) {
            if ( error ) {
                callback(error, usersByLogin);
                return;
            }
            that._connectionManager.request(
                "HEAD", parseUriTemplate(usersByLogin._href, {login: login}),
                "", {}, function (error, response) {
                    var available = false;

                    if ( response.xhr.status === 404 ) {
                        available = true;
                    } else if ( error ) {
                        available = error;
                    }
                    callback(available, response);
                }
            );
        });
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
    UserService.prototype.updateUser = function (userId, userUpdateStruct, callback) {
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
    UserService.prototype.deleteUser = function (userId, callback) {
        this._connectionManager.request(
            "DELETE",
            userId,
            "",
            {},
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
    UserService.prototype.assignUserToUserGroup = function (userId, userGroupId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userGroups = userResponse.document.User.UserGroups;

                that._connectionManager.request(
                    "POST",
                    userGroups._href + "?group=" + userGroupId,
                    "",
                    {"Accept": userGroups["_media-type"]},
                    callback
                );
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
    UserService.prototype.unassignUserFromUserGroup = function (userAssignedGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            userAssignedGroupId,
            "",
            {},
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
    UserService.prototype.createRole = function (roleCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (error) {
                    callback(error, roles);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    roles._href,
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.loadRole = function (roleId, callback) {
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
     * @param [limit=-1] {Number} the limit of the result set
     * @param [offset=0] {Number} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     userService.loadRoles("admin", 5, 5, callback);
     */
    UserService.prototype.loadRoles = function (identifier, limit, offset, callback) {

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
                if (error) {
                    callback(error, roles);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    roles._href + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                    "",
                    {"Accept": roles["_media-type"]},
                    callback
                );
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
    UserService.prototype.updateRole = function (roleId, roleUpdateStruct, callback) {
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
    UserService.prototype.deleteRole = function (roleId, callback) {
        this._connectionManager.request(
            "DELETE",
            roleId,
            "",
            {},
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
    UserService.prototype.getRoleAssignmentsForUser = function (userId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userRoles = userResponse.document.User.Roles;

                that._connectionManager.request(
                    "GET",
                    userRoles._href,
                    "",
                    {"Accept": userRoles["_media-type"]},
                    callback
                );
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
    UserService.prototype.getRoleAssignmentsForUserGroup = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                that._connectionManager.request(
                    "GET",
                    userGroupRoles._href,
                    "",
                    {"Accept": userGroupRoles["_media-type"]},
                    callback
                );
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
    UserService.prototype.getUserAssignmentObject = function (userAssignmentId, callback) {
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
    UserService.prototype.getUserGroupAssignmentObject = function (userGroupAssignmentId, callback) {
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
    UserService.prototype.assignRoleToUser = function (userId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userRoles = userResponse.document.User.Roles;

                that._connectionManager.request(
                    "POST",
                    userRoles._href,
                    JSON.stringify(roleAssignInputStruct.body),
                    roleAssignInputStruct.headers,
                    callback
                );
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
    UserService.prototype.assignRoleToUserGroup = function (userGroupId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                that._connectionManager.request(
                    "POST",
                    userGroupRoles._href,
                    JSON.stringify(roleAssignInputStruct.body),
                    roleAssignInputStruct.headers,
                    callback
                );
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
    UserService.prototype.unassignRoleFromUser = function (userRoleId, callback) {
        this._connectionManager.request(
            "DELETE",
            userRoleId,
            "",
            {},
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
    UserService.prototype.unassignRoleFromUserGroup = function (userGroupRoleId, callback) {
        this._connectionManager.request(
            "DELETE",
            userGroupRoleId,
            "",
            {},
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
    UserService.prototype.addPolicy = function (roleId, policyCreateStruct, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (error) {
                    callback(error, roleResponse);
                    return;
                }

                var rolePolicies = roleResponse.document.Role.Policies;

                that._connectionManager.request(
                    "POST",
                    rolePolicies._href,
                    JSON.stringify(policyCreateStruct.body),
                    policyCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.loadPolicies = function (roleId, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (error) {
                    callback(error, roleResponse);
                    return;
                }

                var rolePolicies = roleResponse.document.Role.Policies;

                that._connectionManager.request(
                    "GET",
                    rolePolicies._href,
                    "",
                    {"Accept": rolePolicies["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadPolicy = function (policyId, callback) {
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
    UserService.prototype.updatePolicy = function (policyId, policyUpdateStruct, callback) {
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
    UserService.prototype.deletePolicy = function (policyId, callback) {
        this._connectionManager.request(
            "DELETE",
            policyId,
            "",
            {},
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
    UserService.prototype.loadPoliciesByUserId = function (userPolicies, userId, callback) {
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
     * Creates a session. This method **only** creates a session, for a complete
     * and correct authentication from CAPI point of view, you need to use
     * {{#crossLink "CAPI/logIn:method"}}the `logIn` method of the CAPI
     * object{{/crossLink}}
     *
     * @method createSession
     * @param sessionCreateStruct {SessionCreateStruct} object describing new session to be created (see "newSessionCreateStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createSession = function (sessionCreateStruct, callback) {
        var that = this;

        this._connectionManager.notAuthorizedRequest(
            "GET",
            this._rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            function (error, rootResource) {
                if (error) {
                    callback(error, rootResource);
                    return;
                }
                that._connectionManager.notAuthorizedRequest(
                    "POST",
                    rootResource.document.Root.createSession._href,
                    JSON.stringify(sessionCreateStruct.body),
                    sessionCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Calls the refresh session resource to check whether the current session
     * is valid. For a complete and correct *is logged in* check, you need to
     * use {{#crossLink "CAPI/isLoggedIn:method"}}CAPI.isLoggedIn{{/crossLink}}
     *
     * @method refreshSession
     * @param {String} sessionId the session identifier (e.g. "o7i8r1sapfc9r84ae53bgq8gp4")
     * @param {Function} callback
     */
    UserService.prototype.refreshSession = function (sessionId, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "refreshSession",
            function (error, refreshSession) {
                if (error) {
                    callback(error, refreshSession);
                    return;
                }
                that._connectionManager.request(
                    "POST",
                    parseUriTemplate(refreshSession._href, {sessionId: sessionId}),
                    "",
                    {"Accept": refreshSession["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Delete the target session. For a complete and correct de-authentifcation,
     * you need to use {{#crossLink "CAPI/logOut:method"}}the `logOut` method of
     * the CAPI object{{/crossLink}}
     *
     * @method deleteSession
     * @param sessionId {String} target session identifier (e.g. "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteSession = function (sessionId, callback) {
        this._connectionManager.request(
            "DELETE",
            sessionId,
            "",
            {},
            callback
        );
    };

    return UserService;
});

/* globals define */
define('utils/extend',[], function () {
    "use strict";
    /**
     * Provides only the `extend` function.
     *
     * @class extend
     * @static
     */

    /**
     * Extend the given object with properties of an arbitrary amount of other objects
     *
     * Override priority is determined using the order the objects are given in
     * Each further object has a higher priority then the one before it.
     *
     * Only actual properties of the given objects will be used not the ones bubbling up
     * through the prototype chain.
     *
     * @method extend
     * @static
     * @param target
     * @param [obj]* Arbitrary amount of objects which will extend the first one
     * @return {Object} the extended object
     */
    var extend = function (target /*, obj, ... */) {
        var extensions = Array.prototype.slice.call(arguments, 1);
        extensions.forEach(function (extension) {
            var key;

            if (typeof extension !== "object") {
                // Skip everything that is not an object
                return;
            }

            for (key in extension) {
                if (extension.hasOwnProperty(key) && extension[key] !== undefined) {
                    target[key] = extension[key];
                }
            }
        });

        return target;
    };

    return extend;
});

/* global define */
define('CAPI',['authAgents/SessionAuthAgent', 'authAgents/HttpBasicAuthAgent', 'ConnectionManager',
        'ConnectionFeatureFactory', 'connections/XmlHttpRequestConnection', 'connections/MicrosoftXmlHttpRequestConnection',
        'services/DiscoveryService', 'services/ContentService', 'services/ContentTypeService',
        'services/UserService', "utils/extend"],
    function (SessionAuthAgent, HttpBasicAuthAgent, ConnectionManager,
              ConnectionFeatureFactory, XmlHttpRequestConnection, MicrosoftXmlHttpRequestConnection,
              DiscoveryService, ContentService, ContentTypeService,
              UserService, extend) {
    "use strict";

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
        var defaultOptions,
            mergedOptions,
            connectionFactory,
            connectionManager,
            discoveryService,
            contentService,
            contentTypeService,
            userService;

        // Options used if not overwritten from the outside
        defaultOptions =  {
            logRequests: false, // Whether we should log each request to the js console or not
            rootPath: '/api/ezp/v2/', // Path to the REST root
            connectionStack: [ // Array of connections, should be filled-in in preferred order
                {connection: XmlHttpRequestConnection},
                {connection: MicrosoftXmlHttpRequestConnection}
            ]
        };

        authenticationAgent.setCAPI(this);

        // Merging provided options (if any) with defaults
        mergedOptions = extend({}, defaultOptions, options);

        connectionFactory = new ConnectionFeatureFactory(mergedOptions.connectionStack);
        connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory);
        connectionManager.logRequests = mergedOptions.logRequests;
        discoveryService = new DiscoveryService(mergedOptions.rootPath, connectionManager);

        /**
         * Checks that the CAPI instance is logged in
         *
         * @method isLoggedIn
         * @param {Function} callback
         */
        this.isLoggedIn = function (callback) {
            authenticationAgent.isLoggedIn(callback);
        };

        /**
         * Logs in the user
         *
         * @method logIn
         * @param {Object} [credentials]
         * @param {String} credentials.login
         * @param {String} credentials.password
         * @param {Function} callback
         */
        this.logIn = function (credentials, callback) {
            if ( callback ) {
                authenticationAgent.setCredentials(credentials);
            } else {
                callback = credentials;
            }
            authenticationAgent.logIn(callback);
        };

        /**
         * Logs out the current user.
         *
         * @method logOut
         * @param {Function} callback
         */
        this.logOut = function (callback) {
            authenticationAgent.logOut(callback);
        };

        /**
         * Get instance of Content Service. Use ContentService to retrieve information and execute operations related to Content.
         *
         * @method getContentService
         * @return {ContentService}
         * @example
         *      var contentService = jsCAPI.getContentService();
         *      contentService.loadRoot(
         *          callback
         *      );
         */
        this.getContentService = function () {
            if (!contentService)  {
                contentService = new ContentService(
                    connectionManager,
                    discoveryService,
                    mergedOptions.rootPath
                );
            }
            return contentService;
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
        this.getContentTypeService = function () {
            if (!contentTypeService) {
                contentTypeService = new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return contentTypeService;
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
        this.getUserService = function () {
            if (!userService)  {
                userService = new UserService(
                    connectionManager,
                    discoveryService,
                    mergedOptions.rootPath
                );
            }
            return userService;
        };

        /**
         * Get instance of Discovery Service. Use DiscoveryService to internally to discover
         * resources URI and media type provided in the root resource.
         *
         * @method getDiscoveryService
         * @return {DiscoveryService}
         * @example
         *      var discoveryService = jsCAPI.getDiscoveryService();
         *      discoveryService.getInfoObject(
         *          "Trash",
         *          callback
         *      );
         */
        this.getDiscoveryService = function () {
            return discoveryService;
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
        define('q',definition);

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
"use strict";

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
define('services/PromiseService',["q", "structures/CAPIError"], function (q, CAPIError) {
    "use strict";

    /**
     * Creates an instance of promise-based service object based on original service
     *
     * @class PromiseService
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version (e.g. ContentService)
     */
    var PromiseService = function (originalService) {
        var key,
            _generateMappedFunction,
            _generatePromiseFunction;

        /**
         * Generate a new function, that if called assured `this` is mapped to
         * the original service.
         *
         * @method _generateMappedFunction
         * @private
         *
         * @param {Function} originalFunction
         * @return {Function}
         */
        _generateMappedFunction = function (originalFunction) {
            return function () {
                return originalFunction.apply(originalService, Array.prototype.slice(arguments));
            };
        };

        /**
         * Generate a promise version of the given function
         *
         * The execution is mapped to the originalService in order to preserve all
         * internal state manipulations.
         *
         * @method _generatePromiseFunction
         * @private
         *
         * @param originalFunction
         * @return {Function}
         */
        _generatePromiseFunction = function (originalFunction) {
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
        /* Disabling hasOwnProperty wrapper check here, as we explicitly WANT to copy
         * over potentially inherited functions */
        /* jshint -W089 */
        for (key in originalService) {
            if (typeof originalService[key] !== "function") {
                continue;
            }

            switch(true) {
            case (/^_/).test(key):
                // Skip all private methods
                break;
            case (/^(new[^\s(]+Struct)/).test(key):
                // Simply cover over newXXXStruct functions, as they are synchronous.
                // Still make sure the method is called on the original service ;)
                this[key] = _generateMappedFunction(originalService[key]);
                break;
            default:
                // Map all other functions using the promise system, as they are supposed to be
                // asynchronous
                this[key] = _generatePromiseFunction(originalService[key]);
            }
        }
    };
    /* jshint +W089 */

    return PromiseService;
});


/* global define */
define('PromiseCAPI',["CAPI", "services/PromiseService"], function (CAPI, PromiseService) {
    "use strict";

    /**
     * Creates an instance of PromiseCAPI object based on existing CAPI object
     *
     * @class PromiseCAPI
     * @constructor
     * @param originalCapi {CAPI} main REST client object
     */
    var PromiseCAPI = function (originalCapi) {
        var key,
            _services,
            _generatePromiseServiceFactory,
            _generateMappedFunction;

        // Documentation for dynamically created methods

        /**
         * Dynamically generated method which returns promise-based version of the ContentService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "ContentService"}}ContentService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getContentService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseContentService = jsPromiseCAPI.getContentService(),
         *     promise = promiseContentService.loadSection("/api/ezp/v2/content/sections/1");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Dynamically generated method which returns promise-based version of the ContentTypeService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "ContentTypeService"}}ContentTypeService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getContentTypeService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseContentTypeService = jsPromiseCAPI.getContentTypeService(),
         *     promise = promiseContentTypeService.loadContentTypeGroup("/api/ezp/v2/content/typegroups/1");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Dynamically generated method which returns promise-based version of the UserService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "UserService"}}UserService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getUserService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseUserService = jsPromiseCAPI.getUserService(),
         *     promise = promiseUserService.loadUserGroup("/api/ezp/v2/user/groups/1/5");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Array of promise-based services instances (needed to implement singletons approach)
         *
         * @attribute _services
         * @type {Object}
         * @protected
         */
        _services = {};

        /**
         * Convert any CAPI service factory into Promise-based service factory.
         *
         * The factory will cache once created instances inside the _services object
         * to not create new service wrappers each time they are requested
         *
         * @method _createPromiseServiceFactory
         * @param serviceFactoryName {String} name of the function which returns one of the CAPI services
         * @return {Function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         * @private
         */
        _generatePromiseServiceFactory = function (serviceFactoryName) {
            return function () {
                if (!_services[serviceFactoryName]) {
                    _services[serviceFactoryName] = new PromiseService(
                        originalCapi[serviceFactoryName].call(originalCapi)
                    );
                }
                return _services[serviceFactoryName];
            };
        };

        _generateMappedFunction = function (originalMethodName) {
            return function () {
                return originalCapi[originalMethodName].apply(
                    originalCapi,
                    Array.prototype.slice.call(arguments)
                );
            };
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        /* Disabling hasOwnProperty wrapper check here, as we explicitly WANT to copy
         * over potentially inherited functions */
        /* jshint -W089 */
        for (key in originalCapi) {
            if (typeof originalCapi[key] !== "function") {
                continue;
            }

            switch(true) {
            case (/^_/).test(key):
                // Skip all private methods
                break;
            case (/^(get[^\s(]+Service)/).test(key):
                // Wrap all services to return a PromiseService Wrapper
                this[key] = _generatePromiseServiceFactory(key);
                break;
            default:
                // Map all other functions by simply copying them, while
                // retaining their calling context
                this[key] = _generateMappedFunction(key);
            }
        }
    };
    /* jshint +W089 */

    return PromiseCAPI;
});
    // Exporting needed parts of the CAPI to public

    window.eZ = window.eZ || {};

    window.eZ.HttpBasicAuthAgent = require('authAgents/HttpBasicAuthAgent');
    window.eZ.SessionAuthAgent = require('authAgents/SessionAuthAgent');
    window.eZ.CAPI = require('CAPI');
    window.eZ.PromiseCAPI = require('PromiseCAPI');

}));