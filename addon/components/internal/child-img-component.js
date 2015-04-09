import Ember from 'ember';
import ImgComponent from '../img-component';

var reads = Ember.computed.reads;

/**
 * ImgComponent class specifically for use in container views
 */
var ChildImgComponent = ImgComponent.extend({
  url    : reads('parentView.url'),
  alt    : reads('parentView.alt'),
  width  : reads('parentView.width'),
  height : reads('parentView.height')
});

export default ChildImgComponent;
