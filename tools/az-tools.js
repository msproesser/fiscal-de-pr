const { exec } = require('child_process');
const {joinLists, unique} = require('./polyfill')

function queryPrFactory(azHost, azProject) {
  const command = `az repos pr list --org ${azHost} -p ${azProject} --status active --creator`
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

function normalize(azHost, azProject) {
  const BASE_URL = `${azHost}${azProject}/_git`
  return prs => prs.map(vstsNormalizeFields)
  .map(pr => {
    pr.url = `${BASE_URL}/${pr.repository}/pullrequest/${pr.codeReviewId}`
    return pr
  })
}

function vstsPrSource({azHost, azProject, listDraft, members}) {
  const queryPRs = queryPrFactory(azHost, azProject)
  const BASE_URL = `${azHost}${azProject}/_git`

  return function() {
    return Promise.all(unique(members).map(queryPRs))
    .then(filterResults(listDraft))
    .then(normalize(azHost, azProject))
  }
}

function vstsPrByRepository({azHost, azProject, listDraft, repository}) {
  const command = `az repos pr list --org ${azHost} -p ${azProject} --status active --repository ${repository}`
  const queryRepo = () => new Promise((resolve, reject) => {
    exec(command ,
    (error, stdout, stderr) => {
        if (error !== null) {
            console.log(`exec error: ${error} + ${stderr}`);
            reject(error)
        } else {
            resolve(JSON.parse(stdout))
        }
    });
  })
  return function() {
    return Promise.all([queryRepo()])
    .then(filterResults(listDraft))
    .then(normalize(azHost, azProject))
  }

}

module.exports = {
  vstsPrSource,
  vstsPrByRepository
}