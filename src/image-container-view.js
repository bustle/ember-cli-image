/**
  `Ember.ImageContainerView` is a container view with a stateful image 
  (`Ember.ImgView` or `Ember.BackgroundImageView`) as its sole child.
  Class names are updated according to the image's state.

  Instances of `ImageContainerView` can be created using the `image` Handlebars helper.
  ```handlebars
  {{image src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```

  @class ImageView
  @namespace Ember
  @extends Ember.ContainerView
  @uses Ember.ImgView
**/
Ember.ImageContainerView = Ember.ContainerView.extend({
  classNames: ['image-view'],
  classNameBindings: ['loadingClass', 'errorClass'],

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
  isLoading: Ember.computed.alias('imageView.isLoading'),

  /**
    Proxy to child image's isError property

    @property isError
    @type Boolean
    @default false
  */
  isError: Ember.computed.alias('imageView.isError'),

  /**
    The child image view which is either an img (`ImgView`)
    or `BackgroundImageView` based on the `background` property.

    @property imageView
    @type Ember.View
    @default Ember.ImgView
  */
  imageView: Ember.computed(function() {
    if(this.get('background')) {
      return Ember.BackgroundImageView.create({
        srcBinding: 'parentView.src'
      });
    }
    return Ember.ImgView.create({
      srcBinding: 'parentView.src',
      altBinding: 'parentView.alt',
      widthBinding: 'parentView.width',
      heightBinding: 'parentView.height'
    });
  }).property('background'),

  /**
    If you would like to present a different child view while
    the image is loading, define a `loadingView`

    @property loadingView
    @type Ember.View
    @default null
  */
  loadingView: null,

  /**
    Returns a sole child view which is either an image view,
    or loading view (if specified)

    @property childViews
    @type Array
  */
  childViews: Ember.computed(function() {
    var loadingView = this.get('loadingView'), view;
    if(this.get('isLoading') && loadingView) {
      view = loadingView;
    } else {
      view = this.get('imageView');
    }
    return [view];
  }).property('isLoading', 'loadingView', 'imageView'),

  /**
    Loading state class name. This can be overriden
    per instance or app wide using Ember.ImageContainerView.reopen

    @property loadingClassName
    @type String
    @default 'image-loading'
  */
  loadingClassName: 'image-loading',

  /**
    Error state class name. This can be overriden
    per instance or app wide using Ember.ImageContainerView.reopen

    @property errorClassName
    @type String
    @default 'image-error'
  */
  errorClassName: 'image-error',
  
  /**
    @private
    
    Computed property proxies for state classes
    so they can be easily overridden.

    @property loadingClass
    @property errorClass
  */
  loadingClass: Ember.computed(function() {
    if(this.get('isLoading')) { return this.get('loadingClassName'); }
  }).property('isLoading'),

  errorClass: Ember.computed(function() {
    if(this.get('isError')) { return this.get('errorClassName'); }
  }).property('isError')

});

/**
  `ImageContainerView` `{{image}}` Handlebars helper.
*/
Ember.Handlebars.helper('image', Ember.ImageContainerView);

