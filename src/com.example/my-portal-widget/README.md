# My portal widget

This articles covers how to write a plugin that shows on the portal page.

## What is a portal widget?

A portal plugin always gives a short overview on a piece of information (the so-called 'tile'). It can link a longer view that is opened when the tile is clicked, this we call the side pop-up. The side pop-up is optional.

## Code example

The simplest portal plugin comes without a side pop-up and shows static content on its tile. Two uses for this would be presenting an advertisement, which is just a slogan. You can find the corresponding file at [src/com.example/my-portal-widget/register.js](src/com.example/my-portal-widget/register.js).

```javascript
ext.point('io.ox/portal/widget').extend({
  id: 'myAd'
})

ext.point('io.ox/portal/widget/myAd').extend({
  title: 'My advertisement',
  preview () {
    const content = $('<div class="content">')
      .text('Buy stuff. It\'s like solid happiness.')
    this.append(content)
  }
})

ext.point('io.ox/portal/widget/myAd/settings').extend({
  title: 'My advertisement',
  type: 'myAd'
})
```

The code for the portal widget consists out of three parts:

1. First of all you register your new code to the extension point `io.ox/portal/widget` and assign a new id for your new widget. In this case it's 'myAd'.

2. The second section contains the description and functionality of your portal widget. You can declare a title and program your plugins content via the `preview` method. You have to append your widget content to `this`. Technically, this contains the container to which you can attach your content. If necessary you can do changes on the container, too. Be aware that you have to follow a pattern and name the new extension point after the id in the first part where you registered the new plugin: `io.ox/portal/widget/$id`.

3. This also needs to get considered in the third part, which configures a settings entry. The path of the extension point should be the same of your portal plugin and gets complemented by 'settings': `io.ox/portal/widget/$id/settings`. Please add a custom title and set the type to your portal widgets id, in that case 'myAd'. You have to have settings.

## Declare your plugin

You also need to declare your extension point via a `manifest.json`. The minimal declaration for an app looks like this, [src/com.example/my-portal-widget/manifest.json](src/com.example/my-portal-widget/manifest.json):

```javascript
{
  "namespace": "portal"
}
```

It consists of a namespace to define the timing when the plugin shall be loaded and the path to the plugins entry file. By convention it's always called `register.js`.
You can find more information about manifests ==[here](https://documentation.open-xchange.com/7.10.5/ui/customize/manifests.html)==.

## Advanced portal widget functionality

### 1. Side popup

The code example above only shows a very simple portal widget with a static content within its tile. But you can also write a side popup. The `manifest.json` can stay the same, but you have to improve the *second part* of the `register.js`:

```javascript
ext.point('io.ox/portal/widget/myAd').extend({
  title: 'My advertisement',

  load (baton) {
    const def = $.Deferred()
    def.resolve("It's like solid happiness.").done(data => {
      baton.data = {
        teaser: 'Buy stuff',
        fullText: 'Buy stuff. It is like solid happiness.'
      }
    })
    return def
  },

  preview (baton) {
    const content = $('<div class="content pointer">')
      .text(baton.data.teaser)
    this.append(content)
  },

  draw (baton) {
    const content = $('<div class="myAdd">')
      .text(baton.data.fullText)
    this.append(content)
  }
})
```

As you can see two more methods are declared: **load** and **draw**. The order of the methods is important since the baton object gets passed around.

When a plugin is supposed to be rendered, the first method to be called is **load**. It usually does some (asynchronous) loading of data, e.g. from the file store or some external source. Meanwhile, the empty tile is rendered on the portal page.

When the loading is done, it is consensus that the loaded data is stored as `baton.data`. Then **preview** is called. It then renders its content, which is appended to the tile and often needs data from the baton object.

When the tile is clicked on, a side popup is drawn. The method **draw** gets called. Here you can describe the side popups functionality and content.

The given example is a stereotypical use case: First, load gets the data. Then preview renders a short version of the data on the tile. When clicked, draw renders a longer, more detailed view of that data on a side popup.

### 2. Initialize

Sometimes you want to do things even before loading. Maybe pre-populate the baton. For this we have the method `initialize`:

```javascript
initialize (baton) {
  baton.default = 'Defaultiness'
}
```

### 3. Action

In case you want to make the widget title clickable and perform some action when this happens, you can use the `action` method:

```javascript
action () {
  console.log('widget title was clicked!')
}
```

### 4. Require Setup

There are some external sources that need some kind of setup before they can be used, e.g services that need an OAuth authorization. For this, you need to implement two more methods, named `requiresSetup` and `performSetup`. The former determines whether it is necessary to run a setup, the latter starts the setup process if the former returns true.

```javascript
requiresSetup () {
    return isMissingAnAccount()
},
performSetup () {
  createANewAccount()
}
```

### 5. Unique

If you want to make sure the widget can only be created once, make sure you set it to `unique`:

```javascript
ext.point('io.ox/portal/widget/myAd/settings').extend({
  title: 'My advertisement',
  type: 'myAd',
  unique: true
})
```

### 6. Error handling

Occasionally, it might happen that there is an error when loading an external source. Should this occur and load (which, as you know, uses a $.Deferred) call fail instead of done, the function error is called. This allows you to handle this case differently.

```javascript
error (error) {
  $(this).empty().append(
    $('<div>').text('An error occurred.')
  )
}
```

Important: This is not a catch-all solution. If you do not use `load` to load the data, but do it `preview` or `draw`, this will not work. It will also not work if the service that is called wraps the error nicely in a valid response.

### 7. Configurable settings

Sometimes you want to fine-tune your widget. The place to do so is in the settings part. If you mark your settings editable, your settings gets a little 'edit' link and you get to define a function that is called. This function is given both the model and the view so you can build your own settings pane. In the following example the `ModalDialog` gets imported to make an dialog accessible to edit the portal widgets title.

```javascript
import ModalDialog from '$/io.ox/backbone/views/modal'

//...

ext.point('io.ox/portal/widget/myAd/settings').extend({
  title: 'My advertisement',
  type: 'myAd',
  editable: true,

  edit (model, view) {
    const dialog = new ModalDialog({ title: 'My Advertisement', async: true })
    const title = $('<input type="text" class="form-control">').val(model.get('title'))

    dialog
      .build(function () {
        this.$body.append(
          $('<div class="form-group">').append(
            $('<label>').text('Title'),
            title,
            $('<div class="alert alert-danger">').css('margin-top', '15px').hide()
          )
        )
      })
      .addCancelButton()
      .addButton({ label: 'Save', action: 'save' })
      .open()

    dialog
      .on('save', () => {
        model.set({ title: $.trim(title.val()) })
        dialog.close()
      })
      .on('cancel', () => console.log('Edit was canceled.'))
  }
})
```
