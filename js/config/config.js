// ============================================================================
// GERENCIAMENTO DE ÁREAS.
// ============================================================================

let MAX_AREAS = 10;  // Número máximo de áreas que podem ser criadas.

// Carrega configuração do JSON.
const configPromise = fetch('./js/config/config.json')
.then(response => response.json())
.then(config => {
    // Verifica se é um número ou uma string que pode ser convertida para número.
    if (config.MAX_AREAS !== undefined) {
        const maxAreasValue = Number(config.MAX_AREAS);

    // Verifica se o valor é um número válido e positivo.
    if (!isNaN(maxAreasValue) && maxAreasValue > 0 && Number.isInteger(maxAreasValue)) {
        MAX_AREAS = maxAreasValue;
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
    return MAX_AREAS; // <-- exportamos esse valor depois de carregado
})
.catch(err => {
    console.warn('Erro ao carregar config.json. Usando valor padrão.', err);
    return MAX_AREAS;
});

export { configPromise, MAX_AREAS };