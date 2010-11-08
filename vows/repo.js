var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , Proj = User + '/' + Repo

vows.describe('Repo').addBatch({
    'after fetching a repo': {
        topic: function() { gh.repo(Proj, this.callback) },
        'the data object can be accessed with the data() method': function(err, repo) {
            assert.ifError(err)
            assert.ok(repo)
            assert.instanceOf(repo.data(), Object)
        },
        'attributes can be accessed with the data() method': function(err, repo) {
            assert.ifError(err)
            assert.equal(repo.data('owner'), User)
        },
        'expected fields are present': function(err, repo) {
            assert.ifError(err)
            assert.ok(h.looksLikeARepo(repo.data()))
        },
    },
    'after fetching branches': {
        topic: function() { gh.branches(Proj, this.callback) },
        'map of branches is available': function(err, branches) {
            assert.ifError(err)
            assert.ok(branches)
            assert.instanceOf(branches, Object)
            assert.ok('master' in branches)
        },
        'names and commit ids of branches are available': function(err, branches) {
            assert.ifError(err)
            assert.ok(Object.keys(branches).every(function(b) { return h.looksLikeASha(branches[b]) }))
        }
    },
    'after fetching collaborators': {
        topic: function() { gh.collaborators(Proj, this.callback) },
        'list of collaborators is available': function(err, collaborators) {
            assert.ifError(err)
            assert.ok(collaborators && collaborators.length >= 1)
            assert.ok(collaborators.indexOf(User) !== -1)
        },
        'names of collaborators are available': function(err, collaborators) {
            assert.ifError(err)
            assert.ok(collaborators.every(function(c) { return c && c.length >= 1 }))
        }
    },
    'after fetching contributors': {
        topic: function() { gh.contributors(Proj, this.callback) },
        'list of contributors is available': function(err, contributors) {
            assert.ifError(err)
            assert.ok(contributors && contributors.length >= 1)
        },
        'names of contributors are available': function(err, contributors) {
            assert.ifError(err)
            assert.ok(contributors.every(function(c) { return h.looksLikeAContributor(c) }))
        }
    },
    'after fetching languages': {
        topic: function() { gh.languages(Proj, this.callback) },
        'map of languages is available': function(err, languages) {
            assert.ifError(err)
            assert.ok(languages)
            assert.instanceOf(languages, Object)
            assert.ok('JavaScript' in languages)
        }
    },
    'after fetching network': {
        topic: function() { gh.network(Proj, this.callback) },
        'map of network is available': function(err, network) {
            assert.ifError(err)
            assert.ok(network && network.length >= 1)
            assert.ok(network.every(function(r) { return h.looksLikeARepo(r) }))
        }
    },
    'after fetching tags': {
        topic: function() { gh.tags(Proj, this.callback) },
        'map of tags is available': function(err, tags) {
            assert.ifError(err)
            assert.ok(tags)
            assert.instanceOf(tags, Object)
        }
    },
    'after fetching watchers': {
        topic: function() { gh.watchers(Proj, this.callback) },
        'list of watchers is available': function(err, watchers) {
            assert.ifError(err)
            assert.ok(watchers && watchers.length >= 1)
            assert.ok(watchers.indexOf(User) !== -1)
        },
        'names of watchers are available': function(err, watchers) {
            assert.ifError(err)
            assert.ok(watchers.every(function(w) { return w && w.length >= 1 }))
        }
    }
}).export(module)
