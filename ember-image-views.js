/**
 * ember-image-views
 * Stateful image views for Ember.js
 *
 * version: 0.1.0
 * last modifed: 2013-11-07
 *
 * Garth Poitras <garth22@gmail.com>
 * Copyright 2013 (c) Garth Poitras
 */

(function(window, Ember, undefined){

"use strict";

/**
  `Ember.ImageLoader` is a Mixin that loads images while keeping
  state and triggering events along the image's lifecycle.

  Typically useful for remote images, but can be used for local images.

  @class ImageLoader
  @namespace Ember
  @uses Ember.Evented
**/
Ember.ImageLoader = Ember.Mixin.create( Ember.Evented, {
  /**
    Image is currently in the loading state,
    meaning its onload or onerror event hasn't
    been triggered after setting the src.

    @property isLoading
    @type Boolean
    @default false
  */
  isLoading: false,

  /**
    Image is currently in the error state,
    meaning its onerror was triggered after setting the src.

    @property isError
    @type Boolean
    @default false
  */
  isError: false,

  /**
    JavaScript Image Object used to do the loading.

    @property imageLoader
    @type Image
    @default Image
  */
  imageLoader: Ember.computed(function() { return new Image(); }).property(),

  /**
    Loads an image with the given src url.
    Triggers events on native Image callbacks.

    @method loadImage
    @param {String} image source url
  */
  loadImage: function(src) {
    var mixin = this,
        img = this.get('imageLoader');

    if(src) {
      this.setProperties({ isLoading: true, isError: false });
      img.onload  = function(e) { Ember.run(this, function() { mixin._onImgLoad(this, e); }); };
      img.onerror = function(e) { Ember.run(this, function() { mixin._onImgError(this, e); }); };
      img.src = src;
      // If the image is already cached in the browser, don't enter loading state.
      if(img.complete || img.naturalWidth !== 0) {
        this.set('isLoading', false);
      }
    }
  },

  /**
    Cancels a pending image request.
    Changing the src successfully aborts the previous request. (use empty gif data uri)
    Notes:
    - Removing img from the DOM does not cancel an img http request.
    - Setting img src to null has unexpected results cross-browser.

    @method cancelImageLoad
  */
  cancelImageLoad: function() {
    if(this.get('isLoading')) {
      this.setProperties({ isLoading: false, isError: false });
      var img = this.get('imageLoader');
      if(img) {
        img.onload = img.onerror = null;
        img.src = Ember.ImageLoader._blankImg;
      }
    }
  },
  
  /**
    @private
    Internal onload event handler
    @method _onImgLoad
  */
  _onImgLoad: function(img, e) {
    this.setProperties({ isLoading: false, isError: false });
    this.trigger('didLoad', img, e);
  },

  /**
    @private
    Internal onerror event handler
    @method _onImgError
  */
  _onImgError: function(img, e) {
    this.setProperties({ isLoading: false, isError: true });
    this.trigger('becameError', img, e);
  },

  /**
    @private
    Remove image events when element is destroyed
    @method _teardownLoader
  */
  _teardownLoader: Ember.on('willDestroyElement', function() {
    var img = this.get('imageLoader');
    if(img) {
      img.onload = img.onerror = null;
    }
  })

});

/**
  @private
  Smallest possible image data uri. 1x1px transparent gif.
  Used to cancel a image request in progress.
  */
Ember.ImageLoader._blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';


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
  attributeBindings: ['finalSrc:src', 'alt', 'width', 'height'],
  classNameBindings: ['loadingClass', 'errorClass'],

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

    @property finalSrc
    @default src
  */
  finalSrc: Ember.computed.oneWay('src'),

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
    this.loadImage(this.get('finalSrc'));
  }, 'finalSrc').on('didInsertElement')
  
});

/**
  `ImgView` `{{img}}` Handlebars helper.
*/
Ember.Handlebars.helper('img', Ember.ImgView);


