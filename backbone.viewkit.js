(function() {

    // Views
    // ---------------

    Backbone.ViewPort = Backbone.View.extend({

        getView: function() {
            return null;
        },

        render: function(transition) {
            var view = this.getView();
            var current = this._current;

            if (view === current) return this;

            if (view) {
                if (current && transition) {
                    transition.run(this.$el, current.$el, view.$el, function() {
                        current.remove();
                    });
                } else {
                    this.$el.html(view.$el);
                }

                view.delegateEvents();

                this._current = view;
            } else {
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

    Backbone.ViewStack = Backbone.ViewPort.extend({

        constructor: function(options) {
            options || (options = {});

            this._stack = stack();
            this.transitions = options.transitions || {};

            Backbone.ViewPort.prototype.constructor.apply(this, arguments);
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

    Backbone.ViewSelector = Backbone.ViewPort.extend({

        constructor: function() {
            this._views = [];
            this._index = null;

            Backbone.ViewPort.prototype.constructor.apply(this, arguments);
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

    Backbone.Transition = function(params) {
        _.extend(this, params);
        _.extend(this, Backbone.Events);
    };

    Backbone.Transition.extend = Backbone.View.extend;

    Backbone.Transitions = {};

    // Slide

    Backbone.Transitions.Slide = Backbone.Transition.extend({

        transform: {
            duration: 0.4,
            easing: 'ease-out',
            delay: 0
        },

        run: function(container, from, to, callback) {
            this.trigger('start');

            var width = container.width();

            var transition = [
                '-webkit-transform',
                this.transform.duration + 's',
                this.transform.easing,
                this.transform.delay + 's'
            ].join(' ');

            from.css('left', 0);
            from.css('-webkit-transition', transition);

            to.css('left', this.reverse ? -width : width);
            to.css('-webkit-transition', transition);
            container.append(to);

            // Reflow
            container.css('width');

            var delta = this.reverse ? width : -width;
            var views = from.add(to);
            views.css('-webkit-transform', 'translateX(' + delta + 'px)');

            from.one('webkitTransitionEnd', transitionEnd);
            to.one('webkitTransitionEnd', transitionEnd);

            var count = 0;
            var self = this;

            function transitionEnd() {
                if (++count !== 2) return;

                callback();

                to.css('-webkit-transition', '');
                to.css('left', '');
                to.css('-webkit-transform', '');

                from.css('-webkit-transition', '');
                from.css('left', '');
                from.css('-webkit-transform', '');

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