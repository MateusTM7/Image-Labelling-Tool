/**
 * Script para página de configuração.
 * Este script gerencia o CRUD de configs e UI.
 */

import { showAlert, showConfirm } from '../utils/alertManager.js';
import { MAX_AREAS, BUTTON_DELAY_CLICK, UI_THEME, applyTheme } from '../config/config.js';

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function init() {
    
    // ===============================
    // MAX_AREAS SECTION
    // ===============================

    const maxAreasInput = document.getElementById('maxAreasInput');
    const setMaxAreasButton = document.getElementById('setMaxAreasValue');

    let currentMaxAreas = MAX_AREAS;

    if (maxAreasInput) {

        const MIN = 1;
        const MAX = 30;
    
        maxAreasInput.value = currentMaxAreas;
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

        maxAreasInput.placeholder = `MAX_AREAS: ${currentMaxAreas}`;
        maxAreasInput.value = currentMaxAreas;
    }

    if (setMaxAreasButton && maxAreasInput) {
        setMaxAreasButton.addEventListener('click', async (event) => {

            event.preventDefault(); // Impede que o botão submeta o formulário e recarregue a página.

            // Obtém o valor atual do input e converte para número inteiro.
            const maxAreasValue = parseInt(maxAreasInput.value, 10);
    
            // Verifica se é um número válido, dentro do intervalo permitido e diferente do valor atual.
            if (!isNaN(maxAreasValue) && maxAreasValue >= 1 && maxAreasValue <= 30 && maxAreasValue  !== currentMaxAreas) {
                try {

                    const confirmedMaxAreasValue = await showConfirm(
                        "Confirm change",
                        `Do you really want to change the value of MAX_AREAS to ${maxAreasValue}?`
                    );

                    if (!confirmedMaxAreasValue) return; // Usuário cancelou.

                    // Envia uma requisição POST para o backend com o novo valor de MAX_AREAS.
                    
                    // ===========================================================
                    // PRECISA IMPLEMENTAR NO BACK.
                    // ===========================================================

                    const bodyDataMaxAreas = { MAX_AREAS: maxAreasValue };

                    const response = await fetch('/api/v1/parameters/update/MAX_AREAS', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyDataMaxAreas), // Corpo da requisição com o novo valor.
                    });
    
                    // Verifica se a resposta foi bem-sucedida.
                    if (response.ok) {
                        // Exibe um alerta de sucesso usando o alertManager.
                        currentMaxAreas = maxAreasValue;
                        maxAreasInput.placeholder = `MAX_AREAS: ${currentMaxAreas}`;
                        maxAreasInput.value = currentMaxAreas;
                        showAlert('Success', `MAX_AREAS updated to ${maxAreasValue}.`, "fa-solid fa-check");
                    } else {
                        // Exibe um alerta de erro genérico caso a atualização falhe.
                        showAlert('Error', 'Failed to update the parameter.', "fa-solid fa-xmark");
                    }
                } catch (err) {
                    // Erro de comunicação (ex: servidor offline, rota inexistente, etc).
                    showAlert('Error', 'Error communicating with the server.', "fa-solid fa-xmark");
                    console.error(err);
                }
            } else {
                // Caso o valor esteja fora do intervalo ou seja igual ao atual, avisa o usuário.
                showAlert('Attention', 'Invalid value or equal to current value.', "fa-solid fa-triangle-exclamation");
            }
        });
    }

    // ===============================
    // BUTTON_DELAY_CLICK SECTION
    // ===============================
    const delayInput = document.getElementById('buttonDelayClickInput');
    const setDelayButton = document.getElementById('setButtonDelayClick');

    let currentDelayClick = BUTTON_DELAY_CLICK;

    if (delayInput) {

        const MIN_DELAY = 500;
        const MAX_DELAY = 10000;

        delayInput.value = currentDelayClick;
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

        delayInput.value = currentDelayClick;
        delayInput.placeholder = `DELAY: ${currentDelayClick}ms`;
    }

    if (setDelayButton && delayInput) {
        setDelayButton.addEventListener('click', async (event) => {

            event.preventDefault();

            const delayValue = parseInt(delayInput.value, 10);

            if (!isNaN(delayValue) && delayValue >= 500 && delayValue <= 10000 && delayValue !== currentDelayClick) {

                // Checa confirmação.
                const confirmedDelayValue = await showConfirm(
                    "Confirm change",
                    `Do you really want to change the value of BUTTON_DELAY_CLICK to ${delayValue}?`
                );

                if (!confirmedDelayValue) return; // Usuário cancelou.

                // Envia uma requisição POST para o backend com o novo valor de BUTTON_DELAY_CLICK.
                    
                // ===========================================================
                // PRECISA IMPLEMENTAR NO BACK.
                // ===========================================================

                try {
                    const bodyDataButtonDelayClick = { BUTTON_DELAY_CLICK: delayValue };

                    const response = await fetch('/api/v1/parameters/update/BUTTON_DELAY_CLICK', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyDataButtonDelayClick),
                    });

                    if (response.ok) {
                        currentDelayClick = delayValue;
                        delayInput.value = currentDelayClick;
                        delayInput.placeholder = `DELAY: ${currentDelayClick}ms`;
                        showAlert('Success', `BUTTON_DELAY_CLICK updated to ${delayValue} ms.`, "fa-solid fa-check");
                    } else {
                        showAlert('Error', 'Failed to update the parameter.', "fa-solid fa-xmark");
                    }
                } catch (err) {
                    showAlert('Error', 'Error communicating with the server.', "fa-solid fa-xmark");
                    console.error(err);
                }
            } else {
                showAlert('Attention', 'Invalid value or equal to current value.', "fa-solid fa-triangle-exclamation");
            }
        });
    }

    // ===============================
    // UI_THEME SECTION
    // ===============================

    const themeSelector = document.getElementById('themeSelector');
    const themeButton = document.getElementById('setThemeButton');

    let currentUiTheme = UI_THEME;
  
    if (themeSelector) {
      themeSelector.addEventListener('click', function (e) {
        const selectedOption = e.target.closest('.selected-option');
        const option = e.target.closest('.option');
  
        // Clique na caixa para abrir/fechar
        if (selectedOption) {
          const optionsContainer = selectedOption.nextElementSibling;
  
          // Fecha outros selects (se houver mais de um)
          document.querySelectorAll('.options:not(.hidden)').forEach(dropdown => {
            if (dropdown !== optionsContainer) {
              dropdown.classList.add('hidden');
              dropdown.style.display = 'none';
            }
          });
  
          if (optionsContainer.classList.contains('hidden')) {
            optionsContainer.style.display = 'flex';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                optionsContainer.classList.remove('hidden');
              });
            });
          } else {
            optionsContainer.classList.add('hidden');
            optionsContainer.addEventListener('transitionend', function handler() {
              if (optionsContainer.classList.contains('hidden')) {
                optionsContainer.style.display = 'none';
              }
              optionsContainer.removeEventListener('transitionend', handler);
            });
          }
  
          return;
        }
  
        // Clique em uma opção
        if (option) {
          const value = option.getAttribute('data-value');
          const label = option.querySelector('span').textContent;
  
          themeSelector.querySelector('.selected-option span').textContent = label;
  
          // Fecha o dropdown
          const optionsContainer = themeSelector.querySelector('.options');
          optionsContainer.classList.add('hidden');
          optionsContainer.addEventListener('transitionend', function handler() {
            if (optionsContainer.classList.contains('hidden')) {
              optionsContainer.style.display = 'none';
            }
            optionsContainer.removeEventListener('transitionend', handler);
          });
  
          // Aplica o tema
          applyTheme(value);
        }
      });
    }

    if (themeSelector && themeButton) {

        // Define valor inicial com base na config atual
        themeSelector.value = currentUiTheme;

        // Aplica o tema atual visualmente no custom select
        const selectedSpan = themeSelector.querySelector('.selected-option span');
        if (selectedSpan) {
            selectedSpan.textContent = capitalize(currentUiTheme);
        }
        
        themeButton.addEventListener('click', async (event) => {

            event.preventDefault();

            const newTheme  = selectedSpan?.textContent?.toLowerCase();
            if (!newTheme ) {
                showAlert('Error', 'No theme selected.', "fa-solid fa-xmark");
                return;
            }
    
            if (newTheme  === currentUiTheme) {
                showAlert('Attention', 'Theme is already applied.', "fa-solid fa-triangle-exclamation");
                return;
            }

            // Envia uma requisição POST para o backend com o novo valor de UI_THEME.
                    
            // ===========================================================
            // PRECISA IMPLEMENTAR NO BACK.
            // ===========================================================

            try {

            // Checa confirmação.
            const confirmedNewThemeValue = await showConfirm(
                "Confirm change",
                `Do you really want to change the value of UI_THEME to ${newTheme}?`
            );

            if (!confirmedNewThemeValue) return; // Usuário cancelou.

                const bodyDataUiTheme = { UI_THEME: newTheme };

                const response = await fetch('/api/v1/parameters/update/UI_THEME', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyDataUiTheme)
                });

                if (response.ok) {
                    applyTheme(newTheme); // Aplica sem recarregar a página.
                    currentUiTheme = newTheme;
                    showAlert('Success', `Theme updated to "${capitalize(newTheme)}".`, "fa-solid fa-check");
                } else {
                    showAlert('Error', 'Failed to update theme.', "fa-solid fa-xmark");
                }
            } catch (err) {
                console.error(err);
                showAlert('Error', 'Error communicating with the server.', "fa-solid fa-xmark");
            }
        });
    }
        
}
