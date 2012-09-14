var assert = chai.assert;

describe('ViewSelector', function() {
    var viewSelector, foo, bar;

    beforeEach(function() {
        viewSelector = new Backbone.ViewSelector();

        foo = new Backbone.TextView({ text: 'foo' });
        bar = new Backbone.TextView({ text: 'bar' });
        foo.render();
        bar.render();
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
        beforeEach(function() {
            viewSelector.setViews([foo, bar]);
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
            assert.equal(viewSelector.$el.html(), 'foo');

            viewSelector.selectView(1);
            assert.equal(viewSelector.$el.html(), 'bar');
        });

        it('adds view selector to view', function() {
            assert.equal(foo.viewSelector, viewSelector);
        });
    });
});