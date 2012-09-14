var assert = chai.assert;

describe('ViewStack', function() {
    var viewStack;

    beforeEach(function() {
        viewStack = new Backbone.ViewStack();
    });

    describe('when pushing view', function() {
        var foo;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            viewStack.pushView(foo.render());
        });

        it('shows pushed view', function() {
            assert.equal(viewStack.$el.html(), 'foo');
        });

        it('adds view stack to view', function() {
            assert.equal(foo.viewStack, viewStack);
        });
    });

    describe('when popping view', function() {
        var foo, bar;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            bar = new Backbone.TextView({ text: 'bar' });

            viewStack.pushView(foo.render());
            viewStack.pushView(bar.render());
        });

        it('shows previous view', function() {
            assert.equal(viewStack.$el.html(), 'bar');

            viewStack.popView();

            assert.equal(viewStack.$el.html(), 'foo');
        });

        it('shows nothing when all views are popped', function() {
            viewStack.popView();
            viewStack.popView();
            viewStack.popView();

            assert.equal(viewStack.$el.html(), '');
        });

        it('removes view stack from view', function() {
            var view = viewStack.popView();
            assert.ok(!view.viewStack);
        });
    });

    describe('when replacing a view', function() {
        var foo, bar;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            bar = new Backbone.TextView({ text: 'bar' });

            viewStack.pushView(foo.render());
        });

        it('shows replaced view', function() {
            viewStack.replaceView(bar.render());

            assert.equal(viewStack.$el.html(), 'bar');
        });

        it('removes previous view from stack', function() {
            viewStack.replaceView(bar.render());
            viewStack.popView();

            assert.equal(viewStack.$el.html(), '');
        });

        it('removes view stack from view', function() {
            var view = viewStack.replaceView(bar.render());
            assert.ok(!view.viewStack);
        });
    });
});