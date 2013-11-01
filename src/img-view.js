/**
  `Ember.ImgView` renders a stateful `<img>` element whose loading and
  error states can be observed, and whose class names are updated accordingly.

  Instances of `ImgView` can be created using the `img` Handlebars helper.
  ```handlebars
  {{img src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```
  
  @class ImgView
  @namespace Ember
  @extends Ember.View
  @uses Ember.ImageLoader
**/
Ember.ImgView = Ember.View.extend( Ember.ImageLoader, {
  tagName: 'img',
  attributeBindings: ['src', 'alt', 'width', 'height'],
  classNameBindings: ['loadingClass', 'errorClass'],

  /**
    Loading state class name. This can be overriden
    per instance or app wide using Ember.ImgView.reopen

    @property loadingClassName
    @type String
    @default 'loading'
  */
  loadingClassName: 'loading',

  /**
    Error state class name. This can be overriden
    per instance or app wide using Ember.ImgView.reopen

    @property errorClassName
    @type String
    @default 'error'
  */
  errorClassName: 'error',

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
  }).property('isError'),

  /**
    The javascript Image Object used by the ImageLoader
    Mixin to observe an image's loading state.

    @property imageLoader
    @type Object
    @default element
  */
  imageLoader: Ember.computed.alias('element'),

  /**
    @private
    
    Use the ImageLoader Mixin to load the image src on 
    didInsertElement and whenever the src is changed.

    @method loadImageOnSrcSet
  */
  loadImageOnSrcSet: Ember.observer(function() {
    this.loadImage(this.get('src'));
  }, 'src').on('didInsertElement')
  
});

/**
  `ImgView` `{{img}}` Handlebars helper.
*/
Ember.Handlebars.helper('img', Ember.ImgView);

