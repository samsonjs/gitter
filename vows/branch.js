var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo
  , Branch = 'master'

vows.describe('Branch').addBatch({
    'after fetching a branch': {
        topic: function() { gh.branch(Proj, Branch, this.callback) },
        'the data object can be accessed with the data() method': function(err, branch) {
            assert.ifError(err)
            assert.ok(branch)
            assert.instanceOf(branch.data(), Object)
        },
        'attributes can be accessed with the data() method': function(err, branch) {
            assert.ifError(err)
            assert.instanceOf(branch.data('author'), Object)
        },
        'expected fields are present': function(err, branch) {
            assert.ifError(err)
            assert.ok(h.looksLikeABranch(branch.data()))
        },
    },
    'after fetching commits': {
        topic: function() { gh.commits(Proj, Branch, this.callback) },
        'list of commits is available': function(err, commits) {
            assert.ifError(err)
            assert.ok(commits)
            assert.instanceOf(commits, Array)
            assert.ok(commits.every(function(c) { return h.looksLikeACommit(c) }))
        }
    }
}).export(module)
