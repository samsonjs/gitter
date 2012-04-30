var gh = require('../')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Sha = '6c6cb9b3449c17e3ae4eee9061b4081ff33c8c64'

vows.describe('Blob').addBatch({
  'after fetching a blob': {
    topic: function() { gh.blob(User, Repo, Sha, this.callback) },
    'the data can be accessed via the content attribute': function(err, blob) {
      assert.ifError(err)
      assert.ok(blob)
      assert.ok(blob.content)
    }
  }
}).export(module)
