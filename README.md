# Demo — De Gennaro Propiedades

Versión estática de demostración del panel, con datos de ejemplo (sin ninguna
conexión a Supabase ni a Tokko). Pensada para mostrar cómo se ve y se usa el
CRM sin exponer datos reales ni credenciales.

Es HTML/CSS/JS plano — sin build, sin Node, sin dependencias propias. Las
únicas librerías (Tailwind, Chart.js, jsPDF) se cargan desde CDN.

## Ver en local

Abrí `index.html` con cualquier servidor estático, por ejemplo:

```bash
python3 -m http.server 8080
```

y entrá a `http://localhost:8080`. (Abrir el archivo directamente con
`file://` también funciona para mirar la UI, pero algunos navegadores
bloquean la carga de `data.js`/`app.js` por CORS en ese modo — usar un
servidor evita el problema.)

## Publicar en GitHub Pages

1. Creá un repo nuevo en GitHub (puede ser público) y subí **el contenido de
   esta carpeta** a la raíz de ese repo:

   ```bash
   cd demo
   git init
   git add .
   git commit -m "Demo del CRM De Gennaro Propiedades"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Build and deployment → Source**, elegí
   "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. A los pocos minutos queda publicada en
   `https://<tu-usuario>.github.io/<tu-repo>/`.

## Qué incluye

Todas las secciones del panel real, con datos de ejemplo en memoria
(`data.js`) que se reinician al recargar la página:

- Resumen operativo (KPIs + gráfico)
- Leads (filtro por estado, cambio de estado, historial)
- Vendedores y Métricas
- Agenda (marcar realizada / cancelar / reagendar una visita)
- Propiedades
- Informes a propietarios (descarga en PDF)
- Tasación (estimador interactivo sobre comparables de ejemplo)
- Contratos (generador simplificado, descarga en PDF)

## Qué no incluye

No hay login, no hay base de datos, no hay sincronización con Tokko ni con
n8n — todo lo que "se guarda" vive solo en la memoria del navegador y se
pierde al recargar. Es intencional: es una demo para mostrar el producto, no
una copia funcional de la app real.
