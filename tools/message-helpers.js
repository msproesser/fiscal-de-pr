const {flatten} = require('./polyfill')
function groupByAuthor(prLinks) {
  return prLinks.reduce((sum, pr) => {
      sum[pr.displayName] = flatten([sum[pr.displayName] || [], pr])
      return sum
  }, {})
}

module.exports = {
  groupByAuthor
}