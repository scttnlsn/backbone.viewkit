var assert = chai.assert;

describe('ViewSelector', function() {
    var viewSelector, foo, bar;

    beforeEach(function() {
        foo = new Backbone.TextView({ text: 'foo' }).render();
        bar = new Backbone.TextView({ text: 'bar' }).render();

        viewSelector = new Backbone.ViewKit.ViewSelector({ views: [foo, bar] });
    });

    it('manages list of views', function() {
        assert.deepEqual(viewSelector.getViews(), [foo, bar]);
    });

    describe('when setting views', function() {
        beforeEach(function() {
            viewSelector.setViews([foo, bar]);
        });

        it('adds view selector to view', function() {
            assert.equal(foo.viewSelector, viewSelector);
            assert.equal(bar.viewSelector, viewSelector);
        });
    });

    describe('when selecting view', function() {
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