import Ember from 'ember';
import BackgroundImageComponent from '../background-image';

/**
 * @private
 * BackgroundImageComponent class specifically for use in container views
 */
 var ChildBackgroundImageComponent = BackgroundImageComponent.extend({
   url: Ember.computed.reads('parentView.url')
 });

export default ChildBackgroundImageComponent;
