import Ember from 'ember';
import ImageLoaderMixin from '../mixins/image-loader-mixin';

/**
  `x-img` renders a stateful `<img>` element whose loading and
  error states can be observed, and whose class names are updated accordingly.

  Instances of `x-img` can be created using the `img` Handlebars helper.
  ```handlebars
  {{img src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```

  @class ImgComponent
  @extends Ember.Component
  @uses ImageLoaderMixin
**/
var ImgComponent = Ember.Component.extend( ImageLoaderMixin, {
  tagName: 'img',
  attributeBindings: ['alt', 'width', 'height'],

  /**
    @property imageLoader
    @type Object
    @default the img element itself
  */
  imageLoader: Ember.computed.reads('element'),

  /**
    @private
    @method _cancelLoadOnDestroy
    Cancels slow loading images when destroying view.
    Ember routing seems to hang otherwise.
  */
  _cancelLoadOnDestroy: Ember.on('willDestroyElement', function() {
    this.cancelImageLoad();
  })
});

export default ImgComponent;
