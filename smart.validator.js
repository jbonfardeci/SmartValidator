/**
 * Smart Validator
 * 
 * Why another form validator? Because this one will validate input elements that will be added to the DOM in the future. 
 * Frameworks such as AngularJS and KnockoutJS dynamically add/remove elements from the DOM with IF statements.
 * 
 * Dependencies: Bootstrap CSS (but you can use your own class names)
 */

function SmartValidator(container, opts) {
    var self = this;
    
    this.container = container.constructor == String ? document.getElementById(container) : container;
    
    // Default templates utilize Bootstrap icons but you can modify them to use your own.
    this.settings = {
        selector: '*.required,*[required],*[data-required],*[data-ng-required],*[ng-required]',
        callback: function(complete, totalRequired, totalIncomplete, self){
            // Do something, such as show a submit button, if all fields are valid.
        },
        interval: 1000,
        templates: {
            validClass: 'glyphicon-ok',
            invalidClass: 'glyphicon-exclamation-sign',
            required: '<span class="error glyphicon glyphicon-exclamation-sign"></span>',
            validation: '<span class="validation" style="display:none;">{0}</span>'
        }
    };

    this.$dom.extend(this.settings, opts);
    
    this.isComplete = false;

    this.intervalId = setInterval(function () {
        self.checkIncomplete();
        self.checkRequiredFields();
        self.validateFields();
    }, this.settings.interval);
};

SmartValidator.prototype = {
    
    $dom: {
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
        
        first: function (o, tag) {
            if (tag) { return o.getElementsByTagName(tag)[0]; }
            return (o && o.nodeType != 1) ? this.next(o) : o;
        },

        next: function (o) {
            do {
                o = o.nextSibling;
            } while (o && o.nodeType != 1);
            return o;
        },

        prev: function prev(o) {
            do {
                o = o.previousSibling;
            } while (o && o.nodeType != 1);
            return o;
        },

        extend: function (first, second) {
            for (var prop in second) {
                first[prop] = second[prop];
            }
            return first;
        },

        prepend: function (o, content, isHtml) {
            var firstChild = o.firstChild;
            if (typeof (content) != 'string') {
                o.insertBefore(content, firstChild);
            }
            else if (!!isHtml) {
                var temp = document.createElement('div');
                temp.innerHTML = content;
                o.insertBefore(this.first(temp), firstChild);
            }
            else {
                o.insertBefore(document.createTextNode(content), firstChild);
            }
            return o;
        },

        append: function (o, content, isHtml) {
            if (typeof (content) != 'string') {
                o.appendChild(content);
            }
            else if (!!isHtml) {
                var temp = document.createElement('div');
                temp.innerHTML = content;
                o.appendChild(temp.firstChild);
            }
            else {
                o.appendChild(document.createTextNode(content));
            }
            return o;
        },
        
        parent: function (o, num) {
            num = num || 1;
            for (var i = 0; i < num; i++) {
                if (o != null) {
                    o = o.parentNode;
                }
            }
            return o;
        },
        
        closest: function (o, tagName) {
            tagName = tagName.toLowerCase();
            var parentNode = this.parent(o);
            do {
                parentNode = this.parentNode(parentNode);
            }
            while(parentNode && parentNode.tagName.toLowerCase() != tagName);     
            return parentNode;
        },

        before: function (parent, before, o) {
            if (o == null) {
                o = before;
                before = parent;
                parent = before.parentNode;
            }
            parent.insertBefore(o, before);
            return o;
        },

        attr: function (o, attr) {
            if(!!o[attr]){
                return o[attr];
            }
            return o.getAttribute(attr);
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
            var tagName = el.tagName.toLowerCase();
            var val = '';
        
            if (el.type == 'checkbox') {
                val = el.checked ? 'true' : '';
            } else {
                val = this.trim(el.value);
            }
            return val;
        },

        needsValue: function(el) {
            return this.getValue(el) == '';
        }
    },
    
    rxValidators: /\b(email|phone|ssn|zip|date)\b/,
    
    checkRequiredFields: function () {
        var self = this;
        var $ = this.$dom;
        var required = this.container.querySelectorAll(self.settings.selector);
        var templates = this.settings.templates;

        $.each(required, function (el) {
            if (!!!el.$$error) {
                el.$$error = $.after(templates.required, el);
            }

            if ($.getValue(el) == '') {
                $.removeClass(el.$$error, templates.validClass);
                $.addClass(el.$$error, templates.invalidClass);
                el.$$error.innerHTML = '&#x2757';
            }
            else {
                $.removeClass(el.$$error, templates.invalidClass);
                $.addClass(el.$$error, templates.validClass);
                el.$$error.innerHTML = '&#x2714';
            }
        });
    },
    
    checkIncomplete: function () {
        var self = this;
        var $ = this.$dom;
        var totalRequired = 0;
        var totalIncomplete = 0;
        var complete = false;
        var requiredFields = this.container.querySelectorAll(this.settings.selector);
        var incompleteCount = $.filter(requiredFields,
            function (el) {
                return $.getValue(el, self.container) == '';
            }).length;

        totalRequired = requiredFields.length;
        totalIncomplete = incompleteCount;
        complete = totalRequired - totalIncomplete == totalRequired;
        this.isComplete = complete;
        this.settings.callback(complete, totalRequired, totalIncomplete, self);
    },
    
    validateFields: function () {
        var self = this;
        var $ = this.$dom;
        var inputs = this.container.querySelectorAll('input.email,input.phone,input.ssn,input.zip,input.date');
        
        $.each(inputs, function (el) {
            var val = el.value;
            var validator = self.rxValidators.exec(el.className)[0];
            var invalidText = 'Invalid ' + validator.replace(/^\w/, function (s) {
                return s.toUpperCase();
            });

            if (!!!el.$$validation) {
                el.$$validation = $.after(self.templates.validation.replace(/\{0\}/g, invalidText), el);
            }

            if (!validatePattern(val, validator) && !!val) {
                $.show(el.$$validation);
            }
            else {
                $.hide(el.$$validation);
            }
        });
    },

    validatePattern: function(value, type) {
        var $ = this.$dom;

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

