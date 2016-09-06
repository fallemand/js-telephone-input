/* Google libphonenumber. Lite Versión by jackocnr
   More info: http://jackocnr.com/intl-tel-input.html */
require('./node_modules/intl-tel-input/build/js/utils');

function telephoneInputMask(field, parameters) {

    'use strict';

    //Check if parameters exists.
    if(!field || !parameters) {
        console.log('js-telephone-input: field or parameters are not defined');
        return;
    }

    //Define attributes && state variables.
    var country = (parameters.country) ? parameters.country : field.getAttribute('data-country').toLocaleLowerCase(),
        codeAreaInput = (parameters.codeAreaInput) ? parameters.codeAreaInput : document.getElementById(field.getAttribute('data-areaCode')),
        numberInput = (parameters.numberInput) ? parameters.numberInput : document.getElementById(field.getAttribute('data-number')),
        metadata = getMetadata(country),
        validations = getValidations(),
        elements = getElements(),
        preventKeyup = false,
        pristine = true;

    if (metadata) {
        //Define common metadata
        metadata.inputErrorClass = ' tel-validations-input-error';
        metadata.maskCharacters = ['(', ')', '-'];
        metadata.showClass = ' show';

        //Validate User Default Value
        validateInitialValue();

        //Define field attributes and events
        addEvent(field, 'keyup', changed);
        addEvent(field, 'keypress', checkPressedKey);
        addEvent(field, 'blur', setInputsValue);
    }

    //Validate default telephone
    function validateInitialValue() {
        if(field.value.length > 0) {
            changed();
            if (!setInputsValue()) {
                validations.show(validations.elements.invalidDefaultNumber, true, false);
            }
        }
        else {
            field.setAttribute('placeholder', metadata.example);
        }
    }

    // Principal event - Fired on click and keyup
    function changed() {
        if (preventKeyup) {
            preventKeyup = false;
            return;
        }
        field.value = intlTelInputUtils.formatNumber(field.value, country, intlTelInputUtils.numberFormat.NATIONAL);
        validations.isValid();
    }

    // Strips everything that's not a number
    function stripValue(maskedValue) {
        return maskedValue.split('').filter(isDigit);
    }

    // Checks is char is a number
    function isDigit(char) {
        return /\d/.test(char);
    }

    // Validates only number
    function checkPressedKey(event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (isNotANumber(charCode)) {
            event.preventDefault();
            validations.show(validations.elements.numbers, true);
            highlightInput();
            preventKeyup = true;
        }

        function highlightInput() {
            if (!field.className || field.className.indexOf(metadata.inputErrorClass) === -1) {
                field.className += metadata.inputErrorClass;
                setTimeout(function () {
                    field.className = field.className.replace(metadata.inputErrorClass, '');
                }, 200);
            }
        }

        function isNotANumber(charCode) {
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return true;
            }
            return false;
        }
    }

    // Define all the validations
    function getValidations() {

        // Define elements
        var validations = {};
        validations.parent = document.getElementById(field.getAttribute('data-validations'));
        validations.elements = {
            valid: createValidation('valid', 'tel-validations-success tel-validations-valid'),
            possible: createValidation('possible', 'tel-validations-success tel-validations-possible'),
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
        validations.reset = function (validationExcluded) {
            elements.tel.className = elements.tel.className.replace(' tel-error', '').replace(' tel-success', '');
            for (var type in validations.elements) {
                if (validations.elements.hasOwnProperty(type)) {
                    if (validationExcluded !== validations.elements[type]) {
                        validations.elements[type].className = validations.elements[type].className.replace(metadata.showClass, '');
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
                var telClass = (isValid) ? ' tel-success' : ' tel-error';
                if (elements.tel.className.indexOf(telClass) === -1) {
                    elements.tel.className += telClass;
                }
            }
            validations.parent.className += (validations.parent.className.indexOf(metadata.showClass) === -1) ? metadata.showClass : '';
            validation.className += (validation.className.indexOf(metadata.showClass) === -1) ? metadata.showClass : '';
        };

        //Hide a specific validation
        validations.hide = function (validation) {
            validation.className = validation.className.replace(metadata.showClass, '');
            //syi.validationsFixer.fixValidationsPosition();
        };

        // Checks if the number is valid and shows the validations
        validations.isValid = function () {
            if (field.value.length === 0) {
                pristine = true;
                validations.reset();
                if(!parameters.required) {
                    return true;
                }
            }
            var isValid = intlTelInputUtils.isValidNumber(field.value, country);
            if(isValid) {
                validations.show(validations.elements.valid, true, true);
                pristine = false;
                return true;
            }
            else {
                switch(intlTelInputUtils.getValidationError(field.value, country)) {
                    case intlTelInputUtils.validationError.TOO_SHORT :
                        if(!pristine) {
                            validations.show(validations.elements.min, true, false);
                        }
                        break;
                    case intlTelInputUtils.validationError.TOO_LONG :
                        validations.show(validations.elements.max, true, false);
                        break;
                    case intlTelInputUtils.validationError.NOT_A_NUMBER :
                        validations.show(validations.elements.notANumber, true, false);
                        break;
                    case intlTelInputUtils.validationError.IS_POSSIBLE :
                        validations.show(validations.elements.possible, true, false);
                        break;
                }
            }
            validations.show(validations.info.zero, false);
            //syi.validationsFixer.fixValidationsPosition();
            return false;

        };

        // Replaces the validations message with a specific variable
        function replaceTemplates(validation) {
            var start = validation.innerHTML.indexOf('##'),
                end = validation.innerHTML.lastIndexOf('##'),
                variable = validation.innerHTML.substring(start + 2, end);
            validation.innerHTML = (start > -1) ? validation.innerHTML.replace('##' + variable + '##', metadata[variable]) : validation.innerHTML;
        }

        // Creates the validation
        function createValidation(name, className, replaceTemplate) {
            var validation = document.createElement('span');
            validation.className = className;
            validation.innerHTML = parameters.messages[name];
            if (replaceTemplate) {
                replaceTemplates(validation);
            }
            validations.parent.appendChild(validation);
            return validation;
        }
        return validations;
    }

    // Sets the value on the hidden inputs
    function setInputsValue() {
        pristine = false;
        if (validations.isValid()) {
            validations.hide(validations.info.zero);
            var telephone = getTelephone();
            numberInput.value = telephone.telephone;
            codeAreaInput.value = telephone.areaCode;
            return true;
        }
        numberInput.value = '';
        codeAreaInput.value = '';
        return false;
    }

    // Gets the telephone area code and number
    function getTelephone() {
        return {
            fullTelephone: stripValue(field.value).join(''),
            areaCode: field.value.substring(field.value.lastIndexOf('(') + 1, field.value.lastIndexOf(')')),
            telephone: stripValue(field.value.substring(field.value.lastIndexOf(')') + 1, field.value.length)).join('')
        }
    }

    // Creates sub components (Country list menu)
    function getElements() {
        function findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        }

        // Creates list of countries
        function createCountriesList(elements) {
            var countries = getCountries();
            for (var country in countries) {
                if (countries.hasOwnProperty(country)) {
                    var listItem = document.createElement('li');
                    listItem.className = 'tel-flags-list-item';
                    listItem.innerHTML = '<div class="tel-flags-list-item-flag ' + countries[country].shortName + '"></div><span class="tel-flags-list-item-name">' + countries[country].name + '</span><span class="tel-flags-list-item-code">' + countries[country].code + '</span>';
                    elements.telFlagsList.appendChild(listItem);
                }
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

            function hideCountryList(event) {
                if (event.target.className.indexOf('tel-flags') === -1) {
                    elements.telFlagsList.className = elements.telFlagsList.className.replace(' show', '');
                }
            }

            elements.telFlagsSelected.onclick = showCountryList;
            addEvent(document, 'mouseup', hideCountryList);
        }

        // Sets the default country
        function setDefaultCountry(elements) {
            elements.telFlagsSelected.innerHTML = '<div class="tel-flags-list-item-flag ' + country + '"></div>'
        }

        var elements = {};
        elements.tel = findAncestor(field, 'tel');
        elements.telNumber = findAncestor(field, 'tel-number');

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

    // Gets the metadata for a particular country
    function getMetadata(siteId) {
        var metadata = {
            'mx': {
                example: '(55)1234-5678'
            },
            'ar': {
                example: '(11)1234-5678'
            }
        };
        return metadata[siteId];
    }

    // Gets the metadata for a particular country
    function getCountries() {
        return [
            {
                'shortName': 'ar',
                'name': 'Argentina',
                'code': '+54'
            },
            {
                'shortName': 'mx',
                'name': 'México',
                'code': '+55'
            }
        ];
    }
}

