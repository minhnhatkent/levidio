(function iifeNav() {
    'use strict';

    var toggle_event = $('html').hasClass('touch') ? 'touchend' : 'click';

    $(document).ready(function extNavDocReady() {
        initHeader();
        initFooter();
    });

    function initHeader() {
        // Assume any browser that doesn't match any of the following user agents does not support the tel protocol
        var user_agents = [
            'iPhone',
            'iPad',
            'iPod',
            'Android',
            'Windows Phone'
        ].join('|'),
            user_agent_regex = new RegExp(user_agents, 'gi');

        // If non of the user agents above match, disable the tel protocol
        if (!navigator.userAgent.match(user_agent_regex)) {
            $('#ctct-header .utility-nav li.ctct-icon-call-us > a').attr('href', '#');
        }

        $('#ctct-header .global-nav .header').on(toggle_event, function headerClick() {
            $('#ctct-header .global-nav .nav').slideToggle().toggleClass('shadow');
            $('#ctct-header .global-nav .header .arrow, #ctct-header .global-nav .header .arrow-hover').toggleClass('open');
        });
        initSubNav();
    }

    function initFooter() {

        $('#ctct-footer .primary-nav .more').on(toggle_event, function footerClick() {
            $('#ctct-footer .secondary-nav-wrapper').slideToggle('fast', 'linear');
            $('#ctct-footer .primary-nav .more .more-icon').toggleClass('open');

            $('html, body').animate({scrollTop: $(document).height()}, 'fast', function scrollAnimateCallback() {
                location.href = '#more';
            });
        });

        $('#ctct-footer .locale-indicator').on(toggle_event, function localeIndicatorClick() {
            $('#ctct-footer .locale-menu').toggle();
        });

        if ($('#ctct-footer-legal .locale-menu').length === 0) {
            $('#ctct-footer-legal .locale-indicator').hover(function localeHover() {
                $(this).css({'color': '#0D76C1', 'cursor': 'auto'});
            });
        }
    }

    function initSubNav() {
        var $sub_nav = $('#ctct-header .sub-nav');
        $sub_nav.on(toggle_event, function subNavClick(e) {
            var $this = $(this);

            if (e.target.attributes.href && e.target.attributes.href.value === '#') {
                if ($this.hasClass('open')) {
                    $this.removeClass('open');
                } else {
                    $this.parent().find('.sub-nav.open').removeClass('open');
                    $this.addClass('open');
                }

                return false;
            }
        });

        $('body').on('click', function bodyClick() {
            if ($(this).not($sub_nav)) {
                $sub_nav.removeClass('open');
            }
        });
    }
}());
