(function() {

    'use strict';

    //----------------------------------------------------
    // Define our constructor
    //----------------------------------------------------
    global.jsTelephoneInput = function() {

        //Check if parameters exists.
        if(!arguments[0] || !arguments[1] || typeof arguments[1] !== "object") {
            console.log('js-telephone-input: field or parameters are not defined');
            return;
        }

        // Create global element references
        this.LibPhoneNumber = require('awesome-phonenumber');
        this.countriesList = require('./country-list');
        this.field = arguments[0];
        this.classNames = {
            tel : 'ui-telephone',
            telError : ' ui-telephone--error',
            telSuccess : ' ui-telephone--success',
            telWithFlag : ' ui-telephone--with-flag',
            telNumber : 'ui-telephone__number',
            telFlags : 'ui-telephone__flags',
            telFlagsCanChange : ' ui-telephone__flags--can-change',
            telFlagsSelected : 'ui-telephone__selected-flag',
            telFlagsList : 'ui-telephone__flags-list',
            telFlagsListItem : 'ui-telephone__flags-list-item',
            telFlagsListItemName : 'ui-telephone__flag-name',
            telFlagsListItemIcon : 'ui-telephone__flag-icon',
            telFlagsListItemCode : 'ui-telephone__flag-code',
            validations: 'ui-telephone__validations',
            validationError : 'ui-telephone__validation--error',
            validationInfo : 'ui-telephone__validation--info',
            validationSuccess : 'ui-telephone__validation--success',
            inputErrorClass : ' ui-telephone__input-error',
            showClass : ' is-visible'
        };
        this.parameters = extendDefaults(arguments[1], this.field);
        this.validations = getValidations(this);
        this.elements = getElements(this);
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
    jsTelephoneInput.prototype.setInputsValue = function(event, jsTelephoneInput) {
        if(this instanceof global.jsTelephoneInput) {
            jsTelephoneInput = this;
        }
        var valid = jsTelephoneInput.isValid(),
            telephone = jsTelephoneInput.getTelephone(),
            numberInput = document.getElementById(jsTelephoneInput.parameters.number),
            areaCodeInput = document.getElementById(jsTelephoneInput.parameters.areaCode),
            fullNumberInput = document.getElementById(jsTelephoneInput.parameters.fullNumber);

        if(numberInput) {
            numberInput.value = (valid) ? telephone.telephone : '';
        }
        if(areaCodeInput) {
            areaCodeInput.value = (valid) ? telephone.areaCode: '';
        }
        if(fullNumberInput) {
            fullNumberInput.value = (valid) ? telephone.fullTelephone: '';
        }

        if (valid) {
            jsTelephoneInput.validations.hide(jsTelephoneInput.validations.info.zero);
            return true;
        }
        return false;
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
            countryCode: this.LibPhoneNumber.getCountryCodeForRegionCode(this.parameters.country),
            fullTelephone: stripValue(this.field.value).join(''),
            areaCode: stripValue(this.field.value.substring(0, areaCodeLimit)).join(''),
            telephone: stripValue(this.field.value.substring(areaCodeLimit + 1, this.field.value.length)).join('')
        }
    };

    // Checks if the number is valid
    jsTelephoneInput.prototype.isValid = function() {
        if (this.field.value.length === 0) {
            if(!this.parameters.required) {
                return true;
            }
            return false;
        }
        return this.phoneNumber.isValid();
    };

    // Checks if the number is valid and shows the validations
    jsTelephoneInput.prototype.validate = function() {
        if (this.field.value.length === 0) {
            this.validations.reset();
            return;
        }
        if(this.isValid()) {
            this.validations.show(this.validations.elements.valid, true, true);
        }
        else {
            var reason = this.phoneNumber.toJSON().possibility;
            if(reason) {
                switch(reason) {
                    case 'too-short' :
                        this.validations.show(this.validations.elements.min, true, false);
                        break;
                    case 'too-long' :
                        this.validations.show(this.validations.elements.max, true, false);
                        break;
                    case 'unknown' :
                        //validations.show(validations.elements.notANumber, true, false);
                        break;
                    case 'is-possible' :
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
        return this.LibPhoneNumber.getExample(countryCode, 'fixed-line').getNumber('national');
    };

    //----------------------------------------------------
    // Private Methods
    //----------------------------------------------------

    // Format the telephone and execute validations
    function format(event, jsTelephoneInput) {
        if (jsTelephoneInput.preventKeyup) {
            jsTelephoneInput.preventKeyup = false;
            return;
        }
        jsTelephoneInput.phoneNumber = jsTelephoneInput.LibPhoneNumber(jsTelephoneInput.field.value, jsTelephoneInput.parameters.country);
        var telephone = jsTelephoneInput.phoneNumber.getNumber('national');
        if(telephone) {
            jsTelephoneInput.field.value = telephone;
        }
        jsTelephoneInput.validate();
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
        for (var parameter in defaults) {
            if(field.hasAttribute('data-' + camelCaseToDashCase(parameter))) {
                defaults[parameter] = field.getAttribute('data-' + camelCaseToDashCase(parameter));
            }
        }

        //Checks parameters sent as constructor parameters
        for (var parameter in parameters) {
            if (parameters.hasOwnProperty(parameter)) {
                defaults[parameter] = parameters[parameter];
            }
        }

        return defaults;
    }

    //Validate default telephone
    function validateInitialValue(jsTelephoneInput) {
        if(jsTelephoneInput.field.value.length > 0) {
            format(undefined, jsTelephoneInput);
            if (!jsTelephoneInput.setInputsValue()) {
                jsTelephoneInput.validations.show(jsTelephoneInput.validations.elements.invalidDefaultNumber, true, false);
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
    function checkPressedKey(event, jsTelephoneInput) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (!isCharCodeANumber(charCode)) {
            event.preventDefault();
            jsTelephoneInput.validations.show(jsTelephoneInput.validations.elements.numbers, true);
            highlightInput();
            jsTelephoneInput.preventKeyup = true;
        }

        function highlightInput() {
            if (!jsTelephoneInput.field.className || jsTelephoneInput.field.className.indexOf(jsTelephoneInput.classNames.inputErrorClass) === -1) {
                jsTelephoneInput.field.className += jsTelephoneInput.classNames.inputErrorClass;
                setTimeout(function () {
                    jsTelephoneInput.field.className = jsTelephoneInput.field.className.replace(jsTelephoneInput.classNames.inputErrorClass, '');
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
    function getValidations(jsTelephoneInput) {

        // Define elements
        var validations = {};
        validations.parent = document.getElementById(jsTelephoneInput.parameters.validations);
        validations.elements = {
            valid: createValidation('valid', jsTelephoneInput.classNames.validationSuccess + ' valid'),
            possible: createValidation('possible', jsTelephoneInput.classNames.validationError + ' possible'),
            notANumber: createValidation('notANumber', jsTelephoneInput.classNames.validationError + ' not-a-number'),
            min: createValidation('min', jsTelephoneInput.classNames.validationError + ' min'),
            invalidDefaultNumber: createValidation('invalidDefaultNumber', jsTelephoneInput.classNames.validationError + ' invalid-default-number'),
            max: createValidation('max', jsTelephoneInput.classNames.validationError + ' max'),
            numbers: createValidation('numbers', jsTelephoneInput.classNames.validationError + ' numbers'),
            required: createValidation('required', jsTelephoneInput.classNames.validationError + ' required')
        };
        validations.info = {
            zero: createValidation('zero', jsTelephoneInput.classNames.validationInfo + ' zero', true)
        };

        // Define validations methods
        validations.reset = function (validationExcluded) {
            jsTelephoneInput.elements.tel.className = jsTelephoneInput.elements.tel.className.replace(jsTelephoneInput.classNames.telError, '').replace(jsTelephoneInput.classNames.telSuccess, '');
            for (var type in validations.elements) {
                if (validations.elements.hasOwnProperty(type)) {
                    if (validationExcluded !== validations.elements[type]) {
                        validations.elements[type].className = validations.elements[type].className.replace(jsTelephoneInput.classNames.showClass, '');
                    }
                }
            }
        };

        // Show a specific validation
        validations.show = function (validation, reset, isValid) {
            if (reset) {
                validations.reset(validation);
            }
            if (isValid !== undefined) {
                var telClass = (isValid) ? jsTelephoneInput.classNames.telSuccess : jsTelephoneInput.classNames.telError;
                if (jsTelephoneInput.elements.tel.className.indexOf(telClass) === -1) {
                    jsTelephoneInput.elements.tel.className += telClass;
                }
            }
            validations.parent.className += (validations.parent.className.indexOf(jsTelephoneInput.classNames.showClass) === -1) ? jsTelephoneInput.classNames.showClass : '';
            validation.className += (validation.className.indexOf(jsTelephoneInput.classNames.showClass) === -1) ? jsTelephoneInput.classNames.showClass : '';
        };

        //Hide a specific validation
        validations.hide = function (validation) {
            validation.className = validation.className.replace(jsTelephoneInput.classNames.showClass, '');
            //syi.validationsFixer.fixValidationsPosition();
        };

        // Replaces the validations message with a specific variable
        function replaceTemplates(validation) {
            var start = validation.innerHTML.indexOf('##'),
                end = validation.innerHTML.lastIndexOf('##'),
                variable = validation.innerHTML.substring(start + 2, end);
            validation.innerHTML = (start > -1) ? validation.innerHTML.replace('##' + variable + '##', getTextToRepalce(variable) ) : validation.innerHTML;

            function getTextToRepalce(variable) {
                switch(variable) {
                    case 'example' : return jsTelephoneInput.getExampleNumber(jsTelephoneInput.parameters.country)
                }
            }
        }

        // Creates the validation
        function createValidation(name, className, replaceTemplate) {
            var validation = document.createElement('span');
            validation.className = className;
            validation.innerHTML = jsTelephoneInput.parameters.messages[name];
            if (replaceTemplate) {
                replaceTemplates(validation);
            }
            validations.parent.appendChild(validation);
            return validation;
        }

        return validations;
    }

    // Creates sub components (Country list menu)
    function getElements(jsTelephoneInput) {
        var elements = {};
        elements.tel = findAncestor(jsTelephoneInput.field, jsTelephoneInput.classNames.tel);
        elements.telNumber = findAncestor(jsTelephoneInput.field, jsTelephoneInput.classNames.telNumber);

        if (jsTelephoneInput.parameters.withFlag) {
            elements.tel.className += jsTelephoneInput.classNames.telWithFlag;
            elements.telFlags = document.createElement('div');
            elements.telFlags.className = jsTelephoneInput.classNames.telFlags;
            elements.tel.insertBefore(elements.telFlags, elements.tel.firstChild);
            elements.telFlagsSelected = document.createElement('div');
            elements.telFlagsSelected.className = jsTelephoneInput.classNames.telFlagsSelected;
            elements.telFlags.appendChild(elements.telFlagsSelected);
            setDefaultCountry(elements);

            if (jsTelephoneInput.parameters.canChangeCountry) {
                elements.telFlagsList = document.createElement('ul');
                elements.telFlagsList.className = jsTelephoneInput.classNames.telFlagsList;
                elements.telFlags.appendChild(elements.telFlagsList);
                createCountriesList(elements);
                createEvents(elements);
                elements.telFlags.className += jsTelephoneInput.classNames.telFlagsCanChange;
            }
        }

        return elements;

        function findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        }

        // Creates list of countries
        function createCountriesList(elements) {
            for (var i = 0; i < jsTelephoneInput.countriesList.length; i += 1) {
                var listItem = document.createElement('li');
                var attrCountryCode = document.createAttribute("data-country");
                attrCountryCode.value = jsTelephoneInput.countriesList[i][1];
                listItem.setAttributeNode(attrCountryCode);
                listItem.className = jsTelephoneInput.classNames.telFlagsListItem;
                listItem.innerHTML = '<div class="' + jsTelephoneInput.classNames.telFlagsListItemIcon + ' ' + jsTelephoneInput.classNames.telFlagsListItemIcon +'--' + jsTelephoneInput.countriesList[i][1] + '"></div>';
                listItem.innerHTML += '<span class="' + jsTelephoneInput.classNames.telFlagsListItemName + '">' + jsTelephoneInput.countriesList[i][0] + '</span>';
                listItem.innerHTML += '<span class="' + jsTelephoneInput.classNames.telFlagsListItemCode + '">' + jsTelephoneInput.countriesList[i][2] + '</span>';
                elements.telFlagsList.appendChild(listItem);
            }
        }

        // Creates events of the component
        function createEvents(elements) {

            var hideCountryListHandler;

            function showCountryList() {
                if (elements.telFlagsList.className.indexOf('is-visible') > -1) {
                    elements.telFlagsList.className = elements.telFlagsList.className.replace(jsTelephoneInput.classNames.showClass, '');
                } else {
                    elements.telFlagsList.className = jsTelephoneInput.classNames.telFlagsList + jsTelephoneInput.classNames.showClass;
                    hideCountryListHandler = addEvent(document, 'mouseup', hideCountryList);
                }
            }

            function hideCountryList(event, force) {
                if ((event && event.target.className.indexOf('tel-flags') === -1) || force) {
                    elements.telFlagsList.className = elements.telFlagsList.className.replace(jsTelephoneInput.classNames.showClass, '');

                }
                removeEvent(document, 'mouseup', hideCountryListHandler);
            }

            function changeSelectedCountry(event) {
                var newCountry = event.target.getAttribute('data-country');
                if(!newCountry) {
                    newCountry = event.target.parentNode.getAttribute('data-country');
                }
                changeSelectedFlag(jsTelephoneInput.parameters.country, newCountry);
                hideCountryList(false, true);
                changeInfoExample();
                setExampleNumber(newCountry, jsTelephoneInput);
                jsTelephoneInput.field.value = "";
                jsTelephoneInput.setInputsValue();
                jsTelephoneInput.validations.reset();

                function changeSelectedFlag(actualCountryCode, newCountryCode) {
                    var flagDiv = elements.telFlagsSelected.firstChild;
                    flagDiv.className = flagDiv.className.replace('-' + actualCountryCode, '-' + newCountryCode);
                    jsTelephoneInput.parameters.country = newCountryCode;
                }

                function changeInfoExample() {
                    jsTelephoneInput.validations.info.zero.innerHTML = jsTelephoneInput.validations.info.zero.innerHTML.replace(jsTelephoneInput.exampleNumber, jsTelephoneInput.getExampleNumber(jsTelephoneInput.parameters.country));
                }
            }

            elements.telFlagsSelected.onclick = showCountryList;
            addEvent(elements.telFlagsList, 'click', changeSelectedCountry);
        }

        // Sets the default country
        function setDefaultCountry(elements) {
            elements.telFlagsSelected.innerHTML = '<div class="' + jsTelephoneInput.classNames.telFlagsListItemIcon + ' ' + jsTelephoneInput.classNames.telFlagsListItemIcon + '--' + jsTelephoneInput.parameters.country + '"></div>';
        }
    }

    // Add events with ie8 fallback
    function addEvent(element, event, funct, jsTelephoneInput) {
        var handler = function(e) {
            funct(e, jsTelephoneInput)
        };
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else {
            element.attachEvent('on' + event, handler);
        }
        return handler;
    }

    // remove events with ie8 fallback
    function removeEvent(element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler);
        }
        if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
        }
    }

    // Sets the input's placeholder and the info message
    function setExampleNumber(countryCode, jsTelephoneInput) {
        var newExampleNumber = jsTelephoneInput.getExampleNumber(countryCode);
        jsTelephoneInput.field.setAttribute('placeholder', newExampleNumber);
        jsTelephoneInput.exampleNumber = newExampleNumber;
    }

    // Transforms camelCaseAttributes to dash-case-attributes
    function camelCaseToDashCase(string) {
        return string.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }

}());
