// Definindo as rotas e seus respectivos títulos e arquivos HTML
const routes = {
    '': { title: 'Home', html: '/pages/home.html' },  // Rota padrão, página inicial.
    '#/home': { title: 'Home', html: '/pages/home.html' },  // Rota para a página inicial.
    '#/image-labelling': { title: 'Image Labelling Tool', html: '/pages/image-labelling.html' },  // Rota para a ferramenta de rotulagem de imagens.
    '#/configuration': { title: 'Configurations', html: '/pages/configuration.html' }  // Rota para a página de configurações.
};

// Elementos DOM que serão manipulados
const app = document.getElementById('app');  // Contêiner onde o conteúdo da página será renderizado.
const titleEl = document.getElementById('pageTitle');  // Elemento onde o título da página será exibido.
const overlay = document.getElementById('mainOverlay');  // Elemento para mostrar ou esconder o overlay de carregamento.

// Função para mostrar ou esconder o overlay de carregamento.
function showLoading(show = true) {
    overlay.style.display = show ? 'flex' : 'none';  // Exibe ou oculta o overlay dependendo do parâmetro 'show'.
}

// Função para renderizar a rota com base na URL.
async function renderRoute() {
    showLoading(true);  // Exibe o overlay de carregamento.

    // Obtém o caminho da URL, utilizando o hash (parte após o #).
    const path = window.location.hash || '';
    // Busca a rota correspondente ao caminho.
    const route = routes[path] || null;

    // Se a rota não existir, exibe uma mensagem de erro.
    if (!route) {
        app.innerHTML = '<h1>404 - Page Not Found</h1>';
        titleEl.textContent = 'Error';
        showLoading(false);
        return;
    }

    // Tenta carregar o HTML da página correspondente à rota.
    try {
        const response = await fetch(route.html);  // Faz uma requisição para carregar o arquivo HTML.
        const html = await response.text();  // Obtém o conteúdo HTML como texto.
        app.innerHTML = html;  // Atualiza o conteúdo do 'app' com o HTML da rota.
        titleEl.textContent = route.title;  // Atualiza o título da página.
    } catch (e) {
        // Se ocorrer um erro ao carregar o conteúdo, exibe uma mensagem de erro.
        app.innerHTML = '<h1>Error in loading the content.</h1>';
        titleEl.textContent = 'Erro';
    }

    // Tenta carregar e inicializar scripts específicos para a rota '/image-labelling'.
    try {
        if (path === '#/image-labelling') {
            // Primeiro importa o config e aguarda o carregamento do JSON
            const { configPromise } = await import('./config/config.js');
            await configPromise;
            // Só depois importa o módulo da página e inicia
            const module = await import('./pages/image-labelling.js');
            module.init();
        }
    } catch (e) {
        // Se ocorrer um erro ao carregar o script da rota '/image-labelling', exibe uma mensagem de erro.
        console.log("Error in loading the image-labelling.js file or the config.json file.");
    }

    // Tenta carregar e inicializar scripts específicos para a rota '/configuration'.
    try {
        if (path === '#/configuration') {
            // Primeiro importa o config e aguarda o carregamento do JSON
            const { configPromise } = await import('./config/config.js');
            await configPromise;
            // Só depois importa o módulo da página e inicia
            const module = await import('./pages/configuration.js');
            module.init();
        }
    } catch (e) {
        // Se ocorrer um erro ao carregar o script da rota '/image-labelling', exibe uma mensagem de erro.
        console.log("Error in loading the configuration.js file or the config.json file.");
    }

    showLoading(false);  // Oculta o overlay de carregamento após o processo ser concluído.
}

// Intercepta cliques em links para mudar o hash da URL
document.addEventListener('click', e => {
    const link = e.target.closest('a');  // Verifica se o clique foi em um link.
    if (link && link.hash.startsWith('#/')) {  // Se o link for uma rota válida.
        e.preventDefault();  // Previne a navegação padrão do link.
        window.location.hash = link.hash;  // Atualiza o hash da URL com o valor do link.
    }
});

// Adiciona ouvintes de eventos para detectar mudanças no hash ou quando o conteúdo da página for carregado.
window.addEventListener('hashchange', renderRoute);  // Executa 'renderRoute' quando o hash da URL mudar.
window.addEventListener('DOMContentLoaded', renderRoute);  // Executa 'renderRoute' quando o conteúdo da página for completamente carregado.