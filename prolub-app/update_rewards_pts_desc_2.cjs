const fs = require('fs');

const updates = `Licuadora 6 Velocidades;Prepara los mejores batidos y cócteles para celebrar cada victoria de tu selección.;320;160
Picatodo Negro;Pica los ingredientes para tus pasabocas tan rápido como un contragolpe letal.;147;73
Freidora de aire 4 Litros;Snacks crujientes y saludables para el medio tiempo, sin perderte ni un segundo del partido.;463;231
Cafetera Eléctrica 12 Tazas He7031a Negro;Mantente despierto en todos los partidos, incluso en los de la madrugada. Energía para gritar gol.;349;175
Olla Arrocera 1;El acompañamiento perfecto para el asado del domingo de fútbol. Rinde para toda la hinchada.;213;107
Olla Eléctrica Multifunción;Prepara un banquete de campeones mientras disfrutas de la final del Mundial.;533;267
Sanduchera Panini;Sándwiches calientes y listos para el pitazo inicial. El mejor refuerzo para tu hambre.;133;66
Sanduchera Eléctrica 2 Puestos;Doble porción para compartir con tu compañero de tribuna en casa.;107;53
Horno Electrico;Calienta tus snacks y mantén la temperatura del partido al máximo nivel.;295;147
Horno Microondas de Mesa;Comida lista en tiempo récord, para que no te pierdas ni una jugada de peligro.;492;246
Ventilador De Piso;Mantén la frescura cuando el partido se ponga candente en los últimos minutos.;332;166
Ventilador 3 en 1;Refresca el ambiente en la sala mientras tu equipo suda la camiseta en la cancha.;267;133
Plancha Para Ropa vertical;Tu camiseta de la selección siempre impecable, lista para salir a celebrar.;244;122
Plancha De Vapor Ligera;Elimina las arrugas de tu uniforme de hincha con la precisión de un tiro libre.;147;73
Wafflera;Desayunos de campeones para los partidos mañaneros del Mundial.;147;73
Nevera Convencional 211 Litros Brutos;Mantén tus bebidas heladas para celebrar cada gol como se debe.;1733;867
Nevera No Frost 249 L;Espacio de sobra para las provisiones de toda la fase de grupos.;2133;1067
Nevera No Frost 389 L;El estadio de tus bebidas. Capacidad gigante para la gran final.;2533;1267
Lavadora Carga Superior 15 kg;Lava las camisetas de toda la hinchada después de una celebración épica.;3873;1937
Lavadora Carga Superior 11 kg (24lb);Tu uniforme de la suerte siempre limpio y listo para el próximo encuentro.;2444;1222
Sofá cama;El mejor asiento del estadio está en tu sala. Comodidad total para ver el Mundial.;944;472
Juego de comedor 6 puestos;Reúne a tu equipo titular para disfrutar de una buena comida antes del partido.;1111;556
Juego de vajilla 4 puestos;Sirve la pasión del fútbol en cada comida con tu familia.;133;67
Batería de ollas;Equipa tu cocina como un verdadero director técnico prepara su estrategia.;267;133
Reloj Garmin Vivoactive 5 Marfil;Mide tus pulsaciones en la tanda de penales y controla tu rendimiento como un profesional.;2132;1066
Televisor Challenger 32” LED;No te pierdas ningún detalle del partido desde la comodidad de tu cuarto.;949;475
Televisor 40” LED UHD 4K;Resolución de campeonato para ver cada jugada polémica con claridad.;2000;1000
Televisor 43” LED UHD 4K;Siente que estás en el estadio con colores vivos y definición de primera.;2667;1333
Televisor 50” LED UHD 4K;Una pantalla gigante para vivir la emoción del Mundial en tamaño real.;3467;1733
Televisor 65” LED UHD 4K;El estadio en tu sala. La experiencia definitiva para la final del mundo.;4444;2222
Barra de sonido;Escucha el cántico de la hinchada y el silbato del árbitro como si estuvieras allí.;1507;753
Parlante Clip 5 JBL;Lleva la fiesta del fútbol a cualquier parte. Pequeño pero con potencia de goleador.;378;189
Parlante K-SPK300D Negro;Potencia de estadio para que tus celebraciones se escuchen en todo el barrio.;1107;553
Audífonos Deportivos Inalámbricos Bluetooth 5.3;Concéntrate en el partido o en tu entrenamiento con la mejor tecnología.;133;67
Audífonos Diadema Bluetooth con SD y Radio;Sintoniza los partidos en la radio y no te pierdas ni un minuto de la acción.;133;67
Audífonos de diadema JBL Bluetooth;Aíslate del ruido y vive la narración del partido con calidad de estudio.;377;188
Mini Proyector WiFi y Bluetooth - Resolución nativa 1080P;Proyecta el partido en la pared y convierte tu casa en una fan zone.;389;194
Amazon Alexa;Pídele a Alexa los resultados del Mundial y controla tu casa inteligente sin soltar la cerveza.;400;200
Aspiradora Robot;Que ella limpie la sala mientras tú no despegas los ojos del televisor.;980;490
Patineta eléctrica Xiaomi Scooter 5 Max;Llega a tiempo para el pitazo inicial, esquivando el tráfico como un crack.;3667;1833
Bicicleta Eléctrica 35kmh;Muévete por la ciudad con la velocidad de un extremo por la banda.;3222;1611
Portátil HP 14”;Sigue las estadísticas del Mundial y trabaja sin perder el ritmo.;2199;1099
Tablet SAMSUNG;Lleva el partido a cualquier habitación de la casa. Tu segunda pantalla ideal.;2133;1067
Tablet Lenovo;Analiza las jugadas y revisa el VAR desde la palma de tu mano.;1333;667
Samsung Galaxy A16 · 256 GB · 8 GB RAM;Captura los mejores momentos de tus celebraciones con calidad de primera.;1200;600
Samsung Galaxy A36 · 256 GB · 8 GB RAM;Rendimiento de alto nivel para seguir el Mundial en tus redes sociales.;1667;833
iPhone 13 · 128 GB;Graba tus reacciones a los goles con la mejor cámara del mercado.;4000;2000
iPhone 15 · 128 GB;Tecnología de punta para el hincha más exigente. Sigue el Mundial con estilo.;5067;2533
Celular SAMSUNG Galaxy A17 256 GB 8 GB RAM Azul;Un equipo titular en tu bolsillo. Batería para todo el día de partidos.;1333;667
Celular MOTOROLA G55;Conectividad rápida para que no te pierdas ninguna notificación de gol.;1333;667
Celular MOTOROLA G56 5G 256 GB 8 GB RAM Azul Marino;Velocidad 5G para ver los partidos en streaming sin interrupciones.;1444;722
Ahumador y Asador de Barril Mediano 20 Lbs;El MVP del tercer tiempo. Prepara los mejores asados para celebrar con tu hinchada.;667;333`;

