window.onload = function () {
    initializeComponent();
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
            'possible': 'El teléfono es posiblemente correcto.',
            'notANumber': 'El teléfono no es un número.',
            'zero': 'Ingrésalo siguiendo el formato de este ejemplo: ##example##'
        },
        parameters = {
            required: (document.getElementById('required').value == 'Si'),
            withFlag: (document.getElementById('withFlag').value == 'Si'),
            canChangeCountry: (document.getElementById('canChangeCountry').value == 'Si'),
            messages: messages
        };

    //Initialize component
    var telephoneInput = document.getElementById('telephone');
    telephoneInputMask(telephoneInput, parameters);
}

function changeParameters() {
    var initialValue = document.getElementById('initialValue').value;
    var tel = document.getElementById('tel');
    tel.className = 'tel';
    var telNumber = document.createElement('div');
    telNumber.className = 'tel-number';
    telNumber.innerHTML = '<input id="telephone" required type="text" value="' + initialValue + '" data-validations="tel-validations" data-country="' + document.getElementById('country').value + '" data-areaCode="telephoneAreaCode" data-number="telephoneNumber" />';
    var telValidations = document.createElement('div');
    telValidations.id = 'tel-validations';
    telValidations.className = 'tel-validations';
    tel.innerHTML = '';
    tel.appendChild(telNumber);
    tel.appendChild(telValidations);

    initializeComponent()
}
