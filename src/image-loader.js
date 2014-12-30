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
