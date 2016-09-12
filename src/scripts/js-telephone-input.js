(function() {

    //----------------------------------------------------
    // Define our constructor
    //----------------------------------------------------
    this.jsTelephoneInput = function() {

        //Check if parameters exists.
        if(!arguments[0] || !arguments[1] || typeof arguments[1] !== "object") {
            console.log('js-telephone-input: field or parameters are not defined');
            return;
        }

        // Create global element references
        this.PhoneNumber = require('awesome-phonenumber');
        this.countriesList = require('./country-list');
        this.field = arguments[0];
        this.parameters = (extendDefaults(arguments[1])).bind(this);
        this.validations = getValidations();
        this.elements = getElements();
        this.preventKeyup = false;
        this.phoneNumber = null;
        this.exampleNumber = null;
        this.classNames = {
            inputErrorClass : ' tel-validations-input-error',
            showClass : ' show'
        };

        //Validate User Default Value
        validateInitialValue();

        //Define field events and attributes
        addEvent(this.field, 'keyup', changed);
        addEvent(this.field, 'click', changed);
        addEvent(this.field, 'keypress', checkPressedKey);
        addEvent(this.field, 'blur', setInputsValue);
        setExampleNumber(this.parameters.country);
    };

    //----------------------------------------------------
    // Public Methods
    //----------------------------------------------------

    // Sets the value on the hidden inputs
    jsTelephoneInput.prototype.setInputsValue = function() {
        setInputsValue().call(this);
    };

    // Gets the telephone areaCode and number in json format
    jsTelephoneInput.prototype.getTelephone = function() {
        getTelephone().call(this);
    };

    // Checks if the number is valid
    jsTelephoneInput.prototype.isValid = function() {
        isValid().call(this);
    };

    // Checks if the number is valid and shows the validations
    jsTelephoneInput.prototype.validate = function() {
        validate().call(this);
    };

    //----------------------------------------------------
    // Private Methods
    //----------------------------------------------------

    // Mix default parameters with the user parameters
    function extendDefaults(parameters) {
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
            validations : 'tel-validations',
            areaCode : "telephoneAreaCode",
            number : "telephoneNumber",
            fullNumber : "telephoneFullNumber"
        };

        //Checks parameters written as html attributes
        for (var parameter in defaults) {
            if(this.field.hasAttribute('data-' + parameter)) {
                defaults[parameter] = this.field.getAttribute('data-' + parameter);
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

    // Sets the value on the hidden inputs
    function setInputsValue() {
        var valid = isValid();
        var telephone = getTelephone();
        var numberInput = document.getElementById(this.parameters.number);
        var areaCodeInput = document.getElementById(this.parameters.areaCode);
        var fullNumberInput = document.getElementById(this.parameters.fullNumber);
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
            this.validations.hide(this.validations.info.zero);
            return true;
        }
        return false;
    }

    // Gets the telephone areaCode and number in json format
    function getTelephone() {
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
            fullTelephone: stripValue(this.field.value).join(''),
            areaCode: stripValue(this.field.value.substring(0, areaCodeLimit)).join(''),
            telephone: stripValue(this.field.value.substring(areaCodeLimit + 1, this.field.value.length)).join('')
        }
    }

    // Checks if the number is valid
    function isValid() {
        if (this.field.value.length === 0) {
            if(!this.parameters.required) {
                return true;
            }
            return false;
        }
        if(this.phoneNumber.isValid()) {
            return true;
        }
        return false;
    }

    // Checks if the number is valid and shows the validations
    function validate() {
        if (this.field.value.length === 0) {
            this.validations.reset();
            return;
        }
        if(isValid()) {
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
    }

    //Validate default telephone
    function validateInitialValue() {
        if(this.field.value.length > 0) {
            changed();
            if (!setInputsValue()) {
                this.validations.show(this.validations.elements.invalidDefaultNumber, true, false);
            }
        }
    }

    // Principal event - Fired on keyup
    function changed() {
        if (this.preventKeyup) {
            this.preventKeyup = false;
            return;
        }
        this.phoneNumber = this.PhoneNumber(this.field.value, this.parameters.country);
        var telephone = phoneNumber.getNumber('national');
        if(telephone) {
            this.field.value = telephone;
        }
        validate();
    }

    // Strips everything that's not a number
    function stripValue(maskedValue) {
        return maskedValue.split('').filter(isDigit);

        function isDigit(char) {
            return /\d/.test(char);
        }
    }

    // Validates only number
    function checkPressedKey(event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (!isCharCodeNumber(charCode)) {
            event.preventDefault();
            this.validations.show(this.validations.elements.numbers, true);
            highlightInput();
            this.preventKeyup = true;
        }

        function highlightInput() {
            if (!this.field.className || this.field.className.indexOf(this.classNames.inputErrorClass) === -1) {
                this.field.className += this.classNames.inputErrorClass;
                setTimeout(function () {
                    this.field.className = this.field.className.replace(this.classNames.inputErrorClass, '');
                }, 200);
            }
        }

        function isCharCodeNumber(charCode) {
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        }
    }

    // Get an example number for the country
    function getExampleNumber(countryCode) {
        return this.PhoneNumber.getExample(countryCode, 'fixed-line').getNumber('national');
    }

    // Define all the validations
    function getValidations() {

        // Define elements
        var validations = {};
        validations.parent = document.getElementById(this.field.getAttribute('data-validations'));
        validations.elements = {
            valid: createValidation('valid', 'tel-validations-success tel-validations-valid'),
            possible: createValidation('possible', 'tel-validations-error tel-validations-possible'),
            notANumber: createValidation('notANumber', 'tel-validations-error tel-validations-not-a-number'),
            min: createValidation('min', 'tel-validations-error tel-validations-min'),
            invalidDefaultNumber: createValidation('invalidDefaultNumber', 'tel-validations-error tel-validations-invalid-default-number'),
            max: createValidation('max', 'tel-validations-error tel-validations-max'),
            numbers: createValidation('numbers', 'tel-validations-error tel-validations-numbers'),
            required: createValidation('required', 'tel-validations-error tel-validations-required')
        };
        validations.info = {
            zero: createValidation('zero', 'tel-validations-info tel-validations-zero', true)
        };

        // Define validations methods
        validations.reset = (function (validationExcluded) {
            elements.tel.className = elements.tel.className.replace(' tel-error', '').replace(' tel-success', '');
            for (var type in validations.elements) {
                if (validations.elements.hasOwnProperty(type)) {
                    if (validationExcluded !== validations.elements[type]) {
                        validations.elements[type].className = validations.elements[type].className.replace(this.classNames.showClass, '');
                    }
                }
            }
        }).bind(this);

        // Show a specific validation
        validations.show = (function (validation, reset, isValid) {
            if (reset) {
                validations.reset(validation);
            }
            if (isValid !== undefined) {
                var telClass = (isValid) ? ' tel-success' : ' tel-error';
                if (elements.tel.className.indexOf(telClass) === -1) {
                    elements.tel.className += telClass;
                }
            }
            validations.parent.className += (validations.parent.className.indexOf(this.classNames.showClass) === -1) ? this.classNames.showClass : '';
            validation.className += (validation.className.indexOf(this.classNames.showClass) === -1) ? this.classNames.showClass : '';
        }).bind(this);

        //Hide a specific validation
        validations.hide = (function (validation) {
            validation.className = validation.className.replace(this.classNames.showClass, '');
            //syi.validationsFixer.fixValidationsPosition();
        }).bind(this);

        // Replaces the validations message with a specific variable
        function replaceTemplates(validation) {
            var start = validation.innerHTML.indexOf('##'),
                end = validation.innerHTML.lastIndexOf('##'),
                variable = validation.innerHTML.substring(start + 2, end);
            validation.innerHTML = (start > -1) ? validation.innerHTML.replace('##' + variable + '##', getTextToRepalce(variable) ) : validation.innerHTML;

            function getTextToRepalce(variable) {
                switch(variable) {
                    case 'example' : return getExampleNumber(this.parameters.country)
                }
            }
        }

        // Creates the validation
        function createValidation(name, className, replaceTemplate) {
            var validation = document.createElement('span');
            validation.className = className;
            validation.innerHTML = this.parameters.messages[name];
            if (replaceTemplate) {
                replaceTemplates(validation);
            }
            validations.parent.appendChild(validation);
            return validation;
        }

        return validations;
    }

    // Creates sub components (Country list menu)
    function getElements() {
        var elements = {};
        elements.tel = findAncestor(this.field, 'tel');
        elements.telNumber = findAncestor(this.field, 'tel-number');

        if (parameters.withFlag) {
            elements.tel.className += ' tel-with-flag';
            elements.telFlags = document.createElement('div');
            elements.telFlags.className = 'tel-flags';
            elements.tel.insertBefore(elements.telFlags, elements.tel.firstChild);
            elements.telFlagsSelected = document.createElement('div');
            elements.telFlagsSelected.className = 'tel-flags-selected';
            elements.telFlags.appendChild(elements.telFlagsSelected);
            setDefaultCountry(elements);

            if (parameters.canChangeCountry) {
                elements.telFlagsList = document.createElement('ul');
                elements.telFlagsList.className = 'tel-flags-list';
                elements.telFlags.appendChild(elements.telFlagsList);
                createCountriesList(elements);
                createEvents(elements);
                elements.telFlags.className += ' tel-flags-can-change';
            }
        }

        return elements;

        function findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        }

        // Creates list of countries
        function createCountriesList(elements) {
            for (var i = 0; i < this.countriesList.length; i += 1) {
                var listItem = document.createElement('li');
                var attrCountryCode = document.createAttribute("data-country");
                attrCountryCode.value = this.countriesList[i][1];
                listItem.setAttributeNode(attrCountryCode);
                listItem.className = 'tel-flags-list-item';
                listItem.innerHTML = '<div class="tel-flags-list-item-flag ' + this.countriesList[i][1] + '"></div><span class="tel-flags-list-item-name">' + this.countriesList[i][0] + '</span><span class="tel-flags-list-item-code">' + this.countriesList[i][2] + '</span>';
                elements.telFlagsList.appendChild(listItem);
            }
        }

        // Creates events of the component
        function createEvents(elements) {

            function showCountryList() {
                if (elements.telFlagsList.className.indexOf('show') > -1) {
                    elements.telFlagsList.className = elements.telFlagsList.className.replace(' show', '');
                } else {
                    elements.telFlagsList.className = 'tel-flags-list show';
                }
            }

            function hideCountryList(event, force) {
                if ((event && event.target.className.indexOf('tel-flags') === -1) || force) {
                    elements.telFlagsList.className = elements.telFlagsList.className.replace(' show', '');
                }
            }

            function changeSelectedCountry(event) {
                var newCountry = event.target.getAttribute('data-country');
                if(!newCountry) {
                    newCountry = event.target.parentNode.getAttribute('data-country');
                }
                changeSelectedFlag(this.parameters.country, newCountry);
                hideCountryList(false, true);
                changeInfoExample();
                setExampleNumber(newCountry);
                this.field.value = "";
                setInputsValue();
                this.validations.reset();

                function changeSelectedFlag(actualCountryCode, newCountryCode) {
                    var flagDiv = elements.telFlagsSelected.firstChild;
                    flagDiv.className = flagDiv.className.replace(' ' + actualCountryCode, '') + ' ' + newCountryCode;
                    this.parameters.country = newCountryCode;
                }

                function changeInfoExample() {
                    this.validations.info.zero.innerHTML = this.validations.info.zero.innerHTML.replace(this.exampleNumber, getExampleNumber(this.parameters.country));
                }
            }

            elements.telFlagsSelected.onclick = showCountryList;
            addEvent(document, 'mouseup', hideCountryList);
            addEvent(elements.telFlagsList, 'click', changeSelectedCountry);
        }

        // Sets the default country
        function setDefaultCountry(elements) {
            elements.telFlagsSelected.innerHTML = '<div class="tel-flags-list-item-flag ' + this.parameters.country + '"></div>'
        }
    }

    // Add events with ie8 fallback
    function addEvent(element, event, funct) {
        if (element.addEventListener) {
            element.addEventListener(event, function (event) {
                funct(event);
            }, false);
        } else {
            element.attachEvent('on' + event, function (event) {
                funct(event);
            });
        }
    }

    // Sets the input's placeholder and the info message
    function setExampleNumber(countryCode) {
        var newExampleNumber = getExampleNumber(countryCode);
        this.field.setAttribute('placeholder', newExampleNumber);
        this.exampleNumber = newExampleNumber;
    }

}());
