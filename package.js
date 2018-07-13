Package.describe({
  name: 'b42:mimic',
  version: '0.0.1',
  summary: '',
  git: 'https://github.com/m-vinc/Mimic.git',
  documentation: 'README.md'
})

Package.onUse(api => {
  api.versionsFrom('1.7.0.1')
  api.use([
    'ecmascript'
  ])
  api.mainModule('server/main.js', 'server')
  api.mainModule('client/main.js', 'client')
})

Package.onTest(api => {
  api.use('ecmascript')
  api.use('tinytest')
})
