var assert = chai.assert;

describe('ViewSelector', function() {
    var foo, bar;

    beforeEach(function() {
        foo = new Backbone.TextView({ text: 'foo' }).render();
        bar = new Backbone.TextView({ text: 'bar' }).render();
    });

    it('manages list of views', function() {
        var viewSelector = new Backbone.ViewKit.ViewSelector({ views: [foo, bar] });
        assert.deepEqual(viewSelector.getViews(), [foo, bar]);
    });

    describe('when setting views', function() {
        var viewSelector;

        beforeEach(function() {
            viewSelector = new Backbone.ViewKit.ViewSelector();
        });

        it('adds view selector to view', function() {
            viewSelector.setViews([foo, bar]);
            assert.equal(foo.viewSelector, viewSelector);
            assert.equal(bar.viewSelector, viewSelector);
        });

        it('resets selected index', function() {
            viewSelector.setViews([foo, bar]);
            viewSelector.selectView(0);
            viewSelector.setViews([foo, bar]);
            assert.equal(viewSelector.getView(), null);
        });
    });

    describe('when selecting view', function() {
        var viewSelector;

        beforeEach(function() {
            viewSelector = new Backbone.ViewKit.ViewSelector({ views: [foo, bar] });
        });

        it('throws error when index is out of range', function() {
            assert.throws(function() {
                viewSelector.selectView(-1);
            });

            assert.throws(function() {
                viewSelector.selectView(2);
            });
        });

        it('shows selected view', function() {
            viewSelector.selectView(0);
            assert.equal(viewSelector.$el.html(), '<div>foo</div>');

            viewSelector.selectView(1);
            assert.equal(viewSelector.$el.html(), '<div>bar</div>');
        });

        it('adds view selector to view', function() {
            assert.equal(foo.viewSelector, viewSelector);
        });
    });
});