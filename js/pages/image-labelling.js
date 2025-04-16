/**
 * Script para ferramenta de rotulagem de imagens.
 * Este script gerencia o carregamento de imagens, criação de áreas interativas.
 * e funcionalidades de zoom em uma aplicação de rotulagem.
 */

// ============================================================================
// GERENCIAMENTO DO MENU LATERAL.
// ============================================================================

import { MAX_AREAS } from '../config/config.js';

export function init() {

    // ============================================================================
    // REFERÊNCIAS AOS ELEMENTOS DOM PRINCIPAIS.
    // ============================================================================

    const loadImageButton = document.getElementById('loadImageButton');
    const imageUpload = document.getElementById('imageUpload');
    const imagePlaceholder = document.querySelector('.image-placeholder');
    const overlay = document.getElementById('mainOverlay');
    const areaSection = document.querySelector('.area-section');
    const areaTable = document.querySelector('.area-table');
    const canvasElement = document.getElementById('imageCanvas');
    const addAreaButton = document.getElementById('addAreaButton');
    const zoomModeButton = document.getElementById("zoomModeButton");

    // ============================================================================
    // CONFIGURAÇÃO DO CANVAS (usando fabric.js).
    // ============================================================================

    // Inicializa o canvas do Fabric.js desabilitando a seleção múltipla.
    const canvas = new fabric.Canvas("imageCanvas", { selection: false });

    // Corrige um bug na renderização do texto no Fabric.js.
    fabric.Text.prototype._setTextStyles = function(ctx) {
        ctx.textBaseline = 'alphabetic';
    };

    // Configura estilo padrão para os pontos de manipulação dos objetos.
    fabric.Object.prototype.set({
        cornerStyle: 'circle',         // Formato redondo.
        cornerColor: '#fff',           // Cor branca.
        cornerStrokeColor: '#666',     // Borda cinza.
        cornerSize: 8,                 // Tamanho de 8px.
        transparentCorners: true       // Fundo transparente.
    });

    // Variáveis para controlar o estado do viewport.
    let lastViewportCenter = { x: 0, y: 0 };
    let lastViewportScale = 1;

    // Variáveis para controle de zoom e dimensões.
    let currentZoom = 1;
    let originalImageDimensions = { width: 0, height: 0 };

    // Aqui você tem certeza que o HTML já está no DOM.
    // Exemplo: eventos no aside
    const breadcrumb = document.getElementById("breadcrumb");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
  
    breadcrumb?.addEventListener("click", function () {
        setTimeout(resizeCanvasToImage, 300);
    });
  
    // Chamada inicial do canvas (sem delay).
    updateLastViewportInfo();
    resizeCanvasToImage();

    // ============================================================================
    // GERENCIAMENTO DE ÁREAS.
    // ============================================================================

    const rectsMap = new Map();  // Mapa para armazenar referências aos retângulos.
    const areasData = [];  // Array para armazenar dados de cada área.

    // ============================================================================
    // GERAÇÃO DE ALERTA.
    // ============================================================================

    const alertQueue = [];
    let isAlertShowing = false;

    function showAlert(title = 'Alert', message = 'Test Message') {
        alertQueue.push({ title, message });
        processAlertQueue();
    }

    function processAlertQueue() {
        if (isAlertShowing || alertQueue.length === 0) return;

        isAlertShowing = true;

        const { title, message } = alertQueue.shift();
        const alertBox = document.getElementById('alertBox');
        const titleSpan = alertBox.querySelector('.title');
        const messageSpan = alertBox.querySelector('.mensagem');

        titleSpan.textContent = title;
        messageSpan.textContent = message;

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
    }

    // ============================================================================
    // BLOQUEIO DE BOTÕES.
    // ============================================================================

    /**
     * Desativa temporariamente um botão para prevenir múltiplos cliques rápidos.
     * @param {HTMLElement} button - O botão clicado.
     * @param {number} delay - Tempo em milissegundos para reabilitar o botão (padrão: 1000ms).
     */
    function preventSpamClicks(button, delay = 1000) {
        // Se o botão já estiver desabilitado, não faz nada
        if (button.disabled) return;

        // Desativa o botão
        button.disabled = true;

        // Reativa o botão após o tempo especificado
        setTimeout(() => {
            button.disabled = false;
        }, delay);
    }

    // Seleciona todos os elementos com a classe .button
    document.querySelectorAll('.button').forEach(btn => {
        // Adiciona um ouvinte de clique em cada botão
        btn?.addEventListener('click', function (e) {
            // Chama a função que previne spam
            preventSpamClicks(btn);
        });
    });

    // ============================================================================
    // GERENCIAMENTO DO SELETOR PERSONALIZADO.
    // ============================================================================

    document?.addEventListener('click', function (e) {
        const selectedOption = e.target.closest('.selected-option');
        if (selectedOption) {
            // Primeiro fechamos todos os outros dropdowns com animação.
            document.querySelectorAll('.options:not(.hidden)')
                .forEach(dropdown => {
                    // Não fechamos o dropdown atual ainda.
                    if (dropdown !== selectedOption.nextElementSibling) {
                        dropdown.classList.add('hidden');
                    }
                });
                
            // Agora alternamos o estado do dropdown atual com animação.
            const optionsContainer = selectedOption.nextElementSibling;
            
            // Se o dropdown está escondido, fazemos fadeIn.
            if (optionsContainer.classList.contains('hidden')) {
                // Preparamos o elemento para animação.
                optionsContainer.style.display = 'flex';
                
                // Usamos requestAnimationFrame para garantir que o display seja aplicado.
                // Antes de remover a classe hidden (isso garante a animação).
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        optionsContainer.classList.remove('hidden');
                    });
                });
            } 
            // Se o dropdown está visível, fazemos fadeOut.
            else {
                // Adicionamos a classe hidden para iniciar a animação de fadeOut.
                optionsContainer.classList.add('hidden');
                
                // Esperamos a animação terminar antes de mudar o display para 'none'.
                optionsContainer?.addEventListener('transitionend', function handler() {
                    if (optionsContainer.classList.contains('hidden')) {
                        optionsContainer.style.display = 'none';
                    }
                    optionsContainer.removeEventListener('transitionend', handler);
                });
            }
            return;
        }
    
        const option = e.target.closest('.option');
        if (option) {
            const customSelect = option.closest('.custom-select');
            const selectedOption = customSelect.querySelector('.selected-option span');
            const selectedImg = customSelect.querySelector('.selected-img');
            
            // Pegar o texto e a imagem da opção selecionada
            const optionText = option.querySelector('span').textContent;
            const optionImg = option.querySelector('img').src;
            
            // Atualizar a visualização no dropdown
            selectedOption.textContent = optionText;
            selectedImg.src = optionImg;
            selectedImg.style.display = 'inline-block';
            
            // Obter o valor da opção selecionada
            const optionValue = option.getAttribute('data-value');
            
            // Encontrar o ID da área na linha da tabela
            const tableRow = customSelect.closest('tr');
            const areaId = parseInt(tableRow.cells[0].textContent, 10);
            
            // Atualizar o tipo da área no array areasData
            const areaIndex = areasData.findIndex(area => area.id === areaId);
            if (areaIndex !== -1) {
                areasData[areaIndex].type = {
                    value: optionValue,
                    name: optionText
                };
                // Descomente para debugar.
                //console.log(`Área ${areaId} atualizada com tipo: ${optionText} (${optionValue})`);
            }
            // Descomente para debugar.
            /*
            } else {
                console.warn(`Área com ID ${areaId} não encontrada no array areasData`);
            }
            */
    
            // Fade out do dropdown após selecionar uma opção.
            const optionsContainer = customSelect.querySelector('.options');
            optionsContainer.classList.add('hidden');
            
            // Esperamos a animação terminar antes de mudar o display para 'none'.
            optionsContainer?.addEventListener('transitionend', function handler() {
                if (optionsContainer.classList.contains('hidden')) {
                    optionsContainer.style.display = 'none';
                }
                optionsContainer.removeEventListener('transitionend', handler);
            });
        }

        // Fecha todos os dropdowns quando clicar fora com animação.
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.options:not(.hidden)').forEach(dropdown => {
                // Aplica animação de fadeOut.
                dropdown.classList.add('hidden');
                
                // Espera a animação terminar antes de mudar o display para 'none'.
                dropdown?.addEventListener('transitionend', function handler() {
                    if (dropdown.classList.contains('hidden')) {
                        dropdown.style.display = 'none';
                    }
                    dropdown.removeEventListener('transitionend', handler);
                });
            });
        }
    });

    // ============================================================================
    // UTILITÁRIOS DE ANIMAÇÃO.
    // ============================================================================

    /**
     * Exibe um elemento com efeito fade-in.
     * @param {HTMLElement} element - Elemento a ser exibido.
     * @param {string} displayType - Tipo de display (block, flex, etc.).
     */
    function fadeIn(element, displayType = 'block') {
        // Configura o elemento como invisível antes de exibi-lo.
        element.style.opacity = '0';
        element.style.display = displayType;

        // Usa requestAnimationFrame para garantir que o browser reconheça a mudança.
        // de display antes de iniciar a animação.
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        });
    }

    /**
     * Oculta um elemento com efeito fade-out.
     * @param {HTMLElement} element - Elemento a ser ocultado.
     * @param {Function} callback - Função opcional a ser executada após a animação.
     */
    function fadeOut(element, callback) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';

        // Aguarda o fim da transição para ocultar o elemento completamente.
        const handleTransitionEnd = function() {
            element.style.display = 'none';
            element.removeEventListener('transitionend', handleTransitionEnd);
            if (typeof callback === 'function') callback();
        };

        element?.addEventListener('transitionend', handleTransitionEnd);
    }

    // ============================================================================
    // GERENCIAMENTO DE VIEWPORT E REDIMENSIONAMENTO.
    // ============================================================================

    /**
     * Limita chamadas a uma função para melhorar performance.
     * @param {Function} func - Função a ser limitada.
     * @param {number} limit - Tempo mínimo entre chamadas (ms).
     * @return {Function} Função limitada.
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Função de redimensionamento com throttle para evitar múltiplas chamadas.
    const throttledResize = throttle(() => {
        updateLastViewportInfo();
        resizeCanvasToImage();
    }, 100);

    // Adiciona evento de redimensionamento à janela.
    window?.addEventListener('resize', throttledResize);

    // ============================================================================
    // CARREGAMENTO DE IMAGEM.
    // ============================================================================

    // Configura o botão para acionar o seletor de arquivos.
    loadImageButton?.addEventListener('click', () => {
        imageUpload.click();
    });

    // Processa a imagem selecionada pelo usuário.
    imageUpload?.addEventListener('change', function(event) {
        // IMPLEMENTAR REQUISIÇÃO DA IMAGEM AQUI.
        // const file = requestImageAPI().
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        // Mostra overlay de carregamento.
        fadeIn(overlay, 'flex');

        reader.onload = () => {
            // Cria uma imagem para obter as dimensões e verificar se carregou.
            const img = new Image();
            img.onload = function() {
                fabric.Image.fromURL(reader.result, function(fabricImg) {
                    // Oculta placeholder.
                    imagePlaceholder.style.display = 'none';
            
                    // Mostra o canvas.
                    canvasElement.style.display = 'block';
            
                    // Reset do zoom.
                    currentZoom = 1;
                    canvas.setZoom(1);
                    
                    // Redefine dimensões originais.
                    originalImageDimensions = {
                        width: fabricImg.width,
                        height: fabricImg.height
                    };

                    // Redimensiona o DOM canvas pro tamanho da imagem.
                    canvasElement.width = fabricImg.width;
                    canvasElement.height = fabricImg.height;
            
                    // Redefine o canvas para o tamanho original primeiro.
                    canvas.setDimensions({
                        width: fabricImg.width,
                        height: fabricImg.height
                    });
            
                    // Limpa o canvas existente antes de adicionar nova imagem.
                    canvas.clear();
            
                    // Aplica a imagem como fundo
                    canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
                        scaleX: 1,
                        scaleY: 1,
                        originX: 'left',
                        originY: 'top'
                    });

                    // Redimensiona o canvas para se ajustar ao container.
                    setTimeout(() => {
                        updateLastViewportInfo();
                        resizeCanvasToImage();
                        // Esconde o botão de carregar e mostra a seção de áreas.
                        fadeOut(loadImageButton, () => {
                            fadeIn(areaSection, 'flex');
                            fadeOut(overlay);
                        });
                    }, 100);
                });
            };
            img.src = reader.result;
        };

        reader.readAsDataURL(file);
    });

    // ============================================================================
    // UTILITÁRIOS DE COR.
    // ============================================================================

    /**
     * Gera uma cor aleatória com transparência para as áreas.
     * @return {string} Cor em formato rgba.
     */
    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }

    /**
     * Converte valores RGB para formato hexadecimal.
     * @param {number} r - Valor de vermelho (0-255).
     * @param {number} g - Valor de verde (0-255).
     * @param {number} b - Valor de azul (0-255).
     * @return {string} Cor em formato hexadecimal (#RRGGBB).
     */
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Converte cor hexadecimal para formato rgba com transparência.
     * @param {string} hex - Cor em formato hexadecimal (#RRGGBB).
     * @param {number} alpha - Valor de transparência (0-1).
     * @return {string} Cor em formato rgba.
     */
    function hexToRgba(hex, alpha = 1.0) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Cria um retângulo interativo no canvas.
     * @param {number} id - ID único da área.
     * @param {string} initialColor - Cor inicial (opcional).
     * @return {Object} Objeto contendo o retângulo e sua etiqueta.
     */
    function createInteractiveRect(id, initialColor = null) {
        const newColor = initialColor || getRandomColor();
        const newColorFull = newColor.replace("0.2", "1.0"); // Versão sólida para borda.

        // Calcula o centro da visualização atual.
        const vpt = canvas.viewportTransform;
        const zoom = canvas.getZoom();

        // Centro da área visível no canvas
        const visibleCenterX = (canvas.width / 2 - vpt[4]) / zoom;
        const visibleCenterY = (canvas.height / 2 - vpt[5]) / zoom;
        
        // Tamanho proporcional ao zoom atual (menor quando zoom é maior).
        const rectSize = 100 / zoom;

        // Cria o retângulo com propriedades interativas.
        const rect = new fabric.Rect({
            left: visibleCenterX - rectSize/2,  // Centraliza horizontalmente.
            top: visibleCenterY - rectSize/2,   // Centraliza verticalmente.
            width: rectSize,
            height: rectSize,
            fill: newColor,                 // Cor com transparência.
            stroke: newColorFull,           // Contorno sólido.
            strokeWidth: 1,                 // Espessura da borda.
            strokeDashArray: [5, 5],        // Borda tracejada.
            objectCaching: false,           // Desativa cache para melhor performance.
            hasControls: true,              // Permite redimensionar.
            hasBorders: true,               // Mostra borda.
            lockRotation: true,             // Impede rotação.
            transparentCorners: false,      // Pontas visíveis.
            cornerSize: 8,                  // Tamanho dos pontos de controle.
            id: id,                         // ID para identificação.
        });

        // Cria etiqueta de texto com o ID.
        const textId = `ID ${id}`;
        const baseFontSize = 14;
        
        const label = new fabric.Text(textId, {
            left: rect.left,
            top: rect.top - 5,
            fontSize: baseFontSize / zoom, // Tamanho da fonte inversamente proporcional ao zoom.
            fill: rect.stroke,             // Mesma cor da borda.
            originX: 'center',             // Alinha pelo centro.
            originY: 'bottom',             // Alinha pela parte inferior.
            textAlign: 'center',           // Centraliza o texto.
            fontFamily: 'Montserrat',      // Fonte padrão.
            selectable: false,             // Impede seleção direta.
            evented: false                 // Ignora eventos de mouse.
        });

        // Adiciona os dois elementos ao canvas.
        canvas.add(rect);
        canvas.add(label);

        /**
         * Atualiza a posição e tamanho da etiqueta quando o retângulo é modificado.
         */
        function updateLabelPosition() {
            const currentZoom = canvas.getZoom();
            const baseFontSize = 14;
            
            // Atualiza posição e tamanho da fonte.
            label.set({
                left: rect.left,
                top: rect.top - 5,
                fontSize: baseFontSize / currentZoom // Mantém o texto legível independente do zoom.
            });
            label.setCoords();
            canvas.renderAll();
        }

        // Adiciona eventos para manter a etiqueta sincronizada com o retângulo.
        rect.on('moving', updateLabelPosition);
        rect.on('scaling', updateLabelPosition);
        rect.on('modified', updateLabelPosition);

        // Eventos para atualizar dados da área quando o retângulo é modificado.
        rect.on('modified', function() {
            updateAreaData(this.id);
        });

        rect.on('moving', function() {
            updateAreaData(this.id);
        });

        rect.on('scaling', function() {
            updateAreaData(this.id);
        });

        // Armazena referência ao retângulo para acesso futuro.
        rectsMap.set(id, rect);
        
        // Conecta o retângulo e a etiqueta para referência mútua.
        rect.associatedLabel = label;
        
        return { rect, label };
    }

    /**
     * Atualiza os dados de uma área quando seu retângulo é modificado.
     * @param {number} id - ID da área a ser atualizada.
     */
    function updateAreaData(id) {
        const rect = rectsMap.get(id);
        if (!rect) return;

        const index = areasData.findIndex(area => area.id === id);
        if (index !== -1) {
            // Atualiza as coordenadas no areasData
            areasData[index].x1 = rect.left;
            areasData[index].y1 = rect.top;
            areasData[index].x2 = rect.left + rect.width * rect.scaleX;
            areasData[index].y2 = rect.top + rect.height * rect.scaleY;
        }
    }

    /**
     * Remove uma área do canvas e dos dados.
     * @param {number} id - ID da área a ser removida.
     * @param {HTMLElement} row - Elemento de linha da tabela a ser removido.
     */
    function deleteArea(id, row) {
        // Remove o retângulo e a etiqueta do canvas.
        const rect = rectsMap.get(id);
        if (rect) {
            if (rect.associatedLabel) {
                canvas.remove(rect.associatedLabel);
            } else {
                // Fallback para o método antigo se não houver referência direta.
                const label = canvas.getObjects('text').find(txt => txt.text === `ID ${id}`);
                if (label) canvas.remove(label);
            }

            canvas.remove(rect);
            rectsMap.delete(id);
            canvas.requestRenderAll();
        }

        // Remove do array de dados.
        const index = areasData.findIndex(area => area.id === id);
        if (index !== -1) {
            areasData.splice(index, 1);
        }

        // Remove a linha da tabela.
        row.remove();
    }

    // ============================================================================
    // ADIÇÃO DE NOVAS ÁREAS.
    // ============================================================================

    // Configura evento para adicionar novas áreas ao clicar no botão.
    addAreaButton?.addEventListener('click', () => {
        const tbody = areaTable?.querySelector('tbody');
        if (!tbody) return;
        
        const currentRows = tbody.querySelectorAll('tr').length;

        // Verifica se atingiu o limite de áreas.
        if (currentRows >= MAX_AREAS) {
            //alert(`Limite máximo de ${MAX_AREAS} áreas atingido.`);
            showAlert("Alert", `Maximum number of Areas reached: ${MAX_AREAS}.`)
            return;
        }

        // Encontra o próximo ID disponível.
        const usedIds = Array.from(tbody.querySelectorAll('tr'))
            .map(tr => {
                const td = tr.querySelector('td');
                return td ? parseInt(td.textContent.trim(), 10) : 0;
            })
            .sort((a, b) => a - b);

        let newId = 0;
        for (let i = 0; i < usedIds.length; i++) {
            if (usedIds[i] !== newId) break;
            newId++;
        }

        // Gera cor aleatória e converte para hexadecimal.
        const rgbaColor = getRandomColor();
        const [r, g, b] = rgbaColor.match(/\d+/g).map(Number);
        const hexColor = rgbToHex(r, g, b);

        // Cria a linha da tabela com o seletor de tipo de semáforo.
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${newId}</td>
            <td>
                <div class="td-flex-content">
                    <div class="custom-select">
                        <div class="selected-option" title="Select Traffic Light Type">
                            <span>Select</span>
                            <img class="selected-img" src="" alt="icon" style="display: none;" />
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="options hidden">
                            <div class="option" data-value="opt1">
                                <span>Left Dog House</span>
                                <img src="./assets/traffic_ligth_1.png" alt="Opção 1" />
                            </div>
                            <div class="option" data-value="opt2">
                                <span>Vertical</span>
                                <img src="./assets/traffic_ligth_2.png" alt="Opção 2" />
                            </div>
                            <div class="option" data-value="opt3">
                                <span>Right Dog House</span>
                                <img src="./assets/traffic_ligth_3.png" alt="Opção 3" />
                            </div>
                            <div class="option" data-value="opt4">
                                <span>Horizontal</span>
                                <img src="./assets/traffic_ligth_4.png" alt="Opção 4" />
                            </div>
                        </div>
                    </div>
                    <div class="color-picker">
                        <input type="color" title="Color picker" />
                    </div>
                    <div class="delete-icon" title="Delete area">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);

        // Configura o seletor de cor.
        const colorInput = row.querySelector('.color-picker input[type="color"]');
        const colorDiv = row.querySelector('.color-picker');

        colorInput.value = hexColor;
        colorDiv.style.backgroundColor = hexColor;

        // Atualiza a cor do retângulo quando o seletor de cor muda.
        colorInput?.addEventListener('input', (e) => {
            const newHex = e.target.value;
            colorDiv.style.backgroundColor = newHex;
        
            const rect = rectsMap.get(newId);
            if (rect) {
                const newFill = hexToRgba(newHex, 0.3);
                const newStroke = hexToRgba(newHex, 1.0);
        
                rect.set({
                    fill: newFill,
                    stroke: newStroke,
                });
        
                // Atualiza a cor da etiqueta.
                if (rect.associatedLabel) {
                    rect.associatedLabel.set({ 
                        fill: newStroke,
                        fontSize: 14 / canvas.getZoom() // Mantém o texto em tamanho proporcional.
                    });
                } else {
                    // Fallback para busca
                    const label = canvas.getObjects('text').find(txt => txt.text === `ID ${newId}`);
                    if (label) {
                        label.set({ 
                            fill: newStroke,
                            fontSize: 14 / canvas.getZoom()
                        });
                    }
                }
        
                canvas.requestRenderAll();
            }
        });

        // Configura o botão de excluir área.
        const deleteBtn = row.querySelector('.delete-icon');
        deleteBtn?.addEventListener('click', () => {
            deleteArea(newId, row);
        });
        
        // Cria o retângulo interativo no canvas
        const { rect, label } = createInteractiveRect(newId, rgbaColor);

        // Adiciona ao array com valores iniciais - usando as coordenadas do retângulo recém-criado.
        areasData.push({
            id: newId,
            type: {
                value: null,
                name: "Not selected"
            },
            x1: rect.left,
            y1: rect.top,
            x2: rect.left + rect.width,
            y2: rect.top + rect.height
        });
    });

    // FUNCIONALIDADE DE ZOOM
    let isZoomModeActive = false;
    let selectionRect = null;
    let isDrawingZoom = false;
    let startX, startY;


    // ============================================================================
    // FUNÇÕES DE GERENCIAMENTO DE ZOOM E VIEWPORTT.
    // ============================================================================

    /**
    /**
     * Aplica zoom a uma área específica do canvas.
     * @param {number} x1 - Coordenada X do início da seleção.
     * @param {number} y1 - Coordenada Y do início da seleção.
     * @param {number} x2 - Coordenada X do fim da seleção.
     * @param {number} y2 - Coordenada Y do fim da seleção.
     */
    function zoomToArea(x1, y1, x2, y2) {
        // Ignora seleções muito pequenas (cliques acidentais).
        if (Math.abs(x2 - x1) < 10 || Math.abs(y2 - y1) < 10) {
            return;
        }
        
        // Calcula as dimensões do retângulo de seleção.
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        
        // Calcula o centro da área selecionada - este é o novo ponto focal.
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Salva o ponto focal do zoom para uso futuro em redimensionamentos.
        lastViewportCenter = {
            x: centerX / canvas.getZoom(),
            y: centerY / canvas.getZoom()
        };
        
        // Obtém dimensões do container atual.
        const containerWidth = canvas.width;
        const containerHeight = canvas.height;
        
        // Calcula a proporção para o zoom, considerando largura e altura.
        const zoomX = containerWidth / width;
        const zoomY = containerHeight / height;
        
        // Usa o menor zoom para garantir que toda a área selecionada seja visível.
        // Multiplica por 0.9 para dar uma pequena margem ao redor da seleção.
        let zoom = Math.min(zoomX, zoomY) * 0.9;
        
        // Garante que o zoom não fique abaixo do mínimo necessário.
        const minZoom = calculateMinZoom();
        if (zoom < minZoom) {
            zoom = minZoom;
        }
        
        // Aplica o zoom calculado e armazena para referência.
        currentZoom = zoom;
        canvas.setZoom(zoom);
        lastViewportScale = zoom;
        
        // Calcula a posição de visualização com precisão.
        // para manter a área selecionada centralizada.
        const panX = -centerX * zoom + canvas.width / 2;
        const panY = -centerY * zoom + canvas.height / 2;
        
        // Aplica transformação no viewport.
        canvas.viewportTransform[4] = panX;
        canvas.viewportTransform[5] = panY;
        
        // Garante que a imagem permaneça dentro dos limites.
        constrainPan();
        
        // Atualiza a visualização.
        canvas.requestRenderAll();
    }

    // ============================================================================
    // VIEWPORT & RESIZE HELPERS.
    // ============================================================================

    /**
     * Redimensiona o canvas para se ajustar ao container mantendo a proporção da imagem.
     * e preservando o ponto focal do zoom atual.
     */
    function resizeCanvasToImage() {
        const container = document.querySelector(".image-container");
        if (!canvas.backgroundImage || !canvasElement || !container) return;

        const img = canvas.backgroundImage;
        const imgWidth = originalImageDimensions.width || img.width;
        const imgHeight = originalImageDimensions.height || img.height;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Escala para caber no container
        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
        img.scaleX = img.scaleY = scale;

        const newWidth = Math.round(imgWidth * scale);
        const newHeight = Math.round(imgHeight * scale);
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        // ⚠️ Importante: Captura o zoom e viewport atual ANTES de redimensionar.
        const currentZoom = canvas.getZoom();
        const vpt = canvas.viewportTransform;
        
        // Calcular o ponto focal atual em coordenadas absolutas da imagem (não do viewport).
        // Este é o ponto que queremos manter visível na mesma posição relativa após o redimensionamento.
        const focalPointX = (canvas.width / 2 - vpt[4]) / currentZoom;
        const focalPointY = (canvas.height / 2 - vpt[5]) / currentZoom;
        
        // Calculamos a posição relativa do ponto focal na imagem (de 0 a 1).
        const relativeX = focalPointX / (oldWidth / currentZoom);
        const relativeY = focalPointY / (oldHeight / currentZoom);

        // Agora aplica redimensionamento do DOM/canvas.
        canvasElement.width = newWidth;
        canvasElement.height = newHeight;
        canvas.setDimensions({ width: newWidth, height: newHeight });

        // Manter o mesmo zoom ou ajustar se necessário.
        let newZoom = currentZoom;
        const minZoom = calculateMinZoom();
        if (newZoom < minZoom || !canvas.__hasBeenZoomed) {
            newZoom = minZoom;
            canvas.__hasBeenZoomed = true;
        }

        // Aplicar o zoom atualizado.
        canvas.setZoom(newZoom);
        
        // Calcular o novo ponto focal baseado na mesma posição relativa.
        const newFocalPointX = relativeX * (newWidth / newZoom);
        const newFocalPointY = relativeY * (newHeight / newZoom);
        
        // Ajustar o viewport para manter o ponto focal na mesma posição.
        canvas.viewportTransform[4] = canvas.width / 2 - newFocalPointX * newZoom;
        canvas.viewportTransform[5] = canvas.height / 2 - newFocalPointY * newZoom;

        // Atualizar objetos, texto e etiquetas no canvas.
        updateObjectsAfterResize(oldWidth, oldHeight, newWidth, newHeight);
        
        // Certificar que a imagem não saia dos limites do container.
        constrainPan();
        
        // Atualizar as informações do viewport para uso futuro.
        updateLastViewportInfo();
        
        // Renderizar todas as alterações.
        canvas.renderAll();
    }

    /**
     * Centraliza o canvas no container.
     */
    function centerCanvas() {
        const zoom = canvas.getZoom();
        const container = document.querySelector(".image-container");
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        canvas.viewportTransform[4] = (containerWidth - canvas.width * zoom) / 2;
        canvas.viewportTransform[5] = (containerHeight - canvas.height * zoom) / 2;

        constrainPan();
        canvas.renderAll();
    }

    /**
     * Armazena informações sobre a visualização atual para uso posterior.
     */
    function updateLastViewportInfo() {
        const vpt = canvas.viewportTransform;
        const zoom = canvas.getZoom();
        
        // Calcula o centro atual da visualização em coordenadas do canvas.
        // Este é o ponto focal que queremos manter ao redimensionar.
        lastViewportCenter = {
            x: (canvas.width/2 - vpt[4]) / zoom,
            y: (canvas.height/2 - vpt[5]) / zoom
        };
        
        lastViewportScale = zoom;
    }
    /**
     * Calcula o zoom mínimo necessário para preencher o container.
     * @return {number} Fator de zoom mínimo.
     */
    function calculateMinZoom() {
        const container = document.querySelector(".image-container");
        if (!container || !canvas.width || !canvas.height) return 1;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calcula a proporção para encaixar a imagem completamente
        const zoomX = containerWidth / canvas.width;
        const zoomY = containerHeight / canvas.height;
        
        // Usa o menor valor para garantir que a imagem caiba completamente.
        return Math.min(zoomX, zoomY);
    }

    /**
     * Limita o movimento da imagem para que ela não saia dos limites do container.
     * Garante que não haja espaços vazios entre as bordas do container e da imagem.
     */
    function constrainPan() {
        const vpt = canvas.viewportTransform;
        const zoom = canvas.getZoom();
        
        const container = document.querySelector(".image-container");
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const zoomedWidth = canvas.width * zoom;
        const zoomedHeight = canvas.height * zoom;
        
        // Tratamento melhorado para quando a imagem é maior que o container.
        if (zoomedWidth > containerWidth) {
            // Impede que a borda direita da imagem ultrapasse o limite direito.
            if (vpt[4] > 0) vpt[4] = 0;
            
            // Impede que a borda esquerda da imagem ultrapasse o limite esquerdo.
            const minX = containerWidth - zoomedWidth;
            if (vpt[4] < minX) vpt[4] = minX;
        } else {
            // Se imagem é menor que o container, centraliza.
            vpt[4] = (containerWidth - zoomedWidth) / 2;
        }
        
        // Tratamento similar para altura
        if (zoomedHeight > containerHeight) {
            // Impede que a borda inferior ultrapasse o limite inferior.
            if (vpt[5] > 0) vpt[5] = 0;
            
            // Impede que a borda superior ultrapasse o limite superior.
            const minY = containerHeight - zoomedHeight;
            if (vpt[5] < minY) vpt[5] = minY;
        } else {
            // Se imagem é menor que o container, centraliza.
            vpt[5] = (containerHeight - zoomedHeight) / 2;
        }
        
        // Forçar renderização após os ajustes.
        canvas.requestRenderAll();
    }

    /**
     * Atualiza todos os objetos no canvas após o redimensionamento.
     * @param {number} oldWidth - Largura anterior do canvas.
     * @param {number} oldHeight - Altura anterior do canvas.
     * @param {number} newWidth - Nova largura do canvas.
     * @param {number} newHeight - Nova altura do canvas.
     */
    function updateObjectsAfterResize(oldWidth, oldHeight, newWidth, newHeight) {
        // Calcula as proporções de escala para redimensionar os objetos.
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;
        
        // Atualiza cada objeto no canvas.
        canvas.getObjects().forEach(obj => {
            // Apenas processa retângulos com ID (áreas marcadas).
            if (obj.type === 'rect' && typeof obj.id !== 'undefined') {
                // Calcula a nova posição e dimensões proporcionalmente.
                const newLeft = obj.left * scaleX;
                const newTop = obj.top * scaleY;
                const newWidth = obj.width * obj.scaleX * scaleX;
                const newHeight = obj.height * obj.scaleY * scaleY;
                
                // Aplica as novas dimensões ao objeto.
                obj.set({
                    left: newLeft,
                    top: newTop,
                    width: newWidth / obj.scaleX,
                    height: newHeight / obj.scaleY,
                });
                
                // Atualiza as coordenadas internas do objeto.
                obj.setCoords();

                // Atualiza os dados da área no array de dados.
                updateAreaData(obj.id);
                
                // Atualiza a etiqueta associada ao retângulo.
                const label = obj.associatedLabel;
                if (label) {
                    // Tamanho base da fonte para referência.
                    const baseFontSize = 14;
                    
                    // Atualiza a posição e o tamanho da fonte da etiqueta.
                    label.set({
                        left: newLeft,
                        top: newTop - 5,
                        fontSize: baseFontSize / canvas.getZoom(), // Ajusta tamanho da fonte pelo zoom.
                    });
                    
                    // Atualiza as coordenadas internas da etiqueta.
                    label.setCoords();
                }
            }
        });
        
        // Renderiza as alterações.
        canvas.renderAll();
    }

    // ============================================================================
    // EVENTOS E CONTROLES DO MODO ZOOM.
    // ============================================================================

    // Configura o botão de modo zoom.
    zoomModeButton?.addEventListener("click", function() {
        // Inverte o estado do modo zoom.
        isZoomModeActive = !isZoomModeActive;
        
        // Atualiza a classe visual do botão para mostrar estado ativo/inativo.
        this.classList.toggle("active", isZoomModeActive);
        
        if (isZoomModeActive) {
            // Quando ativa o modo zoom:
            // Remove qualquer objeto selecionado atualmente.
            canvas.discardActiveObject();
            // Desativa a seleção múltipla.
            canvas.selection = false;
            // Muda o cursor para mira (crosshair).
            canvas.defaultCursor = "crosshair";
        } else {
            // Quando desativa o modo zoom:
            // Reativa a seleção de objetos.
            canvas.selection = true;
            // Restaura o cursor padrão.
            canvas.defaultCursor = "default";
        }
    });

    // Configura eventos de mouse do canvas para funcionalidades de zoom e pan.
    canvas.on("mouse:down", function (opt) {
        // Verifica se clicou em algum objeto (retângulo, texto, etc.).
        const clickedOnObject = opt.target !== null;

        // LÓGICA PRIORITÁRIA: Se clicou em um objeto, permite manipular apenas o objeto.
        if (clickedOnObject) {
            // Cancela qualquer outro modo (dragging, zoom).
            this.isDragging = false;
            isDrawingZoom = false;
            return;
        }
        
        // LÓGICA SECUNDÁRIA: Se está no modo zoom e não clicou em objeto.
        // Inicia desenho do retângulo de seleção para zoom.
        if (isZoomModeActive && !clickedOnObject) {
            // Obtém as coordenadas do clique.
            const pointer = canvas.getPointer(opt.e);
            startX = pointer.x;
            startY = pointer.y;

            // Remove qualquer retângulo de seleção anterior.
            if (selectionRect) {
                canvas.remove(selectionRect);
            }

            // Cria novo retângulo de seleção para o zoom.
            selectionRect = new fabric.Rect({
                left: startX,
                top: startY,
                width: 0,
                height: 0,
                fill: "rgba(0, 0, 255, 0.1)", // Azul semi-transparente.
                stroke: "blue",               // Contorno azul.
                strokeWidth: 1,               // Espessura da borda.
                selectable: false,            // Não selecionável.
                evented: false                // Ignora eventos de mouse.
            });

            // Adiciona o retângulo ao canvas.
            canvas.add(selectionRect);
            isDrawingZoom = true;
        } 
        // LÓGICA TERCIÁRIA: Se não está no modo zoom, não clicou em objeto e zoom > 1.
        // Permite arrastar a imagem (pan).
        else if (!isZoomModeActive && !clickedOnObject && currentZoom > 1) {
            const evt = opt.e;
            // Ativa o modo de arrastar.
            this.isDragging = true;
            // Armazena a posição inicial do cursor.
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
            // Muda o cursor para "mão fechada".
            this.defaultCursor = 'grabbing';
            // Força atualização do cursor instantaneamente.
            canvas.setCursor('grabbing');
            canvasElement.style.cursor = 'grabbing';
        }
    });

    canvas.on("mouse:move", function (opt) {
        // Se está no modo zoom e desenhando o retângulo de seleção.
        if (isZoomModeActive && isDrawingZoom && selectionRect) {
            // Obtém a posição atual do cursor.
            const pointer = canvas.getPointer(opt.e);
            
            // Calcula as dimensões do retângulo baseado no ponto inicial e atual.
            const width = pointer.x - startX;
            const height = pointer.y - startY;

            // Atualiza as dimensões do retângulo de seleção.
            // Garante que o retângulo seja criado em qualquer direção de arrasto.
            selectionRect.set({
                width: Math.abs(width),
                height: Math.abs(height),
                left: width < 0 ? pointer.x : startX,
                top: height < 0 ? pointer.y : startY
            });

            // Renderiza as alterações.
            canvas.renderAll();
        } 
        // Se está arrastando a imagem (pan).
        else if (this.isDragging) {
            const evt = opt.e;
            
            // Calcula a distância de movimento desde o último quadro.
            const deltaX = evt.clientX - this.lastPosX;
            const deltaY = evt.clientY - this.lastPosY;
            
            // Atualiza a posição de visualização.
            const vpt = this.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            
            // Mantém a imagem dentro dos limites do container.
            constrainPan();
            
            // Renderiza as alterações.
            this.requestRenderAll();
            
            // Atualiza as últimas posições do cursor.
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
        }
    });

    canvas.on("mouse:up", function (opt) {
        // Finaliza o zoom quando no modo zoom e estiver desenhando seleção.
        if (isZoomModeActive && isDrawingZoom && selectionRect) {
            // Marca como finalizado o desenho do retângulo.
            isDrawingZoom = false;

            // Captura as coordenadas finais da seleção.
            const x1 = selectionRect.left;
            const y1 = selectionRect.top;
            const x2 = x1 + selectionRect.width;
            const y2 = y1 + selectionRect.height;

            // Remove o retângulo de seleção.
            canvas.remove(selectionRect);
            selectionRect = null;

            // Aplica o zoom à área selecionada.
            zoomToArea(x1, y1, x2, y2);
        }

        // Garante que o cursor retorne ao normal ao soltar o botão do mouse.
        if (this.isDragging) {
            this.isDragging = false;
            canvas.defaultCursor = 'default';
            canvas.setCursor('default');
            canvasElement.style.cursor = 'default';

            updateLastViewportInfo();
        }
        
        // Finaliza o modo de arrastar
        this.isDragging = false;
        this.defaultCursor = 'default';
    });

    // Adiciona suporte para zoom com a roda do mouse (apenas quando no modo zoom).
    canvas.on('mouse:wheel', function(opt) {
        // Só permite zoom com roda quando no modo zoom.
        if (!isZoomModeActive) return;
        
        // Previne comportamentos padrão do navegador (scroll da página).
        const evt = opt.e;
        evt.preventDefault();
        evt.stopPropagation();
        
        // Obtém o ponto onde aplicar o zoom (posição do cursor).
        const pointer = canvas.getPointer(evt);
        
        // Determina a direção do zoom baseado na direção de rolagem.
        // deltaY positivo = rolar para baixo = diminuir zoom.
        // deltaY negativo = rolar para cima = aumentar zoom.
        const delta = evt.deltaY;
        const zoomFactor = 1.1; // 10% de mudança por vez.
        let newZoom = canvas.getZoom();
        
        if (delta > 0) {
            // Zoom out (afasta).
            newZoom = newZoom / zoomFactor;
        } else {
            // Zoom in (aproxima).
            newZoom = newZoom * zoomFactor;
        }
        
        // Define limites para o zoom.
        // Limite inferior: O zoom mínimo necessário para ver a imagem completa.
        // Limite superior: 20x (para evitar consumo excessivo de memória).
        newZoom = Math.min(Math.max(calculateMinZoom(), newZoom), 20);
        
        // Melhora a precisão do zoom no ponto do cursor.
        // Salva a posição do ponto antes do zoom (coordenadas do mundo).
        const pointBefore = {
            x: pointer.x / canvas.getZoom(),
            y: pointer.y / canvas.getZoom()
        };
        
        // Aplica o novo zoom.
        canvas.setZoom(newZoom);
        currentZoom = newZoom;
        
        // Calcula o ponto após o zoom.
        const pointAfter = {
            x: pointer.x / newZoom,
            y: pointer.y / newZoom
        };
        
        // Ajusta o deslocamento para manter o ponto do cursor na mesma posição.
        canvas.viewportTransform[4] += (pointAfter.x - pointBefore.x) * newZoom;
        canvas.viewportTransform[5] += (pointAfter.y - pointBefore.y) * newZoom;
        
        // Atualiza o tamanho das etiquetas de texto para manter legibilidade.
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'text' && obj.text && obj.text.startsWith('ID ')) {
                const baseFontSize = 14;
                obj.set({
                    fontSize: baseFontSize / newZoom
                });
                obj.setCoords();
            }
        });
        
        // Garante que a imagem fique dentro dos limites.
        constrainPan();
        
        // Atualiza as informações de viewport para referência futura.
        updateLastViewportInfo();
        
        // Renderiza as alterações.
        canvas.requestRenderAll();
    });

    /**
     * Resetar o zoom para o nível mínimo e centralizar a imagem.
     */
    function resetZoom() {
        // Calcula o zoom mínimo necessário para ver a imagem completa.
        const minZoom = calculateMinZoom();
        currentZoom = minZoom;
        
        // Aplica o zoom mínimo.
        canvas.setZoom(minZoom);
        
        // Centraliza a imagem no container.
        centerCanvas();
        
        // Atualiza o tamanho das etiquetas para o novo zoom.
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'text' && obj.text && obj.text.startsWith('ID ')) {
                const baseFontSize = 14;
                obj.set({
                    fontSize: baseFontSize / minZoom
                });
                obj.setCoords();
            }
        });

        updateLastViewportInfo();
        
        // Atualiza o viewport.
        canvas.renderAll();
    }

    // Configura o botão de reset de zoom.
    const resetZoomButton = document.getElementById("zoomRemoveButton");
    resetZoomButton?.addEventListener("click", function() {
        resetZoom();
    });

    // ============================================================================
    // EXPORT.
    // ============================================================================

    /**
     * Função para exportar as áreas como um arquivo JSON
     */
    function exportAreasAsJSON() {
        // Verificar se existem áreas para exportar.
        if (!areasData || areasData.length === 0) {
            showAlert("Alert", "There are no areas to export. Please add at least one area.");
            return;
        }
        
        // Verificar se todas as áreas têm type definido corretamente.
        // Procurando por áreas com type.value nulo ou não selecionado.
        const areasWithoutType = areasData.filter(area => 
            !area.type || 
            area.type.value === null || 
            area.type.value === undefined ||
            area.type.name === "Not selected" ||
            area.type.name === "Select"
        );
        
        if (areasWithoutType.length > 0) {
            const areaNumbers = areasWithoutType.map(area => area.id).join(', ');
            showAlert("Alert", `The areas with IDs [${areaNumbers}] have no traffic light type defined. Please select a type for all areas before exporting.`);
            return;
        }
        
        try {
            // Criar objeto para exportação com metadados.
            const exportData = {
                exportDate: new Date().toISOString(),
                totalAreas: areasData.length,
                areas: areasData
            };
            
            // Converter para string JSON formatada.
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Criar um blob com os dados.
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Criar URL para o blob
            const url = URL.createObjectURL(blob);
            
            // Criar elemento de link temporário para download.
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `traffic_light_areas_${new Date().toISOString().slice(0, 19)}.json`;
            
            // Adicionar ao documento, clicar e remover.
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Limpar recursos
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Exibir mensagem de sucesso.
            showAlert("Success", `${areasData.length} areas successfully exported!`);
        } catch (error) {
            console.error("Error exporting areas:", error);
            showAlert("Erro", "Failed to export areas. Check the console for details.");
        }
    }
    const exportBtn = document.getElementById('exportAreas');
    exportBtn?.addEventListener('click', exportAreasAsJSON);
}