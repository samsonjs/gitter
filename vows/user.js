var gh = require('../lib')
  , vows = require('vows')
  , assert = require('assert')
  , h = require('./helper')
  
  , User = 'samsonjs'

vows.describe('User').addBatch({
    'after fetching a user': {
        topic: function() { gh.user(User, this.callback) },
        'the data object can be accessed with the data() method': function(err, user) {
            assert.ifError(err)
            assert.ok(user)
            assert.instanceOf(user.data(), Object)
        },
        'attributes can be accessed with the data() method': function(err, user) {
            assert.ifError(err)
            assert.equal(user.data('login'), User)
        },
        'expected fields are present': function(err, user) {
            assert.ifError(err)
            assert.ok(h.looksLikeAUser(user.data()))
        },
    },
    'after fetching their followers': {
        topic: function() { gh.followers(User, this.callback) },
        'list of followers is available': function(err, followers) {
            assert.ifError(err)
            assert.ok(followers && followers.length > 1)
        },
        'usernames of followers are available': function(err, followers) {
            assert.ifError(err)
            assert.ok(followers.every(function(f) { return f && f.length > 1 }))
        }
    },
    'after fetching users they follow': {
        topic: function() { gh.following(User, this.callback) },
        'list of following users is available': function(err, following) {
            assert.ifError(err)
            assert.ok(following && following.length > 1)
        },
        'names of following users are available': function(err, following) {
            assert.ifError(err)
            assert.ok(following.every(function(f) { return f && f.length > 1 }))
        }
    },
    'after fetching their public repos': {
        topic: function() { gh.repos(User, this.callback) },
        'list of public repos is available': function(err, repos) {
            assert.ifError(err)
            assert.ok(repos.length > 1)
            assert.ok(repos.every(function(r) { return h.looksLikeARepo(r) }))
        }
    },
    'after fetching their watched repos': {
        topic: function() { gh.watched(User, this.callback) },
        'list of watched repos is available': function(err, repos) {
            assert.ifError(err)
            assert.ok(repos.length > 1)
            assert.ok(repos.every(function(r) { return h.looksLikeARepo(r) }))
        }
    }
}).export(module)
