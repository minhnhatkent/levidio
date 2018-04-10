/*
* Functions related to ajax filtering or endless scrolling.
*/

if (typeof ctctblog === 'undefined') {
    var ctctblog = {};
}

// set the current page to use in these functions.
ctctblog.current_page = 1;

// filtering functions.
ctctblog.getFilterValues = function (formData) {
    'use strict';
    // only if the form exists add some stuff.
    if ($('[data-filter-form]').length) {
        $('[data-filter-form]').addClass('disabled');

        // each input that you want disabled should have this attr.
        $('[data-filter-form] .section').each(function() {
            var $self = $(this),
                taxonomy_name = $self.data('filter-taxonomy');

            if (taxonomy_name !== 'sortby') {
                formData[taxonomy_name] = [];
                $self.find('[data-disable]').each(function () {
                    var $filter = $(this);
                    $filter.attr('disabled', true);

                    //if the input is checked grab its value.
                    if ($filter.is(':checked')) {
                        formData[taxonomy_name].push($filter.data('value')); // push topics into the topics array.
                    }
                });
            } else {
                // sortby and sort are both selects - we should get these regardless if the user actually changed them.
                formData.orderby = $self.find('#sortby').val();
                formData.order = $self.find('#sort').val();
            }
        });
    }

    // return the added values.
    return formData;
};

// when we are on an archive page we need to get the current value to include in the ajax call.
ctctblog.getCurrentArchiveFilter = function getCurrentArchiveFilter(formData) {
    'use strict';
    var term = $('#s').val();
    if (typeof term !== typeof undefined && term) {
        formData.search = term;
    }

    if ($('#filter-tag').length) {
        // set the tag if its a tags page
        formData.tag = $('#filter-tag').val();
    } else if ($('#filter-year').length) {
        // if we are on a date archive page include that information.
        formData.year = $('#filter-year').val();

        if ($('#filter-month').length) {
            formData.monthnum = $('#filter-month').val();

            if ($('#filter-day').length) {
                formData.day = $('#filter-day').val();
            }
        }
    }

    return formData;
};

// handles the response data from the ajax call.
ctctblog.handleAjaxResponse = function handleAjaxResponse(container, filter, content) {
    'use strict';
    if (!content || (content && !content.posts && !content.last_page)) {
        var error = '<div class="alert" id="no-response">Sorry, no results were found.</div>';
        container.html(error);
    } else {
        if ($('#no-response').length) {
            $('#no-response').remove();
        }
        if ( filter ) {
            container.html(content.content);
        } else {
            container.append(content.content);
        }
    }
};

// ajax function to get more authors on the author archive page.
ctctblog.ajaxGetAuthors = function ajaxGetAuthors() {
    'use strict';
    var $load_more = $('#older-posts a'),
        $content = $('#add-content'),
        current_user = 0, // first set of users
        offset = 16; // starting at an offset of 16. (this will increase with each call).

    if ($load_more.length) {
        $load_more.on('click', function(e){
            e.preventDefault();

            // show the loader utility.
            ctctblog.loaderIcon('#add-content', false, true);

            // animate the contents opacity.
            $content.animate({
                'opacity': '.3'},
                300);

            $.ajax({
                url: '/wp-content/themes/roots/tribe-ajax-helper.php',
                type: 'POST',
                data: {
                    action: 'getAuthors',
                    offset : offset,
                    current_user : current_user,
                    _wpnonce: $('#_wpnonce').val(),
                    _wp_http_referer: $('[name="_wp_http_referer"]').val()
                }
            }).success(function(data) {
                // parse the data and display it.
                var response = $.parseJSON(data);
                if (!response.error) {
                    $content.append(response.content);

                    offset = response.offset;
                    current_user = response.current_user;

                    if (response.last_page) {
                        $('.post-nav').fadeOut(300);
                    }
                } else {
                    $('.post-nav').fadeOut(300);
                }

            }).fail(function(xhr, status, error) {
                // if it fails hide the more button so it doesn't become an issue
                $('.post-nav').fadeOut(300);
            }).always(function(){
                // the following is agnostic of failure or success
                ctctblog.loaderIcon('#add-content', false, false);
                $content.animate({
                    'opacity': '1'},
                    300);
            });
            

        });
    }
};

