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
    Loads an image with the given src url.
    Triggers events on native Image callbacks.

    @method loadImage
    @param {String} image source url
  */
  loadImage: function(src) {
    if(src) {
      var mixin = this;
      var img = this.get('imageLoader');

      if (img) {
        this.setProperties({ isLoading: true, isError: false });
        img.onload  = function(e) { Ember.run(this, function() { mixin._onImgLoad(this, e); }); };
        img.onerror = function(e) { Ember.run(this, function() { mixin._onImgError(this, e); }); };
        img.src = src;
        // If the image is already cached in the browser
        if(img.complete || img.naturalWidth !== 0) {
          this.set('isLoading', false);
        }
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
    
    Load the image on willinsertElement and whenever the src is changed.

    @method loadImageOnSrcSet
  */
  _loadImageOnSrcSet: Ember.observer('src', function() {
    this.loadImage(this.get('_src'));
  }).on('willInsertElement'),

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
