var gh = require('../')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Sha = '3363be22e88e50d6dd15f9a4b904bfe41cdd22bc'

vows.describe('Commit').addBatch({
  'after fetching a commit': {
    topic: function() { gh.commit(User, Repo, Sha, this.callback) },
    'attributes can be accessed': function(err, commit) {
      assert.ifError(err)
      assert.instanceOf(commit.author, Object)
    },
    'expected fields are present': function(err, commit) {
      assert.ifError(err)
      assert.ok(h.looksLikeACommit(commit))
    },
  }
}).export(module)
