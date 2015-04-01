import Ember from 'ember';
import XImg from './x-img';

var reads = Ember.computed.reads;

/**
 * ImageChild classes specifically for container views
 */
var ImageChild = XImg.extend({
  url: reads('parentView.url'),
  alt: reads('parentView.alt'),
  width: reads('parentView.width'),
  height: reads('parentView.height')
});

export default ImageChild;