/**
  `Ember.BackgroundImageView` loads a stateful image for its 
  css background-image. Class names are updated according to the image state.

  Instances of `BackgroundImageView` can be created using the `background-image` Handlebars helper.
  ```handlebars
  {{background-image src="img/image1.jpg"}}
  ```

  @class BackgroundImageView
  @namespace Ember
  @extends Ember.View
  @uses Ember.ImageLoader
**/
Ember.BackgroundImageView = Ember.View.extend( Ember.ImageLoader, {
  attributeBindings: ['style'],
  classNames: ['background-image'],
  classNameBindings: ['loadingClass', 'errorClass'],

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

    @property finalSrc
    @default src
  */
  finalSrc: Ember.computed.oneWay('src'),

  /**
    Loading state class name. This can be overriden
    per instance or app wide using Ember.BackgroundImageView.reopen

    @property loadingClassName
    @type String
    @default 'loading'
  */
  loadingClassName: 'loading',

  /**
    Error state class name. This can be overriden
    per instance or app wide using Ember.BackgroundImageView.reopen

    @property errorClassName
    @type String
    @default 'error'
  */
  errorClassName: 'error',

  /**
    Computed style property string based on the src.

    @property style
    @type String
    @default null
  */
  style: Ember.computed(function() {
    var src = this.get('finalSrc');
    if(src) {
      return Ember.String.fmt('background-image:url("%@");', [src]);
    }
    return null;
  }).property('finalSrc'),

  /**
    @private
    
    Use the ImageLoader Mixin to load the image src on 
    willInsertElement and whenever the src is changed.

    @method loadImageOnSrcSet
  */
  loadImageOnSrcSet: Ember.observer(function() {
    this.loadImage(this.get('finalSrc'));
  }, 'finalSrc').on('willInsertElement'),

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
  `BackgroundImageView` `{{background-image}}` Handlebars helper.
*/
Ember.Handlebars.helper('background-image', Ember.BackgroundImageView);


/**
  `Ember.ImageContainerView` is a container view with a stateful image 
  (`Ember.ImgView` or `Ember.BackgroundImageView`) as a child view.
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

    @property finalSrc
    @default src
  */
  finalSrc: Ember.computed.oneWay('src'),

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
    @property childViews
    @type Array
    @default imageView
  */
  childViews: ['imageView'],

  /**
    The child image view which is either an `ImgView` or 
    `BackgroundImageView` based on the `background` property.

    @property imageView
    @type Ember.View
    @default Ember.ImgView
  */
  imageView: Ember.computed(function() {
    if(this.get('background')) {
      return Ember.BackgroundImageView.create({
        srcBinding: 'parentView.src',
        finalSrcBinding: 'parentView.finalSrc'
      });
    }
    return Ember.ImgView.create({
      srcBinding: 'parentView.src',
      finalSrcBinding: 'parentView.finalSrc',
      altBinding: 'parentView.alt',
      widthBinding: 'parentView.width',
      heightBinding: 'parentView.height'
    });
  }).property('background'),

  /**
    If you would like to present a child view while
    the image is loading, define a `loadingView`

    @property loadingView
    @type Ember.View
    @default null
  */
  loadingView: null,

  /**
   @private
   Creates an instance of the loadingView if set as a string.
   Adds observer to add/remove the loading view upon loading state change.

   @method _setupLoadingView
  */
  _setupLoadingView: Ember.on('init', function() {
    var loadingView = this.get('loadingView');

    if(loadingView) {
      if('string' === typeof loadingView) {
        loadingView = Ember.get(Ember.lookup, loadingView).create();
        this.set('loadingView', loadingView);
      }

      this.addObserver('isLoading', this, function(sender, key) {
        if(sender.get(key)) {
          this.pushObject(loadingView);
        } else {
          this.removeObject(loadingView);
        }
      });
    }
  }),

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


})(this, Ember);