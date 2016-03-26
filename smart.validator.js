/**
 * Smart Validator
 * John Bonfardeci <john.bonfardeci@gmail.com>
 * 2016-03-25
 * 
 * Why another form validator? Because this one will validate input elements that will be added to the DOM in the future. 
 * Frameworks such as AngularJS and KnockoutJS dynamically add/remove elements from the DOM with IF statements.
 * 
 * Dependencies: Bootstrap CSS (but you can use your own class names)
 * 
 * ###Copyright
    The MIT License (MIT)
        
    <https://tldrlegal.com/license/mit-license>

    Copyright (c) 2015 John T. Bonfardeci
        
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
    DEALINGS IN THE SOFTWARE.
 */
'use strict';

// If this is used in an Angular app, setup the `$smartValidator` module.
(function(angular){
    if(!!!angular){return;}
    
    angular.module('smart.validator', [])
        .factory('$smartValidator', ['$interval', function($interval){
            return new SmartValidator($interval);
        }]);
    
})(window['angular'] || undefined);

function SmartValidator($interval) {
    //Sanity check
    if(!this instanceof SmartValidator){
        throw 'SmartValidator must be instantiated with `new`.';
    }
    if($interval === void 0){ $interval = setInterval; }
    this.container;
    this.$interval = $interval;
    
    // Default templates utilize Bootstrap icons but you can modify them to use your own.
    this.settings = {
        selector: '*.required,*[required],*[data-required],*[data-ng-required],*[ng-required]',
        callback: function(complete, totalRequired, totalIncomplete, self){
            // Do something, such as show a submit button, if all fields are valid.
        },
        interval: 100,
        templates: {
            validClass: 'glyphicon-ok',
            invalidClass: 'glyphicon-exclamation-sign',
            required: '<span class="error glyphicon glyphicon-exclamation-sign"></span>',
            validation: '<span class="error validation" style="display:none;">{0}</span>',
            okSign: '&#x2714', // HTML ASCII check mark
            warningSign: '&#x2757' // HTML ASCII exclamation point
        }
    };
};

