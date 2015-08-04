Backbone.ViewKit
===

Backbone.ViewKit is a Backbone plugin for managing views and view transitions, geared primarily toward mobile applications.

**Note**: This is very much still an experiment/work in progress.  It has only been developed/tested in Chrome and Safari (desktop and iOS) at this point.

## Demo

A demo (of the included example) is available here: [http://fiddle.jshell.net/scttnlsn/xQxRY/show/](http://fiddle.jshell.net/scttnlsn/xQxRY/show/).  You can view/edit the code here: [http://jsfiddle.net/scttnlsn/xQxRY/](http://jsfiddle.net/scttnlsn/xQxRY/).

## Backbone.ViewKit.ViewPort

A ViewPort is a Backbone.View responsible for rendering other views inside of it (one at a time) and serves as a base class for other Backbone.ViewKit classes.  To build custom ViewPorts, override the `getView` method and return a Backbone.View.  The returned view will be displayed inside the ViewPort when the ViewPort is rendered.  ViewPorts can also optionally transition between views (see [Backbone.ViewKit.Transition](https://github.com/scttnlsn/backbone.viewkit#backboneviewkittransition)).

```javascript
var foo = new Backbone.View({ el: $('<div>foo</div>') });
var bar = new Backbone.View({ el: $('<div>bar</div>') });
var baz = new Backbone.View({ el: $('<div>baz</div>') });

var CycleView = Backbone.ViewKit.ViewPort.extend({

    initialize: function() {
        this.index = 0;
        this.views = [foo, bar, baz];
    },

    getView: function() {
        var view = this.views[this.index];
        this.index = (this.index + 1) % this.views.length;
        return view;
    }

});

var cycle = new CycleView();
cycle.render(); // renders 'foo'
cycle.render(); // renders 'bar'
cycle.render(); // renders 'baz'
cycle.render(); // renders 'foo'
```

### `getView()`

Returns the currently "active" view to be rendered in the view port.

### `render([transition])`

Render the view returned from `getView` in the view port, optionally using the given transition.  Emits an `inview` event on
the view entering the viewport and an `outview` on the view exiting the viewport.

## Backbone.ViewKit.ViewSelector

A ViewSelector is a ViewPort that manages an ordered set of views which can be selected and rendered one at a time.

```javascript
var viewSelector = new Backbone.ViewKit.ViewSelector({ views: [foo, bar, baz] });

viewSelector.selectView(0); // renders 'foo'
viewSelector.selectView(1); // renders 'bar'
viewSelector.selectView(2); // renders 'baz'
viewSelector.selectView(3); // throws error
```

Views that are managed by the selector will be able to access the selector via `this.viewSelector`.

### `new Backbone.ViewKit.ViewSelector([options])`

When creating a new view selector, optionally initialize it with an array of views and/or a default transition.

```javascript
new Backbone.ViewKit.ViewSelector({
    views: [foo, bar, baz],
    transition: new Backbone.ViewKit.Transitions.Fade()
});
```

### `setViews(views)`

Set the views that the selector will manage.  This replaces all existing views with those given and clears the previously selected index.

```javascript
viewSelector.setViews([foo, bar, baz]);
```

### `selectView(index, [transition])`

Select the view at the given index and render it in the view port.  Optionally specify a transition.  Throws an error if the index is out of bounds.  Emits a `selected` event passing the selected view and the index respectively.

## Backbone.ViewKit.ViewStack

A ViewStack is a ViewPort that manages a stack of views.  New views can be displayed by pushing them on to the stack and one can revert to previously displayed views by popping the stack.

```javascript
var viewStack = new Backbone.ViewKit.ViewStack();

viewStack.pushView(foo); // renders 'foo'
viewStack.pushView(bar); // renders 'bar'
viewStack.popView(); // renders 'foo'
viewStack.pushView(bar); // renders 'bar'
viewStack.replaceView(baz); // renders 'baz'
viewStack.popView(); // renders 'foo'
```

Views that are pushed onto the stack will be able to access the stack via `this.viewStack`.

### `new Backbone.ViewKit.ViewStack([options])`

When creating a new view stack, optionally specify any default transitions.

```javascript
new Backbone.ViewKit.ViewStack({
    transitions: {
        push: new Backbone.ViewKit.Transitions.Slide(),
        pop: new Backbone.ViewKit.Transitions.Slide({ reverse: true })
    }
});
```

### `pushView(view, [transition])`

Push the given view onto the stack and render it in the view port.  Optionally specify a transition.  Emits a `pushed` event passing the pushed view.

### `popView([transition])`

Pop the current view off the top of the stack and render the previous view in the view port.  Returns the popped view.  Optionally specify a transition.  Emits a `popped` event passing the popped view.

### `replaceView(view, [transition])`

Replace the current view with the given view.  This effectively pops the stack and pushes the given view as a single operation.  Returns the replaced view.  Optionally specify a transition.  Throws an error if there is no view to replace.  Emits a `popped` event (see above), `pushed` event (see above), and `replaced` event passing the pushed view and the popped view respectively.

## Backbone.ViewKit.Transition

A Transition is responsible for handling the change between views returned by a ViewPort's `getView` method using CSS transitions.  There are a number of method "hooks" that can be overridden to implement custom transitions- check out the source of the transitions bundled with Backbone.ViewKit for more details.

### Backbone.ViewKit.Transitions.Slide

Slide (right to left by default) between views.  Accepts various optional parameters:

```javascript
new Backbone.ViewKit.Transitions.Slide({
    reverse: false, // right to left
    duration: 0.4, // seconds
    easing: 'ease-out',
    delay: 0 // seconds
});
```

### Backbone.ViewKit.Transitions.Fade

Crossfade between views.  Accepts various optional parameters:

```javascript
new Backbone.ViewKit.Transitions.Fade({
    duration: 0.4, // seconds
    easing: 'ease-out',
    delay: 0 // seconds
});
```