// ajax function to get more posts from a given author.
ctctblog.ajaxGetAuthorPosts = function ajaxGetAuthorPosts(id) {
    'use strict';
    var $load_more = $('#older-posts a'),
        $content = $('#ajax-content'),
        page = 2;

    if ($load_more.length) {
        $load_more.on('click', function(e){
            e.preventDefault();

            // loadericon utility.
            ctctblog.loaderIcon('#ajax-content', false, true);

            $content.animate({
                'opacity': '.3'},
                300);

            $.ajax({
                url: '/wp-content/themes/roots/tribe-ajax-helper.php',
                type: 'POST',
                data: {
                    action: 'getAuthorPosts',
                    author: id,
                    paged: page,
                    _wpnonce: $('#_wpnonce').val(),
                    _wp_http_referer: $('[name="_wp_http_referer"]').val()
                }
            }).success(function(data) {
                var response = $.parseJSON(data);
                // add the parsed data to the page.
                $content.append(response.content);
                if (response.last_page) {
                    $('.post-nav').fadeOut(300);
                }
                page++; // increase the page number.
            }).fail(function() {
                // if it fails hide the more button so it doesn't become an issue
                $('.post-nav').fadeOut(300);
            }).always(function(){
                // the following is agnostic of failure or success
                ctctblog.loaderIcon('#ajax-content', false, false);
                $content.animate({
                    'opacity': '1'},
                    300);
            });
            

        });
    }
};

// get more posts and filter posts ajax call.
ctctblog.ajaxGetPosts = function ajaxGetPosts(filter) {
    'use strict';
    var content = '#archive-content',
        $content = $(content),
        $inputs = $('[data-disable]'),
        formData = {
            action: 'getPosts',
            orderby: 'date',
            order: 'DESC',
            post_status: 'publish'
        };

    // show the loader icon.
    ctctblog.loaderIcon(content, filter, true);

    $content.animate({
            'opacity': '.3'},
            300);

    // get and set the current page, if it is using a filter reset the page to 1.
    ctctblog.current_page++;
    if (filter) {
        ctctblog.current_page = 1;
    }
    formData.page = ctctblog.current_page;

    // get the form data if there is some.
    formData = ctctblog.getFilterValues(formData);

    // if we are on a archive page we should include that information.
    formData = ctctblog.getCurrentArchiveFilter(formData);

    // send the nonce data for confirmation
    formData._wpnonce = $('#_wpnonce').val();
    formData._wp_http_referer = $('[name="_wp_http_referer"]').val();

    if ($('#category-restrict').length && $('#category-restrict').val() !== '') {
        formData.restrict = [$('#category-restrict').val()];
    }

    // ajax request sends out to admin-ajax and get the results for the formData.
    $.ajax({
        url: '/wp-content/themes/roots/tribe-ajax-helper.php',
        method: 'POST',
        data: formData
    }).success(function(data){
        // the php function 'getPosts' returns an array. We need to parse it into JSON to finish things off.
        var response = JSON.parse(data);

        // depending on if this is a filter or not either replace the content or append it (endless scroll)
        ctctblog.handleAjaxResponse($content, filter, response);

        if (response.last_page) {
            $('.post-nav').fadeOut(300);
        } else {
            $('.post-nav:hidden').fadeIn(300);
        }

        $('#number-posts').text(response.posts);
    }).fail(function(){
        // if it fails hide the more button so it doesn't become an issue
        $('.post-nav').fadeOut(300);
    }).always(function(){
        // the following is agnostic of failure or success
        $inputs.each(function(){
            $(this).attr('disabled', false);
        });
        if ($('[data-filter-form]').length && $('[data-filter-form]').hasClass('disabled')) {
            $('[data-filter-form]').removeClass('disabled');
        }

        ctctblog.loaderIcon(content, filter, false);

        $content.animate({
            'opacity': '1'},
            300);
    });
};
