const axios = require('axios')
const {flatten} = require('./polyfill')
const { groupByAuthor } = require('./message-helpers')
const SLACK_BLOCKS_LIMIT = 50

function authorSection(displayName) {
  return {
      "type": "context",
      "elements": [
          {
              "type": "mrkdwn",
              "text": "*Author:* " + displayName
          }
      ]
  }
}

function textSection(text) {
  return {
      "type": "section",
    "text": {
      "text": text,
      "type": "mrkdwn"
    },
  }
}

function createBot(botUrl, botName, botIcon, channel) {
  return (block) => {
      const body = { "blocks" : block.slice(0, SLACK_BLOCKS_LIMIT) }
      botName && (body.username = botName)
      botIcon && (body.icon_emoji = botIcon)
      channel && (body.channel = channel)
      console.log(JSON.stringify(body, null, 2))
      return axios.post(botUrl, body)
             .then(res => console.log("channel message feedback:"+res.data))
  }
}

function errorNotify({botUrl, headerMessage}) {
  const bot = createBot(botUrl)
  return function(err) {
    bot([
      textSection(headerMessage + '\n' + "```" + err.stack + "```")
    ])
  }
}

function minimalSlackMessage({botUrl, botName, botIcon, channel, headerMessage = '@here', notifyEmpty = true}) {
  const bot = createBot(botUrl, botName, botIcon, channel)

  function convertToSection({url, repository, reviews, title}) {
    const revCount = reviews.filter(r => r>1).length
    const revSession = reviews.length > 0 ? `- [ Approves ${revCount} ]` : ''
    return `<${url}| [*${repository}*] *${title.toUpperCase()}*> ${revSession}`
  }

  function sendMessage(prMessageList) {
    console.log("PR list = "+prMessageList.length + " -notifyEmpty="+notifyEmpty);
    if (prMessageList.length || notifyEmpty) {
      const header = [textSection(prMessageList.length ? headerMessage :'Sem PRs Parabéns galera')]
      header.push(textSection(prMessageList))  
      return bot(header)
    }  
  }

  return function(prList) {
    const listOfAuthorPrs = Object.entries(groupByAuthor(prList))
    .map(([author, prs]) => flatten([`*Author*: ${author}`, prs.map(convertToSection)]));
    const finalMessage = flatten(listOfAuthorPrs).join('\n')
    return sendMessage(finalMessage)
  }
}

function singleSlackMessage({botUrl, botName, botIcon, channel, headerMessage = '@here', notifyEmpty = true}) {
  const bot = createBot(botUrl, botName, botIcon, channel)

  function convertToSection({url, repository, reviews, title}) {
    const reviewMarks = reviews.map(r => r>1 ? ':heavy_check_mark:' : ':x:').join('  ')
    const revSession = reviews.length > 0 ? `- [ ${reviewMarks} ]` : ''
    return textSection(`<${url}| [*${repository}*] *${title.toUpperCase()}*> ${revSession}`)
  }

  function sendMessage(prMessageList) {
    console.log("PR list = "+prMessageList.length + " -notifyEmpty="+notifyEmpty);
    if (prMessageList.length || notifyEmpty) {
      const header = [textSection(prMessageList.length ? headerMessage :'Sem PRs Parabéns galera')]
          return bot(header.concat(prMessageList))
    }  
  }

  return function(prList) {
    const listOfAuthorPrs = Object.entries(groupByAuthor(prList))
    .map(([author, prs]) => flatten([authorSection(author), prs.map(convertToSection)]));
    const messagesSequence = flatten(listOfAuthorPrs)
    return sendMessage(messagesSequence)
  }
}
module.exports = {
  singleSlackMessage, errorNotify, minimalSlackMessage
}