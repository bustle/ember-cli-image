# ember-cli-image

Stateful image components for Ember.js

See the [API documentaion](http://bustlelabs.github.io/ember-cli-image/).

## Installation

For Ember CLI v0.2.3 or higher
```
ember install ember-cli-image
```
or
```
ember install:addon ember-cli-image
```

## Usage
This addon comes with three usable components `stateful-img`, `background-image` and `image-container`


```handlebars
{{stateful-img src="img/image1.jpg" alt="Image" width=100 height=100}}
```
Renders a stateful <img> element whose loading and error states can be
observed, and whose class names are updated accordingly.

```handlebars
{{background-image src="img/wallpaper.png"}}
```
Loads a stateful image for its css background-image.
Class names are updated according to the image state.

It can also be used as a wrapper around content.
```handlebars
{{#background-image src="img/wallpaper.png" class="item"}}
  <div class="item__content">
    <h1>{{title}}</h1>
    <p>{{message}}</p>
  </div>
{{/background-image}}
```

```handlebars
{{image-container src="img/image1.jpg" alt="Image" width=100 height=100}}
```
A container component with a stateful image as a child component.
Class names are updated according to the image's state. This can be useful when
you require a wrapper around your images for tasks like fading in images as they
lazily load.

Check out [ember-cli-image-lazy](https://github.com/bustlelabs/ember-cli-image-lazy) for seamlessly enabling lazily-loaded images.

Additionally, if you're using imgix as your image provider take a look at
[ember-cli-image-imgix](https://github.com/bustlelabs/ember-cli-image-imgix) for imgix integration.

## Contributing
Fork the repository, create a feature-branch and send in a pull request.

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
