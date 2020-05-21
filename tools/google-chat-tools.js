const axios = require('axios')
const {flatten} = require('./polyfill')
const { groupByAuthor } = require('./message-helpers')

function googleChatMessage({botUrl, headerMessage = '<users/all>', notifyEmpty = true}) {

  function convertToSection({url, repository, reviews, title}) {
    const revCount = reviews.filter(r => r>1).length
    const revSession = reviews.length > 0 ? `- [ Approves: ${revCount} ]` : ''
    return `      <${url}| [*${repository}*] *${title.toUpperCase()}*> ${revSession}`
  }

  return function(prList) {
    const listOfAuthorPrs = Object.entries(groupByAuthor(prList))
    .map(([author, prs]) => flatten([`*Author:* ${author}`, prs.map(convertToSection)]));
    const finalMessage = flatten([headerMessage, listOfAuthorPrs]).join('\n')

    axios.post(botUrl, {text: finalMessage}, {headers: {'Content-type': 'application/json; charset=UTF-8'}})
    .catch(err => console.log('got error', err))
    .then(response => console.log('success', response))
  }
}

module.exports = {
  googleChatMessage
}