(function(Ember) {

  /**
    `ImgixMixin` is an `ImageView` Mixin that supports
    the imgix.com image service.  It adds imgix specific 
    parameters and presets to base image src urls.
   
    @class ImgixMixin
   */
  var ImgixMixin = Ember.Mixin.create({
    imgixParams: null,
    forceDpr: false,
    processGifs: false,

    _src: Ember.computed('src', 'imgixParams', 'forceDpr', function() {
      var src = this.get('src');
      var imgixParams = this.get('imgixParams');
      var klass = this.constructor;
      var params = '';

      // Gifs cannot be processed by imgix, unless you want it to be single frame
      if(!this.get('processGifs') && klass.urlIsGif(src)) {
        return src;
      }

      if(imgixParams) {
        params += imgixParams;
      }
      if(dprParams && this.get('forceDpr')) {
        params += dprParams;
      }

      return klass.addParams(src, params);
    })

  });

  /**
    Static properties and methods
   */
  var ImgixMixinStatic = {
    addParams: function(src, params) {
      if(!src) { return null; }
      if(!params) { return src; }
      if(src.indexOf('?') === -1) {
        src += '?';
      }
      return src + params;
    },

    urlIsGif: function(url) {
      return url ? !!url.match(/\.gif$|\.gif\?/) : false;
    }
  };

  var dprParams = (function() {
    var dpr = Math.floor(window.devicePixelRatio) || 1;
    if(dpr > 1) {
      return '&dpr=' + dpr;
    }
  }());

  // Apply Imgix mixin to image views
  Ember.ImageView.reopen( ImgixMixin );
  Ember.ImageView.reopenClass( ImgixMixinStatic );
  Ember.BackgroundImageView.reopen( ImgixMixin );
  Ember.BackgroundImageView.reopenClass( ImgixMixinStatic );
  Ember.ImageContainerView.reopen( ImgixMixin );
  Ember.ImageContainerView.reopenClass( ImgixMixinStatic );

}(Ember));
