var assert = chai.assert;

describe('ViewSelector', function() {
    var viewSelector;

    beforeEach(function() {
        viewSelector = new Backbone.ViewSelector();
    });

    describe('when selecting view', function() {
        var foo, bar;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            bar = new Backbone.TextView({ text: 'bar' });
            foo.render();
            bar.render();

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
    });
});