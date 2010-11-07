gitter
======

A GitHub client inspired by pengwynn/octopussy.

v2 API


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

    gh.repo('samsonjs/gitter', function(err, repo) {
      if (err) throw err
      console.log('---- repo: ' + repo.owner + '/' + repo.name + ' ----')
      console.dir(repo)
    }).getWatchers(function(err, repos) {
      if (err) throw err
      console.log('---- watchers ----')
      console.dir(repos)
    }).getBranches(function(err, branches) {
      if (err) throw err
      console.log('---- branches: samsonjs/gitter ----')
      console.dir(branches)
      gh.commit(this.repo, branches['master'], function(err, commit) {
        if (err) throw err
        console.log('---- samsonjs/gitter/master commit: ' + commit.id + ' ----')
        console.dir(commit.data())
      })
    })

For the full API have a look at the top of [lib/index.js](/samsonjs/gitter/blob/master/lib/index.js).


License
=======

Copyright 2010 Sami Samhuri sami.samhuri@gmail.com

MIT (see included [LICENSE](/samsonjs/gitter/blob/master/LICENSE))