const dbContent = fs.readFileSync('services/db.ts', 'utf-8');

let newDbContent = dbContent;

const lines = updates.split('\n').filter(l => l.trim() !== '');
for (const line of lines) {
    const parts = line.split(';');
    if (parts.length < 4) continue;
    
    const name = parts[0].trim();
    const desc = parts[1].trim();
    const pareto = parseInt(parts[2].trim());
    const normal = parseInt(parts[3].trim());
    
    const escapedName = name.replace(/[.*+?^$\{()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(`"name":\\s*['"]${escapedName}['"]`);
    
    const match = newDbContent.match(nameRegex);
    if (match) {
        const matchIndex = match.index;
        const objStart = newDbContent.lastIndexOf('{', matchIndex);
        const objEnd = newDbContent.indexOf('}', matchIndex);
        
        if (objStart !== -1 && objEnd !== -1) {
            let objStr = newDbContent.substring(objStart, objEnd + 1);
            
            objStr = objStr.replace(/"description":\s*"(.*?)"/s, `"description": "${desc.replace(/"/g, '\\"')}"`);
            objStr = objStr.replace(/"pointsPareto":\s*\d+/, `"pointsPareto": ${pareto}`);
            objStr = objStr.replace(/"pointsNormal":\s*\d+/, `"pointsNormal": ${normal}`);
            
            newDbContent = newDbContent.substring(0, objStart) + objStr + newDbContent.substring(objEnd + 1);
        }
    } else {
        console.log("Could not find:", name);
    }
}

// Update DB_KEY to force reload
newDbContent = newDbContent.replace(/const DB_KEY = 'gulf_prolub_db_v\d+';/, "const DB_KEY = 'gulf_prolub_db_v9';");

fs.writeFileSync('services/db.ts', newDbContent);
console.log('Updated services/db.ts');
