window.onload = function () {
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
            required: true,
            withFlag: true,
            country: 'ar',
            messages: messages,
            validations : 'tel-validations',
            areaCode : "telephoneAreaCode",
            number : "telephoneNumber"
        };

    var telephoneInput = document.getElementById('telephone');

    //Initialize component
    telephoneInput = new jsTelephoneInput(telephoneInput, parameters);

    //Call method
    console.log(telephoneInput.isValid());
};
