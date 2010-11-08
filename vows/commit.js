var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo
  , Sha = '3363be22e88e50d6dd15f9a4b904bfe41cdd22bc'

vows.describe('Commit').addBatch({
    'after fetching a commit': {
        topic: function() { gh.commit(Proj, Sha, this.callback) },
        'the data object can be accessed with the data() method': function(err, commit) {
            assert.ifError(err)
            assert.ok(commit)
            assert.instanceOf(commit.data(), Object)
        },
        'attributes can be accessed with the data() method': function(err, commit) {
            assert.ifError(err)
            assert.instanceOf(commit.data('author'), Object)
        },
        'expected fields are present': function(err, commit) {
            assert.ifError(err)
            assert.ok(h.looksLikeACommit(commit.data()))
        },
    }
}).export(module)
