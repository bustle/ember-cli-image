/**
  `ImageContainerView` is a container view with a stateful image 
  (`ImageView` or `BackgroundImageView`) as a child view.
  Class names are updated according to the image's state.

  Instances of `ImageContainerView` can be created using the `image` Handlebars helper.
  ```handlebars
  {{image src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```

  @class ImageContainerView
  @extends Ember.ContainerView
  @uses ImageState
**/
var ImageContainerView = Ember.ContainerView.extend( ImageState, {
  classNames: ['image-view'],
  loadingClass: 'image-loading',
  errorClass: 'image-error',
  
  /**
    Url to the image source.

    @property src
    @type String
    @default null
  */
  src: null,

  /**
    @private
    
    The final image url to load. A buffer to the src, which is
    useful for subclasses and mixins to modify the base src.

    @property _src
    @default src
  */
  _src: Ember.computed.oneWay('src'),

  /**
    If `background` is true, the container uses a `BackgroundImageView`
    as its child image view instead of the default `ImgView`

    @property background
    @type Boolean
    @default false
  */
  background: false,

  /**
    Proxy to child image's isLoading property

    @property isLoading
    @type Boolean
    @default false
  */
  isLoading: Ember.computed.oneWay('imageView.isLoading'),

  /**
    Proxy to child image's isError property

    @property isError
    @type Boolean
    @default false
  */
  isError: Ember.computed.oneWay('imageView.isError'),

  /**
    The child image view which is either an `ImageView` or 
    `BackgroundImageView` based on the `background` property.

    @property imageView
    @type Ember.View
    @default Ember.ImgView
  */
  imageView: Ember.computed('background', function() {
    if(this.get('background')) {
      return BackgroundImageView.create({
        srcBinding: 'parentView.src',
        _srcBinding: 'parentView._src'
      });
    }
    return ImageView.create({
      srcBinding: 'parentView.src',
      _srcBinding: 'parentView._src',
      altBinding: 'parentView.alt',
      widthBinding: 'parentView.width',
      heightBinding: 'parentView.height'
    });
  }),

  /**
    @method _addImageViewChild
    @private
    Adds the sole child imageView
  */
  _addImageViewChild: Ember.on('init', function() {
    this.pushObject(this.get('imageView'));
  }),

  /**
    @method _onImageViewChanged
    Observes when the type of imageView is updated
    and recreates child views accordingly.
  */
  _onImageViewChanged: Ember.observer('imageView', function() {
    this.removeAllChildren();
    this._addImageViewChild();
  })

});


// Add `{{image}}` Handlebars helper.
Ember.Handlebars.helper('image', ImageContainerView);

// Add to namespace
Ember.ImageContainerView = ImageContainerView;
