import Ember from 'ember';
import ImageLoaderMixin from '../mixins/image-loader-mixin';

var reads = Ember.computed.reads;

/**
  `x-img` renders a stateful `<img>` element whose loading and
  error states can be observed, and whose class names are updated accordingly.

  Instances of `x-img` can be created using the `img` Handlebars helper.
  ```handlebars
  {{img src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```

  @class XImg
  @extends Ember.Component
  @uses ImageLoaderMixin
**/
var XImg = Ember.Component.extend( ImageLoaderMixin, {
  tagName: 'img',
  attributeBindings: ['alt', 'width', 'height'],

  /**
    @property imageLoader
    @type Object
    @default element
  */
  imageLoader: reads('element'),

  /**
    @private

    Cancels slow loading images when destroying view.
    Ember routing seems to hang otherwise.

    @method _cancelLoadOnDestroy
  */
  _cancelLoadOnDestroy: Ember.on('willDestroyElement', function() {
    this.cancelImageLoad();
  })
});

export default XImg;
