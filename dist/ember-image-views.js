/**
 * ember-image-views
 * Stateful image views for Ember.js
 *
 * version: 0.2.0
 * last modifed: 2015-01-16
 *
 * Garth Poitras <garth22@gmail.com>
 * Copyright 2015 (c) Garth Poitras
 */

(function(Ember){

"use strict";


var reads = Ember.computed.reads;

/**
  `ImageState` is a Mixin to track image loading/error state
  and update css classes accordingly.

  @class ImageState
**/
var ImageState = Ember.Mixin.create({
  classNameBindings: ['_loadingClass', '_errorClass'],

  /**
    @property src
    @type String
    @default null
  */
  src: null,

  /**
    @property url
    @type String
    @default src
    The final src to load. Gives mixins a chance to modify src
  */
  url: reads('src'),

  /**
    @property isLoading
    @type Boolean
    @default if the src is initially set
  */
  isLoading: true,

  /**
    @property isError
    @type Boolean
    @default false
  */
  isError: false,
  
  /**
    @property loadingClass
    @type String
    @default 'loading'
  */
  loadingClass: 'loading',

  /**
    @property errorClass
    @type String
    @default 'error'
  */
  errorClass: 'error',

  /**
    @private
    
    Computed property proxies for state classes
    so they can be easily overridden.

    @property loadingClass
    @property errorClass
  */
  _loadingClass: Ember.computed('isLoading', function() {
    if(this.get('isLoading')) { return this.get('loadingClass'); }
  }),

  _errorClass: Ember.computed('isError', function() {
    if(this.get('isError')) { return this.get('errorClass'); }
  })
});

/**
  `ImageLoader` is a Mixin to load images and handle state changes from
  native javascript image events.

  @class ImageLoader
  @uses Ember.Evented
  @uses ImageState
**/
var ImageLoader = Ember.Mixin.create( Ember.Evented, ImageState, {
  /**
    JavaScript Image Object used to do the loading.

    @property imageLoader
    @type Image
    @default Image
  */
  imageLoader: Ember.computed(function() { return new Image(); }),

  /**
    Loads the image src using native javascript Image object
    @method loadImage
  */
  loadImage: function() {
    var url = this.get('url');
    var component = this, img;

    if(url) {
      img = this.get('imageLoader');
      if (img) {
        this.trigger('willLoad', url);
        this.setProperties({ isLoading: true, isError: false });

        img.onload = function(e) { 
          Ember.run(function() {
            component.setProperties({ isLoading: false, isError: false });
            component.trigger('didLoad', img, e);
          });
        };
        
        img.onerror = function(e) {
          Ember.run(function() {
            component.setProperties({ isLoading: false, isError: true });
            component.trigger('becameError', img, e);
          });
        };

        img.src = url;
      }
    }
  },

  /**
    Cancels a pending image request.
    @method cancelImageLoad
  */
  cancelImageLoad: function() {
    if(this.get('isLoading')) {
      this.setProperties({ isLoading: false, isError: false });
      this.clearImage();
    }
  },

  /**
   * Clears an image to a blank state.
   * Useful for canceling, or when swapping urls
    Notes:
    - Removing img from the DOM does not cancel an img http request.
    - Setting img src to null has unexpected results cross-browser.
   */
  clearImage: function() {
    var img = this.get('imageLoader');
    if(img) {
      img.onload = img.onerror = null;
      img.src = ImageLoader._blankImg;
    }
  },

  /**
    Loads the image when the view is initially inserted
    @method loadImageOnInsert
  */
  loadImageOnInsert: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, this.loadImage);
  }),

  /**
    Load or reload the image whenever the url is set.
    @method loadImageOnUrlSet
  */
  loadImageOnUrlSet: Ember.observer('url', function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.clearImage();
      this.loadImage();
    });
  }),

  /**
    @private
    Remove image events when element is destroyed
    @method _teardownLoader
  */
  _teardownLoader: Ember.on('willDestroyElement', function() {
    var img = this.get('imageLoader');
    if(img) {
      img = img.onload = img.onerror = null;
      this.set('imageLoader', null);
    }
  })

});

/**
  @private
  Smallest possible image data uri. 1x1px transparent gif.
  Used to cancel a image request in progress.
  */
ImageLoader._blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

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
      this.set('style', 'background-image:url("' + url + '")');
    }
  }.on('willLoad')
});

// Add `{{background-image}}` Handlebars helper.
Ember.Handlebars.helper('background-image', BackgroundImageView);

// Add to namespace
Ember.BackgroundImageView = BackgroundImageView;

/**
 * Child ImageView classes specifically for container views
 */
var ImageChildView = ImageView.extend({
  url: reads('parentView.url'),
  alt: reads('parentView.alt'),
  width: reads('parentView.width'),
  height: reads('parentView.height')
});

var BackgroundImageChildView = BackgroundImageView.extend({
  url: reads('parentView.url')
});

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
  isLoading: reads('imageView.isLoading'),

  /**
    Proxy to child image's isError property

    @property isError
    @type Boolean
    @default false
  */
  isError: reads('imageView.isError'),

  /**
    The child image view which is either an `ImageView` or 
    `BackgroundImageView` based on the `background` property.

    @property imageView
    @type Ember.View
    @default Ember.ImgView
  */
  imageView: Ember.computed('background', function() {
    if(this.get('background')) {
      return BackgroundImageChildView.create();
    }
    return ImageChildView.create();
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

})(Ember);