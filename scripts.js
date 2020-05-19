const commonConfig = require('./commonConfig')

const errorNotify = commonConfig.errorNotify

console.log('commonCfg',JSON.parse(commonConfig.defaultConfig))
const defConfigs = () => (JSON.parse(commonConfig.defaultConfig))
const { mergeDeep } = require('./tools/polyfill')
const configList = require('./config')
const fiscal = require('./fiscal-de-pr')
configList
.map(config => mergeDeep(defConfigs(), config))
.map(config => {
    console.log('Team config = ', config)
    return config
})
.forEach(config => fiscal(config).catch(errorNotify))
