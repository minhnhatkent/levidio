/*
 Requires: jQuery, ctct.cookies, ctct.analytics
 Optional: jQuery Validation, jQuery Tooltips

 The purpose of this file is to facilitate the easy reproduction of two step signup forms anywhere. It can be dropped on both the originating first step page (not a "real" signup form, as well as the target signup form page that acts as the second step.

 When being used on a "step1" page, just put a standard HTML form on the page with a class of "js-two-step". The action attribute should point to the the second step of the form (like /email-marketing/signup.jsp). Put whatever inputs into the form that you want tranfered to the next page. Make sure the name attribute matches the name attribute of the field you want to populate on the second step page. In addition, we can track the users progress through filling out the form by applying classes of 'track-step1', 'track-step2', 'track-step3' on the form elements we want to fire the analytics request. If the element being tracked is an input, a focus event will be used, otherwise a click event will fire the tracking.

    <form class="js-two-step" action="/next/signup.jsp">
        <input class="trac-step1" name="siteContactFirstName"/>
        <input name="siteContactLastName"/>
        <input name="siteContactEmailLogin"/>
        <button class="track-step2">Signup</button>
    </form>

    ^ -- Will activate the validation (just make sure field has something in it), analytics, tooltips, and cookie writing logic. If the user entered all the fields properly they will be shipped off via a location.href (NOT a form submit) to the the url specified in the action attribute.

 When used on a "step2" page, this file will check to see if a two-step-form cookie is set with values, and load them into the corresponding fields on the form before removing the cookie. It will also  setup the analytics tracking for steps 1-3.

*/

if (typeof ctct === 'undefined') {
    var ctct = {};
}

