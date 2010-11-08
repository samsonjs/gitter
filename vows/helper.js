module.exports = { looksLikeABlob: looksLikeABlob
                 , looksLikeABranch: looksLikeACommit
                 , looksLikeACommit: looksLikeACommit
                 , looksLikeAContributor: looksLikeAContributor
                 , looksLikeARepo: looksLikeARepo
                 , looksLikeASha: looksLikeASha
                 , looksLikeATree: looksLikeATree
                 , looksLikeAUser: looksLikeAUser
                 }

var BlobKeys = ('mimeType mode name sha size').split(' ')

var CommitKeys = ('author authoredDate committedDate committer id ' + 
                  'message parents tree url').split(' ')

var ContributorKeys = ('blog contributions email location login name type').split(' ')

var RepoKeys = ('createdAt fork forks hasDownloads hasIssues hasWiki ' + 
                'name openIssues owner private pushedAt url watchers').split(' ')

var UserKeys = ('blog company createdAt email followersCount ' +
                'followingCount id location login name ' + 
                'publicRepoCount publicGistCount type').split(' ')

function looksLikeABlob(obj) { return hasKeys(obj, BlobKeys) }
function looksLikeACommit(obj) { return hasKeys(obj, CommitKeys) }
function looksLikeAContributor(obj) { return hasKeys(obj, ContributorKeys) }
function looksLikeARepo(obj) { return hasKeys(obj, RepoKeys) }
function looksLikeASha(s) { return s && s.length === 40 }
function looksLikeATree(obj) { return obj && obj.every(function(b) { return looksLikeABlob(b) }) }
function looksLikeAUser(obj) { return hasKeys(obj, UserKeys) }

function hasKeys(obj, keys) {
    return (obj && typeof obj === 'object' && keys.every(function(k) {
        if (!(k in obj))
            console.error( k + ' is not in ' + JSON.stringify(obj, null, 2))
        return k in obj
    }))
}
