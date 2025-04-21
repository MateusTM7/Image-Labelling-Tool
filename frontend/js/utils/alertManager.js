/**
 * Script para geração de alerta.
 * Este script gerencia os alertas da aplicação na UI.
 */

// ============================================================================
// GERAÇÃO DE ALERTA.
// ============================================================================

const alertQueue = [];
let isAlertShowing = false;

function showAlert(title = 'Alert', message = 'Test Message', icon = "fa-solid fa-triangle-exclamation") {
    alertQueue.push({ title, message, icon });
    processAlertQueue();
}

function processAlertQueue() {
    if (isAlertShowing || alertQueue.length === 0) return;

    isAlertShowing = true;

    const { title, message, icon } = alertQueue.shift();
    const alertBox = document.getElementById('alertBox');
    const titleSpan = alertBox.querySelector('.title');
    const messageSpan = alertBox.querySelector('.mensagem');

    titleSpan.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${title}`;
    messageSpan.textContent = message;

    if (alertBox) {
        // Garantir que .show aplique o top/opacity corretamente.
        alertBox.style.display = 'flex';
        requestAnimationFrame(() => {
            alertBox.classList.add('show');
        });

        setTimeout(() => {
            alertBox.classList.remove('show');
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

export { showAlert };