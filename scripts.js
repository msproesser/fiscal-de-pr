const fiscal = require('./fiscal-de-pr')
const configList = require('./config')
const { mergeDeep } = require('./tools/polyfill')
const commonConfig = require('./commonConfig')

const errorNotify = commonConfig.errorNotify
console.log('commonCfg',JSON.parse(commonConfig.defaultConfig))
const defConfigs = () => (JSON.parse(commonConfig.defaultConfig))

configList
.map(config => mergeDeep(defConfigs(), config))
.map(config => {
    console.log('Team config = ', config)
    return config
})
.forEach(config => fiscal(config).catch(errorNotify))
