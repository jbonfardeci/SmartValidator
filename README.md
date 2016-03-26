# SmartValidator
A JavaScript validator that works with dynamic form elements created by MV* frameworks such as KnockoutJS and AngularJS.

**Usage
```
// Example options overrides
var opts = {
    // Override for required input selector
    // The default is `*.required,*[required],*[data-required],*[data-ng-required],*[ng-required]`
    selector: '*[required]',

    // Some action to take when the form is complete/valid.
    callback: function (complete, totalRequired, totalIncomplete, $smartValidator) {
        // Show the Submit button if th eform is complete.
        if (complete) {
            $smartValidator.$utils.show(d.querySelector('#form_container .btn-submit'));
        }
        else {
            $smartValidator.$utils.hide(d.querySelector('#form_container .btn-submit'));
        }
    },

    // The interval (in milliseconds) to run the validator
    interval: 100
};

// For Angular frameworks, inject `$smartValidator` into your controller 
// and call the `init` method with the form ID or form element, plus optional setting overrides.
// For example:
angular.module('app', ['smart.validator'])
    .controller('testCtrl', ['$smartValidator', function($smartValidator){
        
        // Initialize the validator
        $smartValidator.init('form_container', opts);
        
    }]);

// Simply instantiate `SmartValidator` for non-Angular frameworks
//var sv = new SmartValidator('form_container');
//sv.init('form_container', opts);
```
