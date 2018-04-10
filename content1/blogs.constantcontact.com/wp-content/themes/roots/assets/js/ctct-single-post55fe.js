// js file for single posts.

if (typeof(ctctblog) == 'undefined') {
    var ctctblog = {};
}

$(document).ready(function(){
    'use strict';
    // single post social buttons
    if ($('#entry-header-social-buttons').length) {
        ctctblog.socialbuttons('#entry-header-social-buttons');
        ctctblog.socialbuttons('#entry-footer-social-buttons');
    }
});

// similar posts ajax function.
ctctblog.getSimilarPost = function getSimilarPost(json) {
    'use strict';
    //incase we don't get an object back don't break anything.
    if (typeof json !== 'object') {
        json = {};
    }

    // set the defaults.
    json.action = 'getSimilarPost';
    json._wpnonce = $('#_wpnonce').val();
    json._wp_http_referer = $('[name="_wp_http_referer"]').val();

    var run_stop = false;
    function runAjax(json){
        $.ajax({
            url: '/wp-content/themes/roots/tribe-ajax-helper.php',
            method: 'POST',
            data: json
        }).success(function(data){
            // if at first we don't succeed try again, with less specifics.
            if (data === 'false') {
                json.orderby = 'date';
                json.meta_key = null;
                if (!run_stop) {
                    run_stop = true;
                    runAjax(json);
                }
            } else {
                // we have content place it on the page.
                var content,
                    h = '';
                try {
                    content = JSON.parse(data);
                } catch (e) {
                    content = null;
                }
                if ( content ) {
                    var $widget_wrapper = $('#similar-post-widget .similar-post-widget-wrapper');

                    h += '<a href="' + content.post_href + '" class="margin-top_16">' + content.post_title + '</a>';
                    $widget_wrapper.find('.similar-post-widget-inner').html(h);

                    // posts is ready to be displayed animate it on to the screen and set up the affix.
                    var offset = $widget_wrapper.offset(),
                        calculateBottom = function (){
                            return $('.blog-footer').outerHeight() + $('#footer-wrapper').outerHeight() + $('#comments').outerHeight() + 80;
                        };

                        //Issue with bootstrap affix. Commenting out for now.
                    $widget_wrapper.addClass('loaded').delay(300).affix({
                        offset: {
                            top: function() {
                                return (this.top = offset.top);
                            },
                            bottom: calculateBottom
                        }
                    });
                }
            }
        });
    }
    runAjax(json);
};

ctctblog.user_scrolled_past = function (section) {
    var viewTop = $(window).scrollTop();
    var viewBottom = viewTop + $(window).height();
    var sectionTop = $(section).offset().top;
    var sectionBottom = sectionTop + $(section).height() + 50;
    return ((sectionBottom >= viewTop) && (sectionBottom <= viewBottom));
};

ctctblog.sticky_sidebar_widget = function () {
    'use strict';
    var $widget_wrapper = $('#sticky-sidebar-widget .sticky-sidebar-widget-wrapper'),
        $before_widget = $('#sticky-sidebar-widget').prev(),
        offset = $widget_wrapper.offset(),
        visible = false,
        calculateBottom = function (){
            return $('.blog-footer').outerHeight() + $('#ctct-footer').outerHeight() + $('#comments').outerHeight() + 80;
        };

    $(document).on('scroll', function () {
        if (ctctblog.user_scrolled_past($before_widget) && !visible) {
            visible = true;
            $widget_wrapper.addClass('loaded').delay(300).affix({
                offset: {
                    top: function() {
                        return (this.top = offset.top);
                    },
                    bottom: calculateBottom
                }
            });
        }
    });
};
