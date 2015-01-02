/**
  `ImageView` renders a stateful `<img>` element whose loading and
  error states can be observed, and whose class names are updated accordingly.

  Instances of `ImageView` can be created using the `img` Handlebars helper.
  ```handlebars
  {{img src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```
  
  @class ImageView
  @extends Ember.View
  @uses ImageLoader
**/
var ImageView = Ember.View.extend( ImageLoader, {
  tagName: 'img',
  attributeBindings: ['alt', 'width', 'height'],

  /**
    @property imageLoader
    @type Object
    @default element
  */
  imageLoader: reads('element'),

  /**
    @private
    
    Cancels slow loading images when destroying view.
    Ember routing seems to hang otherwise.

    @method _cancelLoadOnDestroy
  */
  _cancelLoadOnDestroy: Ember.on('willDestroyElement', function() {
    this.cancelImageLoad();
  })
});

// Add `ImageView` `{{img}}` Handlebars helper.
Ember.Handlebars.helper('img', ImageView);

// Add to namespace
Ember.ImageView = ImageView;
