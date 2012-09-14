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
            this.closeView(view);
            this.render();
        },

        replaceView: function(view) {
            this._stack.pop();
            this.pushView(view);
        },

        closeView: function(view) {

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
            this._views = views;
        },

        selectView: function(index) {
            if (index >= this._views.length || index < 0) {
                throw new Error('Index out of bounds');
            }

            this._index = index;
            this.render();
        }

    });

})();