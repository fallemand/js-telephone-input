(function() {

    'use strict';

    //----------------------------------------------------
    // Define our constructor
    //----------------------------------------------------
    global.jsTelephoneInput = function(field, parameters) {

        //Check if parameters exists.
        if(!field || !parameters || typeof parameters !== "object") {
            throw new Error('js-telephone-input: field or parameters are not defined');
            return;
        }

        // Create global elements references
        this.libPhoneNumber = require('awesome-phonenumber');
        this.countriesList = require('./country-list');
        this.field = field;
        this.classNames = {
            'tel': 'ui-telephone',
            'telError': 'ui-telephone--error',
            'telSuccess': 'ui-telephone--success',
            'telWithFlag': 'ui-telephone--with-flag',
            'telCanChangeFlag': 'ui-telephone--change-flag',
            'telNumber': 'ui-telephone__number',
            'telFlags': 'ui-telephone__flags',
            'telFlagsSelected': 'ui-telephone__selected-flag',
            'telFlagsList': 'ui-telephone__flags-list',
            'telFlagsListItem': 'ui-telephone__flags-list-item',
            'telFlagsListItemName': 'ui-telephone__flag-name',
            'telFlagsListItemIcon': 'ui-telephone__flag-icon',
            'telFlagsListItemCode': 'ui-telephone__flag-code',
            'validations': 'ui-telephone__validations',
            'validationError': 'ui-telephone__validation--error',
            'validationInfo': 'ui-telephone__validation--info',
            'validationSuccess': 'ui-telephone__validation--success',
            'inputErrorClass': 'ui-telephone__input-error',
            'showClass': 'is-visible'
        };
        this.parameters = extendDefaults(parameters, this.field);
        this.elements = getElements(this);
        this.validations = getValidations(this);
        this.preventKeyup = false;
        this.phoneNumber = null;
        this.exampleNumber = null;

        //Validate User Default Value
        validateInitialValue(this);

        //Define field events and attributes
        addEvent(this.field, 'keyup', format, this);
        addEvent(this.field, 'click', format, this);
        addEvent(this.field, 'keypress', checkPressedKey, this);
        addEvent(this.field, 'blur', this.setInputsValue, this);
        setExampleNumber(this.parameters.country, this);
    };

    //----------------------------------------------------
    // Public Methods
    //----------------------------------------------------

    // Sets the value on the hidden inputs
    jsTelephoneInput.prototype.setInputsValue = function(event, component) {
        if(this instanceof global.jsTelephoneInput) {
            component = this;
        }
        var valid = component.isValid(),
            telephone = component.getTelephone(),
            numberInput = querySelector(component.elements.tel, component.parameters.number),
            areaCodeInput = querySelector(component.elements.tel, component.parameters.areaCode),
            fullNumberInput = querySelector(component.elements.tel, component.parameters.fullNumber);

        if(numberInput) {
            numberInput.value = valid ? telephone.telephone : '';
        }
        if(areaCodeInput) {
            areaCodeInput.value = valid ? telephone.areaCode : '';
        }
        if(fullNumberInput) {
            fullNumberInput.value = valid ? telephone.fullTelephone : '';
        }

        if (valid) {
            component.validations.hide(component.validations.info.zero);
        }
        return valid;
    };

    // Gets the telephone areaCode and number in json format
    jsTelephoneInput.prototype.getTelephone = function() {
        var areaCodeLimit = this.field.value.indexOf(' ');
        //If the telephone does not contain spaces, cut the areaCode using the "-"
        if(areaCodeLimit === -1) {
            areaCodeLimit = this.field.value.indexOf('-');
        }
        else {
            //If there are multiple spaces, use the first two parts as the areaCode.
            if((this.field.value.match(/\s/g) || []).length > 2) {
                areaCodeLimit = this.field.value.indexOf(' ', areaCodeLimit + 1);
            }
        }
        return {
            country: this.parameters.country,
            countryCode: this.libPhoneNumber.getCountryCodeForRegionCode(this.parameters.country),
            fullTelephone: stripValue(this.field.value).join(''),
            areaCode: stripValue(this.field.value.substring(0, areaCodeLimit)).join(''),
            telephone: stripValue(this.field.value.substring(areaCodeLimit + 1, this.field.value.length)).join('')
        }
    };

    // Checks if the number is valid
    jsTelephoneInput.prototype.isValid = function() {
        return (!this.parameters.required && this.field.value.length === 0) ||
            ((this.phoneNumber) ? this.phoneNumber.isValid() : false);
    };

    // Checks if the number is valid and shows the validations
    jsTelephoneInput.prototype.validate = function() {
        if (this.field.value.length === 0) {
            this.validations.reset();
            return;
        }
        if(this.isValid()) {
            this.validations.show(this.validations.elements.valid, true, true);
        } else {
            var reason = this.phoneNumber.toJSON().possibility;
            if(reason) {
                switch(reason) {
                    case 'too-short':
                        this.validations.show(this.validations.elements.min, true, false);
                        break;
                    case 'too-long':
                        this.validations.show(this.validations.elements.max, true, false);
                        break;
                    case 'is-possible':
                        this.validations.show(this.validations.elements.possible, true, false);
                        break;
                }
                this.validations.show(this.validations.info.zero, false);
                //syi.validationsFixer.fixValidationsPosition();
            }
        }
    };

    // Get an example number for the country
    jsTelephoneInput.prototype.getExampleNumber = function(countryCode) {
        return this.libPhoneNumber.getExample(countryCode, 'fixed-line').getNumber('national');
    };

    //----------------------------------------------------
    // Private Methods
    //----------------------------------------------------

    // Format the telephone and execute validations
    function format(event, component) {
        if (component.preventKeyup) {
            component.preventKeyup = false;
            return;
        }
        component.phoneNumber = component.libPhoneNumber(component.field.value, component.parameters.country);
        var telephone = component.phoneNumber.getNumber('national');
        if(telephone) {
            component.field.value = telephone;
        }
        component.validate();
    }

    // Mix default parameters with the user parameters
    function extendDefaults(parameters, field) {
        var defaults = {
            country: 'ar',
            required: true,
            withFlag: true,
            canChangeCountry: true,
            messages: {
                'required': 'Completa este dato.',
                'valid': 'El teléfono es correcto.',
                'min': 'Este teléfono tiene menos dígitos de los requeridos.',
                'invalidDefaultNumber': 'El teléfono cargado en tu cuenta no es válido. Verifícalo por favor.',
                'max': 'Este teléfono excede el máximo de dígitos posible.',
                'numbers': 'Sólo puedes ingresar números.',
                'possible': 'Revisa tu teléfono.',
                'notANumber': 'El teléfono no es un número.',
                'zero': 'Ingrésalo siguiendo el formato de este ejemplo: ##example##'
            },
            validations : 'telValidations',
            areaCode : "telAreaCode",
            number : "telNumber",
            fullNumber : "telFullNumber"
        };

        //Checks parameters written as html attributes
        Object.keys(defaults).forEach(function(parameter) {
            if(field.hasAttribute('data-' + camelCaseToDashCase(parameter))) {
                defaults[parameter] = field.getAttribute('data-' + camelCaseToDashCase(parameter));
            }
        });

        //Checks parameters sent as constructor parameters
        Object.keys(parameters).forEach(function(parameter) {
            defaults[parameter] = parameters[parameter];
        });

        return defaults;
    }

    //Validate default telephone
    function validateInitialValue(component) {
        if(component.field.value.length > 0) {
            format(undefined, component);
            if (!component.setInputsValue()) {
                component.validations.show(component.validations.elements.invalidDefaultNumber, true, false);
            }
        }
    }

    // Strips everything that's not a number
    function stripValue(maskedValue) {
        return maskedValue.split('').filter(isDigit);

        function isDigit(char) {
            return /\d/.test(char);
        }
    }

    // Validates only number
    function checkPressedKey(event, component) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (!isCharCodeANumber(charCode)) {
            event.preventDefault();
            component.validations.show(component.validations.elements.numbers, true);
            highlightInput();
            component.preventKeyup = true;
        }

        function highlightInput() {
            if (!component.field.className || component.field.className.indexOf(component.classNames.inputErrorClass) === -1) {
                addClass(component.classNames.inputErrorClass, component.field);
                setTimeout(function () {
                    removeClass(component.classNames.inputErrorClass, component.field);
                }, 200);
            }
        }

        function isCharCodeANumber(charCode) {
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        }
    }

    // Define all the validations
    function getValidations(component) {

        // Define elements
        var validations = {};
        validations.parent = querySelector(component.elements.tel, component.parameters.validations);
        validations.elements = {
            valid: createValidation('valid', component.classNames.validationSuccess + ' valid'),
            possible: createValidation('possible', component.classNames.validationError + ' possible'),
            notANumber: createValidation('notANumber', component.classNames.validationError + ' not-a-number'),
            min: createValidation('min', component.classNames.validationError + ' min'),
            invalidDefaultNumber: createValidation('invalidDefaultNumber', component.classNames.validationError + ' invalid-default-number'),
            max: createValidation('max', component.classNames.validationError + ' max'),
            numbers: createValidation('numbers', component.classNames.validationError + ' numbers'),
            required: createValidation('required', component.classNames.validationError + ' required')
        };
        validations.info = {
            zero: createValidation('zero', component.classNames.validationInfo + ' zero', true)
        };

        // Define validations methods
        validations.reset = function (validationExcluded) {
            removeClass(component.classNames.telError, component.elements.tel);
            removeClass(component.classNames.telSuccess, component.elements.tel);
            Object.keys(validations.elements).forEach(function(type) {
                if (validationExcluded !== validations.elements[type]) {
                    removeClass(component.classNames.showClass, validations.elements[type]);
                }
            });
        };

        // Show a specific validation
        validations.show = function (validation, reset, isValid) {
            if (reset) {
                validations.reset(validation);
            }
            if (isValid !== undefined) {
                var telClass = (isValid) ? component.classNames.telSuccess : component.classNames.telError;
                if (component.elements.tel.className.indexOf(telClass) === -1) {
                    addClass(telClass, component.elements.tel);
                }
            }
            addClass(component.classNames.showClass, validations.parent, component.classNames.showClass);
            addClass(component.classNames.showClass, validation, component.classNames.showClass);
        };

        //Hide a specific validation
        validations.hide = function (validation) {
            removeClass(component.classNames.showClass, validation);
            //syi.validationsFixer.fixValidationsPosition();
        };

        // Replaces the validations message with a specific variable
        function replaceTemplates(validation) {
            var start = validation.innerHTML.indexOf('##'),
                end = validation.innerHTML.lastIndexOf('##'),
                variable = validation.innerHTML.substring(start + 2, end);
            validation.innerHTML = (start > -1) ? validation.innerHTML.replace('##' + variable + '##', getTextToReplace(variable) ) : validation.innerHTML;

            function getTextToReplace(variable) {
                switch(variable) {
                    case 'example' : return component.getExampleNumber(component.parameters.country)
                }
            }
        }

        // Creates the validation
        function createValidation(name, className, replaceTemplate) {
            var validation = document.createElement('span');
            validation.className = className;
            validation.innerHTML = component.parameters.messages[name];
            if (replaceTemplate) {
                replaceTemplates(validation);
            }
            validations.parent.appendChild(validation);
            return validation;
        }

        return validations;
    }

    // Creates sub components (Country list menu)
    function getElements(component) {
        var elements = {};
        elements.tel = findAncestor(component.field, component.classNames.tel);
        elements.telNumber = findAncestor(component.field, component.classNames.telNumber);

        if (component.parameters.withFlag) {
            addClass(component.classNames.telWithFlag, elements.tel);
            elements.telFlags = document.createElement('div');
            addClass(component.classNames.telFlags, elements.telFlags);
            elements.tel.insertBefore(elements.telFlags, elements.tel.firstChild);
            elements.telFlagsSelected = document.createElement('div');
            elements.telFlagsSelected.className = component.classNames.telFlagsSelected;
            elements.telFlags.appendChild(elements.telFlagsSelected);
            setDefaultCountry(elements);

            if (component.parameters.canChangeCountry) {
                elements.telFlagsList = document.createElement('ul');
                addClass(component.classNames.telFlagsList, elements.telFlagsList);
                elements.telFlags.appendChild(elements.telFlagsList);
                createCountriesList(elements);
                createEvents(elements);
                addClass(component.classNames.telCanChangeFlag, elements.tel);
            }
        }

        return elements;

        function findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        }

        // Creates list of countries
        function createCountriesList(elements) {
            component.countriesList.forEach(function(country) {
                var listItem = document.createElement('li');
                var attrCountryCode = document.createAttribute("data-country");
                attrCountryCode.value = country[1];
                listItem.setAttributeNode(attrCountryCode);
                listItem.className = component.classNames.telFlagsListItem;
                listItem.innerHTML = '<div class="' + component.classNames.telFlagsListItemIcon + ' ' + component.classNames.telFlagsListItemIcon +'--' + country[1] + '"></div>';
                listItem.innerHTML += '<span class="' + component.classNames.telFlagsListItemName + '">' + country[0] + '</span>';
                listItem.innerHTML += '<span class="' + component.classNames.telFlagsListItemCode + '">' + country[2] + '</span>';
                elements.telFlagsList.appendChild(listItem);
            })
        }

        // Creates events of the component
        function createEvents(elements) {

            var hideCountryListHandler;

            function showCountryList() {
                if (elements.telFlagsList.className.indexOf(component.classNames.showClass) > -1) {
                    removeClass(component.classNames.showClass, elements.telFlagsList)
                } else {
                    addClass(component.classNames.showClass, elements.telFlagsList);
                    hideCountryListHandler = addEvent(document, 'mouseup', hideCountryList);
                }
            }

            function hideCountryList() {
                removeClass(component.classNames.showClass, elements.telFlagsList);
                removeEvent(document, 'mouseup', hideCountryListHandler);
            }

            function changeSelectedCountry(event) {
                var newCountry = event.target.getAttribute('data-country');
                if(!newCountry) {
                    newCountry = event.target.parentNode.getAttribute('data-country');
                }
                changeSelectedFlag(component.parameters.country, newCountry);
                hideCountryList();
                changeInfoExample();
                setExampleNumber(newCountry, component);
                component.validations.reset();
                component.field.value = "";
                component.setInputsValue();
                component.validations.reset();

                function changeSelectedFlag(actualCountryCode, newCountryCode) {
                    var flagDiv = elements.telFlagsSelected.firstChild;
                    flagDiv.className = flagDiv.className.replace('-' + actualCountryCode, '-' + newCountryCode);
                    component.parameters.country = newCountryCode;
                }

                function changeInfoExample() {
                    component.validations.info.zero.innerHTML = component.validations.info.zero.innerHTML.replace(component.exampleNumber, component.getExampleNumber(component.parameters.country));
                }
            }

            elements.telFlagsSelected.onclick = showCountryList;
            addEvent(elements.telFlagsList, 'click', changeSelectedCountry);
        }

        // Sets the default country
        function setDefaultCountry(elements) {
            elements.telFlagsSelected.innerHTML = '<div class="' + component.classNames.telFlagsListItemIcon + ' ' + component.classNames.telFlagsListItemIcon + '--' + component.parameters.country + '"></div>';
        }
    }

    // Add events cross browser
    function addEvent(element, event, funct, component) {
        var handler = function(e) {
            funct(e, component)
        };
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else {
            element.attachEvent('on' + event, handler);
        }
        return handler;
    }

    // remove events cross browser
    function removeEvent(element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler);
        }
        if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
        }
    }

    // Sets the input's placeholder and the info message
    function setExampleNumber(countryCode, component) {
        var newExampleNumber = component.getExampleNumber(countryCode);
        component.field.setAttribute('placeholder', newExampleNumber);
        component.exampleNumber = newExampleNumber;
    }

    // Transforms camelCaseAttributes to dash-case-attributes
    function camelCaseToDashCase(string) {
        return string.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }

    // Gets the element by the data-js
    function querySelector(parent, element) {
        return parent.querySelector("[data-js='" + element + "']");
    }

    //Remove the css class from the element
    function removeClass(cssClass, element) {
        element.className = element.className.replace(new RegExp('(?:^|\\s)'+cssClass+'(?!\\S)') , '');
    }

    //Remove the css class from the element
    function addClass(cssClass, element, condition) {
        if(!condition || (condition && element.className.indexOf(condition) === -1)) {
            element.className += (element.className.length > 0) ?  ' ' + cssClass : cssClass;
        }
    }

}());
