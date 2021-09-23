const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  outputDir: resolve('./永乐大后台'),
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.194:8999/Api', //对应自己的接口
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          //'^/api': ''
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('common', resolve('src/common'))
      .set('components', resolve('src/components'))
      .set('http', resolve('src/http'))
      .set('base', resolve('src/base'))
      .set('views', resolve('src/views'))
      .set('store', resolve('src/store'))
      .set('filters', resolve('src/filters'))
      .set('directives', resolve('src/directives'))
      .set('router', resolve('src/router'))

    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    config.plugins.delete('prefetch')
  },
  lintOnSave: false,
  productionSourceMap: false
}
