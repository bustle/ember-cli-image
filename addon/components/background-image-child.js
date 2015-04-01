import Ember from 'ember';
import BackgroundImage from './background-image';

var reads = Ember.computed.reads;

/**
 * BackgroundImageChild classes specifically for container views
 */
 var BackgroundImageChild = BackgroundImage.extend({
   url: reads('parentView.url')
 });

export default BackgroundImageChild;
