import { fadeIn, fadeOut } from './effects.js';

/**
 * Script para geração de alerta.
 * Este script gerencia os alertas da aplicação na UI.
 */

// ============================================================================
// GERAÇÃO DE ALERTA.
// ============================================================================

const alertQueue = [];      // Fila de alertas a serem exibidos.
let isAlertShowing = false; // Flag que indica se um alerta está sendo exibido no momento.

/**
 * Adiciona um novo alerta à fila e inicia o processamento.
 * @param {string} title - Título do alerta.
 * @param {string} message - Mensagem do alerta.
 * @param {string} icon - Classe do ícone a ser exibido.
 */
export function showAlert(title = 'Alert', message = 'Test Message', icon = "fa-solid fa-triangle-exclamation") {
    alertQueue.push({ title, message, icon });
    processAlertQueue();
}

/**
 * Processa a fila de alertas, exibindo um de cada vez.
 */
function processAlertQueue() {
    if (isAlertShowing || alertQueue.length === 0) return;

    isAlertShowing = true;

    const { title, message, icon } = alertQueue.shift(); // Pega o próximo alerta da fila.
    const alertBox = document.getElementById('alertBox');
    const titleSpan = alertBox.querySelector('.title');
    const messageSpan = alertBox.querySelector('.message');

    // Preenche o conteúdo do alerta.
    titleSpan.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${title}`;
    messageSpan.textContent = message;

    if (alertBox) {
        // Garantir que .show aplique o top/opacity corretamente.
        alertBox.style.display = 'flex';
        requestAnimationFrame(() => {
            alertBox.classList.add('show');
        });

        // Após 4 segundos, esconde o alerta com uma pequena animação.
        setTimeout(() => {
            alertBox.classList.remove('show');

            // Após a animação de saída, esconde o alerta e libera a fila.
            setTimeout(() => {
                alertBox.style.display = 'none';
                isAlertShowing = false;
                processAlertQueue(); // Processa o próximo.
            }, 400); // Espera a animação de saída.
        }, 4000); // Duração visível.
    } else {
        console.log("Not possible to generate the alert.");
    }
}

/**
 * Esconde a caixa de confirmação com transição suave.
 */
function hideConfirmBox() {

    const confirmBox = document.getElementById('confirmBox');
    const confirmOverlay = document.getElementById('confirmOverlay');

    // Inicia a transição removendo a classe .show.
    confirmBox.classList.remove('show');

    // Listener para aguardar o fim da transição de top/opacity.
    const handleTransitionEnd = (e) => {

        // Garante que a transição foi realmente de algo que nos importa.
        if (e.propertyName === 'opacity' || e.propertyName === 'top') {
            clearTimeout(fallbackTimeout); // Cancela o fallback se a transição acontecer.
            confirmBox.style.display = 'none';
            fadeOut(confirmOverlay, '.3');
            confirmBox.removeEventListener('transitionend', handleTransitionEnd);
        }
    };

    // Fallback para garantir que o confirmBox desapareça mesmo que a transição falhe.
    const fallbackTimeout = setTimeout(() => {
        confirmBox.style.display = 'none';
        fadeOut(confirmOverlay, '.3');
        confirmBox.removeEventListener('transitionend', handleTransitionEnd);
    }, 500); // Tempo máximo da transição (em ms).

    confirmBox.addEventListener('transitionend', handleTransitionEnd);
}

/**
 * Exibe uma caixa de confirmação com título, mensagem e botões confirm/cancel.
 * @param {string} title - Título da caixa.
 * @param {string} message - Mensagem principal.
 * @returns {Promise<boolean>} - Resolve `true` se confirmar, `false` se cancelar.
 */
export function showConfirm(title = 'Confirm', message = 'Are you sure?', icon = "fa-solid fa-triangle-exclamation") {
    return new Promise((resolve) => {
        const confirmBox = document.getElementById('confirmBox');
        const titleEl = confirmBox.querySelector('.title');
        const messageEl = confirmBox.querySelector('.message');
        const confirmBtn = confirmBox.querySelector('#confirmButton');
        const cancelBtn = confirmBox.querySelector('#cancelButton');
        const confirmOverlay = document.getElementById('confirmOverlay');

        if (!confirmBox) {
            console.log("Not possible to generate the confirmation.");
            resolve(false);
            return;
        }

        // Preenche os textos na caixa de confirmação.

        // Preenche o conteúdo do alerta
        titleEl.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${title}`;
        messageEl.textContent = message;
   
        // Mostra a caixa com efeito de transição (top + opacity)
        confirmBox.style.display = 'flex';
        confirmBox.classList.remove('show'); // Começa do estado oculto.
        void confirmBox.offsetWidth; // <- força reflow aqui!
        
        // Agora aplica a transição.
        //confirmOverlay.style.display = 'block'; // Ativa o fundo bloqueante

        fadeIn(confirmOverlay, "flex", "0.001", ".7");
        setTimeout(() => {
            requestAnimationFrame(() => {
                confirmOverlay.classList.add("show");
            });
        }, 1000);
        confirmBox.style.display = 'flex';
        confirmBox.classList.add('show');
        
        // Limpa handlers antigos (evita múltiplos listeners).
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;

        // Botão confirmar: fecha e resolve como `true`
        confirmBtn.onclick = () => {
            hideConfirmBox();
            resolve(true);
        };
        
        // Botão cancelar: fecha e resolve como `false`.
        cancelBtn.onclick = () => {
            hideConfirmBox();
            resolve(false);
        };
    });
}