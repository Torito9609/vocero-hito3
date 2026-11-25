# VOCERO: ¿Lo firmarías?

Prototipo del Hito 3 del Grupo 20 en la Cátedra Manuel Ancízar (reto L08-A, «El delegado artificial»).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La experiencia (abrir con `?conductor=1` para ver notas de observación) |
| `guia.html` | Instrucciones para quien conduce y observa |
| `guion.js` | **Todo el contenido**: las 4 versiones de la historia, personajes, momentos, acciones, respuestas y consecuencias. Para corregir un texto, editen este archivo |
| `motor.js` | Lógica del juego (no hace falta tocarla para cambiar textos) |
| `sonido.js` | Sonidos de VOCERO y de la sala, generados en el navegador (sin archivos de audio) |
| `estilos.css` | Apariencia |
| `Plantilla_Hito3_G20_borrador.md` | Borrador para la plantilla del entregable |

## Abrir en el computador

Hagan doble clic en `index.html`. No necesita internet ni instalar nada.

## Publicar en GitHub Pages (enlace para el profesor)

1. Entren a GitHub y creen un repositorio **público**, por ejemplo `vocero-hito3`.
2. Pulsen **Add file → Upload files** y arrastren `index.html`, `guia.html`, `guion.js`, `motor.js`, `sonido.js` y `estilos.css`. Pulsen **Commit changes**.
3. Vayan a **Settings → Pages**. En *Build and deployment* elijan **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Pulsen **Save**.
4. Después de 1 o 2 minutos aparece el enlace: `https://SU-USUARIO.github.io/vocero-hito3/`.
5. Ábranlo en una ventana de incógnito y en un celular para comprobar que funciona. Luego pongan el enlace en la plantilla.

Enlaces para el entregable:
- Experiencia: `https://SU-USUARIO.github.io/vocero-hito3/`
- Modo conductor: `https://SU-USUARIO.github.io/vocero-hito3/?conductor=1`
- Instrucciones: `https://SU-USUARIO.github.io/vocero-hito3/guia.html`

Con la terminal, los pasos 1 y 2 equivalen a:

```bash
cd hito3
git init && git add index.html guia.html guion.js motor.js sonido.js estilos.css README.md
git commit -m "Prototipo Hito 3"
git branch -M main
git remote add origin https://github.com/SU-USUARIO/vocero-hito3.git
git push -u origin main
```

## Privacidad

Lo que escribe la persona participante se guarda solo en su navegador (`localStorage`) y nunca se envía a internet. Al terminar la prueba, descarguen el registro y pulsen **Nueva partida** para borrarlo.
