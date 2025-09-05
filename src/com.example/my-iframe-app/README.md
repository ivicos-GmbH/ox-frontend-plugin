## My iframe app

- A minmal app that that creates a iframe and loads a url
- [src/com.example/my-iframe-app](src/com.example/my-iframe-app)

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
  list.push('com.example/my-iframe-app')
  // adds our app id to the list and send it on the middleware
  settings.set('apps/list', list.join(',')).save()
})()
```

If you want to start the app programmatically please use the following code

```js
const { default: api } = await import('$/io.ox/core/api/apps')
api.get('com.example/my-iframe-app').launch()
```
