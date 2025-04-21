/**
 * Script para página de prevenção de span click nos botões.
 */

// ============================================================================
// BLOQUEIO DE BOTÕES.
// ============================================================================

import { configPromise } from '../config/config.js';

let buttonDelay = 100; // Valor padrão antes do fetch.

// Carrega o delay configurado.
configPromise.then(config => {
    if (config.BUTTON_DELAY_CLICK !== undefined) {
        buttonDelay = config.BUTTON_DELAY_CLICK;
    }
});

/**
 * Desativa temporariamente um botão para prevenir múltiplos cliques rápidos.
 * @param {HTMLElement} button - O botão clicado.
 * @param {number} delay - Tempo em milissegundos para reabilitar o botão (padrão: 1000ms).
 */
function preventSpamClicks(button, delay = buttonDelay) {
    // Se o botão já estiver desabilitado, não faz nada
    if (button.disabled) return;

    // Desativa o botão
    button.disabled = true;

    // Reativa o botão após o tempo especificado
    setTimeout(() => {
        button.disabled = false;
    }, delay);
}

// Escuta todos os cliques no documento.
document.addEventListener('click', function (e) {

    const btn = e.target.closest('.button'); // Garante que clicou em um botão ou em um elemento filho dele
    
     // Chama a função que previne spam
    if (btn) {
        preventSpamClicks(btn);
    }
});