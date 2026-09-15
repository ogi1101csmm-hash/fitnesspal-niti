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


## Cambio v7 - evitar códigos falsos
- El lector queda restringido a EAN-13, EAN-8, UPC-A y UPC-E.
- Se valida el dígito de control EAN/UPC.
- Se exigen al menos 5 lecturas coincidentes antes de aceptar un código.
- El código dominante debe representar al menos el 75 % de las lecturas recientes.
- Se eliminan Code 39, Code 128 e ITF para evitar falsos positivos.
- Se elimina el zoom forzado.
