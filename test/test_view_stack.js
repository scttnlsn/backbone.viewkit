var assert = chai.assert;

describe('ViewStack', function() {
    var viewStack;

    beforeEach(function() {
        viewStack = new Backbone.ViewKit.ViewStack();
    });

    describe('when pushing view', function() {
        var foo;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
        });

        it('shows pushed view', function() {
            viewStack.pushView(foo.render());
            assert.equal(viewStack.$el.html(), '<div>foo</div>');
        });

        it('adds view stack to view', function() {
            viewStack.pushView(foo.render());
            assert.equal(foo.viewStack, viewStack);
        });

        it('emits a `pushed` event', function(done) {
            viewStack.on('pushed', function(view) {
                assert.equal(view, foo);
                done();
            });
            viewStack.pushView(foo.render());
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
            assert.equal(viewStack.$el.html(), '<div>bar</div>');

            viewStack.popView();

            assert.equal(viewStack.$el.html(), '<div>foo</div>');
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
        });

        it('shows replaced view', function() {
            viewStack.pushView(foo.render());
            viewStack.replaceView(bar.render());

            assert.equal(viewStack.$el.html(), '<div>bar</div>');
        });

        it('removes previous view from stack', function() {
            viewStack.pushView(foo.render());
            viewStack.replaceView(bar.render());
            viewStack.popView();

            assert.equal(viewStack.$el.html(), '');
        });

        it('removes view stack from view', function() {
            viewStack.pushView(foo.render());
            var view = viewStack.replaceView(bar.render());
            assert.ok(!view.viewStack);
        });

        it('throws error if stack is empty', function() {
            assert.throws(function() {
                viewStack.replaceView(bar.render());
            });
        });
    });
});