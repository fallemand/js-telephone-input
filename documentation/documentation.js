window.onload = function () {
    initializeComponent();

    initializeDemo();
};

function initializeComponent() {
    //Define parameters
    var messages = {
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
        parameters = {
            required: (document.getElementById('required').value == 'Yes'),
            withFlag: (document.getElementById('withFlag').value == 'Yes'),
            canChangeCountry: (document.getElementById('canChangeCountry').value == 'Yes'),
            messages: messages
        };

    //Initialize component
    var telephoneInput = document.getElementById('telephone');
    telephoneInput = new jsTelephoneInput(telephoneInput, parameters);

}

function initializeDemo() {

    //Fill select with countries
    var countries = [
        "ar","bo","br","cl","co","do","ec","sv","gt","hn","mx","ni","pa","py","pe","pt","uy","ve"
    ];
    var countrySelect = document.getElementById('country');
    var option;
    for(var country in countries) {
        option = document.createElement('option');
        option.innerText = countries[country];
        countrySelect.appendChild(option);
    }

    //Button event
    var saveButton = document.getElementById('saveParameters');
    saveButton.onclick = function() {changeParameters()};
}

function changeParameters() {
    var initialValue = document.getElementById('initialValue').value;
    var tel = document.getElementById('demo-telephone');
    tel.className = 'ui-telephone';
    var telNumber = document.createElement('div');
    telNumber.className = 'ui-telephone__number';
    telNumber.innerHTML = '<input id="telephone" type="text" value="' + initialValue + '" data-validations="tel-validations" data-country="' + document.getElementById('country').value + '" data-area-code="telephoneAreaCode" data-full-number="telephoneFullNumber" data-number="telephoneNumber" />';
    var telValidations = document.createElement('div');
    telValidations.id = 'tel-validations';
    telValidations.className = 'ui-telephone__validations';
    tel.innerHTML = '';
    tel.appendChild(telNumber);
    tel.appendChild(telValidations);

    initializeComponent();
}
