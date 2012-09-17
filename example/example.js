(function() {

    var viewSelector = new Backbone.ViewSelector();
    var viewStack = new Backbone.ViewStack();

    var TemplateView = Backbone.View.extend({

        className: 'page',

        initialize: function() {
            this.render();
        },

        render: function() {
            var template = _.template($(this.template).html());
            this.$el.html(template());
            return this;
        }

    });

    var TabsView = TemplateView.extend({

        template: '#tabs-template',

        events: {
            'click [data-tab]': 'selectTab'
        },

        selectTab: function(e) {
            var index = parseInt($(e.target).data('tab'), 10);
            viewSelector.selectView(index);
        }

    });

    var FooView = TemplateView.extend({

        template: '#foo-template',

        className: 'page foo',

        events: {
            'click .push': 'push'
        },

        push: function() {
            var bar = new BarView();
            var slide = new Backbone.Transitions.Slide();
            viewStack.pushView(bar, slide);
        }

    });

    var BarView = TemplateView.extend({

        template: '#bar-template',

        className: 'page bar',

        events: {
            'click .push': 'push',
            'click .pop': 'pop'
        },

        push: function() {
            var baz = new BazView();
            var slide = new Backbone.Transitions.Slide();
            this.viewStack.pushView(baz, slide);
        },

        pop: function() {
            var slide = new Backbone.Transitions.Slide({ reverse: true });
            this.viewStack.popView(slide);
        }

    });

    var BazView = TemplateView.extend({

        template: '#baz-template',

        className: 'page baz',

        events: {
            'click .pop': 'pop'
        },

        pop: function() {
            var slide = new Backbone.Transitions.Slide({ reverse: true });
            this.viewStack.popView(slide);
        }

    });

    var QuxView = TemplateView.extend({

        template: '#qux-template'

    });

    $(function() {
        var tabs = new TabsView();
        var foo = new FooView();
        var baz = new BazView();
        var qux = new QuxView();

        viewSelector.setViews([viewStack, qux]);
        viewSelector.selectView(0);

        viewStack.pushView(foo);

        $('#tabs').html(tabs.el);
        $('#content').html(viewSelector.el);
    });

})();