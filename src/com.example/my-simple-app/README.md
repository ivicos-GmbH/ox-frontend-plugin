# My simple app

- A minimal app that that creates single window with "hello world!" as main content
- [src/com.example/my-simple-app](src/com.example/my-simple-app)

In order to add the app to the launcher, it also needs to be defined in the middleware configuration.
The key is `io.ox/core//apps/list` and contains a comma separated list of app ids.
If not specified, the id will be the same as the `name` attribute.

For development purposes (if you don't have access to the middleware configuration), it is possible to manually set the list in the browser console:

```js
(async () => {
  const defaultList = 'io.ox/mail,io.ox/calendar,io.ox/contacts,io.ox/files,io.ox/portal,io.ox/tasks'
  let settingsLoader = await import('../io.ox/core/settings.js')
  settingsLoader = settingsLoader.default ? settingsLoader.default : settingsLoader
  const settings = settingsLoader.load('io.ox/core')
  const list = settings.get('apps/list', defaultList).split(',')
  list.push('com.example/my-simple-app')
  // adds our app id to the list and send it on the middleware
  settings.set('apps/list', list.join(',')).save()
})()
```

If you want to start the app programmatically:

```js
const { default: api } = await import('$/io.ox/core/api/apps')
api.get('com.example/my-simple-app').launch()
```
