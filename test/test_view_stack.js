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
            viewStack.pushView(foo);
            assert.equal(viewStack.$el.html(), '<div>foo</div>');
        });

        it('adds view stack to view', function() {
            viewStack.pushView(foo);
            assert.equal(foo.viewStack, viewStack);
        });

        it('emits a `pushed` event', function(done) {
            viewStack.on('pushed', function(view) {
                assert.equal(view, foo);
                done();
            });
            viewStack.pushView(foo);
        });
    });

    describe('when popping view', function() {
        var foo, bar;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            bar = new Backbone.TextView({ text: 'bar' });

            viewStack.pushView(foo);
            viewStack.pushView(bar);
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

        it('emits a `popped` event', function(done) {
            viewStack.on('popped', function(view) {
                assert.equal(view, bar);
                done();
            });
            viewStack.popView();
        });
    });

    describe('when replacing a view', function() {
        var foo, bar;

        beforeEach(function() {
            foo = new Backbone.TextView({ text: 'foo' });
            bar = new Backbone.TextView({ text: 'bar' });
        });

        it('shows replaced view', function() {
            viewStack.pushView(foo);
            viewStack.replaceView(bar);

            assert.equal(viewStack.$el.html(), '<div>bar</div>');
        });

        it('removes previous view from stack', function() {
            viewStack.pushView(foo);
            viewStack.replaceView(bar);
            viewStack.popView();

            assert.equal(viewStack.$el.html(), '');
        });

        it('removes view stack from view', function() {
            viewStack.pushView(foo);
            var view = viewStack.replaceView(bar);
            assert.ok(!view.viewStack);
        });

        it('throws error if stack is empty', function() {
            assert.throws(function() {
                viewStack.replaceView(bar);
            });
        });

        it('emits a `popped` event', function(done) {
            viewStack.pushView(foo);
            viewStack.on('popped', function(view) {
                assert.equal(view, foo);
                done();
            });
            viewStack.replaceView(bar);
        });

        it('emits a `pushed` event', function(done) {
            viewStack.pushView(foo);
            viewStack.on('pushed', function(view) {
                assert.equal(view, bar);
                done();
            });
            viewStack.replaceView(bar);
        });

        it('emits a `replaced` event', function(done) {
            viewStack.pushView(foo);
            viewStack.on('replaced', function(pushed, popped) {
                assert.equal(pushed, bar);
                assert.equal(popped, foo);
                done();
            });
            viewStack.replaceView(bar);
        });
    });
});