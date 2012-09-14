(function() {

    Backbone.ViewStack = Backbone.View.extend({

        constructor: function() {
            Backbone.View.prototype.constructor.apply(this, arguments);

            this._stack = [];
            this._defaultEl = this.$el;
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

        },

        render: function() {
            var view = this.activeView();

            if (view) {
                this.setElement(view.$el);
            } else {
                this.setElement(this._defaultEl);
            }

            return this;
        }

    });

    Backbone.ViewSelector = null;

})();