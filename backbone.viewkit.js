(function() {

    Backbone.ViewPort = Backbone.View.extend({

        constructor: function() {
            Backbone.View.prototype.constructor.apply(this, arguments);

            this._originalEl = this.$el;
        },

        activeView: function() {
            return null;
        },

        render: function() {
            var view = this.activeView();

            if (view) {
                this.setElement(view.$el);
            } else {
                this.setElement(this._originalEl);
            }

            return this;
        }

    });

    Backbone.ViewStack = Backbone.ViewPort.extend({

        constructor: function() {
            Backbone.ViewPort.prototype.constructor.apply(this, arguments);

            this._stack = [];
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
            var view = this._stack.pop();

            if (view) {
                this.closeView(view);
            }

            this.render();
            return view;
        },

        replaceView: function(view) {
            var popped = this._stack.pop();

            if (popped) {
                this.closeView(popped);
            }

            this.pushView(view);
            return popped;
        },

        closeView: function(view) {
            delete view.viewStack;
        }

    });

    Backbone.ViewSelector = Backbone.ViewPort.extend({

        constructor: function() {
            Backbone.ViewPort.prototype.constructor.apply(this, arguments);

            this._views = [];
            this._index = null;
        },

        activeView: function() {
            return this._views[this._index];
        },

        setViews: function(views) {
            var self = this;

            if (this._views) {
                _.each(this._views, function(view) {
                    self.closeView(view);
                });
            }

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