// ============================================================================
// GERENCIAMENTO DE ÁREAS.
// ============================================================================

let MAX_AREAS = 10;  // Número máximo de áreas que podem ser criadas.
let BUTTON_DELAY_CLICK = 2000;

// Carrega configuração do JSON.
const configPromise = fetch('./js/config/config.json')
.then(response => response.json())
.then(config => {

    // Verifica se é um número ou uma string que pode ser convertida para número.
    if (config.MAX_AREAS !== undefined) {
        const maxAreasValue = Number(config.MAX_AREAS);

    // Verifica se o valor é um número válido e positivo.
    if (!isNaN(maxAreasValue) && maxAreasValue > 0 && Number.isInteger(maxAreasValue)) {

        // Se for maior que 30 o valor lido, aplica como 30.
        if (maxAreasValue > 30) {
            maxAreasValue = 30;

        // Se for menor ou igual a 0 o valor lido, aplica como 1.
        } else if (maxAreasValue <= 0) {
            maxAreasValue = 1;

        } else {
            MAX_AREAS = maxAreasValue;
        }

        // Descomentar caso queira testar.
        //console.log(`MAX_AREAS configured to: ${MAX_AREAS}`);
    }
    // Descomentar caso queira testar.
    /*
    } else {
        console.warn(`Invalid value for MAX_AREAS: ${config.MAX_AREAS}. Using the default value: 10.`);
    }
    */
    }

    // Validar e ajustar BUTTON_DELAY_CLICK
    if (config.BUTTON_DELAY_CLICK !== undefined) {

        // Verifica se é um número ou uma string que pode ser convertida para número.
        const delay = Number(config.BUTTON_DELAY_CLICK);

        // Verifica se o valor é um número válido e positivo.
        if (!isNaN(delay) && Number.isInteger(delay)) {
            
            // Se for menor ou igual a 500 o valor lido, aplica como 500.
            if (delay < 500) {
                BUTTON_DELAY_CLICK = 500;
            
            // Se for maior que 10000 o valor lido, aplica como 10000.
            } else if (delay > 10000) {
                BUTTON_DELAY_CLICK = 10000;

            } else {
                BUTTON_DELAY_CLICK = delay;
            }

            // Descomentar caso queira testar.
            //console.log(`MAX_AREAS configured to: ${MAX_AREAS}`);
        }
    }
    // Descomentar caso queira testar.
    /*
    } else {
        console.warn(`Invalid value for BUTTON_DELAY_CLICK: ${config.BUTTON_DELAY_CLICK}. Using the default value: 2000.`);
    }
    */
    return { MAX_AREAS, BUTTON_DELAY_CLICK }; // <-- exportamos esse valor depois de carregado.
})
.catch(err => {
    console.warn('Error loading config.json. Using default value.', err);
    return { MAX_AREAS, BUTTON_DELAY_CLICK };
});

export { configPromise, MAX_AREAS, BUTTON_DELAY_CLICK };