import Ember from 'ember';
/**
  * `ImagePlaceholder` provides the placeholder
  * (as an `<i>`-tag icon) for the missing images
  *
  * @class ImagePlaceHolder
  * @private
  **/
var ImagePlaceholder = Ember.Component.extend({

  classNames: ['image-placeholder'],
  classNameBindings: ['iconClass'],
  attributeBindings: ['style'],

  iconClass: function() {
    return 'icon-' + this.get('icon');
  }.property('icon'),

  style: function() {
    var height = this.get('height') || 0;
    var fontSize = Math.floor(height * 0.5);
    return 'line-height:' + height + 'px;font-size:' + fontSize + 'px';
  }.property('height'),

  setHeight: function() {
    if(!this.get('height')) {
      this.set('height', this.$().height());
    }
  }.on('didInsertElement')
});

export default ImagePlaceholder;
