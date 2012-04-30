/// gitter
/// http://github.com/samsonjs/gitter
/// @_sjs
///
/// Copyright 2010 - 2012 Sami Samhuri <sami@samhuri.net>
/// MIT License

(function() {
  "use strict"

  var global = (function() { return this || (1, eval)('this') }())
    , isBrowser = 'document' in global
    , ie

  if (isBrowser) {
    ie = (function() {
      var undef
        , v = 3
        , div = document.createElement('div')
        , all = div.getElementsByTagName('i')

      while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
      );

      return v > 4 ? v : undef
    }())
  }

  var inherits
  if ('create' in Object) {
    // util.inherits from node
    inherits = function(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false
        }
      })
    }
  }
  else if ([].__proto__) {
    inherits = function(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype.__proto__ = superCtor.prototype
      ctor.prototype.constructor = ctor
    }
  }
  else { // ie8
    var __hasProp = Object.prototype.hasOwnProperty
    inherits = function(child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key]
      }
      function ctor() { this.constructor = child }
      ctor.prototype = parent.prototype
      child.prototype = new ctor
      child.__super__ = parent.prototype
      return child
    }
  }

  var api = {
    // Blob
    blob: function(user, repo, sha, cb) {
      return new Blob(user, repo, sha, cb)
    }

    // Branch
  , branch: function(user, repo, name, cb) {
      return new Branch(user, repo, name, cb)
    }

    // Commit
  , commit: function(user, repo, sha, cb) {
      return new Commit(user, repo, sha, cb)
    }

    // Download
  , download: function(user, repo, id, cb) {
      return new Download(user, repo, id, cb)
    }

    // Issue
  , issue: function(user, repo, id, cb) {
      return new Issue(user, repo, id, cb)
    }

    // Organization
  , org: function(name, cb) {
      return new Org(name, cb)
    }
  , members: function(name, cb) {
      return new Org(name).fetchMembers(cb)
    }

    // Repo
  , repo: function(user, repo, cb) {
      return new Repo(user, repo, cb)
    }
  , branches: function(user, repo, cb) {
      return new Repo(user, repo).fetchBranches(cb)
    }
  , collaborators: function(user, repo, cb) {
      return new Repo(user, repo).fetchCollaborators(cb)
    }
  , contributors: function(user, repo, cb) {
      return new Repo(user, repo).fetchContributors(cb)
    }
  , downloads: function(user, repo, cb) {
      return new Repo(user, repo).fetchDownloads(cb)
    }
  , forks: function(user, repo, cb) {
      return new Repo(user, repo).fetchForks(cb)
    }
  , issues: function(user, repo, cb) {
      return new Repo(user, repo).fetchIssues(cb)
    }
  , languages: function(user, repo, cb) {
      return new Repo(user, repo).fetchLanguages(cb)
    }
  , tags: function(user, repo, cb) {
      return new Repo(user, repo).fetchTags(cb)
    }
  , watchers: function(user, repo, cb) {
      return new Repo(user, repo).fetchWatchers(cb)
    }

  , ref: function(user, repo, name, cb) {
      return new Ref(user, repo, name, cb)
    }

    // Tag
  , tag: function(user, repo, name, cb) {
      return new Tag(user, repo, name, cb)
    }

    // Tree
  , tree: function(user, repo, sha, cb) {
      return new Tree(user, repo, sha, cb)
    }

    // User
  , user: function(login, cb) {
      return new User(login, cb)
    }
  , followers: function(login, cb) {
      return new User(login).fetchFollowers(cb)
    }
  , following: function(login, cb) {
      return new User(login).fetchFollowing(cb)
    }
  , repos: function(login, cb) {
      return new User(login).fetchRepos(cb)
    }
  , watched: function(login, cb) {
      return new User(login).fetchWatched(cb)
    }

    // Why not, expose the resources directly as well.
  , Blob: Blob
  , Branch: Branch
  , Commit: Commit
  , Download: Download
  , Issue: Issue
  , Org: Org
  , Ref: Ref
  , Repo: Repo
  , Tree: Tree
  , User: User
  }

  // when running in the browser request is set later, in shim()
  var request

  if (isBrowser) {
    shim()
    global.GITR = api
  }
  else {
    var https = require('https')
    request = function(options, cb) {
      var req = https.request(options, function(response) {
        var bodyParts = []
        response.on('data', function(b) { bodyParts.push(b) })
        response.on('end', function() {
          var body = bodyParts.join('')
          if (response.statusCode === 200) {
            cb(null, body, response)
          }
          else {
            console.dir(options, response, body)
            var err = new Error('http error')
            err.statusCode = response.statusCode
            err.body = body
            cb(err)
          }
        })
      })
      req.end()
      req.on('error', function(err) { cb(err) })
    }
    module.exports = api
  }


  // Generic Resource //
  //
  // Used as the prototype by createResource. Provides
  // methods for fetching the resource and related
  // sub-resources.
  function Resource() {}

  // Fetch data for this resource and pass it to the
  // callback after mixing the data into the object.
  // Data is also available via the `data` property.
  Resource.prototype.fetch = function(cb) {
    if (this.data) {
      cb(null, this.data)
    }
    else {
      var self = this
      fetch(this.path, function(err, data) {
        // console.log('FETCH', self.path, err, data)
        if (err) {
          // console.log(err)
        }
        else {
          self.data = data
          mixin(self, data)
        }
        if (typeof cb === 'function') {
          cb.call(self, err, data)
        }
      })
    }
    return this
  }

  Resource.prototype.fetchSubResource = function(thing, cb) {
    if (this['_' + thing]) {
      cb(null, this['_' + thing])
    }
    else {
      var self = this
      fetch(this.path + '/' + thing, function(err, data) {
        // console.log('FETCH SUBRESOURCE', self.path, thing, err, data)
        if (err) {
          // console.log(self.path, err)
        }
        else {
          self['_' + thing] = data
        }
        if (typeof cb === 'function') {
          cb.call(self, err, data)
        }
      })
    }
    return this
  }

  var __slice = Array.prototype.slice

  // Create a resource w/ Resource as the prototype.
  //
  // spec: an object with the following properties:
  //
  //   - constructor: a constructor function
  //   - has: a list of resources belonging to this resource
  //
  // Typically the constructor accepts one or more arguments specifying
  // the name or pieces of info identifying the specific resource and
  // used to build the URL to fetch it. It also accepts an optional
  // callback as the last parameter.
  //
  // The constructor must set the `path` property which is used to
  // fetch the resource.
  //
  // If a callback is provided then the resource is immediately
  // fetched and the callback is threaded through to the `fetch`
  // method. The callback function has the signature
  // `function(err, data)`.
  //
  // The `has` list specifies sub-resources, e.g. a user has repos,
  // followers, etc. An organization has members.
  //
  // Each related sub-resource gets a method named appropriately,
  // e.g. the User resource has followers so User objects have a
  // `fetchFollowers` method.
  function createResource(spec) {
    var subResources = spec.has ? __slice.call(spec.has) : null
      , resource = function(/* ..., cb */) {
          var args = __slice.call(arguments)
            , lastArgIsCallback = typeof args[args.length - 1] === 'function'
            , cb = lastArgIsCallback ? args.pop() : null
            , result = spec.constructor.apply(this, args)

          if (typeof cb === 'function') {
            this.fetch(cb)
          }

          return result
        }

    inherits(resource, Resource)

    if (subResources) {
      subResources.forEach(function(thing) {
        var fnName = 'fetch' + toTitleCase(thing)
        resource.prototype[fnName] = function(cb) {
          return this.fetchSubResource(thing, cb)
        }
      })
    }

    return resource
  }


  // Define Resources //

  var Blob = createResource({
    constructor: function(user, repo, sha) {
      this.user = user
      this.repo = repo
      this.sha = sha
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/blobs/' + sha
    }
  })

  var Branch = createResource({
    constructor: function (user, repo, name) {
      this.user = user
      this.repo = repo
      this.name = name
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/refs/heads/' + name
    }
  })

  var Commit = createResource({
    constructor: function Commit(user, repo, sha) {
      this.user = user
      this.repo = repo
      this.sha = sha
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/commits/' + sha
    }
  })

  var Download = createResource({
    constructor: function(user, repo, id) {
      this.user = user
      this.repo = repo
      this.id = id
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/downloads/' + id
    }
  })

  var Issue = createResource({
    constructor: function(user, repo, id) {
      this.user = user
      this.repo = repo
      this.id = id
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/issues/' + id
    }
  })

  var Org = createResource({
    constructor: function(name) {
      this.name = name
      this.path = '/orgs/' + encodeURIComponent(nam)
    }

  , has: 'members repos'.split(' ')
  })

  var Ref = createResource({
    constructor: function (user, repo, name) {
      this.user = user
      this.repo = repo
      this.name = name
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/refs/' + name
    }
  })

  var Repo = createResource({
    constructor: function(user, repo) {
      this.user = user
      this.repo = repo
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/')
    }

  , has: ('branches collaborators contributors downloads' +
          ' forks languages tags teams watchers').split(' ')
  })

  var Tag = createResource({
    constructor: function (user, repo, name) {
      this.user = user
      this.repo = repo
      this.name = name
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/refs/tags/' + name
    }
  })

  var Tree = createResource({
    constructor: function(user, repo, sha) {
      this.user = user
      this.repo = repo
      this.sha = sha
      this.path = '/repos/' + [user, repo].map(encodeURIComponent).join('/') + '/git/trees/' + sha
    }
  })

  var User = createResource({
    constructor: function(login) {
      // Allow creating a user from an object returned by the API
      if (login.login) {
        login = login.login
      }
      this.login = login
      this.path = '/users/' + encodeURIComponent(login)
    }

  , has: 'followers following repos watched'.split(' ')
  })


  // Fetch data from github. JSON is parsed and keys are camelized.
  //
  // path: the path to the resource
  // cb: callback(err, data)
  function fetch(path, cb) {
    request({ host: 'api.github.com', path: path }, function(err, body, response) {
      // JSONP requests in the browser return the object directly
      var data = body

      // Requests in Node return json text, try to parse it
      if (response && /json/i.exec(response.headers['content-type'])) {
        try {
          data = JSON.parse(body)
        }
        catch (e) {
          err = e
          data = null
        }
      }

      cb(err, camelize(data))
    })
  }

  // created_at => createdAt
  function camel(s) {
    return s.replace(/_(.)/g, function(_, l) { return l.toUpperCase() })
  }

  // camelize all keys of an object, or all objects in an array
  function camelize(obj) {
    if (!obj || typeof obj === 'string') return obj
    if (Array.isArray(obj)) return obj.map(camelize)
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce(function(camelizedObj, k) {
        camelizedObj[camel(k)] = camelize(obj[k])
        return camelizedObj
      }, {})
    }
    return obj
  }

  function toTitleCase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  function mixin(a, b) {
    for (var k in b) {
      if (b.hasOwnProperty(k)) a[k] = b[k]
    }
  }


  // Browser Utilities //

  function shim() {
    shimBind()
    shimES5()
    shimRequest()
  }

  function shimBind() {
    // bind from Prototype
    if (!Function.prototype.bind) {
      (function(){
        function update(array, args) {
          var arrayLength = array.length, length = args.length
          while (length--) array[arrayLength + length] = args[length]
          return array
        }
        function merge(array, args) {
          array = __slice.call(array, 0)
          return update(array, args)
        }
        Function.prototype.bind = function(context) {
          if (arguments.length < 2 && typeof arguments[0] === 'undefined') return this
          var __method = this, args = __slice.call(arguments, 1)
          return function() {
            var a = merge(args, arguments)
            return __method.apply(context, a)
          }
        }
      }())
    }
  }

  // a few functions from Kris Kowal's es5-shim
  // https://github.com/kriskowal/es5-shim
  function shimES5() {
    var has = Object.prototype.hasOwnProperty

    // ES5 15.2.3.6
    if (!Object.defineProperty || ie === 8) { // ie8
      Object.defineProperty = function(object, property, descriptor) {
        if (typeof descriptor == "object" && object.__defineGetter__) {
          if (has.call(descriptor, "value")) {
            if (!object.__lookupGetter__(property) && !object.__lookupSetter__(property)) {
              // data property defined and no pre-existing accessors
              object[property] = descriptor.value
            }
            if (has.call(descriptor, "get") || has.call(descriptor, "set")) {
              // descriptor has a value property but accessor already exists
              throw new TypeError("Object doesn't support this action")
            }
          }
          // fail silently if "writable", "enumerable", or "configurable"
          // are requested but not supported
          else if (typeof descriptor.get == "function") {
            object.__defineGetter__(property, descriptor.get)
          }
          if (typeof descriptor.set == "function") {
            object.__defineSetter__(property, descriptor.set)
          }
        }
        return object
      }
    }

    // ES5 15.2.3.14
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    if (!Object.keys) { // ie8
      (function() {
        var hasDontEnumBug = true,
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length

        for (var key in {"toString": null}) {
          hasDontEnumBug = false
        }

        Object.keys = function (object) {

          if (
            typeof object !== "object" && typeof object !== "function"
            || object === null
          )
            throw new TypeError("Object.keys called on a non-object")

          var keys = []
          for (var name in object) {
            if (has.call(object, name)) {
              keys.push(name)
            }
          }

          if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
              var dontEnum = dontEnums[i]
              if (has.call(object, dontEnum)) {
                keys.push(dontEnum)
              }
            }
          }

          return keys
        }
      }())
    } // Object.keys

    //
    // Array
    // =====
    //

    // ES5 15.4.3.2
    if (!Array.isArray) {
      Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]"
      }
    }

    // ES5 15.4.4.18
    if (!Array.prototype.forEach) { // ie8
      Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0
        for (var i = 0; i < len; i++) {
          if (i in this) {
            block.call(thisObject, this[i], i, this)
          }
        }
      }
    }

    // ES5 15.4.4.19
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    if (!Array.prototype.map) { // ie8
      Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0
        if (typeof fun != "function") {
          throw new TypeError()
        }

        var res = new Array(len)
        var thisp = arguments[1]
        for (var i = 0; i < len; i++) {
          if (i in this) {
            res[i] = fun.call(thisp, this[i], i, this)
          }
        }

        return res
      }
    }

    // ES5 15.4.4.20
    if (!Array.prototype.filter) { // ie8
      Array.prototype.filter = function (block /*, thisp */) {
        var values = []
          , thisp = arguments[1]
        for (var i = 0; i < this.length; i++) {
          if (block.call(thisp, this[i])) {
            values.push(this[i])
          }
        }
        return values
      }
    }

    // ES5 15.4.4.21
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
    if (!Array.prototype.reduce) { // ie8
      Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0
        if (typeof fun != "function") {
          throw new TypeError()
        }

        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1) {
          throw new TypeError()
        }

        var i = 0
        if (arguments.length >= 2) {
          var rv = arguments[1]
        } else {
          do {
            if (i in this) {
              rv = this[i++]
              break
            }

            // if array contains no values, no initial value to return
            if (++i >= len) {
              throw new TypeError()
            }
          } while (true)
        }

        for (; i < len; i++) {
          if (i in this) {
            rv = fun.call(null, rv, this[i], i, this)
          }
        }

        return rv
      }
    } // Array.prototype.reduce
  } // function shimES5()

  // jsonp request, quacks like node's http.request
  function shimRequest() {
    var load, _jsonpCounter = 1

    // request is declared earlier
    request = function(options, cb) {
      var jsonpCallbackName = '_jsonpCallback' + _jsonpCounter++
        , url = 'https://' + options.host + options.path + '?callback=GITR.' + jsonpCallbackName
      GITR[jsonpCallbackName] = function(response) {
        if (response.meta.status >= 200 && response.meta.status < 300) {
          cb(null, response.data)
        }
        else {
          var err = new Error('http error')
          err.statusCode = response.meta.status
          err.response = response
          cb(err)
        }
        setTimeout(function() { delete GITR[jsonpCallbackName] }, 0)
      }
      load(url)
    }

    // bootstrap loader from LABjs (load is declared earlier)
    load = function(url) {
      var oDOC = document
      , handler
      , head = oDOC.head || oDOC.getElementsByTagName("head")

      // loading code borrowed directly from LABjs itself
      // (now removes script elem when done and nullifies its reference --sjs)
      setTimeout(function () {
        if ("item" in head) { // check if ref is still a live node list
          if (!head[0]) { // append_to node not yet ready
            setTimeout(arguments.callee, 25)
            return
          }
          head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        }
        var scriptElem = oDOC.createElement("script")
          , scriptdone = false

        scriptElem.onload = scriptElem.onreadystatechange = function () {
          if ((scriptElem.readyState && scriptElem.readyState !== "complete" && scriptElem.readyState !== "loaded") || scriptdone) {
            return false
          }
          scriptElem.onload = scriptElem.onreadystatechange = null
          scriptElem.parentNode.removeChild(scriptElem)
          scriptElem = null
          scriptdone = true
        }
        scriptElem.src = url
        head.insertBefore(scriptElem, head.firstChild)
      }, 0) // setTimeout

      // required: shim for FF <= 3.5 not having document.readyState
      if (oDOC.readyState == null && oDOC.addEventListener) {
        oDOC.readyState = "loading"
        oDOC.addEventListener("DOMContentLoaded", function handler() {
          oDOC.removeEventListener("DOMContentLoaded", handler, false)
          oDOC.readyState = "complete"
        }, false)
      }

    } // function load(url)

  } // function shimRequest()

}())