SmartValidator.prototype = {
    _kill: function(intervalId){
        if (intervalId === void 0) { intervalId = undefined; }
        
        //for Angular $interval cancel method
        if(this.$interval.cancel){
            return this.$interval.cancel();
        }
        
        if(!!intervalId){
            clearInterval(intervalId);
            return true;
        }
        return false;
    },
    
    init: function(container, opts){
        if (opts === void 0) { opts = {}; }
        
        var self = this;
        
        for(var p in opts){
            this.settings[p] =opts[p];
        }
        
        this.container = this.$utils.id(container);

        return this.$interval(function () {
            self.checkRequiredFields(self);
        }, this.settings.interval);
    },

    $utils: {
        each: function (a, callback, i) {
            i = i || 0;
            for (; i < a.length; i++) {
                callback(a[i], i);
            }
        },

        id: function (id) {
            return typeof (id) == 'string' ? document.getElementById(id) : id;
        },
    
        byClass: function (name, type) {
            var r = []
                , rx = new RegExp('(^|\\s)' + name + '(\\s|$)')
                , elements = document.getElementsByTagName(type || '*');

            this.each(elements, function (e) {
                if (rx.test(e.className.toString())) {
                    r.push(e);
                }
            });

            return r;
        },
        
        addClass: function(el, className){
            var cn = el.className.split(' ');
            if (cn.indexOf(className) > -1) { return el; }
            cn.push(className);
            el.className = this.trim(cn.join(' '));
            return el;
        },
        
        removeClass: function(el, className){
            var cn = el.className;
            el.className = cn.replace(new RegExp(className), '').replace(/\s{2}/, ' ');
            return el;
        },
        
        after: function(el, target){
            if(el.constructor == String){
                var div = document.createElement('div');
                div.innerHTML = el;
                el = div.querySelector(':first-child');
            }
            
            target.parentNode.insertBefore(el, target.nextSibling);
            
            return el;
        },
        
        extend: function (first, second) {
            for (var prop in second) {
                first[prop] = second[prop];
            }
            return first;
        },

        show: function (el) {
            el.style.display = null;
            return el;
        },
    
        hide: function(el){
            el.style.display = 'none';
            return el;
        },

        makeArray: function(els){
            return Array.prototype.slice.call(els);
        },

        filter: function(a, cb){
            var b = [];
            var i = 0;
            for(; i < a.length; i++){
                if(cb(a[i])){
                    b.push(a[i]);
                }
            }
            return b;
        },
    
        trim: function(val){
            return (val+'').replace(/(^\s+|\s+$)/g, '');
        },
    
        getValue: function (el, container) {
            var self = this;
            container = container || document.body;
            var val = '';
        
            if (el.type == 'checkbox') {
                val = el.checked ? 'true' : '';
            } else {
                //textarea, input, and select
                val = this.trim(el.value);
            }
            return val;
        },

        needsValue: function (el, container) {
            return this.getValue(el, container) == '';
        }
    },
    
    rxValidators: /\b(email|phone|ssn|zip|date)\b/,
    
    checkRequiredFields: function (self) {
        if(self === void 0){ self = this; }
        var $ = this.$utils;
        var required = this.container.querySelectorAll(self.settings.selector);
        var templates = self.settings.templates;
        var totalRequired = 0;
        var totalIncomplete = 0;
        var complete = false;
        var incompleteCount = $.filter(required,
            function (el) {
                return $.needsValue(el, self.container);
            }).length;
        var isValid = self.validateFields(self);

        $.each(required, function (el) {
            if (!!!el.$$error) {
                el.$$error = $.after(templates.required, el);
            }

            if ($.getValue(el) == '') {
                $.removeClass(el.$$error, templates.validClass);
                $.addClass(el.$$error, templates.invalidClass);
            }
            else {
                $.removeClass(el.$$error, templates.invalidClass);
                $.addClass(el.$$error, templates.validClass);
            }
        });

        totalRequired = required.length;
        complete = (totalRequired - incompleteCount == totalRequired) && isValid;
        this.settings.callback(complete, totalRequired, incompleteCount, self);
    },
    
    validateFields: function (self) {
        if(self === void 0){ self = this; }
        var errorCt = 0;
        var $ = this.$utils;
        var inputs = self.container.querySelectorAll('input.email,input.phone,input.ssn,input.zip,input.date');
        
        $.each(inputs, function (el) {
            var val = el.value;
            var validator = self.rxValidators.exec(el.className)[0];
            var invalidText = 'Invalid ' + validator.replace(/^\w/, function (s) {
                return s.toUpperCase();
            });

            if (!!!el.$$validation) {
                el.$$validation = $.after(self.settings.templates.validation.replace(/\{0\}/g, invalidText), el);
            }

            if (!self.validatePattern(val, validator) && !!val) {
                $.show(el.$$validation);
                errorCt += 1;
            }
            else {
                $.hide(el.$$validation);
            }
        });
        
        return errorCt == 0;
    },

    validatePattern: function(value, type) {
        var $ = this.$utils;

        if (!!!value) {
            return false;
        }

        var value = $.trim(value);

        if (value.length == 0) { return false; }

        var pattern;

        switch (type) {
            case "email":
                pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                break;
            case "zip":
                pattern = /\d{5}(-\d{4})?/;
                break;
            case "phone":
                //test north american or international phone numbers
                return /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)
                    || /^\+(?:[0-9] ?){6,14}[0-9]$/.test(value);
            case "date":
                pattern = /\d{1,2}(\-|\/)\d{1,2}(\-|\/)\d{2,4}$/;
                break;
            case "ssn":
                pattern = /^\d{3}\-\d{2}\-\d{4}$/;
                break;
            default:
                return false;
        }
        return pattern.test(value);
    }
    
};

