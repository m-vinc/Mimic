Package.describe({
  name: 'b42:impersonate',
  version: '0.0.1',
  summary: '',
  git: 'https://gitlab-web.42.fr/secret/packages/users',
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
