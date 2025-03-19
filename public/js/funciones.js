document.addEventListener("DOMContentLoaded", function () {
    // Función para permitir solo números en el input de celular
    function soloNumeros(event) {
        var charCode = event.which || event.keyCode;
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    }

    // Función para limitar la entrada a 4 dígitos en clave
    function limitarEntradaClave(event) {
        var input = event.target;
        if (input.value.length >= 4 && event.key >= '0' && event.key <= '9') {
            event.preventDefault();
        }
    }

    // Validar número de celular cuando pierde el foco
    function validarNumeroCelular() {
        var celular = document.getElementById("celular").value;
        var errorSpan = document.getElementById("error-celular");
        var regexp = /^((3|9)[0-9]{9})$/;
        var mensaje = "";

        if (celular.length !== 10) {
            mensaje = "El número debe tener exactamente 10 dígitos.";
        } else if (!regexp.test(celular)) {
            mensaje = "El número debe iniciar con 3 o 9.";
        }

        // Mostrar mensaje de error debajo del contenedor
        errorSpan.textContent = mensaje;
        errorSpan.style.visibility = mensaje ? "visible" : "hidden";
    }

    // Validar clave cuando pierde el foco
    function validarClave() {
        var clave = document.getElementById("clave").value;
        var errorSpan = document.getElementById("error-clave");
        var mensaje = "";

        if (clave.length !== 4) {
            mensaje = "La clave debe tener exactamente 4 dígitos.";
        }

        // Mostrar mensaje de error debajo del contenedor
        errorSpan.textContent = mensaje;
        errorSpan.style.visibility = mensaje ? "visible" : "hidden";
    }

    // Crear y agregar los elementos de error si no existen, dentro del contenedor del input
    function agregarElementoError(inputId, errorId) {
        var input = document.getElementById(inputId);
        var contenedor = input.closest(".form__element"); // Seleccionar el div contenedor

        if (contenedor && !document.getElementById(errorId)) {
            var errorSpan = document.createElement("span");
            errorSpan.id = errorId;
            errorSpan.className = "error";
            errorSpan.style.visibility = "hidden";
            contenedor.appendChild(errorSpan); // Agregar dentro del contenedor
        }
    }

    // Agregar los mensajes de error debajo del contenedor del input
    agregarElementoError("celular", "error-celular");
    agregarElementoError("clave", "error-clave");

    // Asignar eventos a los inputs
    document.getElementById("celular").addEventListener("keypress", soloNumeros);
    document.getElementById("celular").addEventListener("blur", validarNumeroCelular);
    document.getElementById("clave").addEventListener("keypress", limitarEntradaClave);
    document.getElementById("clave").addEventListener("blur", validarClave);
});