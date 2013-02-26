var assert = chai.assert;

describe('ViewPort', function() {
    var foo, bar, viewport;

    beforeEach(function() {
        foo = new Backbone.TextView({ text: 'foo' });
        bar = new Backbone.TextView({ text: 'bar' });
        viewport = new Backbone.ViewKit.ViewPort();
    });

    it('is initally empty', function() {
        assert.equal(viewport.$el.html(), '');
    });

    it('renders active view', function() {
        foo.render();
        viewport.getView = function() {
            return foo;
        };

        assert.equal(viewport.render().$el.html(), '<div>foo</div>');
    });

    it('triggers event when view becomes active', function(done) {
        foo.on('inview', function(vp) {
            assert.equal(vp, viewport);
            done();
        });

        viewport.getView = function() {
            return foo;
        };

        viewport.render();
    });

    it('triggers event when view becomes inactive', function(done) {
        viewport.getView = function() {
            return foo;
        };

        viewport.render();

        foo.on('outview', function(vp) {
            assert.equal(vp, viewport);
            done();
        });

        viewport.getView = function() {
            return bar;
        };

        viewport.render();
    });
});