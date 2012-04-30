var gh = require('../')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Branch = 'master'

vows.describe('Branch').addBatch({
  'after fetching a branch': {
    topic: function() { gh.branch(User, Repo, Branch, this.callback) },
    'attributes can be accessed': function(err, branch) {
      assert.ifError(err)
      assert.typeOf(branch.ref, 'string')
      assert.instanceOf(branch.object, Object)
    },
    'expected fields are present': function(err, branch) {
      assert.ifError(err)
      assert.ok(h.looksLikeABranch(branch))
    },
  }
}).export(module)
