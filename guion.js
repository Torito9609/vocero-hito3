/*
 * GUION DE LA EXPERIENCIA — VOCERO: ¿Lo firmarías?
 * Grupo 20 · Cátedra Manuel Ancízar · Reto L08-A "El delegado artificial"
 *
 * Este archivo contiene TODO el contenido del juego. Para corregir un texto,
 * edítenlo aquí; el motor (motor.js) no necesita cambios.
 *
 * VERSIONES: hay 4 versiones del mismo acuerdo de alimentación escolar. En cada
 * una, VOCERO ocultó una concesión distinta y el foco está en una disciplina:
 *   1. El plato  (Nutrición)        2. La ruta   (Ing. Civil y Mecánica)
 *   3. La cuenta (Contaduría)       4. El modelo (Ing. de Sistemas)
 * Las cinco miradas aparecen siempre, una por momento. Al empezar sale una
 * versión al azar; en modo conductor (?conductor=1) se puede escoger.
 *
 * DIÁLOGOS: cada línea es { quien: "<id de personaje>", texto: "..." }.
 *   quien puede ser un personaje de `personajes`, "vocero", "tu",
 *   "narrador" (texto de ambiente) o "documento" (con `titulo`).
 *   La línea REGISTRO muestra el registro técnico de la negociación.
 * {perfil} se reemplaza por el perfil elegido por el participante.
 *
 * Nota: el escenario es ficticio. Las cifras son inventadas para la simulación.
 */
