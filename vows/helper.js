module.exports = { looksLikeABlob: looksLikeABlob
                 , looksLikeAFullBlob: looksLikeAFullBlob
                 , looksLikeABranch: looksLikeARef
                 , looksLikeABranchList: looksLikeABranchList
                 , looksLikeACommit: looksLikeACommit
                 , looksLikeACollaborator: looksLikeAShortUser
                 , looksLikeAContributor: looksLikeAContributor
                 , looksLikeAFollower: looksLikeAShortUser
                 , looksLikeARepo: looksLikeARepo
                 , looksLikeASha: looksLikeASha
                 , looksLikeATree: looksLikeATree
                 , looksLikeAUser: looksLikeAUser
                 , looksLikeAWatcher: looksLikeAShortUser
                 }

var BlobKeys = 'mode path sha type url'.split(' ')
var FullBlobKeys = 'content encoding sha size url'.split(' ')

var CommitKeys = 'author committer message parents sha tree url'.split(' ')

var ContributorKeys = 'avatarUrl contributions gravatarId id login url'.split(' ')

var RefKeys = 'object ref url'.split(' ')
var BranchListKeys = 'commit name'.split(' ')
var RefObjectKeys = 'sha type url'.split(' ')

var RepoKeys = ('createdAt fork forks hasDownloads hasIssues hasWiki ' + 
                'name openIssues owner private pushedAt url watchers').split(' ')

var ShortUserKeys = 'avatarUrl gravatarId id login url'.split(' ')

var TreeKeys = 'tree sha url'.split(' ')

var UserKeys = ('blog company createdAt email followers ' +
                'following id location login name ' + 
                'publicRepos publicGists type').split(' ')

function looksLikeABlob(obj) { return hasKeys(obj, BlobKeys) }
function looksLikeAFullBlob(obj) { return hasKeys(obj, FullBlobKeys) }
function looksLikeACommit(obj) { return hasKeys(obj, CommitKeys) }
function looksLikeAContributor(obj) { return hasKeys(obj, ContributorKeys) }
function looksLikeARef(obj) {
  return hasKeys(obj, RefKeys) && hasKeys(obj.object, RefObjectKeys)
}
function looksLikeABranchList(obj) {
  return obj.every(function(branch) { return hasKeys(branch, BranchListKeys) })
}
function looksLikeARepo(obj) { return hasKeys(obj, RepoKeys) }
function looksLikeASha(s) { return s && s.length === 40 }
function looksLikeAShortUser(obj) { return hasKeys(obj, ShortUserKeys) }
function looksLikeATree(obj) {
  return hasKeys(obj, TreeKeys) && obj.tree.every(looksLikeABlob)
}
function looksLikeAUser(obj) { return hasKeys(obj, UserKeys) }

function hasKeys(obj, keys) {
    return (obj && typeof obj === 'object' && keys.every(function(k) {
        if (!(k in obj))
            console.error( k + ' is not in ' + JSON.stringify(obj, null, 2))
        return k in obj
    }))
}
