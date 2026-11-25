# VOCERO: ¿Lo firmarías?

Prototipo del Hito 3 del **Grupo 20** en la Cátedra de Sede Manuel Ancízar *Más que humanos: IA, salud y posthumanismo* (UNAL, 2026-2), reto L08-A «El delegado artificial».

> ¿Puedes respaldar y asumir responsabilidad por una decisión tomada en tu nombre por una inteligencia artificial cuando solo conoces parte de sus consecuencias?

## Enlaces

| | |
|---|---|
| **Jugar** | https://torito9609.github.io/vocero-hito3/ |
| **Modo conductor** (notas de observación y selector de versión) | https://torito9609.github.io/vocero-hito3/?conductor=1 |
| **Guía para quien conduce y observa** | https://torito9609.github.io/vocero-hito3/guia.html |

Funciona en computador y celular, sin instalar nada. También se puede abrir sin internet: basta con hacer doble clic en `index.html`.

## La experiencia

Una persona asume el papel de un ciudadano o ciudadana de Bogotá en 2032. Su delegado artificial, VOCERO, votó por ella un acuerdo de alimentación escolar. En una asamblea ilustrada vive cinco momentos. En cada uno, los personajes hablan por turnos y la persona «levanta la mano» para elegir una acción. Después revisa su postura. Al final ratifica, condiciona o impugna el acuerdo, dice quién debe responder por él y descubre todo lo que no vio. La partida dura entre 15 y 20 minutos.

- **4 versiones de la historia.** Cada una pone el foco en una disciplina del grupo: *El plato* (Nutrición), *La ruta* (Ing. Civil y Mecánica), *La cuenta* (Contaduría) y *El modelo* (Ing. de Sistemas). La versión sale al azar, o la elige quien conduce en el modo conductor.
- **Sonido.** VOCERO habla con la voz sintética del navegador y hace pitidos robóticos. La sala tiene efectos: murmullo de fondo, campanilla, mazo, urna, entre otros. Se silencia con 🔊.
- **Registro descargable** (.txt) con las acciones, los cambios de postura, las razones, los tiempos y el cierre, para el registro de la prueba.
- **↺ Nueva partida** en el encabezado.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La experiencia |
| `guia.html` | Instrucciones para conducir y observar la prueba |
| `guion.js` | **Todo el contenido**: las 4 versiones, los personajes, los diálogos, las acciones, las respuestas y las consecuencias. Para corregir un texto, editen este archivo |
| `motor.js` | Lógica del juego (no hace falta tocarla para cambiar textos) |
| `sonido.js` | Voz de VOCERO y efectos de sonido, generados en el navegador (sin archivos de audio) |
| `estilos.css` | Apariencia, ilustraciones y animaciones |

## Publicar cambios

Editen los archivos y súbanlos a la rama `main`, con *Add file → Upload files* o con `git push`. GitHub Pages actualiza el sitio en uno o dos minutos.

## Privacidad

Lo que escribe la persona participante se guarda solo en el navegador de ese dispositivo (`localStorage`) y nunca se envía a internet. Al terminar la prueba, descarguen el registro y pulsen **↺ Nueva partida** para borrarlo. Otra opción es jugar en una **ventana de incógnito**: todo se borra al cerrarla, así que hay que descargar el registro antes de cerrarla.

## Créditos

El escenario y el contenido son del Grupo 20 y se basan en sus entregables H1 y H2. Las cifras son ficticias. La página se programó con ayuda de Claude (Anthropic).
