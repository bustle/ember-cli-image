import Ember from 'ember';
import ImageLoaderMixin from '../mixins/image-loader-mixin';
/**
  `BackgroundImage` loads a stateful image for its
  css background-image. Class names are updated according to the image state.

  @class BackgroundImage
  @extends Ember.Component
  @uses ImageLoaderMixin
**/
var BackgroundImage = Ember.Component.extend( ImageLoaderMixin, {
  attributeBindings: ['style'],
  classNames: ['background-image'],
  applyStyle: function(url) {
    if(url) {
      this.set('style', 'background-image:url("' + url + '")');
    }
  }.on('willLoad')
});

export default BackgroundImage;
