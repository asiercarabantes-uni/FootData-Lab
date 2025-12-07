

// load the content dynamically
function loadContent(url) {
    fetch(url)
    .then(response => response.text())
    .then(html => {
        document.getElementById('content').innerHTML = html;
    })
    .catch(err => console.error('Error al cargar contenido:', err));
}