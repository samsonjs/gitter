/// gitter
/// http://github.com/samsonjs/gitter
/// @_sjs
///
/// Copyright 2010 Sami Samhuri <sami.samhuri@gmail.com>
/// MIT License

// TODO:
//  - authentication and write APIs

(function() {
    var global = this
      , isBrowser = 'document' in global
      // when running in the browser request is set later
      , request = isBrowser ? null : require('request')
      , Blob, Branch, Commit, Raw, Repo, Tree, User
      , api

    api = {
        blob: function(repo, sha, path, cb) {
            return new Blob(repo, sha, path, cb)
        },
        branch: function(repo, branch, cb) {
            return new Branch(repo, branch, cb) 
        },
        commits: function(repo, branch, cb) {
            return new Branch(repo, branch).getCommits(cb)
        },
        commit: function(repo, sha, cb) {
            return new Commit(repo, sha, cb) 
        },
        raw: function(repo, sha, cb) {
            return new Raw(repo, sha, cb)
        },
        repo: function(repo, cb) {
            return new Repo(repo, cb)
        },
        branches: function(repo, cb) {
            return new Repo(repo).getBranches(cb)
        },
        collaborators: function(repo, cb) {
            return new Repo(repo).getCollaborators(cb)
        },
        contributors: function(repo, cb) {
            return new Repo(repo).getContributors(cb)
        },
        languages: function(repo, cb) {
            return new Repo(repo).getLanguages(cb)
        },
        network: function(repo, cb) {
            return new Repo(repo).getNetwork(cb)
        },
        tags: function(repo, cb) {
            return new Repo(repo).getTags(cb)
        },
        watchers: function(repo, cb) {
            return new Repo(repo).getWatchers(cb)
        },
        tree: function(repo, sha, cb) {
            return new Tree(repo, sha, cb)
        },
        blobs: function(repo, sha, cb) {
            return new Tree(repo, sha).getBlobs(cb)
        },
        user: function(user, cb) {
            return new User(user, cb)
        },
        followers: function(user, cb) {
            return new User(user).getFollowers(cb)
        },
        following: function(user, cb) {
            return new User(user).getFollowing(cb)
        },
        repos: function(user, cb) {
            return new User(user).getRepos(cb)
        },
        watched: function(user, cb) {
            return new User(user).getWatched(cb)
        }
    }
    if (isBrowser) global.GITR = api
    else module.exports = api


    // Define resources //

    Blob = createResource('blob/show/:repo/:tree/:path', {
        has: [ ['commits', 'commits/list/:repo/:tree/:path'] ]
    })
    Branch = createResource('commits/show/:repo/:branch', {
        has: [ ['commits', 'commits/list/:repo/:branch'] ]
    })
    Commit = createResource('commits/show/:repo/:sha')
    Raw = createResource('blob/show/:repo/:sha')
    Repo = createResource('repos/show/:repo', {
        has: [ 'branches'
             , 'collaborators'
             , 'contributors'
             , 'languages'
             , 'network'
             , 'tags'
             , 'watchers'
             ]
    })
    Tree = createResource('tree/show/:repo/:sha', {
        has: [ ['blobs', 'blob/all/:repo/:sha']
             , ['fullBlobs', 'blob/full/:repo/:sha']
             , ['fullTree', 'tree/full/:repo/:sha']
             ]
    })
    Tree.prototype._processData = function(data) {
        Resource.prototype._processData.call(this, data)
        this.blobs = this.data()
    }

    User = createResource('user/show/:user', {
        has: [ 'followers'
             , 'following'
             , ['repos', 'repos/show/:user']
             , ['watched', 'repos/watched/:user']
             ]
    })

    // Construct a new github resource.
    //
    // options:
    //   - params: params for constructor (optional, inferred from route if missing)
    //   - has: list of related resources, accessors are created for each item
    //
    // The members of the `has` list are arrays of the form [name, route, unpack].
    // The first member, name, is used to create an accessor (e.g. getName), and
    // is required.
    //
    // Route and unpack are optional. Route specifies the endpoint for this
    // resource and defaults to the name appended to the main resource's endpoint.
    //
    // Unpack is a function that extracts the desired value from the object fetched
    // for this resource. It defaults to a function that picks out the only property
    // from an object, or returns the entire walue if not an object or it contains
    // more than one property.
    //
    // When passing only the name you may pass it directly without wrapping it in
    // an array.
    function createResource(route, options) {
        if (!route) throw new Error('route is required')
        options = options || {}
    
        var resource = function() { Resource.apply(this, [].slice.call(arguments)) }
        inherits(resource, Resource)

        resource.prototype._route = route
        resource.prototype._params = options.params || paramsFromRoute(route)

        resource.has = function(prop, route, unpack) {
            unpack = unpack || onlyProp
            var dataProp = '_' + prop
              , fn = 'get' + titleCaseFirst(prop)
              , processData = function(d) {
                    getter(this, dataProp, function() { return camelize(unpack(d))})
                }
              , result = function(resource) { return this[dataProp] }
            resource.prototype[fn] = function(cb, force) {
                return this._fetch({ prop: dataProp
                                   , route: route || this._route + '/' + prop
                                   , processData: processData.bind(this)
                                   , result: result.bind(this)
                                   }, cb.bind(this), force)
            }
            return resource
        }
        if (options.has) options.has.forEach(function(args) {
            resource.has.apply(resource, Array.isArray(args) ? args : [args])
        })
    
        return resource
    }

    // Assigns the given resource args to the new instance. Sets the path to the
    // endpoint for main resource data.
    //
    // If the optional last arg is a function main data is fetched immediately,
    // and that function is used as the callback.
    //
    // If the optional last arg is an object then it is set as the main resource
    // data.
    function Resource(/* ...args, opt: data or callback */) {
        var args = [].slice.call(arguments)
          , last = args[args.length - 1]

        // assign params from args
        this._params.forEach(function(param, i) {
            this[param] = args[i]
        }.bind(this))

        // set the resource path
        this.urlPath = this.resolve(this._route)

        if (typeof last === 'function') this.fetch(last)
        else if (typeof last === 'object') this.data(last)
    }

    // Set or get main data for this resource, or fetch
    // a specific property from the data.
    //
    // When the data param is empty cached data is returned.
    //
    // When the data param is a string the property by that name
    // is looked up in the cached data.
    //
    // Otherwise cached data is set to the data param.
    Resource.prototype.data = function(data) {
        if (!data) return this._data
        if (typeof data === 'string' && typeof this._data === 'object') return this._data[data]

        getter(this, '_data', function() { return data }, {configurable: true})
        return this
    }

    // Fetch the main data for this resource.
    //
    // cb: callback(err, data)
    // force: if true load data from github, bypassing the local cache
    Resource.prototype.fetch = function(cb, force) {
        return this._fetch({ prop: '_data'
                           , route: this.urlPath
                           , processData: this._processData.bind(this)
                           , result: function(resource) { return resource }
                           }, cb.bind(this), force)
    }

    // 'repos/show/:user/:repo/branches' -> 'repos/show/samsonjs/gitter
    Resource.prototype.resolve = function(route) { // based on crock's supplant
        if (route.indexOf(':') < 0) return route
        return route.replace(/:(\w+)\b/g, function (s, prop) {
            var val = this[prop]
            if (typeof val !== 'string' && typeof val !== 'number')
                throw new Error('no suitable property named "' + prop + '" (found ' + val + ')')
            return val
        }.bind(this))
    }

    // Fetch arbitrary data from github.
    //
    // options:
    //   - prop: name of data cache property
    //   - route: route to github endpoint (can contain resource params)
    //   - processData: function that processes fetched data
    //   - result: function to obtain the result passed to the callback
    // cb: callback(err, data)
    // force: if true load data from github, bypassing the local cache
    Resource.prototype._fetch = function(options, cb, force) {
        if (!force && this[options.prop]) {
            cb(null, options.result(this))
            return this
        }
    
        // Interpolate resource params
        var path = this.resolve(options.route)
    
        // Make the request
        return this._get(path, function(err, data) {
            if (err) {
                cb(err)
                return
            }
            options.processData(data)
            cb(null, options.result(this))
        }.bind(this))
    }

    // Fetch data from github. JSON responses are parsed.
    //
    // path: github endpoint
    // cb: callback(err, data)
    Resource.prototype._get = function(path, cb) {
        request({uri: 'http://github.com/api/v2/json/' + path}, function(err, response, body) {
            if (err)
                cb(err)
            else if (isBrowser)
                cb(null, body) // body is an object
            else if (response.statusCode !== 200)
                cb(new Error('failed to fetch ' + path + ': ' + response.statusCode))
            else if (response.headers['content-type'].match(/json/))
                cb(null, JSON.parse(body))
            else
                cb(null, body)
        })
        return this
    }

    // Descendents of Resource can overwrite _processData and _unpack to process
    // the main resource data differently.

    Resource.prototype._processData = function(data) {
        return this.data(camelize(this._unpack(data)))
    }
    Resource.prototype._unpack = onlyProp


    // Utilities //

    function camel(s) { // created_at => createdAt
        return s.replace(/_(.)/g, function(_, l) { return l.toUpperCase() })
    }
    function camelize(obj) { // camelize all keys of an object, or all objects in an array
        if (!obj || typeof obj === 'string') return obj
        if (Array.isArray(obj)) return obj.map(camelize)
        return Object.keys(obj).reduce(function(newObj, k) {
            newObj[camel(k)] = obj[k]
            return newObj
        }, {})
    }

    function getter(obj, prop, fn, opts) { // minor convenience
        opts = opts || {}
        opts.get = fn
        Object.defineProperty(obj, prop, opts)
    }

    // util.inherits from node
    function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false
            }
        })
    }
    // get an only property, if any
    function onlyProp(obj) {
        if (obj && typeof obj === 'object') {
            var keys = Object.keys(obj)
            if (keys.length === 1) return obj[keys[0]]
        }
        return obj
    }

    // 'repos/show/:user/:repo/branches' -> ['user', 'repo']
    function paramsFromRoute(route) {
        if (route.indexOf(':') === -1) return []
        return route.split('/')
                    .filter(function(s) { return s.charAt(0) === ':' })
                    .map(function(s) { return s.slice(1) })
    }

    function titleCaseFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

    
    // Browser Utilities //

    if (isBrowser) (function() {
        var update, merge, load, _jsonpCounter = 1
        request = function(options, cb) { // jsonp request
            var jsonpCallbackName = '_jsonpCallback' + _jsonpCounter++
              , url = options.uri + '?callback=GITR.' + jsonpCallbackName
            GITR[jsonpCallbackName] = function(obj) {
                cb(null, null, obj)
                setTimeout(function() { delete GITR[jsonpCallbackName] }, 0)
            }
            load(url)
        }

        // bind from Prototype (for Safari 5)
        if (!Function.prototype.bind) {
            update = function(array, args) {
                var arrayLength = array.length, length = args.length
                while (length--) array[arrayLength + length] = args[length]
                return array
            }
            merge = function(array, args) {
                array = [].slice.call(array, 0)
                return update(array, args)
            }
            Function.prototype.bind = function(context) {
                if (arguments.length < 2 && typeof arguments[0] === 'undefined') return this
                var __method = this, args = [].slice.call(arguments, 1)
                return function() {
                    var a = merge(args, arguments)
                    return __method.apply(context, a)
                }
            }
        }
        // bootstrap loader from LABjs
        load = function(url) {
            var oDOC = document
              , handler
              , head = oDOC.head || oDOC.getElementsByTagName("head")

            // loading code borrowed directly from LABjs itself
            setTimeout(function () {
                if ("item" in head) { // check if ref is still a live node list
                    if (!head[0]) { // append_to node not yet ready
                        setTimeout(arguments.callee, 25)
                        return
                    }
                    head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
                }
                var scriptElem = oDOC.createElement("script"),
                    scriptdone = false
                scriptElem.onload = scriptElem.onreadystatechange = function () {
                    if ((scriptElem.readyState && scriptElem.readyState !== "complete" && scriptElem.readyState !== "loaded") || scriptdone) {
                        return false
                    }
                    scriptElem.onload = scriptElem.onreadystatechange = null
                    scriptdone = true
                };
                scriptElem.src = url
                head.insertBefore(scriptElem, head.firstChild)
            }, 0)

            // required: shim for FF <= 3.5 not having document.readyState
            if (oDOC.readyState == null && oDOC.addEventListener) {
                oDOC.readyState = "loading"
                oDOC.addEventListener("DOMContentLoaded", handler = function () {
                    oDOC.removeEventListener("DOMContentLoaded", handler, false)
                    oDOC.readyState = "complete"
                }, false)
            }
        }
    }())
}())