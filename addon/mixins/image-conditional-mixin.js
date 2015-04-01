import Ember from 'ember';
import ImagePlaceholder from '../components/image-placeholder';

/**
 * `ImageConditional` is a Mixin to allow a graceful
 * fallback for missing images, using a pretty placeholder.
 *
 * @class ImageConditionalMixin
 * @extensionfor ImageContainer
 * @uses ImagePlaceholder
 * @example
 *   {{image src=undefined icon="user" width=300 height=100}}
 */
var ImageConditionalMixin = Ember.Mixin.create({
  /**
   * The icon name to use (as `icon-foo`) when no image is present.
   *
   * @property icon
   * @type String
   * @default 'picture'
  */
  icon: 'picture',

  /**
   * Delegates to `ImageContainer.imageView` when the image `src`
   * is present; returns an `ImagePlaceholder` if not
   *
   * @method imageView
   * @return {Component} `Image` or `ImagePlaceholder`
  */
  imageView: function() {
    if(this.get('src')) {
      return this._super.apply(this, arguments);
    }
    return ImagePlaceholder.create({
      icon: this.get('icon'),
      height: this.get('height')
    });
  }.property('src', 'background')

});

export default ImageConditionalMixin;
