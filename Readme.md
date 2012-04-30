gitter
======

A GitHub client inspired by [pengwynn/octokit](https://github.com/pengwynn/octokit).

v3 API

Works in Node.js and most web browsers.


Installation
============

npm install gitter


Usage
=====

    var gh = require('gitter')
    gh.user('samsonjs', function(err, user) {
      if (err) throw err
      console.log('---- user: samsonjs ----')
      console.dir(user)
    })

    gh.repo('samsonjs', 'gitter', function(err, repo) {
      if (err) throw err
      console.log('---- repo: ' + repo.owner + '/' + repo.name + ' ----')
      console.dir(repo)
    }).fetchWatchers(function(err, watchers) {
      if (err) throw err
      console.log('---- watchers ----')
      console.dir(watchers)
    }).fetchBranches(function(err, branches) {
      if (err) throw err
      console.log('---- branches: samsonjs/gitter ----')
      console.dir(branches)
      gh.commit(this.user, this.repo, branches['master'], function(err, commit) {
        if (err) throw err
        console.log('---- samsonjs/gitter/master commit: ' + commit.id + ' ----')
        console.dir(commit.data())
      })
    })

For the full API have a look at the top of [lib/index.js](https://github.com/samsonjs/gitter/blob/master/lib/index.js).


License
=======

Copyright 2010 - 2012 Sami Samhuri sami@samhuri.net

[MIT License](http://sjs.mit-license.org)
