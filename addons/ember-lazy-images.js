(function(Ember) {

/**
 * @class LazyImageLoader
 * Manages a queue of ImageViews and only loads them
 * when they are scrolled into the viewport.
 */
function LazyImageLoader(options) {
  var self = this;

  options = options || {};
  this.offset = parseInt(options.offset, 10) || 150;
  this.throttle = options.throttle || 200;

  this._guid = 0;
  this._queue = {};

  Ember.$(window).on('scroll', function() {
    Ember.run.throttle(self, self.render, self.throttle);
  }).on('resize', function() {
    Ember.run.throttle(self, self.render, self.throttle);
  });
}

LazyImageLoader.prototype.queueView = function(view) {
  var queueId = '' + this._guid;
  this._queue[queueId] = view;
  this._guid++;
  return queueId;
};

LazyImageLoader.prototype.dequeueView = function(view) {
  delete this._queue[view.queueId];
};

LazyImageLoader.prototype.render = function() {
  var queue = this._queue;
  var queueId, view, element;

  for (queueId in queue) {
    if (queue.hasOwnProperty(queueId)) {
      view = queue[queueId];
      element = view.get('element');
      if (this.checkIfInView(element)) {
        view.setProperties({ canLazyLoad: true, src: element.getAttribute('data-src') });
      }
    }
  }
};

LazyImageLoader.prototype.checkIfInView = function(element) {
  var rect = element.getBoundingClientRect();
  var offset = this.offset;

  return rect.bottom > 0 - offset &&
         rect.right > 0 - offset &&
         rect.left < (window.innerWidth || document.documentElement.clientWidth) + offset &&
         rect.top < (window.innerHeight || document.documentElement.clientHeight) + offset;
};


/**
 * LazyImageViewMixin
 * Mixin for ImageViews to use a LazyImageLoader to manage when
 * they should load their src.
 */
var LazyImageViewMixin = Ember.Mixin.create({
  attributeBindings: ['url:data-src'],
  canLazyLoad: false,

  // Override these methods to queue if not in view
  loadImageOnInsert: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, this._loadOrQueue);
  }),
  
  loadImageOnSrcChange: Ember.observer('url', function() {
    this.set('canLazyLoad', false);
    Ember.run.scheduleOnce('afterRender', this, this._loadOrQueue);
  }),

  _loadImageLazy: Ember.observer('canLazyLoad', function() {
    if (this.get('canLazyLoad')) {
      Ember.run.scheduleOnce('afterRender', this, this.loadImage);
      this.constructor.lazyLoader.dequeueView(this);
      this.get('element').removeAttribute('data-src');
    }
  }),

  _loadOrQueue: function() {
    var lazyLoader = this.constructor.lazyLoader;
    var isCurrentlyInView = lazyLoader.checkIfInView(this.get('element'));
    if (isCurrentlyInView) {
      this.set('canLazyLoad', true);
    } else {
      this.queueId = lazyLoader.queueView(this);
    }
  },

  _dequeueOnDestroy: Ember.on('willDestroyElement', function() {
    this.constructor.lazyLoader.dequeueView(this);
  })
});

// Create a default LazyImageLoader.
// To customize per application, create one and reopenClass on image views
var defaultLazyLoader = new LazyImageLoader();
Ember.ImageView.reopenClass({ lazyLoader: defaultLazyLoader });
Ember.BackgroundImageView.reopenClass({ lazyLoader: defaultLazyLoader });

// Apply the Mixin to ImageViews instances to make them lazy
Ember.ImageView.reopen( LazyImageViewMixin );
Ember.BackgroundImageView.reopen( LazyImageViewMixin, {
  style: Ember.computed('url', 'canLazyLoad', function() {
    if(this.get('canLazyLoad')) {
      return this._super();
    }
  })
});

}(Ember));
