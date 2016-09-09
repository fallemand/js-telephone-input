global.jsTelephoneInput = function(field, parameters) {

    'use strict';

    /* Google's libphonenumber pre-compiled
     More info: https://github.com/grantila/awesome-phonenumber */
    var PhoneNumber = require('awesome-phonenumber');

    /* Country List: Define here the countries you want to be visible */
    var countriesList = require('./country-list');

    //Check if parameters exists.
    if(!field || !parameters) {
        console.log('js-telephone-input: field or parameters are not defined');
        return;
    }

    //Define attributes && state variables.
    var country = (parameters.country) ? parameters.country : field.getAttribute('data-country').toLocaleLowerCase(),
        codeAreaInput = (parameters.codeAreaInput) ? parameters.codeAreaInput : document.getElementById(field.getAttribute('data-areaCode')),
        numberInput = (parameters.numberInput) ? parameters.numberInput : document.getElementById(field.getAttribute('data-number')),
        fullNumberInput = (parameters.fullNumberInput) ? parameters.fullNumberInput : document.getElementById(field.getAttribute('data-fullNumber')),
        classNames = {
            inputErrorClass : ' tel-validations-input-error',
            showClass : ' show'
        },
        validations = getValidations(),
        elements = getElements(),
        preventKeyup = false,
        phoneNumber,
        exampleNumber;

    //Validate User Default Value
    validateInitialValue();

    //Define field events and attributes
    addEvent(field, 'keyup', changed);
    addEvent(field, 'click', changed);
    addEvent(field, 'keypress', checkPressedKey);
    addEvent(field, 'blur', setInputsValue);
    setExampleNumber(country);

    //Validate default telephone
    function validateInitialValue() {
        if(field.value.length > 0) {
            changed();
            if (!setInputsValue()) {
                validations.show(validations.elements.invalidDefaultNumber, true, false);
            }
        }
    }

    // Principal event - Fired on keyup
    function changed() {
        if (preventKeyup) {
            preventKeyup = false;
            return;
        }
        phoneNumber = PhoneNumber(field.value, country);
        var telephone = phoneNumber.getNumber('national');
        if(telephone) {
            field.value = telephone;
        }
        validations.isValid();
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
            validations.show(validations.elements.numbers, true);
            highlightInput();
            preventKeyup = true;
        }

        function highlightInput() {
            if (!field.className || field.className.indexOf(classNames.inputErrorClass) === -1) {
                field.className += classNames.inputErrorClass;
                setTimeout(function () {
                    field.className = field.className.replace(classNames.inputErrorClass, '');
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
        return PhoneNumber.getExample(countryCode, 'fixed-line').getNumber('national');
    }

    // Define all the validations
    function getValidations() {

        // Define elements
        var validations = {};
        validations.parent = document.getElementById(field.getAttribute('data-validations'));
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
        validations.reset = function (validationExcluded) {
            elements.tel.className = elements.tel.className.replace(' tel-error', '').replace(' tel-success', '');
            for (var type in validations.elements) {
                if (validations.elements.hasOwnProperty(type)) {
                    if (validationExcluded !== validations.elements[type]) {
                        validations.elements[type].className = validations.elements[type].className.replace(classNames.showClass, '');
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
            validations.parent.className += (validations.parent.className.indexOf(classNames.showClass) === -1) ? classNames.showClass : '';
            validation.className += (validation.className.indexOf(classNames.showClass) === -1) ? classNames.showClass : '';
        };

        //Hide a specific validation
        validations.hide = function (validation) {
            validation.className = validation.className.replace(classNames.showClass, '');
            //syi.validationsFixer.fixValidationsPosition();
        };

        // Checks if the number is valid and shows the validations
        validations.isValid = function () {
            if (field.value.length === 0) {
                validations.reset();
                if(!parameters.required) {
                    return true;
                }
                return false;
            }
            if(phoneNumber.isValid()) {
                validations.show(validations.elements.valid, true, true);
                return true;
            }
            if(phoneNumber.toJSON().possibility) {
                switch(phoneNumber.toJSON().possibility) {
                    case 'too-short' :
                        validations.show(validations.elements.min, true, false);
                        break;
                    case 'too-long' :
                        validations.show(validations.elements.max, true, false);
                        break;
                    case 'unknown' :
                        //validations.show(validations.elements.notANumber, true, false);
                        break;
                    case 'is-possible' :
                        validations.show(validations.elements.possible, true, false);
                        break;
                }
                validations.show(validations.info.zero, false);
                //syi.validationsFixer.fixValidationsPosition();
            }
            return false;
        };

        // Replaces the validations message with a specific variable
        function replaceTemplates(validation) {
            var start = validation.innerHTML.indexOf('##'),
                end = validation.innerHTML.lastIndexOf('##'),
                variable = validation.innerHTML.substring(start + 2, end);
            validation.innerHTML = (start > -1) ? validation.innerHTML.replace('##' + variable + '##', getTextToRepalce(variable) ) : validation.innerHTML;

            function getTextToRepalce(variable) {
                switch(variable) {
                    case 'example' : return getExampleNumber(country)
                }
            }
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
        if (validations.isValid()) {
            validations.hide(validations.info.zero);
            var telephone = getTelephone();
            if(numberInput) {
                numberInput.value = telephone.telephone;
            }
            if(codeAreaInput) {
                codeAreaInput.value = telephone.areaCode;
            }
            if(fullNumberInput) {
                fullNumberInput.value = telephone.fullTelephone;
            }
            return true;
        }
        numberInput.value = '';
        codeAreaInput.value = '';
        return false;
    }

    // Gets the telephone area code and number
    function getTelephone() {
        var areaCodeLimit = field.value.indexOf(' ');
        //If the telephone does not contain spaces, cut the areaCode using the "-"
        if(areaCodeLimit === -1) {
            areaCodeLimit = field.value.indexOf('-');
        }
        else {
            //If there are multiple spaces, use the first two parts as the areaCode.
            if((field.value.match(/\s/g) || []).length > 2) {
                areaCodeLimit = field.value.indexOf(' ', areaCodeLimit + 1);
            }
        }
        return {
            fullTelephone: stripValue(field.value).join(''),
            areaCode: stripValue(field.value.substring(0, areaCodeLimit)).join(''),
            telephone: stripValue(field.value.substring(areaCodeLimit + 1, field.value.length)).join('')
        }
    }

    // Creates sub components (Country list menu)
    function getElements() {
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

        function findAncestor(el, cls) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
            return el;
        }

        // Creates list of countries
        function createCountriesList(elements) {
            for (var i = 0; i < countriesList.length; i += 1) {
                var listItem = document.createElement('li');
                var attrCountryCode = document.createAttribute("data-country");
                attrCountryCode.value = countriesList[i][1];
                listItem.setAttributeNode(attrCountryCode);
                listItem.className = 'tel-flags-list-item';
                listItem.innerHTML = '<div class="tel-flags-list-item-flag ' + countriesList[i][1] + '"></div><span class="tel-flags-list-item-name">' + countriesList[i][0] + '</span><span class="tel-flags-list-item-code">' + countriesList[i][2] + '</span>';
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
                changeSelectedFlag(country, newCountry);
                hideCountryList(false, true);
                changeInfoExample();
                setExampleNumber(newCountry);
                field.value = "";
                setInputsValue();
                validations.reset();

                function changeSelectedFlag(actualCountryCode, newCountryCode) {
                    var flagDiv = elements.telFlagsSelected.firstChild;
                    flagDiv.className = flagDiv.className.replace(' ' + actualCountryCode, '') + ' ' + newCountryCode;
                    country = newCountryCode;
                }

                function changeInfoExample() {
                    validations.info.zero.innerHTML = validations.info.zero.innerHTML.replace(exampleNumber, getExampleNumber(country));
                }
            }

            elements.telFlagsSelected.onclick = showCountryList;
            addEvent(document, 'mouseup', hideCountryList);
            addEvent(elements.telFlagsList, 'click', changeSelectedCountry);
        }

        // Sets the default country
        function setDefaultCountry(elements) {
            elements.telFlagsSelected.innerHTML = '<div class="tel-flags-list-item-flag ' + country + '"></div>'
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
        field.setAttribute('placeholder', newExampleNumber);
        exampleNumber = newExampleNumber;
    }
};