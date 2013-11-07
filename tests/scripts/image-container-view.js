var get = Ember.get, set = Ember.set;

var testRemoteSrc = 'https://raw.github.com/emberjs/website/master/source/images/tomster-sm.png',
    testSrcInvalid = 'fake-invalid-src';

var appendView = function(view) {
  Ember.run(function() { view.appendTo('#qunit-fixture'); });
},
afterRender = function(callback) {
  Ember.run.scheduleOnce('afterRender', null, callback);
}

//-----------------------------------------------------------

module('Ember.ImageContainerView');

test('can create image container view', function() {
  var view = Ember.ImageContainerView.create();
  ok( view, 'ImageContainerView created' );
});

test('can create via handlebars helper', function() {
  var testAlt = 'test', testW = 100, testH = 200;

  var view = Ember.View.create({
    template: Ember.Handlebars.compile(Ember.String.fmt('{{image src="%@" alt="%@" width=%@ height=%@}}', [testRemoteSrc, testAlt, testW, testH]))
  });

  appendView(view);

  var imgViews = view.$().find('img');
  equal(imgViews.length, 1, 'helper rendered an instance of the view');
  equal(imgViews.attr('src'), testRemoteSrc, 'src attribute rendered');
  equal(imgViews.attr('alt'), testAlt, 'alt attribute rendered');
  equal(imgViews.attr('width'), testW, 'width attribute rendered');
  equal(imgViews.attr('height'), testH, 'height attribute rendered');
});

