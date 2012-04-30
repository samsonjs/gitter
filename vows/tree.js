var gh = require('../')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , TreeSha = '3363be22e88e50d6dd15f9a4b904bfe41cdd22bc'

vows.describe('Tree').addBatch({
  'after fetching a tree': {
    topic: function() { gh.tree(User, Repo, TreeSha, this.callback) },
    'data is a git tree': function(err, tree) {
      assert.ifError(err)
      assert.ok(h.looksLikeATree(tree))
    }
  }
}).export(module)
