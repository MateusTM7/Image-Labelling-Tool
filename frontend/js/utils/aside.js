document?.addEventListener("DOMContentLoaded", function () {

    // Busca os elementos principais da interface.
    const breadcrumb = document.getElementById("breadcrumb");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    // Configura o botão do menu para abrir/fechar a barra lateral.
    breadcrumb?.addEventListener("click", function () {
        sidebar.classList.toggle("closed");
        mainContent.classList.toggle("expanded");
    });
});