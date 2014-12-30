/**
 * ember-image-views
 * Stateful image views for Ember.js
 *
 * version: 0.2.0
 * last modifed: 2014-12-30
 *
 * Garth Poitras <garth22@gmail.com>
 * Copyright 2014 (c) Garth Poitras
 */

(function(Ember){

"use strict";

/**
  `ImageState` is a Mixin to track image loading/error state
  and update css classes accordingly.

  @class ImageState
**/
var ImageState = Ember.Mixin.create({
  classNameBindings: ['_loadingClass', '_errorClass'],

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
    @property src
    @type String
    @default null
  */
  src: null,

  /**
    @private
    
    The final image src load. A buffer to the src, which is
    useful for subclasses and mixins to modify the base src.

    @property _src
    @default src
  */
  _src: Ember.computed.oneWay('src'),

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
    var src = this.get('_src');
    var component = this, img;

    if(src) {
      img = this.get('imageLoader');
      if (img) {
        img.src = ''; // needed for onload to be called if reusing the same image object
        this.trigger('willLoad', src);
        this.setProperties({ isLoading: true, isError: false });

        img.onload  = function(e) { 
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

        img.src = src;
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
        img.src = ImageLoader._blankImg;
      }
    }
  },

  /**
    @private
    Reload the image whenever the src is changed.
    @method _loadImageOnSrcChange
  */
  _loadImageOnSrcChange: Ember.observer('src', function() {
    this.loadImage();
  }),

  /**
    @private
    Load the image when the view is initially inserted into DOM
    @method _loadImageOnInsert
  */
  _loadImageOnInsert: Ember.on('didInsertElement', function() {
    this.loadImage();
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
  attributeBindings: ['_src:src', 'alt', 'width', 'height'],

  /**
    @property imageLoader
    @type Object
    @default element
  */
  imageLoader: Ember.computed.oneWay('element'),

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
  style: Ember.computed('_src', function() {
    var src = this.get('_src');
    if(src) {
      return 'background-image:url("' + src + '")';
    }
  })
});

// Add `{{background-image}}` Handlebars helper.
Ember.Handlebars.helper('background-image', BackgroundImageView);

// Add to namespace
Ember.BackgroundImageView = BackgroundImageView;

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

})(Ember);