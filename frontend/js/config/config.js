// ============================================================================
// GERENCIAMENTO DE ÁREAS.
// ============================================================================

let MAX_AREAS = 10;             // Número máximo de áreas que podem ser criadas.
let BUTTON_DELAY_CLICK = 2000;  // Delay do botão em ms.
let UI_THEME = 'light';         // Tema padrão.

// Função para alterar tema de estilização.
function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light'); // fallback
    }
}

// Carrega configuração do JSON.
const configPromise = fetch('/api/v1/parameters')
.then(response => response.json())
.then(config => {

    // ========== MAX_AREAS ==========

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

    // ========== BUTTON_DELAY_CLICK ==========

    // Validar e ajustar BUTTON_DELAY_CLICK.
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

    // ========== UI_THEME ==========

    // Validar e ajustar UI_THEME.
    if (typeof config.UI_THEME === 'string') {
        const theme = config.UI_THEME.toLowerCase();

        // Verifica se é um dos temas disponíveis.
        if (['light', 'dark'].includes(theme)) {
            UI_THEME = theme;
        }
    }
    
    applyTheme(UI_THEME);
    document.documentElement.classList.remove('loading');

    return { MAX_AREAS, BUTTON_DELAY_CLICK, UI_THEME }; // <-- exportamos esse valor depois de carregado.
})
.catch(err => {
    console.warn('Error loading config.json. Using default value.', err);
    return { MAX_AREAS, BUTTON_DELAY_CLICK, UI_THEME };
});

export { applyTheme, configPromise, MAX_AREAS, BUTTON_DELAY_CLICK, UI_THEME };