/**
 * Script para funções e utilitários de animação.
 */

// Mapa de controle para não empilhar listeners
const activeTransitions = new WeakMap();

/**
 * Exibe um elemento com efeito fade-in.
 * @param {HTMLElement} element - Elemento a ser exibido.
 * @param {string} displayType - Tipo de display (block, flex, etc.).
 */
export function fadeIn(element, displayType = 'block', duration = "0.3", opacity = '1') {

    // Cancela qualquer fadeOut pendente.
    const prevHandler = activeTransitions.get(element);
    if (prevHandler) {
        element?.removeEventListener('transitionend', prevHandler);
        activeTransitions.delete(element);
    }

    // Configura o elemento como invisível antes de exibi-lo.
    element.style.transition = 'none';
    element.style.opacity = '0';
    element.style.display = displayType;

    // Força reflow para que o browser reconheça o novo display antes do fade.
    void element.offsetWidth;

    // Configura o elemento como visivel e com transição.
    element.style.transition = `opacity ${duration}s ease`;
    element.style.opacity = opacity;
}

/**
 * Oculta um elemento com efeito fade-out.
 * @param {HTMLElement} element - Elemento a ser ocultado.
 * @param {Function} callback - Função opcional a ser executada após a animação.
 */
export function fadeOut(element, duration = "0.3", callback) {
    
    // Garante que qualquer transição anterior seja limpa.
    element.style.transition = 'opacity ' + duration + 's ease';
    element.style.opacity = '0';

    // Aguarda o fim da transição para ocultar o elemento completamente.
    const handleTransitionEnd = function() {
        element.style.display = 'none';
        element?.removeEventListener('transitionend', handleTransitionEnd);
        activeTransitions.delete(element);

        // Se existir função de callback, executa ela.
        if (typeof callback === 'function') {
            callback();
        }
    };

    // Remove qualquer listener anterior e registra o novo.
    const prevHandler = activeTransitions.get(element);
    if (prevHandler) {
        element?.removeEventListener('transitionend', prevHandler);
    }

    activeTransitions.set(element, handleTransitionEnd);
    element?.addEventListener('transitionend', handleTransitionEnd);
}