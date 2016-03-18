/**
 * Created by petermomot on 3/17/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal.Constants')
        .constant('REGEX', {
            'NAME': /^[a-zA-Z\s]+$/,
            'EMAIL': /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
            'PASS': /^\S{4,}$/
        });

})();
