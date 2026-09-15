# FitTrack Free

PWA gratuita de nutrición y fitness, pensada para desplegarse directamente en GitHub Pages.

## Funciones
- Diario por comidas: desayuno, comida, cena y snacks.
- Calorías y macronutrientes.
- Objetivos diarios personalizados.
- Agua.
- Ayuno intermitente.
- Registro de peso y gráficas.
- Recetas y cálculo por ración.
- Escáner de código de barras cuando el navegador soporta `BarcodeDetector`.
- Búsqueda de alimentos escaneados en Open Food Facts.
- Exportación/importación de datos en JSON.
- Instalación como PWA en móvil.
- Funciona sin backend y guarda los datos en `localStorage`.
- Cache offline básica mediante Service Worker.
- Sin anuncios.

## Publicar en GitHub Pages
1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Ve a **Settings > Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub te mostrará la URL pública cuando termine el despliegue.

## Instalar en iPhone
Abre la URL publicada en Safari y usa **Compartir > Añadir a pantalla de inicio**.

## Notas
- El lector por cámara usa html5-qrcode, compatible con Safari/iPhone mediante acceso estándar a la cámara.
- Los productos por código de barras dependen de Open Food Facts y pueden no existir o contener datos incompletos.
- Esta aplicación no sustituye asesoramiento médico o dietético profesional.
- No está afiliada con MyFitnessPal ni utiliza su código, marca o contenido propietario.


## Cambio v3 - cantidades y macros
Los alimentos obtenidos por código de barras conservan sus valores nutricionales de referencia por 100 g.
Al modificar la cantidad, la aplicación recalcula automáticamente calorías, proteínas, carbohidratos y grasas.

Ejemplo:
- Referencia por 100 g: 250 kcal, 20 g proteína, 30 g carbohidratos, 8 g grasa.
- Cantidad introducida: 60 g.
- Resultado: 150 kcal, 12 g proteína, 18 g carbohidratos, 4.8 g grasa.


## Cambio v6 - lector EAN/UPC
- Fuerza los formatos EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39 e ITF.
- Aumenta la frecuencia de lectura a 20 fps.
- Amplía la zona efectiva de lectura.
- Desactiva el detector nativo y utiliza el decodificador de la librería para mejorar compatibilidad en iPhone.
- Intenta activar enfoque continuo y un ligero zoom cuando la cámara lo permite.
- Limpia y valida el código detectado antes de consultar Open Food Facts.


## Cambio v8 - arranque estable en iPhone
La v8 parte de la configuración de cámara de la v6, que sí abría correctamente en Safari/iPhone.
La validación anti-falsos-positivos se realiza después de la detección y no modifica los constraints iniciales de la cámara.

- Se mantiene `facingMode: environment` simple.
- Se elimina la restricción de formatos del constructor que podía impedir el arranque.
- Se eliminan constraints de resolución avanzados al iniciar.
- Se valida el dígito de control EAN-13, EAN-8 y UPC-A.
- Se requieren 3 lecturas válidas coincidentes antes de aceptar un código.
- El enfoque continuo se intenta únicamente después de que la cámara ya esté funcionando.


## Cambio v9
- Se restaura exactamente la configuración de cámara de la v5, que sí abrió correctamente en iPhone.
- La validación del EAN se realiza únicamente después de que la cámara haya arrancado.
- Se requieren 3 lecturas iguales y un dígito de control EAN/UPC válido.
- `app.js` se carga como `app.js?v=9` para evitar que Safari reutilice JavaScript antiguo.
- Si el arranque falla, la app muestra el error técnico real debajo del buscador para poder diagnosticarlo.


## Cambio v10 - lector mediante fotografía
- Se elimina el escaneo continuo por cámara.
- El usuario pulsa "Sacar foto del código".
- En iPhone se abre directamente la cámara trasera mediante un input `capture="environment"`.
- La fotografía se analiza posteriormente con `html5-qrcode.scanFile()`.
- Se muestra una vista previa de la foto.
- El resultado se valida como EAN-13, EAN-8 o UPC-A antes de consultar Open Food Facts.
- Si no puede leerse, se permite repetir la fotografía o introducir el código manualmente.


## Cambio v11 - botón de cámara en iPhone
- El botón ya no llama a `input.click()` mediante JavaScript.
- Se usa un `<label for="barcodePhoto">` asociado directamente al input de archivo.
- Esto hace que Safari/iPhone interprete la pulsación como una acción directa del usuario y abra correctamente la cámara/selector de fotos.
- También se han sustituido las referencias implícitas por ID por `document.getElementById(...)`, mejorando compatibilidad con Safari.
- `app.js` se carga como `app.js?v=11` para evitar caché antigua.
