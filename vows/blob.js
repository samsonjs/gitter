var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo
  , TreeSha = '3363be22e88e50d6dd15f9a4b904bfe41cdd22bc'
  , Path = 'lib/index.js'

vows.describe('Blob').addBatch({
    'after fetching a blob': {
        topic: function() { gh.blob(Proj, TreeSha, Path, this.callback) },
        'the data object can be accessed with the data() method': function(err, blob) {
            assert.ifError(err)
            assert.ok(blob)
            assert.instanceOf(blob.data(), Object)
        },
        'data is a blob': function(err, blob) {
            assert.ifError(err)
            assert.ok(h.looksLikeABlob(blob.data()))
        },
    },
    'after fetching commits for a blob': {
        topic: function() { gh.blob(Proj, TreeSha, Path).getCommits(this.callback) },
        'list of commits is available': function(err, commits) {
            assert.ifError(err)
            assert.ok(commits)
            assert.instanceOf(commits, Array)
            assert.equal(commits.length, 1)
            assert.ok(commits.every(function(c) { return h.looksLikeACommit(c) }))
        }
    },
}).export(module)