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

