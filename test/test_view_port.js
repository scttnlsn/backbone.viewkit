var assert = chai.assert;

describe('ViewPort', function() {
    var viewport;

    beforeEach(function() {
        viewport = new Backbone.ViewPort();
    });

    it('is initally empty', function() {
        assert.equal(viewport.$el.html(), '');
    });

    it('renders active view', function() {
        var empty = true;
        var foo = new Backbone.TextView({ text: 'foo' });
        foo.render();

        viewport.activeView = function() {
            if (!empty) return foo;
        };

        assert.equal(viewport.render().$el.html(), '');
        empty = false;
        assert.equal(viewport.render().$el.html(), 'foo');
    });
});