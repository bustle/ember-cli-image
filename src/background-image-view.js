/**
  `BackgroundImageView` loads a stateful image for its 
  css background-image. Class names are updated according to the image state.

  Instances of `BackgroundImageView` can be created using the `background-image` Handlebars helper.
  ```handlebars
  {{background-image src="img/image1.jpg"}}
  ```

  @class BackgroundImageView
  @extends Ember.View
  @uses ImageLoader
**/
var BackgroundImageView = Ember.View.extend( ImageLoader, {
  attributeBindings: ['style'],
  classNames: ['background-image'],
  applyStyle: function(url) {
    if(url) {
      var backgroundImageStyle = 'background-image:url("' + url + '")';
      this.set('style', backgroundImageStyle.htmlSafe());
    }
  }.on('willLoad')
});

// Add `{{background-image}}` Handlebars helper.
Ember.Handlebars.helper('background-image', BackgroundImageView);

// Add to namespace
Ember.BackgroundImageView = BackgroundImageView;
