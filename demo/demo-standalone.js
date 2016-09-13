window.onload = function () {
    //Define parameters
    var messages = {
            'required': 'Completa este dato.',
            'codeArea': 'Ingresa el código de área.',
            'valid': 'El teléfono es correcto.',
            'min': 'Este teléfono tiene menos dígitos de los requeridos.',
            'invalidDefaultNumber': 'El teléfono cargado en tu cuenta no es válido. Verifícalo por favor.',
            'max': 'Este teléfono excede el máximo de dígitos posible.',
            'numbers': 'Sólo puedes ingresar números.',
            'zero': 'Ingrésalo siguiendo el formato de este ejemplo: ##example##'
        },
        parameters = {
            required: true,
            withFlag: true,
            country: 'ar',
            messages: messages,
            validations : 'tel-validations',
            areaCode : "telephoneAreaCode",
            number : "telephoneNumber",
            fullNumber : "telephoneFullNumber"
        };

    var telephoneInput = document.getElementById('telephone');

    //Initialize component
    telephoneInput = new jsTelephoneInput(telephoneInput, parameters);

    //Call method
    console.log(telephoneInput.isValid());
};
