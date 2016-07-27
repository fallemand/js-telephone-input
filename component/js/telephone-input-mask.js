/*!
 //= require components/validationsFixer/validations-fixer.js
 */

function telephoneInputMask(field, parameters) {

    'use strict';

    //Define attributes && state variables.
    var country = field.getAttribute('data-country').toLocaleLowerCase(),
        codeAreaInput = document.getElementById(field.getAttribute('data-areaCode')),
        numberInput = document.getElementById(field.getAttribute('data-number')),
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
        addEvent(field, 'click', changed);
        addEvent(field, 'keyup', changed);
        addEvent(field, 'keypress', checkPressedKey);
        addEvent(field, 'blur', setInputsValue);
        field.setAttribute('placeholder', metadata.example);
    }

    //Validate default telephone
    function validateInitialValue() {
        var initialValue = field.getAttribute('data-value');
        if (initialValue) {
            field.value = initialValue;
            changed();
            if (!setInputsValue()) {
                validations.show(validations.elements.invalidDefaultNumber, true, false);
            }
        }
    }

    // Principal event - Fired on click and keyup
    function changed(event) {
        if (preventKeyup) {
            preventKeyup = false;
            return;
        }
        var oldStart = field.selectionStart,
            oldEnd = field.selectionEnd,
            value = applyMask();
        if (metadata.maskCharacters.indexOf(value.charAt(oldStart - 1)) > -1) {
            if (event.keyCode !== 8 || oldStart === 0) {
                oldStart = oldStart + 1;
                oldEnd = oldEnd + 1;
            }
        }
        field.value = value;
        field.selectionStart = oldStart;
        field.selectionEnd = oldEnd;
        validations.isValid();
    }

    // Strips everything that's not a number
    function stripValue(maskedValue) {
        return maskedValue.split('').filter(isDigit);
    }

    // Returns the value masked
    function applyMask() {
        var arrayValue = stripValue(field.value);
        if (arrayValue.length === 0) {
            return '';
        }
        var mask = getMask(arrayValue),
            array = arrayValue.slice(),
            result = mask.map(function (char) {
                if (array.length === 0) {
                    if(parameters.completeMask) return char;
                    else return '';
                }
                if (char !== '_') {
                    return char
                }
                return array.shift();
            });
        if (array.length > 0) {
            for (var char in array) {
                result.push(array[char]);
            }
        }
        return result.join('');
    }

    // Gets the required mask based on the input value
    function getMask(data) {
        var dataCopy = data.slice();
        var withZero = false;
        var cellphone = false;
        if (startsWithZero(dataCopy)) {
            dataCopy.shift();
            withZero = true;
        }
        var cellphoneCodeLength = startsWithCellphone(dataCopy)
        if (cellphoneCodeLength > -1) {
            dataCopy.splice(0,cellphoneCodeLength);
            cellphone= true;
        }
        var codeAreaDigits = metadata.defaultAreaCodeDigits,
            i = (dataCopy.length <= metadata.maxAreaCodeDigits) ? dataCopy.length : metadata.maxAreaCodeDigits,
            aux;
        do {
            aux = parseInt(dataCopy.slice(0, i).join(''), 10);
            if (metadata.codes.indexOf(aux) > -1) {
                codeAreaDigits = i;
                var isInAreaCodes = true;
            }
            i -= 1;
        }
        while (i >= metadata.minAreaCodeDigits && !isInAreaCodes);
        if(withZero) {
            if(cellphone) {
                return metadata.masks.cellphone.withZero[codeAreaDigits].split('')
            }
            else {
                return metadata.masks.withZero[codeAreaDigits].split('')
            }
        }
        else {
            if(cellphone) {
                return metadata.masks.cellphone[codeAreaDigits].split('')
            }
            else {
                return metadata.masks[codeAreaDigits].split('');
            }
        }
    }

    // Checks if telephone starts with zero
    function startsWithZero(value) {
        return (value[0] === '0');
    }
    
    // Checks if telephone starts with a cellphone code
    function startsWithCellphone(value) {
        if(metadata.cellphoneCodes) {
            var aux = value.slice(0, 2);
            if(metadata.cellphoneCodes.indexOf(parseInt(aux.join(''))) > -1) {
                return aux.length;
            }
        }
        return -1;
        
    }

    // Checks is char is a number
    function isDigit(char) {
        return /\d/.test(char);
    }

    // Validates only number
    function checkPressedKey(event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
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
    }

    // Gets maximum digits of the telephone
    function getMaxCharacters() {
        var value = stripValue(field.value);
        var maxCharacters = metadata.validations.maxCharacters;
        if(startsWithZero(value)) {
            value.shift();
            maxCharacters += 1;
        }
        var cellphoneAreaCodesNumber = startsWithCellphone(value);
        if(cellphoneAreaCodesNumber > -1) {
            maxCharacters += cellphoneAreaCodesNumber;
        }
        return maxCharacters;
    }

    // Define all the validations
    function getValidations() {

        // Define elements
        var validations = {};
        validations.parent = document.getElementById(field.getAttribute('data-validations'));
        validations.elements = {
            valid: createValidation('valid', 'tel-validations-success tel-validations-valid'),
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
            var value = stripValue(field.value),
                maxCharacters = getMaxCharacters();
            if (value.length === maxCharacters) {
                validations.show(validations.elements.valid, true, true);
                pristine = false;
                return true;
            }
            if (value.length === 0) {
                pristine = true;
                validations.reset();
                if(!parameters.required) {
                    return true;
                }
            }
            if (value.length > maxCharacters) {
                validations.show(validations.elements.max, true, false);
            } else if (value.length < maxCharacters && !pristine) {
                validations.show(validations.elements.min, true, false);
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

        function findChild(el, cls) {
            for (var i = 0; i < el.childNodes.length; i += 1) {
                if (el.childNodes[i].classList && el.childNodes[i].classList.contains(cls)) {
                    return el.childNodes[i];
                }
            }
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
                codes: [33, 55, 81, 222, 223, 224, 225, 226, 227, 228, 229, 231, 232, 233, 235, 236, 237, 238, 241, 243, 244, 245, 246, 247, 248, 249, 271, 272, 273, 274, 275, 276, 278, 279, 281, 282, 283, 284, 285, 287, 288, 294, 296, 297, 311, 312, 313, 314, 315, 316, 317, 319, 321, 322, 323, 324, 325, 326, 327, 328, 329, 341, 342, 343, 344, 345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356, 357, 358, 359, 371, 372, 373, 374, 375, 376, 377, 378, 381, 382, 383, 384, 385, 386, 387, 388, 389, 391, 392, 393, 394, 395, 411, 412, 413, 414, 415, 417, 418, 419, 421, 422, 423, 424, 425, 426, 427, 428, 429, 431, 432, 433, 434, 435, 436, 437, 438, 441, 442, 443, 444, 445, 447, 448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 459, 461, 462, 463, 464, 465, 466, 467, 468, 469, 471, 472, 473, 474, 475, 476, 477, 478, 481, 482, 483, 485, 486, 487, 488, 489, 492, 493, 494, 495, 496, 498, 499, 588, 591, 592, 593, 594, 595, 596, 597, 599, 612, 613, 614, 615, 616, 618, 621, 622, 623, 624, 625, 626, 627, 628, 629, 631, 632, 633, 634, 635, 636, 637, 638, 639, 641, 642, 643, 644, 645, 646, 647, 648, 649, 651, 652, 653, 656, 658, 659, 661, 662, 664, 665, 667, 668, 669, 671, 672, 673, 674, 675, 676, 677, 686, 687, 694, 695, 696, 697, 698, 711, 712, 713, 714, 715, 716, 717, 718, 719, 721, 722, 723, 724, 725, 726, 727, 728, 731, 732, 733, 734, 735, 736, 737, 738, 739, 741, 742, 743, 744, 745, 746, 747, 748, 749, 751, 753, 754, 755, 756, 757, 758, 759, 761, 762, 763, 764, 765, 766, 767, 768, 769, 771, 772, 773, 774, 775, 776, 777, 778, 779, 781, 782, 783, 784, 785, 786, 789, 791, 797, 821, 823, 824, 825, 826, 828, 829, 831, 832, 833, 834, 835, 836, 841, 842, 844, 845, 846, 861, 862, 864, 866, 867, 868, 869, 871, 872, 873, 877, 878, 891, 892, 894, 897, 899, 913, 914, 916, 917, 918, 919, 921, 922, 923, 924, 932, 933, 934, 936, 937, 938, 951, 953, 954, 958, 961, 962, 963, 964, 965, 966, 967, 968, 969, 971, 972, 981, 982, 983, 984, 985, 986, 987, 988, 991, 992, 993, 994, 995, 996, 997, 998, 999],
                cellphoneCodes: [44, 45],
                maxAreaCodeDigits: 3,
                minAreaCodeDigits: 2,
                example: '(55)4565-9876',
                masks: {
                    2: '(__)____-____',
                    3: '(___)___-____',
                    withZero: {
                        2: '(___)____-____',
                        3: '(____)___-____'
                    },
                    cellphone: {
                        2: '(____)____-____',
                        3: '(_____)___-____',
                        withZero: {
                            2: '(_____)____-____',
                            3: '(______)___-____'
                        }
                    }
                },
                defaultAreaCodeDigits: 3,
                validations: {
                    maxCharacters: 10
                }
            },
            'ar': {
                codes: [2345, 2902, 2317, 3469, 3585, 3865, 3827, 3438, 3465, 2225, 2941, 3571, 3547, 3892, 11, 2337, 3844, 3835, 3827, 3758, 3543, 2478, 2353, 3576, 3402, 3491, 2353, 2296, 2281, 291, 2266, 353, 3563, 3857, 3329, 3466, 2648, 3722, 3534, 2292, 3741, 2925, 2314, 3387, 3438, 2342, 2658, 3894, 3781, 3868, 297, 2335, 2648, 3489, 3846, 3471, 3463, 3752, 2651, 2226, 2323, 2478, 341, 2936, 2254, 2395, 2274, 2357, 2273, 2929, 3464, 2245, 3833, 264, 3491, 2352, 3582, 3456, 3826, 3721, 3731, 2241, 3821, 3825, 2346, 2946, 2948, 299, 2982, 3718, 2473, 3447, 2333, 3722, 3716, 2962, 2291, 297, 3865, 3442, 345, 351, 342, 2223, 2921, 3582, 2922, 2926, 2265, 3468, 3783, 3541, 3467, 3549, 3774, 299, 2316, 2924, 3521, 2626, 2245, 2317, 2334, 2902, 3783, 3401, 3751, 2335, 3488, 3496, 2945, 3454, 3465, 3717, 2337, 3854, 3404, 3752, 2952, 2344, 2625, 2353, 2243, 2245, 2931, 358, 2268, 3725, 2286, 2267, 3711, 2302, 2356, 2265, 2941, 237, 3388, 2224, 3498, 2202, 3777, 3444, 3446, 2929, 2224, 2933, 2336, 3887, 3716, 3711, 2940, 2335, 3467, 3786, 2647, 3525, 3877, 2320, 2354, 2229, 2264, 2362, 2972, 3584, 2623, 2264, 3548, 3437, 2626, 221, 3575, 3885, 3822, 2655, 3385, 3783, 3891, 2285, 2268, 2244, 3877, 3715, 3482, 3533, 3754, 3472, 2242, 220, 3886, 2355, 3497, 2261, 2227, 2948, 3327, 2322, 3547, 2358, 2323, 261, 2953, 3734, 3476, 2221, 2268, 261, 2627, 2257, 223, 3472, 220, 3722, 2927, 261, 2324, 3773, 2657, 220, 2656, 3876, 2291, 3409, 3717, 2271, 3775, 2921, 3841, 3891, 3863, 237, 3562, 2656, 2272, 2262, 299, 3435, 3825, 2343, 3861, 2342, 3755, 3856, 2284, 3532, 3572, 3878, 2982, 343, 3772, 2928, 2396, 2477, 2963, 2923, 2242, 2322, 2254, 223, 3752, 3734, 3732, 3722, 297, 3757, 2965, 3743, 2962, 3722, 2932, 2333, 3843, 2651, 2317, 2475, 3492, 3407, 3869, 3861, 2297, 2965, 2331, 3482, 3832, 3722, 3783, 3543, 2931, 358, 2966, 2964, 2903, 3574, 3572, 3571, 2902, 2935, 2475, 341, 3445, 3382, 3782, 2344, 2393, 2394, 3542, 387, 2474, 3582, 2646, 2325, 2326, 2934, 2257, 3404, 294, 2252, 3408, 3564, 3522, 3754, 3405, 3406, 3458, 264, 2962, 3498, 3476, 2652, 3783, 2261, 2623, 264, 2972, 381, 3461, 3329, 3884, 2627, 388, 2225, 3783, 223, 342, 3838, 2954, 3546, 3460, 2246, 385, 3756, 2934, 2324, 3856, 3493, 3855, 3867, 2293, 2283, 3875, 3858, 2656, 3837, 3846, 3471, 3862, 3576, 2965, 2392, 2983, 2394, 2622, 3543, 2901, 2624, 2354, 3462, 3483, 2221, 3436, 2338, 3583, 2920, 3735, 2625, 3541, 3400, 3522, 3573, 3524, 3544, 2255, 2336, 2925, 2944, 353, 2941, 3845, 3455, 2928, 2265, 2333, 2942, 3487],
                maxAreaCodeDigits: 5,
                minAreaCodeDigits: 2,
                example: '(11)4323-9400',
                masks: {
                    2: '(__)____-____',
                    3: '(___)___-____',
                    4: '(____)__-____',
                    5: '(_____)__-___',
                    withZero: {
                        2: '(___)____-____',
                        3: '(____)___-____',
                        4: '(_____)__-____',
                        5: '(______)__-___'
                    }
                },
                defaultAreaCodeDigits: 3,
                validations: {
                    maxCharacters: 10
                }
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

