var gh = require('../')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')

  , User = 'samsonjs'
  , Repo = 'gitter'
  , ForkedRepo = 'strftime'
  , CollaboratorsRepo = 'mojo.el'

vows.describe('Repo').addBatch({
  'after fetching a repo': {
    topic: function() { gh.repo(User, Repo, this.callback) },
    'attributes can be accessed': function(err, repo) {
      assert.ifError(err)
      assert.equal(repo.owner.login, User)
    },
    'expected fields are present': function(err, repo) {
      assert.ifError(err)
      assert.ok(h.looksLikeARepo(repo))
    },
  },
  'after fetching branches': {
    topic: function() { gh.branches(User, Repo, this.callback) },
    'list of branches is available': function(err, branches) {
      assert.ifError(err)
      assert.ok(branches)
      assert.instanceOf(branches, Array)
      assert.ok(branches.some(function(branch) { return branch.name === 'master' }))
    },
    'names and commit ids of branches are available': function(err, branches) {
      assert.ifError(err)
      assert.ok(h.looksLikeABranchList(branches))
    }
  },
  'after fetching collaborators': {
    topic: function() { gh.collaborators(User, CollaboratorsRepo, this.callback) },
    'list of collaborators is available': function(err, collaborators) {
      assert.ifError(err)
      assert.ok(collaborators && collaborators.length >= 1)
      assert.ok(collaborators.some(function(c) { return c.login === User }))
    },
    'names of collaborators are available': function(err, collaborators) {
      assert.ifError(err)
      assert.ok(collaborators.every(function(c) { return h.looksLikeACollaborator(c) }))
    }
  },
  'after fetching contributors': {
    topic: function() { gh.contributors(User, Repo, this.callback) },
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
    topic: function() { gh.languages(User, Repo, this.callback) },
    'map of languages is available': function(err, languages) {
      assert.ifError(err)
      assert.ok(languages)
      assert.instanceOf(languages, Object)
      assert.ok('JavaScript' in languages)
    }
  },
  'after fetching fork': {
    topic: function() { gh.forks(User, ForkedRepo, this.callback) },
    'list of forks is available': function(err, forks) {
      assert.ifError(err)
      assert.ok(forks && forks.length >= 1)
      assert.ok(forks.every(function(r) { return h.looksLikeARepo(r) }))
    }
  },
  'after fetching tags': {
    topic: function() { gh.tags(User, Repo, this.callback) },
    'map of tags is available': function(err, tags) {
      assert.ifError(err)
      assert.ok(tags)
      assert.instanceOf(tags, Object)
    }
  },
  'after fetching watchers': {
    topic: function() { gh.watchers(User, Repo, this.callback) },
    'list of watchers is available': function(err, watchers) {
      assert.ifError(err)
      assert.ok(watchers && watchers.length >= 1)
      assert.ok(watchers.some(function(w) { return w.login === User }))
    },
    'names of watchers are available': function(err, watchers) {
      assert.ifError(err)
      assert.ok(watchers.every(h.looksLikeAWatcher))
    }
  }
}).export(module)
