# My extension

## What is an extension point?

Abstractly speaking extension points are an architecture for letting plugins contribute functionality to other parts of the program. The mechanism of extension points and extensions enables us to provide a loosely coupled OX App Suite and allows developers like you to easily exchange functionality.

## Code examples

This is a code example for an extension point. You can find the corresponding file at [src/com.example/my-extension/register.js](src/com.example/my-extension/register.js). It will add an entry to the help dropdown which is labled as 'Click me' and will open an alert dialog if you click on it.

```javascript
ext.point('io.ox/core/appcontrol/right/help').extend({
  id: 'my-extension',
  index: 'first',
  // before: 'some-other-extensions-id'
  extend () {
    this.append($('<a href="">').text(gt('Click me')).on('click', () => alert('You clicked me')))
  }
})
```

As you can see, an extension point gets described through its namespace. If you want to extend some code of the AppSuite UI you first have to identify the extension point that you want to extend.

To write an extension point you need to specify the following properties:

| Property               | Description                                                                                                                                                   |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **id**                 | You need an unique identifier for your custom extension as  `string`                                                                                          |
| **index**              | The index describes the order and position of your extension  `integer`. There are two predefined values as `string` you can use as well: 'first' and 'last'. |
| **before** / **after** | Alternatively to the index you can user before or after to describe the position.                                                                             |
| **extend**             | This is the place where you can add your custom functionality with a  `Function`                                                                              |

Important: Existing extensions with same the id will not be overwritten. Use `replace` instead.

Another example is a custom e-mail footer:

```javascript
ext.point('io.ox/mail/detail').extend({
  id: 'my-extension-mail',
  index: 'last',
  draw (baton) {
    const data = baton.data
    this.append($('<em>').append(
      $.txt("The eMail '"),
      $('<b>').text(data.subject),
      $.txt("' was brought to you by: "),
      $('<b>').text('Your Name Inc.')
    ))
  }
})
```

Some extension points are called with a context object, called 'baton'. The baton gets passed back through callbacks within programmatic flow allowing data exchange between extension points. You can find more information about the baton ==[here](https://documentation.open-xchange.com/7.10.5/ui/extension-points.html)==.

## Declare your plugin

You also need to declare your extension point via a `manifest.json`. The minimal declaration for an app looks like this, [src/com.example/my-extension/manifest.json](src/com.example/my-extension/manifest.json):

```javascript
{
  "namespace": "core"
}
```

It consists of a namespace to define the timing when the plugin shall be loaded and the path to the plugins entry file. By convention it's always called `register.js`.
You can find more information about manifests ==[here](https://documentation.open-xchange.com/7.10.5/ui/customize/manifests.html)==.
