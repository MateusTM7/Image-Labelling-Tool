/**
 * Script para página de configuração.
 * Este script gerencia o CRUD de configs e UI.
 */

import { showAlert } from '../utils/alertManager.js';
import { MAX_AREAS, BUTTON_DELAY_CLICK } from '../config/config.js';

export function init() {

    // ===============================
    // MAX_AREAS SECTION
    // ===============================

    const maxAreasInput = document.getElementById('maxAreasInput');
    const setMaxAreasButton = document.getElementById('setMaxAreasValue');

    if (maxAreasInput) {

        const MIN = 1;
        const MAX = 30;
    
        maxAreasInput.value = MAX_AREAS;
        maxAreasInput.min = MIN;
        maxAreasInput.max = MAX;
        maxAreasInput.step = 1;
    
        maxAreasInput.addEventListener('input', () => {
            let value = parseInt(maxAreasInput.value, 10);
    
            // Se não for número, limpa
            if (isNaN(value)) {
                maxAreasInput.value = '';
                return;
            }
    
            // Força a ficar dentro do intervalo permitido
            if (value < MIN) maxAreasInput.value = MIN;
            if (value > MAX) maxAreasInput.value = MAX;
        });

        maxAreasInput.placeholder = `MAX_AREAS: ${MAX_AREAS}`;
        maxAreasInput.value = MAX_AREAS;
    }

    if (setMaxAreasButton && maxAreasInput) {
        setMaxAreasButton.addEventListener('click', async (event) => {

            event.preventDefault(); // Impede que o botão submeta o formulário e recarregue a página.

            // Obtém o valor atual do input e converte para número inteiro.
            const value = parseInt(maxAreasInput.value, 10);
    
            // Verifica se é um número válido, dentro do intervalo permitido e diferente do valor atual.
            if (!isNaN(value) && value >= 1 && value <= 30 && value !== MAX_AREAS) {
                try {
                    // Envia uma requisição POST para o backend com o novo valor de MAX_AREAS.
                    
                    // ===========================================================
                    // PRECISA IMPLEMENTAR NO BACK.
                    // ===========================================================
                    
                    const response = await fetch('/api/config/max-areas', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ MAX_AREAS: value }), // Corpo da requisição com o novo valor.
                    });

                    console.log(JSON.stringify({ MAX_AREAS: value }))
    
                    // Verifica se a resposta foi bem-sucedida.
                    if (response.ok) {
                        // Exibe um alerta de sucesso usando o alertManager.
                        showAlert('Success', `MAX_AREAS updated to ${value}.`);
                    } else {
                        // Exibe um alerta de erro genérico caso a atualização falhe.
                        showAlert('Error', 'Failed to update the configuration.');
                    }
                } catch (err) {
                    // Erro de comunicação (ex: servidor offline, rota inexistente, etc).
                    showAlert('Error', 'Error communicating with the server.');
                    console.error(err);
                }
            } else {
                // Caso o valor esteja fora do intervalo ou seja igual ao atual, avisa o usuário.
                showAlert('Attention', 'Invalid value or equal to current value.');
            }
        });
    }

    // ===============================
    // BUTTON_DELAY_CLICK SECTION
    // ===============================
    const delayInput = document.getElementById('buttonDelayClickInput');
    const setDelayButton = document.getElementById('setButtonDelayClick');

    if (delayInput) {

        const MIN_DELAY = 500;
        const MAX_DELAY = 10000;

        delayInput.value = BUTTON_DELAY_CLICK;
        delayInput.min = MIN_DELAY;
        delayInput.max = MAX_DELAY;
        delayInput.step = 100;

        delayInput.addEventListener('input', () => {
            let value = parseInt(delayInput.value, 10);

            if (isNaN(value)) {
                delayInput.value = '';
                return;
            }

            if (value < MIN_DELAY) delayInput.value = MIN_DELAY;
            if (value > MAX_DELAY) delayInput.value = MAX_DELAY;
        });

        delayInput.placeholder = `DELAY: ${BUTTON_DELAY_CLICK}ms`;
    }

    if (setDelayButton && delayInput) {
        setDelayButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const value = parseInt(delayInput.value, 10);

            if (!isNaN(value) && value >= 500 && value <= 10000 && value !== BUTTON_DELAY_CLICK) {

                // Envia uma requisição POST para o backend com o novo valor de BUTTON_DELAY_CLICK.
                    
                // ===========================================================
                // PRECISA IMPLEMENTAR NO BACK.
                // ===========================================================

                try {
                    const bodyData = { BUTTON_DELAY_CLICK: value };
                    console.log('Enviando:', JSON.stringify(bodyData));

                    const response = await fetch('/api/config/button-delay-click', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyData),
                    });

                    if (response.ok) {
                        showAlert('Success', `BUTTON_DELAY_CLICK updated to ${value}ms.`);
                    } else {
                        showAlert('Error', 'Failed to update the configuration.');
                    }
                } catch (err) {
                    showAlert('Error', 'Error communicating with the server.');
                    console.error(err);
                }
            } else {
                showAlert('Attention', 'Invalid value or equal to current value.');
            }
        });
    }
}