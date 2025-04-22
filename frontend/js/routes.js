import { fadeIn, fadeOut } from './utils/effects.js';

// Definindo as rotas e seus respectivos títulos e arquivos HTML
const routes = {
    '': { title: 'Home', html: '/pages/home.html' },  // Rota padrão, página inicial.
    '/': { title: 'Home', html: '/pages/home.html' },  // Rota padrão, página inicial.
    '/home': { title: 'Home', html: '/pages/home.html' },  // Rota para a página inicial.
    '/image-labelling': { title: 'Image Labelling Tool', html: '/pages/image-labelling.html' },  // Rota para a ferramenta de rotulagem de imagens.
    '/parameters': { title: 'Parameters', html: '/pages/parameters.html' }  // Rota para a página de configurações.
};

// Elementos DOM que serão manipulados
const app = document.getElementById('app');  // Contêiner onde o conteúdo da página será renderizado.
const titleEl = document.getElementById('pageTitle');  // Elemento onde o título da página será exibido.
const fullOverlay = document.getElementById('fullOverlay');  // Elemento para mostrar ou esconder o overlay de carregamento.
const mainOverlay = document.getElementById('mainOverlay');  // Elemento para mostrar ou esconder o overlay de carregamento.

// Função para renderizar a rota com base na URL.
async function renderRoute(pathname = window.location.pathname) {

    if (pathname === '/home') pathname = '/';
    
    fadeIn(mainOverlay, "flex", "0.001", '1');
    setTimeout(() => {
        requestAnimationFrame(() => {
            fullOverlay.classList.add("hidden");
        });
    }, 1000);

    // Busca a rota correspondente ao caminho.
    const route = routes[pathname] || null;

    // Se a rota não existir, exibe uma mensagem de erro.
    if (!route) {
        try {
            const response = await fetch('/pages/404.html');
            const html = await response.text();
    
            // Verifica se o backend devolveu o index.html disfarçado.
            const isInvalid404 = html.includes('{{content}}') || html.includes('<title>');
    
            if (!response.ok || isInvalid404) {
                throw new Error('404.html not found or returned the index.html');
            }
    
            app.innerHTML = html;
            titleEl.textContent = 'Page Not Found';
        } catch (e) {
            app.innerHTML = '<div class="error-container page-container"><div class="page-wraper"><h1>404 - Page Not Found</h1></div></div>';
            titleEl.textContent = 'Error';
        }
        setTimeout(() => {
            requestAnimationFrame(() => {
                fadeOut(mainOverlay);
            });
        }, 300);
        //showLoading(false);
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
        if (pathname === '/image-labelling') {  // Use pathname instead of path
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
        console.error(e);  // Add this to see the actual error
    }

    // Tenta carregar e inicializar scripts específicos para a rota '/parameters'.
    try {
        if (pathname === '/parameters') {  // Use pathname instead of path
            // Primeiro importa o config e aguarda o carregamento do JSON
            const { configPromise } = await import('./config/config.js');
            await configPromise;
            // Só depois importa o módulo da página e inicia
            const module = await import('./pages/parameters.js');
            module.init();
        }
    } catch (e) {
        // Se ocorrer um erro ao carregar o script da rota '/parameters', exibe uma mensagem de erro.
        console.log("Error in loading the parameters.js file or the config.json file.");
        console.error(e);  // Add this to see the actual error
    }

    //showLoading(false);  // Oculta o overlay de carregamento após o processo ser concluído.
    setTimeout(() => {
        requestAnimationFrame(() => {
            fadeOut(mainOverlay);
        });
    }, 300);
    //showLoading(false);
    return;
}

// Intercepta cliques em links internos e usa history.pushState para evitar reload da página
document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.hostname === window.location.hostname && link.pathname in routes) {
        e.preventDefault();
        history.pushState(null, '', link.pathname);
        renderRoute(link.pathname);
    }
});

// Quando o usuário usa os botões de voltar/avançar do navegador
window.addEventListener('popstate', () => {
    renderRoute();
});

// Quando a página termina de carregar
window.addEventListener('DOMContentLoaded', () => {
    renderRoute();
});