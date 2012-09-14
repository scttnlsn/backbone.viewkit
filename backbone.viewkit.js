(function() {

    Backbone.ViewPort = Backbone.View.extend({

        activeView: function() {
            return null;
        },

        render: function() {
            this.$el.empty();

            var view = this.activeView();

            if (view) {
                this.$el.html(view.$el);
                view.delegateEvents();
            }

            return this;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            var view = this.activeView();
            if (view) {
                view.delegateEvents();
            }
        }

    });

    Backbone.ViewStack = Backbone.ViewPort.extend({

        constructor: function() {
            this._stack = [];

            Backbone.ViewPort.prototype.constructor.apply(this, arguments);
        },

        activeView: function() {
            return this._stack[this._stack.length - 1];
        },

        pushView: function(view) {
            view.viewStack = this;

            this._stack.push(view);
            this.render();
        },

        popView: function() {
            var popped = this._stack.pop();

            if (popped) {
                this.closeView(popped);
            }

            this.render();

            return popped;
        },

        replaceView: function(view) {
            if (this._stack.length === 0) {
                throw new Error('View stack is empty');
            }

            var replaced = this._stack.pop();

            if (replaced) {
                this.closeView(replaced);
            }

            this.pushView(view);

            return replaced;
        },

        closeView: function(view) {
            delete view.viewStack;
        }

    });

    Backbone.ViewSelector = Backbone.ViewPort.extend({

        constructor: function() {
            this._views = [];
            this._index = null;

            Backbone.ViewPort.prototype.constructor.apply(this, arguments);
        },

        activeView: function() {
            return this._views[this._index];
        },

        setViews: function(views) {
            var self = this;

            _.each(this._views, function(view) {
                self.closeView(view);
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

        closeView: function(view) {
            delete view.viewSelector;
        }

    });

})();