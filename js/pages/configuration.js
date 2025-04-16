/**
 * Script para página de configuração.
 * Este script gerencia o CRUD de configs e UI.
 */

import { showAlert } from '../utils/alertManager.js';
import { MAX_AREAS } from '../config/config.js';

export function init() {


    const input = document.getElementById('maxAreasInput');
    if (input) {

        const MIN = 1;
        const MAX = 30;
    
        input.value = MAX_AREAS;
        input.min = MIN;
        input.max = MAX;
        input.step = 1;
    
        input.addEventListener('input', () => {
            let value = parseInt(input.value, 10);
    
            // Se não for número, limpa
            if (isNaN(value)) {
                input.value = '';
                return;
            }
    
            // Força a ficar dentro do intervalo permitido
            if (value < MIN) input.value = MIN;
            if (value > MAX) input.value = MAX;
        });

        input.placeholder = `MAX_AREAS: ${MAX_AREAS}`;
        input.value = MAX_AREAS;
    }
}