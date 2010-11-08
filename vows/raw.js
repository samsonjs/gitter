var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo
  , Sha = 'a0a2d307cfe7810ccae0aec2ec6854d079de6511'

vows.describe('Raw').addBatch({
    'after fetching a raw blob': {
        topic: function() { gh.raw(Proj, Sha, this.callback) },
        'the data object can be accessed with the data() method': function(err, raw) {
            assert.ifError(err)
            assert.ok(raw)
            assert.equal(typeof raw.data(), 'string')
        }
    }
}).export(module)
