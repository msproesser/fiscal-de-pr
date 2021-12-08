const axios = require('axios')
const {flatten} = require('./polyfill')
function bitbucketPrSource({host = 'https://bitbucket.org', authToken, members = []}) {
  const PR_LIST_API = `${host}/api/2.0/pullrequests`
  
  function queryPrs(member) {
    return axios.get(`${PR_LIST_API}/${member}?state=OPEN&pagelen=20`, {headers: {authorization: authToken}})
    .then(result => result.data.values)
  }

  function normalizeFields({links, title, source, author}) {
    return {
      title,
      url: links.html.href,
      repository: source.repository.name,
      displayName: author.display_name,
      reviews: []
    }
  }
  return function() {
    return Promise.all(unique(members).map(queryPrs))
    .then(flatten)
    .then(prs => prs.map(normalizeFields))
  }
}

module.exports = {
  bitbucketPrSource
}