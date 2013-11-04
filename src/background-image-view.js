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

