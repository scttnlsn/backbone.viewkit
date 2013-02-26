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

            var detach = function() {
                if (current) {
                    current.$el.detach();
                }
            };

            if (this._current) this._current.trigger('outview', this);

            if (view) {
                this.$el.append(view.$el);

                if (current && transition) {
                    transition.run(current.$el, view.$el, function() {
                        detach();
                    });
                } else {
                    detach();
                }

                this._current = view;
                this._current.trigger('inview', this);
            } else {
                detach();
                this._current = null;
                this.$el.empty();
            }

            return this;
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
            view.render();
            this.trigger('pushed', view);
        },

        popView: function(transition) {
            transition || (transition = this.transitions.pop);

            var self = this;
            var popped = this._stack.pop();

            var done = function() {
                if (popped) {
                    self._cleanup(popped);
                    popped.remove();
                }

                if (transition) {
                    transition.off('end', done);
                }
            };

            if (transition) {
                transition.on('end', done);
            } else {
                done();
            }

            this.render(transition);
            this.trigger('popped', popped);

            return popped;
        },

        replaceView: function(view, transition) {
            if (this._stack.empty()) {
                throw new Error('View stack is empty');
            }

            var popped = this._stack.pop();

            if (popped) {
                this._cleanup(popped);
            }

            view.viewStack = this;
            this._stack.push(view);

            this.render(transition || this.transitions.replace);
            view.render();
            this.trigger('popped', popped);
            this.trigger('pushed', view);
            this.trigger('replaced', view, popped);

            return popped;
        },

        _cleanup: function(view) {
            delete view.viewStack;
        }

    });

    ViewKit.ViewSelector = ViewKit.ViewPort.extend({

        constructor: function(options) {
            this._views = [];
            this._index = null;

            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);

            ViewKit.ViewPort.prototype.constructor.apply(this, arguments);
        },

        getView: function() {
            return this._views[this._index];
        },

        getViews: function() {
            return this._views;
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
            this._index = null;
        },

        selectView: function(index, transition) {
            if (index >= this._views.length || index < 0) {
                throw new Error('Index out of bounds');
            }

            this._index = index;
            this.render(transition || this.transition);
            this.trigger('selected', this.getView(), index);
        },

        _cleanup: function(view) {
            delete view.viewSelector;
        }

    });

    // Transitions
    // ---------------

    ViewKit.Transition = function(options) {
        options || (options = {});

        this.initialize(options);

        if (this.transition) {
            _.extend(this.transition, _.pick(options, 'duration', 'easing', 'delay'));
        }
    };

    var Config = ViewKit.Transition.Config = {
        transform: '-webkit-transform',
        transition: '-webkit-transition',
        transitionEnd: 'webkitTransitionEnd'
    };

    _.extend(ViewKit.Transition.prototype, Backbone.Events, {

        // Override these
        initialize: function(options) {},
        before: function(from, to) {},
        after: function(from, to) {},
        cleanup: function(from, to) {},

        run: function(from, to, callback) {
            this.trigger('start');

            this.before(from, to);

            if (!this.transition) {
                this.after(from, to);
                this.cleanup(from, to);
                this.trigger('end');
                return callback();
            }

            var els = from.add(to);
            var transition = [
                this.transition.property,
                this.transition.duration + 's',
                this.transition.easing,
                this.transition.delay + 's'
            ].join(' ');

            // Transition
            els.css(Config.transition, transition);
            els.on(Config.transitionEnd, transitionEnd);
            this.after(from, to);

            var count = 0;
            var self = this;

            function transitionEnd() {
                if (++count !== 2) return;

                els.css(Config.transition, '');
                els.off(Config.transitionEnd, transitionEnd);
                self.cleanup(from, to);

                self.trigger('end');
                callback();
            }
        }

    });

    ViewKit.Transition.extend = Backbone.View.extend;

    ViewKit.Transitions = {};

    // Slide

    ViewKit.Transitions.Slide = ViewKit.Transition.extend({

        transition: {
            property: Config.transform,
            duration: 0.4,
            easing: 'ease-out',
            delay: 0
        },

        initialize: function(options) {
            this.reverse = !!options.reverse;
        },

        before: function(from, to) {
            var width = from.parent().width();
            from.css('left', 0);
            to.css('left', this.reverse ? -width : width);
        },

        after: function(from, to) {
            var width = from.parent().width();
            var delta = this.reverse ? width : -width;
            var els = from.add(to);

            els.css(Config.transform, 'translateX(' + delta + 'px)');
        },

        cleanup: function(from, to) {
            var els = from.add(to);

            els.css(Config.transform, '');
            els.css('left', '');
        }

    });

    // Fade

    ViewKit.Transitions.Fade = ViewKit.Transition.extend({

        transition: {
            property: 'opacity',
            duration: 0.4,
            easing: 'ease-out',
            delay: 0
        },

        before: function(from, to) {
            to.css('opacity', 0);
            from.css('opacity', 1);
        },

        after: function(from, to) {
            to.show().css('opacity', 1);
            from.css('opacity', 0);
        },

        cleanup: function(from, to) {
            var views = from.add(to);
            views.css('opacity', '');
            views.css('display', '');
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