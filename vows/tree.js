var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo
  , TreeSha = '3363be22e88e50d6dd15f9a4b904bfe41cdd22bc'

vows.describe('Tree').addBatch({
    'after fetching a tree': {
        topic: function() { gh.tree(Proj, TreeSha, this.callback) },
        'the data object can be accessed with the data() method': function(err, tree) {
            assert.ifError(err)
            assert.ok(tree)
            assert.instanceOf(tree.data(), Array)
        },
        'data is a git tree': function(err, tree) {
            assert.ifError(err)
            assert.ok(h.looksLikeATree(tree.blobs))
        },
    },
    'after fetching blobs': {
        topic: function() { gh.blobs(Proj, TreeSha, this.callback) },
        'list of blobs is available': function(err, blobs) {
            assert.ifError(err)
            assert.ok(blobs)
            assert.instanceOf(blobs, Object)
            assert.ok(Object.keys(blobs).length > 1)
            assert.ok('package.json' in blobs)
            assert.ok(Object.keys(blobs).every(function(k) { return h.looksLikeASha(blobs[k]) }))
        }
    },
    'after fetching full blobs': {
        topic: function() { gh.tree(Proj, TreeSha).getFullBlobs(this.callback) },
        'full blobs are available': function(err, blobs) {
            assert.ifError(err)
            assert.ok(blobs)
            assert.instanceOf(blobs, Array)
            assert.ok(blobs.every(function(b) { return h.looksLikeABlob(b) }))
        }
    },
    'after fetching the full tree': {
        topic: function() { gh.tree(Proj, TreeSha).getFullTree(this.callback) },
        'full contents of tree are available': function(err, tree) {
            assert.ifError(err)
            assert.ok(tree)
            assert.instanceOf(tree, Array)
            assert.ok(tree.every(function(b) { return h.looksLikeABlob(b) }))
        }
    }    
}).export(module)