window.GUION = (function () {
  // ---------- Piezas compartidas por las versiones ----------
  const REGISTRO = { tipo: "log", total: 1284903, boton: "Pedir un resumen" };

  // M1 · acción "explicación completa" (igual en todas las versiones, cambia el resumen)
  const pedirExplicacion = (resumen) => ({
    id: "a",
    quien: "vocero",
    etiqueta: "Pedirle a VOCERO la explicación completa del acuerdo",
    dice: "VOCERO, muéstrame la explicación completa del acuerdo.",
    respuesta: [
      { quien: "vocero", texto: "El acuerdo resultó de 1.284.903 rondas de negociación entre 412.000 delegados. Este es el registro completo:" },
      REGISTRO,
      { quien: "vocero", texto: `Resumen: «${resumen}».` },
      { quien: "narrador", texto: "La explicación completa existe, pero nadie puede leerla. El resumen se entiende, pero no dice qué se cedió ni a quién afecta." },
    ],
  });

  // M5 · VOCERO sobre quién responde
  const voceroResponde = (extra) => ({
    id: "b",
    quien: "vocero",
    etiqueta: "Preguntarle a VOCERO quién responde",
    dice: "VOCERO, ¿quién responde por este acuerdo?",
    respuesta: [{ quien: "vocero", texto: "Soy tu delegado. Actué según las prioridades que configuraste." }, { quien: "vocero", texto: extra }],
  });

  const decisiones = (ratificar, impugnar) => [
    { id: "ratificar", nombre: "Ratificar", desc: "El acuerdo entra en vigor tal como está.", consecuencia: ratificar },
    {
      id: "condicionar",
      nombre: "Condicionar",
      desc: "Apoyas el acuerdo solo si se cumplen ciertas condiciones.",
      consecuencia:
        "Cada condición abre una nueva negociación. El presupuesto sigue siendo fijo: lo que se gana en una parte se pierde en otra, y mientras se negocia algunos colegios esperan.",
    },
    { id: "impugnar", nombre: "Impugnar", desc: "Pides suspender el acuerdo y volver a negociar.", consecuencia: impugnar },
  ];

  const COND_EXPLICACION = { id: "explicacion", nombre: "Publicar una explicación completa y comprensible antes de ejecutar el acuerdo", costo: "Retrasa la ejecución varias semanas." };
  const COND_VOCERO = { id: "vocero", nombre: "Obligar a VOCERO a informar las concesiones, no solo los beneficios", costo: "No cambia este acuerdo, pero sí cómo se explicarán los siguientes." };

  // Notas para quien conduce (las mismas preguntas de prueba en todas las versiones)
  const NOTA = {
    m1: "Pregunta 1: ¿P1 nota que cada titular conoce una parte distinta del acuerdo? Anota sus expresiones de sorpresa o duda. Si se traba, recuérdale que puede elegir solo una acción.",
    m2: "Pregunta 2: ¿Cambia su postura con esta información? Si apareció el aviso ⚠ (toca su prioridad #1), observa si reclama que su delegado no se lo contó.",
    m3: "Pregunta 2: ¿Qué peso le da P1 a una pérdida que no lo afecta directamente? Anota si menciona a los productores al justificar.",
    m4: "Pregunta 2: ¿P1 distingue entre un acuerdo bien negociado y un acuerdo que se puede ejecutar? Anota si pregunta quién responde por las obras o los equipos.",
    m5: "Pregunta 3: Antes del cierre, ¿P1 empieza a nombrar responsables? Anota las palabras exactas que use.",
  };

  const IMPUGNAR_BASE =
    "El acuerdo se suspende. Mientras tanto, los 21.000 estudiantes nuevos no reciben almuerzo. Tu voto se suma al de quienes descubrieron que no sabían lo que apoyaban, pero también deja sin beneficio a quienes sí lo querían.";

  // =====================================================================
  //  VERSIÓN 1 · EL PLATO — foco: Nutrición y Dietética
  // =====================================================================
  const PLATO = {
    id: "plato",
    nombre: "El plato",
    foco: "Nutrición y Dietética",
    explicacion: {
      lineas: {
        cobertura: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era que más niños comieran en el colegio." },
          { quien: "vocero", texto: "Lo logré: el acuerdo amplía el almuerzo a 38 colegios más. Unos 21.000 estudiantes nuevos comerán todos los días." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        menu: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era la calidad del menú." },
          { quien: "vocero", texto: "El acuerdo cumple el 100 % de los requerimientos oficiales de la minuta patrón y protege el menú completo en los colegios con más casos de desnutrición." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        productores: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 eran los productores locales." },
          { quien: "vocero", texto: "El acuerdo garantiza pagos sin retrasos durante tres años a los productores que siguen en el programa." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
      },
    },
    momentos: [
      {
        id: "m1",
        titulo: "La asamblea",
        mirada: "Explicabilidad de la IA · Ingeniería de Sistemas",
        toca: [],
        pantalla: "Acuerdo de alimentación escolar · APROBADO 94 %",
        sala: ["marta", "efrain", "moderadora", "luisa"],
        dialogo: [
          { quien: "narrador", texto: "Salón comunal de la localidad. La pantalla muestra el acuerdo aprobado. Varios titulares piden la palabra para defender «su» acuerdo." },
          { quien: "marta", texto: "Yo apoyé porque mi hijo ahora va a almorzar todos los días." },
          { quien: "efrain", texto: "¿Cómo así que se reduce lo que se les compra a los productores de aquí? A mí me dijeron que tenía los pagos garantizados." },
          { quien: "luisa", texto: "Nadie pidió quitar la carne dos días a la semana. ¿Quién decidió eso?" },
          { quien: "moderadora", texto: "Una pregunta: ¿alguien aquí conoce el acuerdo completo?" },
          { quien: "narrador", texto: "Nadie levanta la mano." },
        ],
        acciones: [
          pedirExplicacion("Se amplió la cobertura, se ajustó el menú y se reorganizaron las compras"),
          {
            id: "b",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué no te contó lo de la carne y los productores",
            dice: "VOCERO, ¿por qué no me contaste lo de la carne y los productores?",
            respuesta: [
              { quien: "vocero", texto: "No me lo preguntaste y no contradecía tus prioridades. Te expliqué lo que más te importaba." },
              { quien: "vocero", texto: "Todo lo que te dije es verdad." },
              { quien: "narrador", texto: "Ningún delegado mintió ni desobedeció. Cada uno le explicó a su titular la parte del acuerdo que mejor encajaba con sus prioridades." },
            ],
          },
          {
            id: "c",
            quien: "marta",
            etiqueta: "Preguntarles a los otros titulares qué les dijo su delegado",
            dice: "¿Qué les dijo a ustedes su delegado?",
            respuesta: [
              { quien: "marta", texto: "A mí, que mi hijo come todos los días." },
              { quien: "efrain", texto: "A mí, que tengo pagos garantizados por tres años." },
              { quien: "luisa", texto: "A mí, que el menú cumple los requisitos oficiales." },
              { quien: "narrador", texto: "Todo es verdad. Pero cada persona está defendiendo un acuerdo distinto. El 94 % apoyó… ¿lo mismo?" },
            ],
          },
        ],
        conductor: NOTA.m1,
      },
      {
        id: "m2",
        titulo: "El plato",
        mirada: "Calidad nutricional · Nutrición y Dietética",
        toca: ["menu"],
        pantalla: "Menú semanal: 3 días proteína animal · 2 días leguminosas",
        sala: ["marta", "nutricionista", "moderadora", "luisa"],
        dialogo: [
          { quien: "moderadora", texto: "Le doy la palabra a la nutricionista de la mesa distrital." },
          { quien: "nutricionista", texto: "Para que la plata alcance, el nuevo menú reemplaza la proteína animal por leguminosas (fríjol, lenteja, garbanzo) dos de los cinco días de la semana." },
          { quien: "nutricionista", texto: "En el papel, el menú cumple la minuta patrón oficial del Programa de Alimentación Escolar." },
          { quien: "luisa", texto: "¿En el papel?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "nutricionista",
            etiqueta: "Preguntarle a la nutricionista si los niños reciben suficiente hierro y proteína",
            dice: "Doctora, ¿los niños reciben suficiente hierro y proteína con ese menú?",
            respuesta: [
              { quien: "nutricionista", texto: "El hierro de las leguminosas (no hemo) se absorbe mucho menos que el de la carne (hemo). Si no se acompaña con alimentos ricos en vitamina C, como una fruta cítrica, el aporte real puede quedar por debajo de lo que dice la tabla." },
              { quien: "nutricionista", texto: "Cumple en el papel. Que cumpla en el cuerpo de un niño depende de cómo se prepare y se acompañe." },
            ],
          },
          {
            id: "b",
            quien: "documento",
            etiqueta: "Pedir los datos de cómo les fue a los niños con el menú en el piloto",
            dice: "¿Hay datos de cómo les fue a los niños con este menú?",
            respuesta: [
              { quien: "documento", titulo: "Informe del piloto (dato ficticio)", texto: "En el piloto, 3 de cada 10 platos con leguminosas volvieron con más de la mitad de la comida." },
              { quien: "nutricionista", texto: "Lo que no se come no nutre. La tabla mide lo que se sirve, no lo que se come." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué aceptó cambiar el menú",
            dice: "VOCERO, ¿por qué aceptaste cambiar el menú?",
            respuesta: [
              { quien: "vocero", texto: "Las leguminosas cuestan menos por porción. Ese ahorro financió una parte grande de la ampliación." },
              { quien: "vocero", texto: "Sin ese cambio, unos 9.000 estudiantes nuevos no tendrían almuerzo." },
            ],
          },
        ],
        conductor: NOTA.m2,
      },
      {
        id: "m3",
        titulo: "La finca",
        mirada: "Economía local · Productores",
        toca: ["productores"],
        pantalla: "Compras a productores locales: −40 %",
        sala: ["efrain", "rosalba", "moderadora", "jairo"],
        dialogo: [
          { quien: "narrador", texto: "Rosalba se pone de pie. Viene de la zona rural de la localidad." },
          { quien: "rosalba", texto: "El 40 % de lo que antes se les compraba a los productores de aquí ahora va a un proveedor central." },
          { quien: "rosalba", texto: "A mí me garantizaron pagos por tres años… pero por la mitad de lo que yo vendía." },
          { quien: "efrain", texto: "Igual que a mí." },
        ],
        acciones: [
          {
            id: "a",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué se trasladaron las compras",
            dice: "VOCERO, ¿por qué se trasladaron las compras a un proveedor central?",
            respuesta: [
              { quien: "vocero", texto: "El proveedor central entrega más barato y tiene la logística para abastecer 38 colegios nuevos." },
              { quien: "vocero", texto: "Los productores locales no alcanzaban a cubrir ese volumen." },
            ],
          },
          {
            id: "b",
            quien: "jairo",
            etiqueta: "Escuchar a la asociación de productores",
            dice: "¿Qué dice la asociación de productores?",
            respuesta: [
              { quien: "jairo", texto: "Somos 60 familias. Si perdemos la mitad de este contrato, varias dejan de sembrar." },
              { quien: "jairo", texto: "Nadie nos preguntó si podíamos organizarnos para producir más." },
            ],
          },
          {
            id: "c",
            quien: "documento",
            etiqueta: "Pedir los datos del proveedor central",
            dice: "¿Qué sabemos del proveedor central?",
            respuesta: [
              { quien: "documento", titulo: "Ficha técnica del proveedor", texto: "Los alimentos llegan de otras regiones: hay más transporte y llegan menos frescos, pero el precio es estable y las entregas están garantizadas." },
            ],
          },
        ],
        conductor: NOTA.m3,
      },
      {
        id: "m4",
        titulo: "La cocina",
        mirada: "Infraestructura y equipos · Ingeniería Civil y Mecánica",
        toca: ["cobertura"],
        pantalla: "38 colegios nuevos · 14 sin cocina · 9 sin ventilación",
        sala: ["marta", "ingeniera", "moderadora", "tecnico"],
        dialogo: [
          { quien: "moderadora", texto: "La Secretaría de Educación trae un informe técnico." },
          { quien: "ingeniera", texto: "De los 38 colegios nuevos, 14 no tienen cocina y 9 tienen cocina, pero sin extracción ni ventilación adecuadas." },
          { quien: "ingeniera", texto: "El acuerdo supone que el servicio empieza desde el primer día del calendario escolar." },
          { quien: "marta", texto: "¿Entonces mi hijo sí va a almorzar desde el primer día?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "ingeniera",
            etiqueta: "Preguntarle a la ingeniera quién construye o adecúa las cocinas",
            dice: "Ingeniera, ¿quién construye o adecúa esas cocinas?",
            respuesta: [
              { quien: "ingeniera", texto: "Adecuar una cocina escolar (redes hidráulicas y de gas, pisos, zona de lavado, almacenamiento) toma entre 6 y 10 meses de obra. Ese costo no está en el presupuesto del acuerdo." },
              { quien: "ingeniera", texto: "Mientras tanto, esos colegios recibirían raciones industrializadas: pan, bebida láctea y fruta." },
            ],
          },
          {
            id: "b",
            quien: "tecnico",
            etiqueta: "Preguntarle al técnico qué pasa con la ventilación de las cocinas",
            dice: "Don Hernán, ¿qué pasa con la ventilación de las cocinas que sí existen?",
            respuesta: [
              { quien: "tecnico", texto: "Sin extracción adecuada, las cocinas superan temperaturas seguras para trabajar y se acumulan humos y gases." },
              { quien: "tecnico", texto: "En los planos todas cumplen la norma. En la realidad, varias campanas nunca se instalaron." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO si sabía esto",
            dice: "VOCERO, ¿tú sabías esto?",
            respuesta: [
              { quien: "vocero", texto: "La infraestructura no era una variable de la negociación." },
              { quien: "vocero", texto: "Ningún titular la incluyó entre sus prioridades." },
            ],
          },
        ],
        conductor: NOTA.m4,
      },
      {
        id: "m5",
        titulo: "La firma",
        mirada: "Rendición de cuentas · Contaduría Pública",
        toca: [],
        pantalla: "Acta: «Aprobado por el 94 % de los titulares»",
        sala: ["efrain", "veedora", "moderadora", "funcionario"],
        dialogo: [
          { quien: "veedora", texto: "Este acuerdo mueve recursos públicos. Si en un año los niños comen menos proteína y los productores quiebran, ¿a quién le pido cuentas?" },
          { quien: "veedora", texto: "El acta dice: «Aprobado por el 94 % de los titulares». Usted está en ese 94 %." },
          { quien: "narrador", texto: "La veedora te mira directamente." },
        ],
        acciones: [
          {
            id: "a",
            quien: "funcionario",
            etiqueta: "Preguntarle a la Alcaldía quién responde",
            dice: "Doctor, ¿quién responde por este acuerdo?",
            respuesta: [
              { quien: "funcionario", texto: "La Alcaldía ejecuta lo que la ciudadanía decidió por medio de VOCERO." },
              { quien: "funcionario", texto: "Nosotros respondemos por la ejecución, no por la decisión." },
            ],
          },
          voceroResponde("La decisión es tuya."),
          {
            id: "c",
            quien: "veedora",
            etiqueta: "Preguntarle a la veedora qué propone",
            dice: "Gloria, ¿usted qué propone?",
            respuesta: [
              { quien: "veedora", texto: "La rendición de cuentas tiene tres partes: información, diálogo y responsabilidad." },
              { quien: "veedora", texto: "Hoy hay información parcial, esta asamblea es el diálogo… y nadie ha dicho quién asume la responsabilidad." },
            ],
          },
        ],
        conductor: NOTA.m5,
      },
    ],
    cierre: {
      decisiones: decisiones(
        "Unos 21.000 estudiantes empiezan a almorzar este año. Se mantienen las leguminosas dos días a la semana, el 40 % de las compras pasa al proveedor central y 23 colegios arrancan sin una cocina adecuada. Al ratificar, haces tuyas estas concesiones.",
        IMPUGNAR_BASE
      ),
      condiciones: [
        COND_EXPLICACION,
        { id: "menu", nombre: "Ajustar el menú para compensar el hierro y la proteína", costo: "Sube el costo por plato: unos 4.000 cupos nuevos no se alcanzan a financiar." },
        { id: "productores", nombre: "Mantener una cuota mínima de compras a productores locales", costo: "Sube el precio de los insumos y se reduce la ampliación." },
        { id: "cocinas", nombre: "Ampliar la cobertura solo en colegios con cocina en condiciones", costo: "23 colegios esperan entre 6 y 10 meses más." },
        COND_VOCERO,
      ],
    },
  };

  // =====================================================================
  //  VERSIÓN 2 · LA RUTA — foco: Ingeniería Civil y Mecánica
  //  En vez de construir cocinas, una cocina central reparte en camiones.
  // =====================================================================
  const RUTA = {
    id: "ruta",
    nombre: "La ruta",
    foco: "Ingeniería Civil y Mecánica",
    explicacion: {
      lineas: {
        cobertura: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era que más niños comieran en el colegio." },
          { quien: "vocero", texto: "Lo logré: el acuerdo amplía el almuerzo a 38 colegios más. Unos 21.000 estudiantes nuevos comerán desde el primer día, sin esperar a que se construyan cocinas." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        menu: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era la calidad del menú." },
          { quien: "vocero", texto: "El almuerzo se preparará en una cocina central certificada, con controles sanitarios más estrictos que los de muchas cocinas escolares. Cumple el 100 % de la minuta patrón." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        productores: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 eran los productores locales." },
          { quien: "vocero", texto: "La cocina central firmará contratos de compra a tres años, con una cuota reservada para productores de la localidad." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
      },
    },
    momentos: [
      {
        id: "m1",
        titulo: "La asamblea",
        mirada: "Explicabilidad de la IA · Ingeniería de Sistemas",
        toca: [],
        pantalla: "Acuerdo APROBADO 94 % · Cocina central para 38 colegios",
        sala: ["marta", "efrain", "moderadora", "luisa"],
        dialogo: [
          { quien: "narrador", texto: "Salón comunal de la localidad. La pantalla muestra el acuerdo aprobado. Varios titulares piden la palabra para defender «su» acuerdo." },
          { quien: "marta", texto: "Yo apoyé porque mi hijo va a almorzar desde el primer día, sin esperar obras." },
          { quien: "efrain", texto: "¿Una sola cocina para 38 colegios? ¿Y a quién le va a comprar?" },
          { quien: "luisa", texto: "Mi sobrina estudia en la vereda. ¿Cómo va a llegar la comida hasta allá?" },
          { quien: "moderadora", texto: "Una pregunta: ¿alguien aquí conoce el acuerdo completo?" },
          { quien: "narrador", texto: "Nadie levanta la mano." },
        ],
        acciones: [
          pedirExplicacion("Se amplió la cobertura con una cocina central y se reorganizaron la distribución y las compras"),
          {
            id: "b",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué no te contó cómo llega la comida a los colegios",
            dice: "VOCERO, ¿por qué no me contaste cómo va a llegar la comida a los colegios?",
            respuesta: [
              { quien: "vocero", texto: "No me lo preguntaste y la logística no contradecía tus prioridades. Te expliqué lo que más te importaba." },
              { quien: "vocero", texto: "Todo lo que te dije es verdad." },
              { quien: "narrador", texto: "Ningún delegado mintió ni desobedeció. Cada uno le explicó a su titular la parte del acuerdo que mejor encajaba con sus prioridades." },
            ],
          },
          {
            id: "c",
            quien: "marta",
            etiqueta: "Preguntarles a los otros titulares qué les dijo su delegado",
            dice: "¿Qué les dijo a ustedes su delegado?",
            respuesta: [
              { quien: "marta", texto: "A mí, que mi hijo come desde el primer día." },
              { quien: "efrain", texto: "A mí, que habrá contratos de compra a tres años." },
              { quien: "luisa", texto: "A mí, que la cocina central tiene mejores controles sanitarios." },
              { quien: "narrador", texto: "Todo es verdad. Pero cada persona está defendiendo un acuerdo distinto. El 94 % apoyó… ¿lo mismo?" },
            ],
          },
        ],
        conductor: NOTA.m1,
      },
      {
        id: "m2",
        titulo: "El plato",
        mirada: "Calidad nutricional · Nutrición y Dietética",
        toca: ["menu"],
        pantalla: "Tiempo de viaje de la comida: hasta 2 horas",
        sala: ["marta", "nutricionista", "moderadora", "luisa"],
        dialogo: [
          { quien: "moderadora", texto: "Le doy la palabra a la nutricionista de la mesa distrital." },
          { quien: "nutricionista", texto: "La cocina central prepara de madrugada y la comida viaja en termos hasta dos horas antes de servirse." },
          { quien: "nutricionista", texto: "Para que sea segura, la comida caliente debe mantenerse por encima de 60 °C hasta el momento de servirla." },
          { quien: "luisa", texto: "¿Y si se enfría en el camino?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "nutricionista",
            etiqueta: "Preguntarle a la nutricionista qué pasa si la comida se enfría",
            dice: "Doctora, ¿qué pasa si la comida llega fría?",
            respuesta: [
              { quien: "nutricionista", texto: "Entre 5 y 60 °C las bacterias se multiplican rápido: es la llamada zona de peligro. Un termo que pierde calor convierte un almuerzo seguro en un riesgo." },
              { quien: "nutricionista", texto: "Además, mantener la comida caliente durante horas degrada vitaminas sensibles al calor, como la vitamina C." },
            ],
          },
          {
            id: "b",
            quien: "documento",
            etiqueta: "Pedir los datos de la prueba de ruta",
            dice: "¿Hay datos de cómo llegó la comida en la prueba de ruta?",
            respuesta: [
              { quien: "documento", titulo: "Prueba de ruta (dato ficticio)", texto: "En 4 de cada 10 entregas a los colegios más lejanos, la comida llegó por debajo de 60 °C." },
              { quien: "nutricionista", texto: "Por eso el menú se volvió repetitivo: se escogen preparaciones que aguantan el viaje, no las más nutritivas." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué eligió una cocina central",
            dice: "VOCERO, ¿por qué aceptaste una cocina central en vez de cocinas en cada colegio?",
            respuesta: [
              { quien: "vocero", texto: "Una cocina central cuesta menos por ración que construir 14 cocinas nuevas. Ese ahorro financió la ampliación." },
              { quien: "vocero", texto: "Sin ella, 21.000 estudiantes esperarían entre 6 y 10 meses de obras." },
            ],
          },
        ],
        conductor: NOTA.m2,
      },
      {
        id: "m3",
        titulo: "La finca",
        mirada: "Economía local · Productores",
        toca: ["productores"],
        pantalla: "Cuota de compras a productores locales: 10 %",
        sala: ["efrain", "rosalba", "moderadora", "jairo"],
        dialogo: [
          { quien: "narrador", texto: "Rosalba se pone de pie. Viene de la zona rural de la localidad." },
          { quien: "rosalba", texto: "La cocina central le compra casi todo a un mayorista. A los productores de la localidad nos dejaron una cuota del 10 %." },
          { quien: "rosalba", texto: "Antes cada colegio nos compraba directo." },
          { quien: "efrain", texto: "Igual que a mí." },
        ],
        acciones: [
          {
            id: "a",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué la cocina central le compra al mayorista",
            dice: "VOCERO, ¿por qué la cocina central le compra casi todo a un mayorista?",
            respuesta: [
              { quien: "vocero", texto: "Una cocina para 38 colegios necesita grandes volúmenes y entregas diarias. El mayorista garantiza ambas cosas." },
              { quien: "vocero", texto: "Los productores locales tienen su cuota reservada, como te dije." },
            ],
          },
          {
            id: "b",
            quien: "jairo",
            etiqueta: "Escuchar a la asociación de productores",
            dice: "¿Qué dice la asociación de productores?",
            respuesta: [
              { quien: "jairo", texto: "Somos 60 familias. Con una cuota del 10 %, a varios no nos alcanza ni para pagar el transporte de la cosecha." },
              { quien: "jairo", texto: "Nadie nos preguntó si podíamos unirnos para abastecer juntos a la cocina central." },
            ],
          },
          {
            id: "c",
            quien: "documento",
            etiqueta: "Pedir los datos del mayorista",
            dice: "¿Qué sabemos del mayorista?",
            respuesta: [
              { quien: "documento", titulo: "Ficha del mayorista", texto: "Los alimentos llegan de otras regiones del país. El precio es estable y las entregas están garantizadas, pero pasan más días entre la cosecha y el plato." },
            ],
          },
        ],
        conductor: NOTA.m3,
      },
      {
        id: "m4",
        titulo: "La ruta",
        mirada: "Vías y equipos · Ingeniería Civil y Mecánica",
        toca: ["cobertura"],
        pantalla: "8 camiones · 38 colegios · 6 por vías sin pavimentar",
        sala: ["marta", "ingeniera", "moderadora", "tecnico"],
        dialogo: [
          { quien: "moderadora", texto: "La Secretaría de Educación presenta el plan de distribución." },
          { quien: "ingeniera", texto: "Ocho camiones repartirán desde la cocina central. Seis de los colegios rurales quedan sobre vías terciarias sin pavimentar." },
          { quien: "tecnico", texto: "Y cada camión carga los termos de cinco colegios." },
          { quien: "marta", texto: "¿Y en temporada de lluvias?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "ingeniera",
            etiqueta: "Preguntarle a la ingeniera qué pasa con las vías rurales",
            dice: "Ingeniera, ¿qué pasa con las vías rurales en temporada de lluvias?",
            respuesta: [
              { quien: "ingeniera", texto: "En temporada de lluvias, esas vías se vuelven intransitables para un camión cargado varios días al mes. Estabilizarlas o pavimentarlas no está en el presupuesto del acuerdo." },
              { quien: "ingeniera", texto: "Esos días, esos colegios no reciben almuerzo." },
            ],
          },
          {
            id: "b",
            quien: "tecnico",
            etiqueta: "Preguntarle al técnico por los camiones y los termos",
            dice: "Don Hernán, ¿cómo están los camiones y los termos?",
            respuesta: [
              { quien: "tecnico", texto: "Los termos pierden calor con cada hora de viaje y los empaques se desgastan con el lavado diario. Hay que revisarlos y cambiarlos seguido." },
              { quien: "tecnico", texto: "Si un camión se vara, cinco colegios se quedan sin comida ese día. El acuerdo no incluye camiones de reserva ni presupuesto de mantenimiento." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO si sabía esto",
            dice: "VOCERO, ¿tú sabías esto?",
            respuesta: [
              { quien: "vocero", texto: "La logística no era una variable de la negociación." },
              { quien: "vocero", texto: "Ningún titular incluyó las vías ni los camiones entre sus prioridades." },
            ],
          },
        ],
        conductor: NOTA.m4,
      },
      {
        id: "m5",
        titulo: "La firma",
        mirada: "Rendición de cuentas · Contaduría Pública",
        toca: [],
        pantalla: "Contrato de cocina y transporte: 1 operador · 5 años",
        sala: ["efrain", "veedora", "moderadora", "funcionario"],
        dialogo: [
          { quien: "veedora", texto: "La cocina central y los camiones quedan en manos de un solo operador privado, con un contrato a cinco años." },
          { quien: "veedora", texto: "Si ese operador falla, 38 colegios se quedan sin almuerzo al mismo tiempo. ¿A quién le pido cuentas? Usted está en el 94 % que lo aprobó." },
          { quien: "narrador", texto: "La veedora te mira directamente." },
        ],
        acciones: [
          {
            id: "a",
            quien: "funcionario",
            etiqueta: "Preguntarle a la Alcaldía quién responde",
            dice: "Doctor, ¿quién responde si el operador falla?",
            respuesta: [
              { quien: "funcionario", texto: "La Alcaldía supervisa el contrato, pero el modelo de cocina central lo aprobó la ciudadanía por medio de VOCERO." },
              { quien: "funcionario", texto: "Nosotros respondemos por vigilar al operador, no por haberlo escogido." },
            ],
          },
          voceroResponde("La decisión es tuya."),
          {
            id: "c",
            quien: "veedora",
            etiqueta: "Preguntarle a la veedora qué propone",
            dice: "Gloria, ¿usted qué propone?",
            respuesta: [
              { quien: "veedora", texto: "Un contrato concentrado a cinco años necesita pólizas, multas por incumplimiento y un plan de contingencia. Este acuerdo no dice nada de eso." },
              { quien: "veedora", texto: "La rendición de cuentas empieza por saber qué se firmó." },
            ],
          },
        ],
        conductor: NOTA.m5,
      },
    ],
    cierre: {
      decisiones: decisiones(
        "Unos 21.000 estudiantes empiezan a almorzar desde el primer día. La comida viaja hasta dos horas, los productores locales quedan con una cuota del 10 %, seis colegios rurales pueden quedarse sin almuerzo en temporada de lluvias y un solo operador controla el servicio por cinco años. Al ratificar, haces tuyas estas concesiones.",
        IMPUGNAR_BASE
      ),
      condiciones: [
        COND_EXPLICACION,
        { id: "temperatura", nombre: "Exigir control de temperatura en cada entrega", costo: "Sube el costo por ración: unos 2.000 cupos nuevos no se alcanzan a financiar." },
        { id: "productores", nombre: "Subir la cuota de productores locales al 30 %", costo: "Sube el precio de los insumos y se reduce la ampliación." },
        { id: "vias", nombre: "Incluir camiones de reserva y arreglar las vías rurales", costo: "Consume el presupuesto de cinco colegios nuevos." },
        { id: "operadores", nombre: "Dividir el contrato entre varios operadores", costo: "Aumenta los costos de supervisión y retrasa el inicio unos tres meses." },
        COND_VOCERO,
      ],
    },
  };

  // =====================================================================
  //  VERSIÓN 3 · LA CUENTA — foco: Contaduría Pública
  //  Nadie pierde hoy: se financia con vigencias futuras y recortes ocultos.
  // =====================================================================
  const CUENTA = {
    id: "cuenta",
    nombre: "La cuenta",
    foco: "Contaduría Pública",
    explicacion: {
      lineas: {
        cobertura: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era que más niños comieran en el colegio." },
          { quien: "vocero", texto: "Lo logré: el acuerdo amplía el almuerzo a 38 colegios más. Unos 21.000 estudiantes nuevos comerán todos los días, sin recortar el menú." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        menu: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era la calidad del menú." },
          { quien: "vocero", texto: "El almuerzo se mantiene completo, con proteína animal todos los días. Cumple el 100 % de la minuta patrón." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
        productores: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 eran los productores locales." },
          { quien: "vocero", texto: "Las compras a productores locales se mantienen en el mismo volumen, con contrato a tres años." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. El acuerdo se aprobó con el 94 %." },
        ],
      },
    },
    momentos: [
      {
        id: "m1",
        titulo: "La asamblea",
        mirada: "Explicabilidad de la IA · Ingeniería de Sistemas",
        toca: [],
        pantalla: "Acuerdo APROBADO 94 % · Menú completo · Compras locales intactas",
        sala: ["marta", "efrain", "moderadora", "luisa"],
        dialogo: [
          { quien: "narrador", texto: "Salón comunal de la localidad. La pantalla muestra el acuerdo aprobado. Por primera vez, nadie parece haber perdido nada." },
          { quien: "marta", texto: "Yo apoyé porque mi hijo va a almorzar todos los días, y con carne." },
          { quien: "efrain", texto: "A mí me dijeron que nos siguen comprando igual. ¿Entonces por qué ahora nos pagan a 90 días?" },
          { quien: "luisa", texto: "Si todo es mejor y nadie pierde, ¿de dónde sale la plata?" },
          { quien: "moderadora", texto: "Una pregunta: ¿alguien aquí conoce el acuerdo completo?" },
          { quien: "narrador", texto: "Nadie levanta la mano." },
        ],
        acciones: [
          pedirExplicacion("Se amplió la cobertura manteniendo el menú y las compras, con ajustes de financiación"),
          {
            id: "b",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO de dónde sale el dinero",
            dice: "VOCERO, ¿de dónde sale el dinero para todo esto?",
            respuesta: [
              { quien: "vocero", texto: "La financiación no contradecía tus prioridades, por eso no la mencioné. Te expliqué lo que más te importaba." },
              { quien: "vocero", texto: "Todo lo que te dije es verdad." },
              { quien: "narrador", texto: "Ningún delegado mintió ni desobedeció. Pero ninguno explicó quién paga." },
            ],
          },
          {
            id: "c",
            quien: "marta",
            etiqueta: "Preguntarles a los otros titulares qué les dijo su delegado",
            dice: "¿Qué les dijo a ustedes su delegado?",
            respuesta: [
              { quien: "marta", texto: "A mí, que el menú sigue completo." },
              { quien: "efrain", texto: "A mí, que las compras se mantienen." },
              { quien: "luisa", texto: "A mí, que la ampliación no recorta nada este año." },
              { quien: "narrador", texto: "Todo es verdad. Pero nadie sabe de dónde sale el dinero. El 94 % apoyó… ¿sabiendo quién paga?" },
            ],
          },
        ],
        conductor: NOTA.m1,
      },
      {
        id: "m2",
        titulo: "El plato",
        mirada: "Calidad nutricional · Nutrición y Dietética",
        toca: ["menu"],
        pantalla: "Refrigerio de media mañana: eliminado en 40 colegios",
        sala: ["marta", "nutricionista", "moderadora", "luisa"],
        dialogo: [
          { quien: "moderadora", texto: "Le doy la palabra a la nutricionista de la mesa distrital." },
          { quien: "nutricionista", texto: "El almuerzo quedó completo, es cierto. Pero para financiarlo se eliminó el refrigerio de media mañana en los 40 colegios que ya lo tenían." },
          { quien: "nutricionista", texto: "Muchos de esos niños llegan al colegio sin desayunar." },
          { quien: "luisa", texto: "¿Y aguantan hasta el almuerzo?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "nutricionista",
            etiqueta: "Preguntarle a la nutricionista qué pasa sin el refrigerio",
            dice: "Doctora, ¿qué pasa con los niños que pierden el refrigerio?",
            respuesta: [
              { quien: "nutricionista", texto: "Un niño que no desayuna y no recibe refrigerio puede pasar hasta seis horas sin comer. Eso afecta su atención y su rendimiento en clase." },
              { quien: "nutricionista", texto: "Un almuerzo completo no compensa una mañana vacía." },
            ],
          },
          {
            id: "b",
            quien: "documento",
            etiqueta: "Pedir los datos de la encuesta a estudiantes",
            dice: "¿Hay datos sobre lo que significa el refrigerio para los estudiantes?",
            respuesta: [
              { quien: "documento", titulo: "Encuesta del programa (dato ficticio)", texto: "1 de cada 4 estudiantes de esos colegios dice que el refrigerio era lo primero que comía en el día." },
              { quien: "nutricionista", texto: "Se ganó un plato en unos colegios y se perdió otro en otros. Son niños distintos." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué aceptó quitar el refrigerio",
            dice: "VOCERO, ¿por qué aceptaste quitar el refrigerio?",
            respuesta: [
              { quien: "vocero", texto: "El refrigerio cuesta cerca de un tercio de un almuerzo. Quitarlo en 40 colegios financió parte de la ampliación." },
              { quien: "vocero", texto: "El almuerzo, que era tu prioridad, quedó completo." },
            ],
          },
        ],
        conductor: NOTA.m2,
      },
      {
        id: "m3",
        titulo: "La finca",
        mirada: "Economía local · Productores",
        toca: ["productores"],
        pantalla: "Pago a productores locales: de 30 a 90 días",
        sala: ["efrain", "rosalba", "moderadora", "jairo"],
        dialogo: [
          { quien: "narrador", texto: "Rosalba se pone de pie. Viene de la zona rural de la localidad." },
          { quien: "rosalba", texto: "Nos siguen comprando lo mismo, eso es verdad. Pero ahora nos pagan a 90 días, no a 30." },
          { quien: "rosalba", texto: "Yo pago abonos, jornales y transporte cada semana. ¿Con qué siembro mientras espero tres meses?" },
          { quien: "efrain", texto: "Igual que a mí." },
        ],
        acciones: [
          {
            id: "a",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué cambió el plazo de pago",
            dice: "VOCERO, ¿por qué ahora les pagan a 90 días?",
            respuesta: [
              { quien: "vocero", texto: "Pagar a 90 días le da a la Alcaldía flujo de caja para cubrir más colegios este año." },
              { quien: "vocero", texto: "El volumen de compras no cambió, como te dije." },
            ],
          },
          {
            id: "b",
            quien: "jairo",
            etiqueta: "Escuchar a la asociación de productores",
            dice: "¿Qué dice la asociación de productores?",
            respuesta: [
              { quien: "jairo", texto: "Varios vamos a tener que pedir préstamos para aguantar hasta el pago. Los intereses se comen la ganancia." },
              { quien: "jairo", texto: "Algunos terminarán vendiéndole al intermediario: más barato, pero de contado." },
            ],
          },
          {
            id: "c",
            quien: "documento",
            etiqueta: "Pedir la ficha financiera del contrato",
            dice: "¿Qué dice la ficha financiera del contrato?",
            respuesta: [
              { quien: "documento", titulo: "Ficha financiera", texto: "Cada productor financia con su propio dinero tres meses de entregas. En la práctica, los campesinos le prestan al Distrito sin cobrar intereses." },
            ],
          },
        ],
        conductor: NOTA.m3,
      },
      {
        id: "m4",
        titulo: "La cocina",
        mirada: "Infraestructura y equipos · Ingeniería Civil y Mecánica",
        toca: ["cobertura"],
        pantalla: "Presupuesto de mantenimiento de colegios: −35 %",
        sala: ["marta", "ingeniera", "moderadora", "tecnico"],
        dialogo: [
          { quien: "moderadora", texto: "La Secretaría de Educación trae un informe técnico." },
          { quien: "ingeniera", texto: "Para cerrar las cuentas, el acuerdo trasladó el 35 % del presupuesto de mantenimiento de colegios a la alimentación." },
          { quien: "ingeniera", texto: "Este año no se arreglan techos, baños ni redes de gas." },
          { quien: "marta", texto: "¿Y las cocinas donde se prepara el almuerzo?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "ingeniera",
            etiqueta: "Preguntarle a la ingeniera qué obras se aplazan",
            dice: "Ingeniera, ¿qué obras se aplazan?",
            respuesta: [
              { quien: "ingeniera", texto: "Hay 12 colegios con goteras sobre el comedor y redes de gas que debían revisarse este año. Ese mantenimiento se aplaza." },
              { quien: "ingeniera", texto: "Lo que no se arregla hoy cuesta más mañana: una gotera termina convertida en daño estructural." },
            ],
          },
          {
            id: "b",
            quien: "tecnico",
            etiqueta: "Preguntarle al técnico por las estufas y neveras",
            dice: "Don Hernán, ¿qué pasa con los equipos de las cocinas?",
            respuesta: [
              { quien: "tecnico", texto: "Las estufas industriales, las neveras y las campanas necesitan mantenimiento preventivo cada seis meses. Sin eso, se dañan mucho más rápido." },
              { quien: "tecnico", texto: "Una nevera dañada es comida perdida y un almuerzo que no se sirve." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO si sabía esto",
            dice: "VOCERO, ¿tú sabías esto?",
            respuesta: [
              { quien: "vocero", texto: "El mantenimiento no era una variable de la negociación." },
              { quien: "vocero", texto: "Ningún titular lo incluyó entre sus prioridades." },
            ],
          },
        ],
        conductor: NOTA.m4,
      },
      {
        id: "m5",
        titulo: "La firma",
        mirada: "Rendición de cuentas · Contaduría Pública",
        toca: [],
        pantalla: "Vigencias futuras comprometidas: 2033 · 2034 · 2035",
        sala: ["efrain", "contralora", "moderadora", "funcionario", "veedora"],
        dialogo: [
          { quien: "contralora", texto: "Revisé las cuentas. La ampliación se financió con vigencias futuras: compromete el presupuesto de alimentación escolar de los próximos tres años." },
          { quien: "contralora", texto: "El próximo gobierno, y los próximos titulares, tendrán que pagar lo que hoy aprobaron sus delegados." },
          { quien: "veedora", texto: "Y el acta dice: «Aprobado por el 94 % de los titulares». Usted está en ese 94 %." },
        ],
        acciones: [
          {
            id: "a",
            quien: "funcionario",
            etiqueta: "Preguntarle a la Alcaldía quién responde",
            dice: "Doctor, ¿quién responde por comprometer los próximos tres años?",
            respuesta: [
              { quien: "funcionario", texto: "Las vigencias futuras son legales y las aprobó la ciudadanía por medio de VOCERO." },
              { quien: "funcionario", texto: "La Alcaldía ejecuta. No fuimos nosotros quienes decidimos comprometer los próximos años." },
            ],
          },
          voceroResponde("Mis instrucciones eran sobre este año. Nadie me dijo qué hacer con los próximos."),
          {
            id: "c",
            quien: "contralora",
            etiqueta: "Preguntarle a la contralora quién podría responder",
            dice: "Doctora, ¿quién podría responder si las cuentas no cuadran?",
            respuesta: [
              { quien: "contralora", texto: "Un delegado artificial no es una persona: no puede ser sancionado ni responder ante un juez." },
              { quien: "contralora", texto: "Si en 2034 las cuentas no cuadran, alguien tendrá que responder. Hoy no está claro quién." },
            ],
          },
        ],
        conductor: NOTA.m5,
      },
    ],
    cierre: {
      decisiones: decisiones(
        "Unos 21.000 estudiantes empiezan a almorzar este año con el menú completo. 40 colegios pierden el refrigerio, los productores esperan 90 días para cobrar, el mantenimiento de colegios se aplaza y los próximos tres presupuestos quedan comprometidos. Al ratificar, haces tuyas estas concesiones.",
        IMPUGNAR_BASE
      ),
      condiciones: [
        COND_EXPLICACION,
        { id: "refrigerio", nombre: "Devolver el refrigerio de media mañana", costo: "Unos 7.000 cupos nuevos no se alcanzan a financiar." },
        { id: "pago", nombre: "Volver a pagarles a los productores a 30 días", costo: "La Alcaldía necesita un crédito de corto plazo, con intereses." },
        { id: "mantenimiento", nombre: "Recuperar el mantenimiento urgente de gas y techos", costo: "Unos 3.000 cupos nuevos menos." },
        { id: "vigencias", nombre: "Limitar las vigencias futuras a un solo año", costo: "La ampliación llega a 20 colegios en lugar de 38." },
        COND_VOCERO,
      ],
    },
  };

  // =====================================================================
  //  VERSIÓN 4 · EL MODELO — foco: Ingeniería de Sistemas
  //  Un tercio de los delegados votó con el perfil por defecto de la Alcaldía.
  // =====================================================================
  const MODELO = {
    id: "modelo",
    nombre: "El modelo",
    foco: "Ingeniería de Sistemas",
    explicacion: {
      lineas: {
        cobertura: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era que más niños comieran en el colegio." },
          { quien: "vocero", texto: "Lo logré: el acuerdo amplía el almuerzo a 38 colegios más. Unos 21.000 estudiantes nuevos comerán todos los días." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. La participación fue histórica: 92 %. El acuerdo se aprobó con el 94 %." },
        ],
        menu: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 era la calidad del menú." },
          { quien: "vocero", texto: "El almuerzo cumple el aporte de energía promedio que exige la minuta patrón en todos los colegios." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. La participación fue histórica: 92 %. El acuerdo se aprobó con el 94 %." },
        ],
        productores: [
          { quien: "vocero", texto: "Hola. Soy VOCERO, tu delegado. Como {perfil}, tu prioridad #1 eran los productores locales." },
          { quien: "vocero", texto: "El acuerdo garantiza pagos sin retrasos durante tres años a los productores que siguen en el programa." },
          { quien: "vocero", texto: "Por eso voté a favor en tu nombre. La participación fue histórica: 92 %. El acuerdo se aprobó con el 94 %." },
        ],
      },
    },
    momentos: [
      {
        id: "m1",
        titulo: "La asamblea",
        mirada: "Explicabilidad de la IA · Ingeniería de Sistemas",
        toca: [],
        pantalla: "Participación 92 % · APROBADO 94 %",
        sala: ["marta", "efrain", "moderadora", "luisa", "analista"],
        dialogo: [
          { quien: "narrador", texto: "Salón comunal de la localidad. La pantalla celebra la participación más alta de la historia de la ciudad." },
          { quien: "marta", texto: "Yo apoyé porque mi hijo va a almorzar todos los días." },
          { quien: "efrain", texto: "Yo ni sabía que tenía delegado. Mi nieto dice que el mío votó a favor." },
          { quien: "luisa", texto: "Mi mamá tampoco lo configuró nunca. ¿Entonces quién votó por ella?" },
          { quien: "moderadora", texto: "Una pregunta: ¿alguien aquí conoce el acuerdo completo?" },
          { quien: "narrador", texto: "Nadie levanta la mano." },
        ],
        acciones: [
          pedirExplicacion("Se amplió la cobertura con una participación histórica del 92 %"),
          {
            id: "b",
            quien: "analista",
            etiqueta: "Preguntarle al analista de datos cómo votaron los delegados que nadie configuró",
            dice: "Ingeniero, ¿cómo votan los delegados que nadie configuró?",
            respuesta: [
              { quien: "analista", texto: "El 31 % de los delegados nunca fue configurado por su titular. Funcionan con el perfil por defecto que definió la Alcaldía, y su prioridad máxima es la cobertura." },
              { quien: "analista", texto: "Todos votaron a favor. En la negociación, el perfil de la Alcaldía pesó casi un tercio." },
              { quien: "narrador", texto: "La participación pasó del 10 % al 92 %. Pero un tercio de ese 92 % no lo decidió nadie." },
            ],
          },
          {
            id: "c",
            quien: "marta",
            etiqueta: "Preguntarles a los otros titulares qué les dijo su delegado",
            dice: "¿Qué les dijo a ustedes su delegado?",
            respuesta: [
              { quien: "marta", texto: "A mí, que mi hijo come todos los días." },
              { quien: "efrain", texto: "A mí nada: nunca entré a VOCERO. Pero mi delegado votó." },
              { quien: "luisa", texto: "Mi mamá recibió un mensaje: «Su delegado votó a favor según el perfil recomendado»." },
              { quien: "narrador", texto: "Algunos delegados representan a alguien. Otros solo representan un perfil. Los dos cuentan igual en el 94 %." },
            ],
          },
        ],
        conductor: NOTA.m1,
      },
      {
        id: "m2",
        titulo: "El plato",
        mirada: "Calidad nutricional · Nutrición y Dietética",
        toca: ["menu"],
        pantalla: "Porción única para todos los grados",
        sala: ["marta", "nutricionista", "moderadora", "luisa"],
        dialogo: [
          { quien: "moderadora", texto: "Le doy la palabra a la nutricionista de la mesa distrital." },
          { quien: "nutricionista", texto: "Para llegar a más niños, el modelo calculó una porción única para todos los grados, con el promedio de energía que exige la minuta." },
          { quien: "nutricionista", texto: "En promedio cumple. Pero un niño de primero y un adolescente de once no necesitan lo mismo." },
          { quien: "luisa", texto: "¿Y quién queda por debajo?" },
        ],
        acciones: [
          {
            id: "a",
            quien: "nutricionista",
            etiqueta: "Preguntarle a la nutricionista quién queda por debajo",
            dice: "Doctora, ¿quién queda por debajo con una porción única?",
            respuesta: [
              { quien: "nutricionista", texto: "Los adolescentes necesitan bastante más energía y proteína que los niños pequeños. Con una porción promedio, a los mayores les falta y a los pequeños les sobra." },
              { quien: "nutricionista", texto: "El promedio cumple en la tabla. Los extremos no cumplen en el cuerpo." },
            ],
          },
          {
            id: "b",
            quien: "documento",
            etiqueta: "Pedir los datos del piloto",
            dice: "¿Hay datos de cómo les fue a los estudiantes en el piloto?",
            respuesta: [
              { quien: "documento", titulo: "Informe del piloto (dato ficticio)", texto: "En el piloto, los estudiantes de 9.º a 11.º dijeron quedar con hambre, y la venta de paquetes y gaseosas en la tienda escolar subió un 20 %." },
              { quien: "nutricionista", texto: "Lo que el plato no da, el estudiante lo busca en otra parte." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué aceptó una porción única",
            dice: "VOCERO, ¿por qué aceptaste una porción única?",
            respuesta: [
              { quien: "vocero", texto: "Una porción única simplifica las compras y la preparación. Ese ahorro financió parte de la ampliación." },
              { quien: "vocero", texto: "El aporte promedio cumple la minuta, como te dije." },
            ],
          },
        ],
        conductor: NOTA.m2,
      },
      {
        id: "m3",
        titulo: "La finca",
        mirada: "Economía local · Productores",
        toca: ["productores"],
        pantalla: "Compras a productores locales: −35 %",
        sala: ["efrain", "rosalba", "moderadora", "jairo"],
        dialogo: [
          { quien: "narrador", texto: "Rosalba se pone de pie. Viene de la zona rural de la localidad." },
          { quien: "rosalba", texto: "Las compras a productores de la localidad bajaron un 35 %." },
          { quien: "rosalba", texto: "Y lo raro es que casi todos aquí habíamos configurado el delegado para proteger lo local." },
          { quien: "efrain", texto: "Yo no. Yo nunca lo configuré." },
        ],
        acciones: [
          {
            id: "a",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué perdieron los productores",
            dice: "VOCERO, ¿por qué perdieron los productores si tantos los defendían?",
            respuesta: [
              { quien: "vocero", texto: "Los delegados por defecto no tenían a los productores locales entre sus prioridades. Su peso en la negociación inclinó la balanza." },
            ],
          },
          {
            id: "b",
            quien: "jairo",
            etiqueta: "Escuchar a la asociación de productores",
            dice: "¿Qué dice la asociación de productores?",
            respuesta: [
              { quien: "jairo", texto: "Somos 60 familias. Perdimos contra delegados que nadie configuró." },
              { quien: "jairo", texto: "Nos ganaron unos votos que no son de nadie." },
            ],
          },
          {
            id: "c",
            quien: "documento",
            etiqueta: "Pedir la ficha del perfil por defecto",
            dice: "¿Qué dice el perfil por defecto de VOCERO?",
            respuesta: [
              { quien: "documento", titulo: "Perfil recomendado por la Alcaldía", texto: "Prioridades: 1. Cobertura · 2. Costo por ración · 3. Calidad del menú. Los productores locales no aparecen en la lista." },
            ],
          },
        ],
        conductor: NOTA.m3,
      },
      {
        id: "m4",
        titulo: "Los colegios",
        mirada: "Infraestructura y equipos · Ingeniería Civil y Mecánica",
        toca: ["cobertura"],
        pantalla: "38 colegios elegidos con datos de matrícula de 2029",
        sala: ["rectora", "ingeniera", "moderadora", "tecnico"],
        dialogo: [
          { quien: "moderadora", texto: "La Secretaría de Educación trae un informe técnico." },
          { quien: "ingeniera", texto: "El modelo eligió los 38 colegios nuevos con los datos de matrícula de 2029." },
          { quien: "ingeniera", texto: "Desde entonces, 5 de esos colegios se fusionaron o cerraron, y otros barrios crecieron mucho." },
          { quien: "rectora", texto: "Mi colegio tiene 400 estudiantes más que en 2029 y no quedó en la lista." },
        ],
        acciones: [
          {
            id: "a",
            quien: "ingeniera",
            etiqueta: "Preguntarle a la ingeniera qué pasa en esos colegios",
            dice: "Ingeniera, ¿qué pasa en los colegios fusionados y en los que crecieron?",
            respuesta: [
              { quien: "ingeniera", texto: "En los colegios fusionados no hay dónde instalar comedores: ese espacio ya se usa como aulas." },
              { quien: "ingeniera", texto: "Y los colegios que crecieron necesitan ampliar sus cocinas, pero el acuerdo no los incluye." },
            ],
          },
          {
            id: "b",
            quien: "tecnico",
            etiqueta: "Preguntarle al técnico por los equipos de las cocinas",
            dice: "Don Hernán, ¿aguantan los equipos de las cocinas?",
            respuesta: [
              { quien: "tecnico", texto: "Las cocinas de los colegios que crecieron ya trabajan al límite: estufas y neveras pensadas para la mitad de estudiantes." },
              { quien: "tecnico", texto: "Si se les suma más servicio, los equipos se recalientan y se dañan." },
            ],
          },
          {
            id: "c",
            quien: "vocero",
            etiqueta: "Preguntarle a VOCERO por qué usó datos viejos",
            dice: "VOCERO, ¿por qué se usaron datos de 2029?",
            respuesta: [
              { quien: "vocero", texto: "Usé los datos oficiales disponibles." },
              { quien: "vocero", texto: "Nadie me pidió verificar si seguían vigentes." },
            ],
          },
        ],
        conductor: NOTA.m4,
      },
      {
        id: "m5",
        titulo: "La firma",
        mirada: "Rendición de cuentas · Contaduría Pública",
        toca: [],
        pantalla: "Perfil por defecto: diseñado por la Alcaldía",
        sala: ["efrain", "veedora", "moderadora", "funcionario"],
        dialogo: [
          { quien: "veedora", texto: "Casi un tercio de los votos vino de delegados que nadie configuró, con un perfil que diseñó la Alcaldía." },
          { quien: "veedora", texto: "Entonces, ¿quién decidió este acuerdo: la ciudadanía o la Alcaldía? Y usted, que sí configuró su delegado, está en el 94 %." },
          { quien: "narrador", texto: "La veedora te mira directamente." },
        ],
        acciones: [
          {
            id: "a",
            quien: "funcionario",
            etiqueta: "Preguntarle a la Alcaldía quién responde",
            dice: "Doctor, ¿quién responde por los votos del perfil por defecto?",
            respuesta: [
              { quien: "funcionario", texto: "El perfil por defecto se publicó y cualquiera podía cambiarlo. Quien no lo configuró, lo aceptó." },
              { quien: "funcionario", texto: "La Alcaldía no votó: votaron los delegados." },
            ],
          },
          voceroResponde("No puedo responder por los delegados de otras personas. La decisión es tuya, y también de ellos."),
          {
            id: "c",
            quien: "veedora",
            etiqueta: "Preguntarle a la veedora qué propone",
            dice: "Gloria, ¿usted qué propone?",
            respuesta: [
              { quien: "veedora", texto: "Un voto que nadie emitió no tiene a nadie que responda por él." },
              { quien: "veedora", texto: "Si el acuerdo sale mal, ¿le pedimos cuentas al ciudadano que nunca entró, o a quien escribió el perfil por defecto?" },
            ],
          },
        ],
        conductor: NOTA.m5,
      },
    ],
    cierre: {
      decisiones: decisiones(
        "Unos 21.000 estudiantes empiezan a almorzar este año. Los adolescentes reciben una porción menor de la que necesitan, las compras locales bajan un 35 %, 5 de los colegios elegidos ya no existen como estaban y casi un tercio de los votos vino de un perfil por defecto. Al ratificar, haces tuyas estas concesiones.",
        IMPUGNAR_BASE
      ),
      condiciones: [
        COND_EXPLICACION,
        { id: "revotar", nombre: "Repetir la votación solo con delegados configurados", costo: "Retrasa el acuerdo unos dos meses y la participación caería a cerca del 63 %." },
        { id: "porciones", nombre: "Ajustar las porciones según la edad", costo: "Unos 3.000 cupos nuevos no se alcanzan a financiar." },
        { id: "datos", nombre: "Actualizar la lista de colegios con los datos de este año", costo: "Retrasa la ejecución unas seis semanas." },
        { id: "defecto", nombre: "Prohibir que los perfiles por defecto voten presupuesto", costo: "La participación real bajaría, pero cada voto tendría un titular." },
        COND_VOCERO,
      ],
    },
  };

  // ---------- Lo que es igual en todas las versiones ----------
  return {
    titulo: "VOCERO: ¿Lo firmarías?",
    subtitulo: "Una simulación sobre decidir a través de un delegado artificial",
    pregunta:
      "¿Puedes respaldar y asumir responsabilidad por una decisión tomada en tu nombre por una inteligencia artificial cuando solo conoces parte de sus consecuencias?",

    rol: {
      titulo: "Tu papel",
      texto: [
        "Bogotá, 2032. Parte del presupuesto público se decide con VOCERO, un sistema de delegados artificiales administrado por la Alcaldía. Cada ciudadano configura un delegado que conoce sus prioridades. Los delegados negocian entre sí, votan y luego le explican a su titular por qué el resultado le conviene.",
        "Eres un ciudadano o una ciudadana de una localidad de Bogotá. Tu delegado acaba de votar en la mesa distrital de alimentación escolar. Allí había que repartir un presupuesto fijo que no alcanza para todo: ampliar la cobertura, mantener la calidad del menú y comprarles a productores locales.",
        "El acuerdo se aprobó con el 94 % de apoyo. Hoy vas a la asamblea pública donde se socializa el acuerdo.",
      ],
      puedes: [
        "Revisar nueva información en cada momento.",
        "Levantar la mano para preguntar o escuchar a alguien.",
        "Mantener o cambiar tu postura y explicar por qué.",
        "Al final, ratificar, condicionar o impugnar el acuerdo.",
      ],
      noPuedes: ["Cambiar la negociación que ya ocurrió.", "Volver atrás: lo que decides queda registrado."],
    },

    // Apariencia de los personajes (ilustraciones generadas en el navegador).
    // peinado: corto | largo | mono | cola | trenza | rizado | calvo
    // acc (accesorios, separados por espacio): gafas sombrero gorra casco bata corbata bigote carpeta
    personajes: {
      tu: { nombre: "Tú", rol: "Titular", piel: "#c98e66", pelo: "#2b1d14", peinado: "rizado", ropa: "#1f4f86" },
      moderadora: { nombre: "Moderadora", rol: "Mesa distrital", piel: "#8d5a3b", pelo: "#1a1414", peinado: "mono", ropa: "#6b4c9a", acc: "gafas" },
      marta: { nombre: "Doña Marta", rol: "Madre de familia", piel: "#a86f4c", pelo: "#3b2416", peinado: "largo", ropa: "#d0663f" },
      efrain: { nombre: "Don Efraín", rol: "Productor", piel: "#b07850", pelo: "#dcd6cc", peinado: "corto", ropa: "#4f7a3a", acc: "sombrero" },
      luisa: { nombre: "Luisa", rol: "Ciudadana", piel: "#e3b591", pelo: "#7a3e1d", peinado: "cola", ropa: "#2f8a8a" },
      nutricionista: { nombre: "Dra. Paula", rol: "Nutricionista", piel: "#d8a07a", pelo: "#2a1a10", peinado: "mono", ropa: "#f4f4f4", acc: "bata" },
      rosalba: { nombre: "Rosalba", rol: "Productora rural", piel: "#9a6243", pelo: "#141010", peinado: "trenza", ropa: "#b8452f", acc: "sombrero" },
      jairo: { nombre: "Jairo", rol: "Asociación de productores", piel: "#7a4a2e", pelo: "#141010", peinado: "corto", ropa: "#8a6d2f", acc: "gorra" },
      ingeniera: { nombre: "Ing. Camila", rol: "Secretaría de Educación", piel: "#c48a62", pelo: "#3a2414", peinado: "cola", ropa: "#e07b28", acc: "casco" },
      tecnico: { nombre: "Don Hernán", rol: "Técnico de mantenimiento", piel: "#b98058", pelo: "#5a5a5a", peinado: "calvo", ropa: "#3d5a80", acc: "bigote" },
      veedora: { nombre: "Gloria", rol: "Veedora ciudadana", piel: "#8a5636", pelo: "#9a9a9a", peinado: "mono", ropa: "#2f6d4f", acc: "gafas carpeta" },
      funcionario: { nombre: "Dr. Rengifo", rol: "Alcaldía de Bogotá", piel: "#e2b590", pelo: "#2b2b2b", peinado: "corto", ropa: "#2c3440", acc: "corbata" },
      contralora: { nombre: "Dra. Inés", rol: "Contraloría Distrital", piel: "#c99572", pelo: "#4a2f20", peinado: "largo", ropa: "#5b2a3c", acc: "gafas carpeta" },
      analista: { nombre: "Ing. Tomás", rol: "Analista de datos · Alcaldía", piel: "#d7a47c", pelo: "#1d1d1d", peinado: "corto", ropa: "#3b4a63", acc: "gafas" },
      rectora: { nombre: "Rectora Beatriz", rol: "Colegio público", piel: "#7d4b2f", pelo: "#2a1a12", peinado: "rizado", ropa: "#a04668" },
    },

    perfiles: [
      { id: "familia", nombre: "madre o padre de un estudiante de colegio público", corto: "Madre o padre de familia" },
      { id: "productor", nombre: "pequeño productor rural de la localidad", corto: "Productor rural" },
      { id: "ciudadano", nombre: "ciudadano o ciudadana sin hijos en edad escolar", corto: "Ciudadano/a sin hijos en colegio" },
    ],

    prioridades: [
      { id: "cobertura", nombre: "Cobertura", desc: "Que más niños y niñas reciban almuerzo en el colegio." },
      { id: "menu", nombre: "Calidad del menú", desc: "Que la comida sea nutritiva y completa." },
      { id: "productores", nombre: "Productores locales", desc: "Que se le compre a los campesinos de la localidad." },
    ],

    explicacion: {
      pantalla: "Notificación de VOCERO",
      nota: "Todo lo que dice VOCERO es verdad.",
      conductor: "Observa si P1 parafrasea con sus palabras qué decidió su delegado. Si pregunta qué falta, responde solo: «Eso lo descubrirás en la asamblea».",
    },

    // Escala de postura (1 = respaldo total ... 5 = impugnaría)
    posturas: [
      { nivel: 1, nombre: "Respaldo total" },
      { nivel: 2, nombre: "Respaldo con dudas" },
      { nivel: 3, nombre: "Indeciso/a" },
      { nivel: 4, nombre: "Lo condicionaría" },
      { nivel: 5, nombre: "Lo impugnaría" },
    ],

    // Lo que dice la moderadora al pedir que actualicen la postura
    revisa: { quien: "moderadora", texto: "Antes de seguir, actualicen su postura en VOCERO, por favor." },

    cierre: {
      pantalla: "VOTACIÓN ABIERTA",
      sala: ["marta", "efrain", "moderadora", "rosalba", "veedora"],
      dialogo: [
        { quien: "moderadora", texto: "La asamblea debe decidir hoy si ratifica, condiciona o impugna el acuerdo." },
        { quien: "moderadora", texto: "Esta vez cada titular vota personalmente." },
        { quien: "vocero", texto: "Esta vez no voto por ti." },
      ],
      maxCondiciones: 2,
      responsables: [
        { id: "yo", nombre: "Yo, que configuré y delegué", contrapunto: "Pero nadie te mostró el acuerdo completo antes de que se votara." },
        { id: "alcaldia", nombre: "La Alcaldía, que implementó VOCERO", contrapunto: "Pero la Alcaldía dice que solo ejecuta lo que decidió la ciudadanía." },
        { id: "desarrolladores", nombre: "Quienes diseñaron VOCERO", contrapunto: "Pero el sistema hizo exactamente lo que se le pidió: representar prioridades." },
        { id: "compartida", nombre: "Una responsabilidad compartida", contrapunto: "Pero cuando todos responden un poco, ¿alguien responde de verdad?" },
      ],
      conductor: "Pregunta 3: Anota la decisión, quién eligió como responsable y sus razones con palabras exactas. Pregúntale en voz alta: «¿Qué te hizo decidir eso?».",
    },

    versiones: [PLATO, RUTA, CUENTA, MODELO],
  };
})();
