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

module('Ember.ImageView');

test('can create img view', function() {
  var view = Ember.ImageView.create();
  ok( view, 'ImageView created' );
});

test('can create via handlebars helper', function() {
  var testAlt = 'test', testW = 100, testH = 200;

  var view = Ember.View.create({
    template: Ember.Handlebars.compile(Ember.String.fmt('{{img src="%@" alt="%@" width=%@ height=%@}}', [testRemoteSrc, testAlt, testW, testH]))
  });

  appendView(view);

  var ImageViews = view.$().find('img');
  equal(ImageViews.length, 1, 'helper rendered an instance of the view');
  equal(ImageViews.attr('src'), testRemoteSrc, 'src attribute rendered');
  equal(ImageViews.attr('alt'), testAlt, 'alt attribute rendered');
  equal(ImageViews.attr('width'), testW, 'width attribute rendered');
  equal(ImageViews.attr('height'), testH, 'height attribute rendered');
});

asyncTest('loaded state triggered', function() {
  expect(5);
  var view = Ember.ImageView.create({
    src: testRemoteSrc
  });

  view.on('didLoad', function() {
    ok( true, 'didLoad event triggered' );
    ok( !view.get('isLoading'), 'not in loading state' );
    ok( !view.get('isError'), 'not in error state' );
    afterRender(function() {
      ok( !view.$().hasClass(view.get('loadingClass')), 'view does not have loading class' );
      ok( !view.$().hasClass(view.get('errorClass')), 'view does not have error class' );
      start();
    });
  });

  appendView(view);
});

asyncTest('error state triggered', function() {
  expect(5);
  var view = Ember.ImageView.create({
    src: testSrcInvalid
  });

  view.on('becameError', function() {
    ok( true, 'becameError event triggered' );
    ok( view.get('isError'), 'in error state' );
    ok( !view.get('isLoading'), 'not in loading state' );
    afterRender(function() {
      ok( view.$().hasClass(view.get('errorClass')), 'view has error class' );
      ok( !view.$().hasClass(view.get('loadingClass')), 'view does not have loading class' );
      start();
    });
  });

  appendView(view);
});

test('subclasses can modify final src', function() {
  var subclass = Ember.ImageView.extend({
    url: Ember.computed(function() {
      return this.get('src') + '?1';
    }).property('src')
  });

  var view = subclass.create({
    src: testRemoteSrc
  });

  appendView(view);

  equal( view.$().attr('src'), testRemoteSrc + '?1',  'src was modified' );
});
