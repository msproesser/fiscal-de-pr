const prSources = {
  'vsts': require('./tools/az-tools').vstsPrSource,
  'bitbucket': require('./tools/bitbucket-tools').bitbucketPrSource
}
const slack = require('./tools/slack-tools')
const notificationChannels = {
  'slack': slack.singleSlackMessage,
  'slack-minimal': slack.minimalSlackMessage,
  'google-chat': require('./tools/google-chat-tools').googleChatMessage
}

function fiscalDePr({team, queryFrom, notifyOn}) {
  const selectedSource = prSources[queryFrom.target]
  const selectedOutput = notificationChannels[notifyOn.target]
  if (!selectedOutput && !selectedSource) {
    console.log('Invalid Source or notificationChannel')
    return
  }
  
  return selectedSource(queryFrom.config)()
  .then(selectedOutput(notifyOn.config))
  .catch(err => {
    const responseStatus = err ? (err.response ? err.response.status : '-') : '-'
    console.log(team + ' got error : '+responseStatus, err)
  })
}
module.exports = fiscalDePr
