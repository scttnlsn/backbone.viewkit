(function() {

    var ViewKit = Backbone.ViewKit = {};

    // Views
    // ---------------

    ViewKit.ViewPort = Backbone.View.extend({

        getView: function() {
            return null;
        },

        render: function(transition) {
            var view = this.getView();
            var current = this._current;

            if (view === current) return this;

            if (view) {
                this.$el.append(view.$el);

                if (current && transition) {
                    transition.run(current.$el, view.$el, function() {
                        current.remove();
                    });
                } else {
                    if (current) current.remove();
                }

                view.delegateEvents();

                this._current = view;
            } else {
                current.remove();
                this._current = null;
                this.$el.empty();
            }

            return this;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            var view = this.getView();
            if (view) {
                view.delegateEvents();
            }
        }

    });

    ViewKit.ViewStack = ViewKit.ViewPort.extend({

        constructor: function(options) {
            options || (options = {});

            this._stack = stack();
            this.transitions = options.transitions || {};

            ViewKit.ViewPort.prototype.constructor.apply(this, arguments);
        },

        getView: function() {
            return this._stack.top();
        },

        pushView: function(view, transition) {
            view.viewStack = this;

            this._stack.push(view);
            this.render(transition || this.transitions.push);
        },

        popView: function(transition) {
            var popped = this._stack.pop();

            if (popped) {
                this._cleanup(popped);
            }

            this.render(transition || this.transitions.pop);

            return popped;
        },

        replaceView: function(view, transition) {
            if (this._stack.empty()) {
                throw new Error('View stack is empty');
            }

            var replaced = this._stack.pop();

            if (replaced) {
                this._cleanup(replaced);
            }

            this.pushView(view, transition || this.transitions.replace);

            return replaced;
        },

        _cleanup: function(view) {
            delete view.viewStack;
        }

    });

    ViewKit.ViewSelector = ViewKit.ViewPort.extend({

        constructor: function() {
            this._views = [];
            this._index = null;

            ViewKit.ViewPort.prototype.constructor.apply(this, arguments);
        },

        getView: function() {
            return this._views[this._index];
        },

        setViews: function(views) {
            var self = this;

            _.each(this._views, function(view) {
                self._cleanup(view);
            });

            _.each(views, function(view) {
                view.viewSelector = self;
            });

            this._views = views;
        },

        selectView: function(index) {
            if (index >= this._views.length || index < 0) {
                throw new Error('Index out of bounds');
            }

            this._index = index;
            this.render();
        },

        _cleanup: function(view) {
            delete view.viewSelector;
        }

    });

    // Transitions
    // ---------------

    ViewKit.Transition = function(params) {
        this.props = {
            transition: '-webkit-transition',
            transform: '-webkit-transform'
        };

        this.events = {
            transition: 'webkitTransitionEnd'
        };

        _.extend(this, params);
        _.extend(this, Backbone.Events);
    };

    ViewKit.Transition.extend = Backbone.View.extend;

    ViewKit.Transitions = {};

    // Slide

    ViewKit.Transitions.Slide = ViewKit.Transition.extend({

        transform: {
            duration: 0.4,
            easing: 'ease-out',
            delay: 0
        },

        run: function(from, to, callback) {
            this.trigger('start');

            var width = from.parent().width();

            var transition = [
                this.props.transform,
                this.transform.duration + 's',
                this.transform.easing,
                this.transform.delay + 's'
            ].join(' ');

            from.css('left', 0);
            from.css(this.props.transition, transition);

            to.css('left', this.reverse ? -width : width);
            to.css(this.props.transition, transition);

            var delta = this.reverse ? width : -width;
            var views = from.add(to);
            views.css(this.props.transform, 'translateX(' + delta + 'px)');
            views.on(this.events.transition, transitionEnd);

            var count = 0;
            var self = this;

            function transitionEnd() {
                if (++count !== 2) return;

                callback();

                views.css(self.props.transition, '');
                views.css('left', '');
                views.css(self.props.transform, '');

                self.trigger('end');
            }
        }

    });

    // Helpers
    // ---------------

    function stack() {
        return {
            items: [],

            push: function(item) {
                this.items.push(item);
            },

            pop: function() {
                return this.items.pop();
            },

            top: function() {
                return this.items[this.items.length - 1];
            },

            empty: function() {
                return this.items.length === 0;
            }
        };
    }

})();