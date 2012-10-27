(function() {

    var support = 'ontouchstart' in window;
    var touch = {};

    function touchstart(e) {
        e = e.originalEvent;

        var now = Date.now();
        var delta = now - (touch.last || now);
        var target = e.touches[0].target;

        touch.target = target.tagName ? target : target.parentNode;
        touch.x1 = e.touches[0].pageX;
        touch.y1 = e.touches[0].pageY;
        touch.last = now;
    }

    function touchmove(e) {
        e = e.originalEvent;

        touch.x2 = e.touches[0].pageX;
        touch.y2 = e.touches[0].pageY;
    }

    function touchend(e) {
        e = e.originalEvent;

        if (touch.x2 > 0 || touch.y2 > 0) {
            var dx = Math.abs(touch.x1 - touch.x2);
            var dy = Math.abs(touch.y1 - touch.y2);

            if (dx > 30 || dy > 30) {
                if (dx >= dy) {
                    var direction = touch.x1 - touch.x2 > 0 ? 'Left' : 'Right';
                } else {
                    var direction = touch.y1 - touch.y2 > 0 ? 'Up' : 'Down';
                }

                $(touch.target).trigger('swipe');
                $(touch.target).trigger('swipe' + direction);
            }

            touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
        } else {
            $(touch.target).trigger('tap');
            touch = {};
        }
    }

    function touchcancel(e) {
        touch = {};
    }

    function click(e) {
        var prevent = (e.target.type !== 'checkbox');
        if (prevent) e.preventDefault();
        if (!support) $(e.target).trigger('tap');
    }

    $(function() {
        $('body')
            .bind('touchstart', touchstart)
            .bind('touchmove', touchmove)
            .bind('touchend', touchend)
            .bind('touchcancel', touchcancel)
            .bind('click', click);
    });

})();