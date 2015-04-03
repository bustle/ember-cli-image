import Ember from 'ember';
import ImageStateMixin from './image-state-mixin';

/**
  @private
  Smallest possible image data uri. 1x1 px transparent gif.
  Used to cancel a image request in progress.
  */
var blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
  Mixin to load images and handle state changes from
  native javascript image events.

  @class ImageLoaderMixin
  @uses Ember.Evented
  @uses ImageStateMixin
**/
var ImageLoaderMixin = Ember.Mixin.create( Ember.Evented, ImageStateMixin, {
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
      img.src = blankImg;
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
    Load an image whenever the url is changed.
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

export default ImageLoaderMixin;
