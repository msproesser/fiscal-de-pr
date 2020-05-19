const axios = require('axios').default
const {flatten} = require('./tools/polyfill')

const {
  BUG_ISSUE_TYPE_ID,
  JIRA_PROJECT_ID,
  JIRA_HOST,
  JIRA_TOKEN,
  AZURE_HOST,
  AZURE_PROJECT,
  AZURE_TOKEN

} = require('./cr-config')
const urlRegex = /.*_git\/(?<repo_name>[a-zA-Z\-]*)\/pullrequest\/(?<id>\d*).*/

function resolveUrl(prUrl) {
  return urlRegex.exec(prUrl).groups
}

//search for PR by id
function getPRDetails({id, repo_name}) {
  const prApiUrl = `${AZURE_HOST}/${AZURE_PROJECT}/_apis/git/repositories/${repo_name}/pullRequests/${id}/threads?api-version=5.1`
  return axios.get(prApiUrl, { headers: { authorization: AZURE_TOKEN} })
  .then(result => result.data.value)
}

function filterComments(commentList) {
  const criteriaL1 = thread => !thread.isDeleted
  const criteriaL2 = comment => comment.commentType == 'text' && comment.parentCommentId == 0
  
  return flatten(
    commentList.filter(criteriaL1).map(c => c.comments)
  ).filter(criteriaL2)
}

//convert a single comment into a payload to create a jira issue
function convertFactory(jiraParentId) {
  return function convertToJiraIssues(commentList) {
    return commentList.map(issuePayloadFactory(BUG_ISSUE_TYPE_ID, JIRA_PROJECT_ID, jiraParentId))
  }
}

//send the payload to jira using API targeting the parent jira issue id
function createIssues(issues) {
  const create = subbug => 
  axios.post(JIRA_HOST + "/rest/api/3/issue/", {fields:subbug}, {
    headers: {
      authorization: JIRA_TOKEN,
      "Content-Type": "application/json"
    }
  })
  .catch(err => console.log('got err', err))
  issues.forEach(create)
}

function executer(prUrl, jiraParentId) {
  Promise.resolve(prUrl)
  .then(resolveUrl)
  .then(getPRDetails)
  .then(filterComments)
  .then(convertFactory(jiraParentId))
  .then(createIssues)
  .then(console.log)
}

// module.exports = executer
executer("pr url", "jira-issue")



function issuePayloadFactory(issueTypeId, projectId, parentId) {
  return function issuePayload(comment) {
    return {
      summary: comment.content,
      issuetype: {id: issueTypeId},
      project: {id: projectId},
      parent: {key: parentId},
      customfield_10704: {
        id: "10327"
      },
      description: {
        type: "doc",
        version: 1,
        content: [
            {
            type: "paragraph",
            content: [
                {
                text: comment.content,
                type: "text"
                }
            ]
            }
        ]
        }
    }
  }
}