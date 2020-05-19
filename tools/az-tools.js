const { exec } = require('child_process');
const {joinLists} = require('./polyfill')

function queryPrFactory(azHost, azProject) {
  const command = "az repos pr list " +
  `--org ${azHost} -p ${azProject} --status active --creator`
  return (member) => new Promise((resolve, reject) => {
    exec(`${command} "${member}"` ,
    (error, stdout, stderr) => {
        if (error !== null) {
            console.log(`exec error: ${error} + ${stderr}`);
            reject(error)
        } else {
            resolve(JSON.parse(stdout))
        }
    });
  }) 
}

function vstsPrSource({azHost, azProject, listDraft, members}) {
  const queryPRs = queryPrFactory(azHost, azProject)
  
  function vstsNormalizeFields({
    codeReviewId, 
    createdBy: {displayName}, 
    repository: {name: repository},
    reviewers, title
  }) {
    const reviews = reviewers.map(r => r.vote)
    return {codeReviewId, displayName, repository, reviews, title}
  }
  function filterResults(listDraft) {
    return prLinks => prLinks.reduce(joinLists, []).filter(pr => !pr.isDraft || listDraft)
  }
  const BASE_URL = `${azHost}${azProject}/_git`
  function normalize(prs) {
    return prs.map(vstsNormalizeFields)
    .map(pr => {
      pr.url = `${BASE_URL}/${pr.repository}/pullrequest/${pr.codeReviewId}`
      return pr
    })
  }

  return function() {
    return Promise.all(members.map(queryPRs))
    .then(filterResults(listDraft))
    .then(normalize)
  }
}

module.exports = {
  vstsPrSource
}