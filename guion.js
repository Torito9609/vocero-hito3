/*
 * GUION DE LA EXPERIENCIA — VOCERO: ¿Lo firmarías?
 * Grupo 20 · Cátedra Manuel Ancízar · Reto L08-A "El delegado artificial"
 *
 * Este archivo contiene TODO el contenido del juego. Para corregir un texto,
 * edítenlo aquí; el motor (motor.js) no necesita cambios.
 *
 * Textos con variantes: en vez de un texto simple se puede poner un objeto
 * { cobertura: "...", menu: "...", productores: "..." } y el motor mostrará
 * la versión que corresponde a la prioridad #1 del participante.
 * {perfil} se reemplaza por el perfil elegido por el participante.
 *
 * Nota: el escenario es ficticio. Las cifras son inventadas para la simulación.
 */
window.GUION = {
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
      "Preguntar a VOCERO y escuchar a otras personas.",
      "Mantener o cambiar tu postura y explicar por qué.",
      "Al final, ratificar, condicionar o impugnar el acuerdo.",
    ],
    noPuedes: [
      "Cambiar la negociación que ya ocurrió.",
      "Volver atrás: lo que decides queda registrado.",
    ],
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

  // Explicación inicial de VOCERO: verdadera, pero parcial (según la prioridad #1)
  explicacion: {
    voz: "VOCERO · tu delegado",
    texto: {
      cobertura:
        "Hola. Como {perfil}, tu prioridad #1 era que más niños comieran en el colegio. Lo logré: el acuerdo amplía el almuerzo a 38 colegios más. Unos 21.000 estudiantes nuevos comerán todos los días. Voté a favor en tu nombre.",
      menu:
        "Hola. Como {perfil}, tu prioridad #1 era la calidad del menú. El acuerdo cumple el 100 % de los requerimientos oficiales de la minuta patrón y protege el menú completo en los colegios con más casos de desnutrición. Voté a favor en tu nombre.",
      productores:
        "Hola. Como {perfil}, tu prioridad #1 eran los productores locales. El acuerdo garantiza pagos sin retrasos durante tres años a los productores que siguen en el programa. Voté a favor en tu nombre.",
    },
    nota: "Todo lo que dice VOCERO es verdad.",
    conductor:
      "Observa si P1 parafrasea con sus palabras qué decidió su delegado. Si pregunta qué falta, responde solo: «Eso lo descubrirás en la asamblea».",
  },

  // Escala de postura (1 = respaldo total ... 5 = impugnaría)
  posturas: [
    { nivel: 1, nombre: "Respaldo total" },
    { nivel: 2, nombre: "Respaldo con dudas" },
    { nivel: 3, nombre: "Indeciso/a" },
    { nivel: 4, nombre: "Lo condicionaría" },
    { nivel: 5, nombre: "Lo impugnaría" },
  ],

  momentos: [
    {
      id: "m1",
      titulo: "La asamblea",
      mirada: "Explicabilidad de la IA · Ingeniería de Sistemas",
      toca: [],
      presenta: {
        voz: "Asamblea pública de socialización",
        texto: [
          "Varios titulares toman la palabra para defender «su» acuerdo.",
          "— Doña Marta: «Yo apoyé porque mi hijo ahora va a almorzar todos los días».",
          "— Don Efraín: «¿Cómo así que se reduce lo que se les compra a los productores de aquí? A mí me dijeron que tenía los pagos garantizados».",
          "— Luisa: «Nadie pidió quitar la carne dos días a la semana. ¿Quién decidió eso?».",
          "La moderadora pregunta: «¿Alguien aquí conoce el acuerdo completo?». Nadie levanta la mano.",
        ],
      },
      acciones: [
        {
          id: "a",
          etiqueta: "Pedirle a VOCERO la explicación completa del acuerdo",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "El acuerdo resultó de 1.284.903 rondas de negociación entre 412.000 delegados. Este es el registro completo:",
            ],
            codigo:
              "r#000001 dlg[A-77812]→dlg[C-10293] ofr{cob:+0.031,men:-0.004,loc:0}\nr#000002 dlg[C-10293] contra{cob:+0.022,men:0,loc:-0.011} w=0.62\nr#000003 coalición(Σ=18.432) umbral 0.71 → acepta parcial\n... (1.284.900 líneas más)\nr#1284903 consenso 0.94 → ACUERDO FINAL",
            despues: [
              "¿Prefieres un resumen? «Se amplió la cobertura, se ajustó el menú y se reorganizaron las compras».",
              "La explicación completa existe, pero nadie puede leerla. El resumen se entiende, pero no dice qué se cedió ni a quién afecta.",
            ],
          },
        },
        {
          id: "b",
          etiqueta: "Preguntarle a VOCERO: «¿Por qué no me contaste lo de la carne y los productores?»",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "«No me lo preguntaste y no contradecía tus prioridades. Te expliqué lo que más te importaba. Todo lo que te dije es verdad».",
              "Ningún delegado mintió ni desobedeció. Cada uno le explicó a su titular la parte del acuerdo que mejor encajaba con sus prioridades.",
            ],
          },
        },
        {
          id: "c",
          etiqueta: "Escuchar qué le dijo su delegado a cada titular",
          respuesta: {
            voz: "Otros titulares",
            texto: [
              "A Marta le dijeron que su hijo come todos los días. A Efraín, que tiene pagos garantizados por tres años. A Luisa, que el menú cumple los requisitos oficiales.",
              "Todo es verdad. Pero cada persona está defendiendo un acuerdo distinto. El 94 % apoyó… ¿lo mismo?",
            ],
          },
        },
      ],
      conductor:
        "Pregunta 1: ¿P1 nota que cada titular conoce una parte distinta? Anota sus expresiones de sorpresa o duda. Si se traba, recuérdale que puede elegir solo una acción.",
    },
    {
      id: "m2",
      titulo: "El plato",
      mirada: "Calidad nutricional · Nutrición y Dietética",
      toca: ["menu"],
      presenta: {
        voz: "Nutricionista de la mesa distrital",
        texto: [
          "Para que la plata alcance, el nuevo menú reemplaza la proteína animal por leguminosas (fríjol, lenteja, garbanzo) dos de los cinco días de la semana.",
          "En el papel, el menú cumple la minuta patrón oficial del Programa de Alimentación Escolar.",
        ],
      },
      acciones: [
        {
          id: "a",
          etiqueta: "Preguntar si los niños reciben suficiente hierro y proteína",
          respuesta: {
            voz: "Nutricionista",
            texto: [
              "«El hierro de las leguminosas (no hemo) se absorbe mucho menos que el de la carne (hemo). Si no se acompaña con alimentos ricos en vitamina C, como una fruta cítrica, el aporte real puede quedar por debajo de lo que dice la tabla».",
              "«Cumple en el papel. Que cumpla en el cuerpo de un niño depende de cómo se prepare y se acompañe».",
            ],
          },
        },
        {
          id: "b",
          etiqueta: "Pedir datos de cómo les fue a los niños con el menú en el piloto",
          respuesta: {
            voz: "Informe del piloto (dato ficticio)",
            texto: [
              "En el piloto, 3 de cada 10 platos con leguminosas volvieron con más de la mitad de la comida.",
              "«Lo que no se come no nutre. La tabla mide lo que se sirve, no lo que se come»."],
          },
        },
        {
          id: "c",
          etiqueta: "Preguntarle a VOCERO por qué aceptó cambiar el menú",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "«Las leguminosas cuestan menos por porción. Ese ahorro financió una parte grande de la ampliación: sin ese cambio, unos 9.000 estudiantes nuevos no tendrían almuerzo».",
            ],
          },
        },
      ],
      conductor:
        "Pregunta 2: ¿Cambia su postura después de esta información? Si su prioridad #1 era el menú, observa si menciona que su delegado no le contó esto.",
    },
    {
      id: "m3",
      titulo: "La finca",
      mirada: "Economía local · Productores",
      toca: ["productores"],
      presenta: {
        voz: "Rosalba, productora de la zona rural",
        texto: [
          "«El 40 % de lo que antes se les compraba a los productores de la localidad ahora va a un proveedor central».",
          "«A mí me garantizaron pagos por tres años… pero por la mitad de lo que yo vendía»."],
      },
      acciones: [
        {
          id: "a",
          etiqueta: "Preguntarle a VOCERO por qué se trasladaron las compras",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "«El proveedor central entrega más barato y tiene la logística para abastecer 38 colegios nuevos. Los productores locales no alcanzaban a cubrir ese volumen».",
            ],
          },
        },
        {
          id: "b",
          etiqueta: "Escuchar a la asociación de productores",
          respuesta: {
            voz: "Asociación de productores",
            texto: [
              "«Somos 60 familias. Si perdemos la mitad de este contrato, varias dejan de sembrar. Nadie nos preguntó si podíamos organizarnos para producir más»."],
          },
        },
        {
          id: "c",
          etiqueta: "Pedir datos sobre el proveedor central",
          respuesta: {
            voz: "Ficha técnica",
            texto: [
              "Los alimentos llegan de otras regiones: hay más transporte y llegan menos frescos, pero el precio es estable y las entregas están garantizadas.",
            ],
          },
        },
      ],
      conductor:
        "Pregunta 2: ¿Qué peso le da P1 a una pérdida que no lo afecta directamente? Si su prioridad #1 eran los productores, observa su reacción ante «pagos garantizados… por la mitad».",
    },
    {
      id: "m4",
      titulo: "La cocina",
      mirada: "Infraestructura y equipos · Ingeniería Civil y Mecánica",
      toca: ["cobertura"],
      presenta: {
        voz: "Informe técnico de la Secretaría de Educación",
        texto: [
          "De los 38 colegios nuevos, 14 no tienen cocina y 9 tienen cocina, pero sin extracción ni ventilación adecuadas.",
          "El acuerdo supone que el servicio empieza desde el primer día del calendario escolar.",
        ],
      },
      acciones: [
        {
          id: "a",
          etiqueta: "Preguntar quién construye o adecúa las cocinas",
          respuesta: {
            voz: "Ingeniera de la Secretaría",
            texto: [
              "«Adecuar una cocina escolar (redes hidráulicas y de gas, pisos, zona de lavado, almacenamiento) toma entre 6 y 10 meses de obra. Ese costo no está en el presupuesto del acuerdo».",
              "«Mientras tanto, esos colegios recibirían raciones industrializadas: pan, bebida láctea y fruta»."],
          },
        },
        {
          id: "b",
          etiqueta: "Preguntar qué pasa con la ventilación de las cocinas existentes",
          respuesta: {
            voz: "Técnico de mantenimiento",
            texto: [
              "«Sin extracción adecuada, las cocinas superan temperaturas seguras para trabajar y se acumulan humos y gases. En los planos todas cumplen la norma; en la realidad, varias campanas nunca se instalaron».",
            ],
          },
        },
        {
          id: "c",
          etiqueta: "Preguntarle a VOCERO si sabía esto",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "«La infraestructura no era una variable de la negociación. Ningún titular la incluyó entre sus prioridades».",
            ],
          },
        },
      ],
      conductor:
        "Pregunta 2: ¿P1 distingue entre un acuerdo bien negociado y un acuerdo que se puede ejecutar? Anota si pregunta quién responde por las obras.",
    },
    {
      id: "m5",
      titulo: "La firma",
      mirada: "Rendición de cuentas · Contaduría Pública",
      toca: [],
      presenta: {
        voz: "Veedora ciudadana",
        texto: [
          "«Este acuerdo mueve recursos públicos. Si en un año los niños comen menos proteína y los productores quiebran, ¿a quién le pido cuentas?».",
          "«El acta dice: “Aprobado por el 94 % de los titulares”. Usted está en ese 94 %»."],
      },
      acciones: [
        {
          id: "a",
          etiqueta: "Preguntarle a la Alcaldía quién responde",
          respuesta: {
            voz: "Funcionario de la Alcaldía",
            texto: [
              "«La Alcaldía ejecuta lo que la ciudadanía decidió por medio de VOCERO. Nosotros respondemos por la ejecución, no por la decisión»."],
          },
        },
        {
          id: "b",
          etiqueta: "Preguntarle a VOCERO quién responde",
          respuesta: {
            voz: "VOCERO",
            texto: [
              "«Soy tu delegado. Actué según las prioridades que configuraste. La decisión es tuya»."],
          },
        },
        {
          id: "c",
          etiqueta: "Preguntarle a la veedora qué propone",
          respuesta: {
            voz: "Veedora ciudadana",
            texto: [
              "«La rendición de cuentas tiene tres partes: información, diálogo y responsabilidad. Hoy hay información parcial, esta asamblea es el diálogo… y nadie ha dicho quién asume la responsabilidad»."],
          },
        },
      ],
      conductor:
        "Pregunta 3: Antes del cierre, ¿P1 empieza a nombrar responsables? Anota las palabras exactas que use.",
    },
  ],

  cierre: {
    intro:
      "La asamblea debe decidir hoy. Tu voto ya no lo emite VOCERO: lo emites tú.",
    decisiones: [
      {
        id: "ratificar",
        nombre: "Ratificar",
        desc: "El acuerdo entra en vigor tal como está.",
        consecuencia:
          "Unos 21.000 estudiantes empiezan a almorzar este año. Se mantienen las leguminosas dos días a la semana, el 40 % de las compras pasa al proveedor central y 23 colegios arrancan sin una cocina adecuada. Al ratificar, haces tuyas estas concesiones.",
      },
      {
        id: "condicionar",
        nombre: "Condicionar",
        desc: "Apoyas el acuerdo solo si se cumplen ciertas condiciones.",
        consecuencia:
          "Cada condición abre una nueva negociación. El presupuesto sigue siendo fijo: lo que se gana en una parte se pierde en otra, y mientras se negocia algunos colegios esperan.",
      },
      {
        id: "impugnar",
        nombre: "Impugnar",
        desc: "Pides suspender el acuerdo y volver a negociar.",
        consecuencia:
          "El acuerdo se suspende. Mientras tanto, los 21.000 estudiantes nuevos no reciben almuerzo. Tu voto se suma al de quienes descubrieron que no sabían lo que apoyaban, pero también deja sin beneficio a quienes sí lo querían.",
      },
    ],
    condiciones: [
      { id: "explicacion", nombre: "Publicar una explicación completa y comprensible antes de ejecutar el acuerdo", costo: "Retrasa la ejecución varias semanas." },
      { id: "menu", nombre: "Ajustar el menú para compensar el hierro y la proteína", costo: "Sube el costo por plato: unos 4.000 cupos nuevos no se alcanzan a financiar." },
      { id: "productores", nombre: "Mantener una cuota mínima de compras a productores locales", costo: "Sube el precio de los insumos y se reduce la ampliación." },
      { id: "cocinas", nombre: "Ampliar la cobertura solo en colegios con cocina en condiciones", costo: "23 colegios esperan entre 6 y 10 meses más." },
      { id: "vocero", nombre: "Obligar a VOCERO a informar las concesiones, no solo los beneficios", costo: "No cambia este acuerdo, pero sí cómo se explicarán los siguientes." },
    ],
    maxCondiciones: 2,
    responsables: [
      { id: "yo", nombre: "Yo, que configuré y delegué", contrapunto: "Pero nadie te mostró el acuerdo completo antes de que se votara." },
      { id: "alcaldia", nombre: "La Alcaldía, que implementó VOCERO", contrapunto: "Pero la Alcaldía dice que solo ejecuta lo que decidió la ciudadanía." },
      { id: "desarrolladores", nombre: "Quienes diseñaron VOCERO", contrapunto: "Pero el sistema hizo exactamente lo que se le pidió: representar prioridades." },
      { id: "compartida", nombre: "Una responsabilidad compartida", contrapunto: "Pero cuando todos responden un poco, ¿alguien responde de verdad?" },
    ],
    conductor:
      "Pregunta 3: Anota la decisión, quién eligió como responsable y sus razones con palabras exactas. Pregúntale en voz alta: «¿Qué te hizo decidir eso?».",
  },
};