$(function twoStepLogic() {
    'use strict';

    var vaildationFailed = false;

    // Verify the cookie and analytics modules are on the page
    if (ctct && ctct.cookies && ctct.analytics) {

        // Setup cookie input value saving logic
        $('form.js-two-step').each(function initTwoStepForm() {
            var $this_form = $(this),
                using_validation = false,
                using_tooltips = false,
                using_error_display_markup = false,
                $error_display = $this_form.find('.display-error');

            // If the validation plugin are on the page, use them
            if ($this_form.validate) {

                using_validation = true;

                // Setup a required rule for each input field in this form
                var validation_rules = {};
                $this_form.find('input').each(function makeTwoStepFormFieldsRequired() {
                    validation_rules[ $(this).attr('name') ] = 'required';
                });

                $this_form.validate({
                    rules: validation_rules,
                    errorPlacement: function errorPlacement(e1, e2) {
                        //necessary to avoid in-line errors
                    }
                });

                // Setup the tooltip on the submit button
                var $form_btn = $this_form.find('button');

                // If there is no title attribute for the tooltip to use on the button, provide a default message
                if (!$form_btn.attr('title')) {
                    $form_btn.attr('title', 'Please complete all fields.');
                }

                // If a tooltip plugin is loaded, use it to display errors
                if ($this_form.tooltip) {
                    using_tooltips = true;
                    $form_btn.tooltip({
                        position: 'bottom center',
                        offset: [10, 0],
                        events:{        /* no default actions! */
                            def: '"",""',
                            input: '"",""',
                            widget: '"",""'
                        }
                    });
                } else if ($error_display.length > 0) {
                    using_error_display_markup = true;
                    $error_display.text('Please complete all fields.');
                }

            }

            // On keyup revalidate the form if there is an error
            $this_form.on('keyup', 'input', function revalidateOnKeyUp() {
                if ($this_form.find('.error').length > 0) {
                    _validateForm();
                }
            });

            $this_form.on('submit', function twoStepFormSubmitHandler(e) {
                e.preventDefault();
                var redirect_uri = $this_form.attr('action') || '/features/signup.jsp',
                    cookie_val = '',
                    ctct_domain = /(.ctct.net)/.test(document.location.host) ? '.ctct.net' : '.constantcontact.com'; // Unless we're on ctct.net, enable all constantcontact.com URLs

                if (!_validateForm()) {
                    return false;
                }

                $this_form.find('input').each(function initTwoStepFormCookie() {
                    var $this_input = $(this);
                    cookie_val += $this_input.attr('name') + '=' + $this_input.val() + '|';
                });

                ctct.cookies.add({
                    name: 'two-step-form',
                    value: cookie_val,
                    path: '/',
                    domain: ctct_domain
                });

                $.each($('input.required'), function triggerBlurOnRequiredFields(e) {
                    $(this).trigger('blur');
                });

                if ($('.has-error').length === 0) {
                    // Set a short time out for any remaining analytics ajax request to finish
                    setTimeout(function redirectToFormTargetURI() {
                        window.top.location.href = redirect_uri;
                    }, 300);
                } else {
                    if (using_tooltips) {
                        $('#submitBtn').tooltip('show');
                    } else if (using_error_display_markup) {
                        $error_display.addClass('hide').removeClass('show');
                    }
                }

                return false;
            });

            function _validateForm() {
                // Only bother attempting to handle tooltips if we had initalized them
                if (using_validation) {
                    if ($this_form.valid && $this_form.valid() && $form_btn) {
                        if (using_tooltips) {
                            $form_btn.data('tooltip').hide();
                        } else if (using_error_display_markup) {
                            $error_display.addClass('hide').removeClass('show');
                        }
                        return true;
                    } else {
                        if (using_tooltips) {
                            $form_btn.data('tooltip').show();
                        } else if (using_error_display_markup) {
                            $error_display.addClass('show').removeClass('hide');
                        }
                        return false;
                    }
                }
            }
        });

        // Account for multiple forms on the page
        // TODO: this logic should be removed when mutiple forms can exist on one page without overriding each other.
        var i = 0,
            tryitfrees = $('a.js-try-it-free'),
            buynows = $('a.js-buy-now');

        $('form.js-two-step').each(function adjustDataFormNames() {
            var $this_form = $(this);
            if (i > 0) {
                var form_name = $this_form.attr('name') + i;
                $this_form.attr('name', form_name);
                $(tryitfrees[i]).attr('data-form-name', form_name); // for /eventspot2/overview
                $(buynows[i]).attr('data-form-name', form_name);
            }
            i++;
        });

        $('a.js-try-it-free, a.js-buy-now').each(function initBuyNowLinks() {
            var $this = $(this),
                href = $this.attr('href');

            $this.on('click', function buyNowLinkClickHandler(e) {
                e.preventDefault();

                var $the_form = $('form[name="' + $this.data('form-name') + '"]'),
                    cookie_val = '',
                    ctct_domain = /(.ctct.net)/.test(document.location.host) ? '.ctct.net' : '.constantcontact.com'; // Unless we're on ctct.net, enable all constantcontact.com URLs

                $the_form.find('input').each(function initTwoStepFormCookieFromBuyNowLink() {
                    var $this_input = $(this);
                    cookie_val += $this_input.attr('name') + '=' + $this_input.val() + '|';
                });

                ctct.cookies.add({
                    name: 'two-step-form',
                    value: cookie_val,
                    path: '/',
                    domain: ctct_domain
                });

                window.location = href;
            });
        });

        // Setup cookie loading logic
        if (ctct.cookies.get({name:'two-step-form'})) {

            // If cookie does exists, load up the values into the form fields, than remove the cookie so it doesn't persist.
            try {
                var cookie_arr = ctct.cookies.get({name:'two-step-form'}).split('|');

                for (i = 0; i < cookie_arr.length; i++) {
                    // Make sure this isn't an empty string
                    if (cookie_arr[i]) {
                        var saved_vals = cookie_arr[i].split('=');
                        if (saved_vals[1]) {
                            $('input[name="' + saved_vals[0] + '"]').val(saved_vals[1]);
                            $('input[name=\"' + saved_vals[0] + '\"]').trigger('blur');
                        }
                    }
                }

            } catch (e) {
                // Something went wrong while loading up two step form values, but have no fear, this caught error will not propagate to up to the window
            }
            ctct.cookies.remove({
                name: 'two-step-form',
                path: '/',
                domain: '.constantcontact.com'
            });
        }
    }

    // On page load, place focus on first errored or empty input field
    $('#signupform:not(.js-no-autofocus) input').each(function focusOnFirstErroredOrEmptyField() {
        if (($(this).hasClass('error')) || ($(this).val() === '')) {
            $(this).focus();
            return false;
        }
    });

    var validateField = function addOrRemoveHasErrorCSSClass(e) {
        var field = $('#' + e.currentTarget.id);

        if (field.val() === '') {
            field.parent().addClass('has-error');
        } else {
            field.parent().removeClass('has-error');
        }
    };

    $('input.required').on('keypress', validateField);
    $('input.required').on('blur', validateField);
});
