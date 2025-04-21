/**
 * Script para funções e utilitários de animação.
 */

/**
 * Exibe um elemento com efeito fade-in.
 * @param {HTMLElement} element - Elemento a ser exibido.
 * @param {string} displayType - Tipo de display (block, flex, etc.).
 */
export function fadeIn(element, displayType = 'block', duration = "0.3") {
    // Configura o elemento como invisível antes de exibi-lo.
    element.style.opacity = '0';
    element.style.display = displayType;

    // Usa requestAnimationFrame para garantir que o browser reconheça a mudança.
    // de display antes de iniciar a animação.
    requestAnimationFrame(() => {
        element.style.transition = 'opacity ' + duration + 's ease';
        element.style.opacity = '1';
    });
}

/**
 * Oculta um elemento com efeito fade-out.
 * @param {HTMLElement} element - Elemento a ser ocultado.
 * @param {Function} callback - Função opcional a ser executada após a animação.
 */
export function fadeOut(element, duration = "0.3", callback) {
    element.style.transition = 'opacity ' + duration + 's ease';
    element.style.opacity = '0';

    // Aguarda o fim da transição para ocultar o elemento completamente.
    const handleTransitionEnd = function() {
        element.style.display = 'none';
        element.removeEventListener('transitionend', handleTransitionEnd);
        if (typeof callback === 'function') callback();
    };

    element?.addEventListener('transitionend', handleTransitionEnd);
}