/* eslint-disable no-not-accumulator-reassign/no-not-accumulator-reassign,import/no-extraneous-dependencies, no-param-reassign */
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const packageInfo = require('./package.json')

module.exports = config => {
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './Resources/**/*'),
        to: path.resolve(__dirname, `./${packageInfo.skpm.main}/Contents/`),
        toType: 'dir',
        context: path.resolve(__dirname, './')
      }
    ])
  )
}
