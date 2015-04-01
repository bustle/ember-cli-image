import Ember from 'ember';
import ImageStateMixin from '../mixins/image-state-mixin';
import ImageChild from './image-child';
import BackgroundImageChild from './background-image-child';

var reads = Ember.computed.reads;

/**
  `ImageContainer` is a container component with a stateful image
  (`XImg` or `BackgroundImage`) as a child component.
  Class names are updated according to the image's state.

  Instances of `ImageContainer` can be created using the `image` Handlebars helper.
  ```handlebars
  {{image src="img/image1.jpg" alt="Image" width=100 height=100}}
  ```

  @class ImageContainer
  @extends Ember.ContainerView
  @uses ImageStateMixin
**/
var ImageContainer = Ember.ContainerView.extend( ImageStateMixin, {
  classNames: ['image-view'],
  loadingClass: 'image-loading',
  errorClass: 'image-error',

  /**
    If `background` is true, the container uses a `BackgroundImageView`
    as its child image view instead of the default `ImgView`

    @property background
    @type Boolean
    @default false
  */
  background: false,

  /**
    Proxy to child image's isLoading property

    @property isLoading
    @type Boolean
    @default false
  */
  isLoading: reads('imageView.isLoading'),

  /**
    Proxy to child image's isError property

    @property isError
    @type Boolean
    @default false
  */
  isError: reads('imageView.isError'),

  /**
    The child image view which is either an `ImageView` or
    `BackgroundImageView` based on the `background` property.

    @property imageView
    @type Ember.View
    @default Ember.ImgView
  */
  imageView: Ember.computed('background', function() {
    if(this.get('background')) {
      return BackgroundImageChild.create();
    }
    return ImageChild.create();
  }),

  /**
    @method _addImageViewChild
    @private
    Adds the sole child imageView
  */
  _addImageViewChild: Ember.on('init', function() {
    this.pushObject(this.get('imageView'));
  }),

  /**
    @method _onImageViewChanged
    Observes when the type of imageView is updated
    and recreates child views accordingly.
  */
  _onImageViewChanged: Ember.observer('imageView', function() {
    this.removeAllChildren();
    this._addImageViewChild();
  })

});

export default ImageContainer;
