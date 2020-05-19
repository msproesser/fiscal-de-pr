const prSources = {
  'vsts': require('./tools/az-tools').vstsPrSource
}

const notificationChannels = {
  'slack': require('./tools/slack-tools').singleSlackMessage
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
