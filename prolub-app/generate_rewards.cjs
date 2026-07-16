const fs = require('fs');

const existingRewards = [
    {
      id: 'rw_001',
      name: 'Camisetas COL',
      description: 'Póntela con orgullo, porque el partido también se juega con el corazón.\nVestirse de selección es parte del ritual.',
      pointsPareto: 444,
      pointsNormal: 222,
      imageUrls: [
        'https://i.postimg.cc/QNp3mpDs/Camiseta-Seleccion-COL.avif'
      ],
      category: 'Ropa',
      popularity: 90,
      dateAdded: '2024-01-01'
    },
    {
      id: 'rw_002',
      name: 'Gorra / Vaso cervecero',
      description: 'Porque el hincha se reconoce desde el primer sorbo y hasta el último minuto.\nPara vivir el partido como se debe',
      pointsPareto: 89,
      pointsNormal: 44,
      imageUrls: [
        'https://placehold.co/600x400/003594/FFFFFF?text=Gorra+Gulf'
      ],
      category: 'Accesorios',
      popularity: 70,
      dateAdded: '2024-01-02'
    },
    {
      id: 'rw_003',
      name: 'Balón original Selección Colombia',
      description: 'El balón que despierta sueños, pasiones y recuerdos de Mundial.\nEmocional y aspiracional.',
      pointsPareto: 256,
      pointsNormal: 128,
      imageUrls: [
        'https://i.postimg.cc/FRnFD78g/Balon-3.webp',
        'https://i.postimg.cc/sX0fwvqJ/Balon-4.webp',
        'https://i.postimg.cc/pT1Vqp4Z/Balon1.webp',
        'https://i.postimg.cc/85nktj9Z/Balon2.webp'
      ],
      category: 'Deportes',
      popularity: 95,
      dateAdded: '2024-01-03'
    },
    {
      id: 'rw_004',
      name: 'Sanduchera',
      description: 'Mientras rueda el balón, prepárate el sánduche del gol.\nTal cual tu idea, perfecta y muy memorable.',
      pointsPareto: 144,
      pointsNormal: 72,
      imageUrls: [
        'https://i.postimg.cc/SQMjDGQJ/Sandwinch-1.webp',
        'https://i.postimg.cc/j2P52RkK/Sandwinch-2.webp',
        'https://i.postimg.cc/7P2bmNPb/Sandwinch-3.webp',
        'https://i.postimg.cc/L41hNV45/Sandwinch-4.webp'
      ],
      category: 'Hogar',
      popularity: 50,
      dateAdded: '2024-01-04'
    },
    {
      id: 'rw_005',
      name: 'Mini parrilla eléctrica',
      description: 'Cuando el partido se alarga, la parrilla también entra en la cancha.\nPerfecta para tiempos extra, reuniones y celebraciones.',
      pointsPareto: 89,
      pointsNormal: 44,
      imageUrls: [
        'https://placehold.co/600x400/F37121/FFFFFF?text=Parrilla+Electrica'
      ],
      category: 'Hogar',
      popularity: 60,
      dateAdded: '2024-01-05'
    },
    {
      id: 'rw_006',
      name: 'Hielera',
      description: 'Que nada se caliente… ni el partido ni la bebida.\nMuy fútbol, muy reunión.',
      pointsPareto: 63,
      pointsNormal: 32,
      imageUrls: [
        'https://i.postimg.cc/x1HzsXRS/Hielera.webp'
      ],
      category: 'Accesorios',
      popularity: 65,
      dateAdded: '2024-01-06'
    },
    {
      id: 'rw_007',
      name: 'Parlante Bluetooth',
      description: 'Que el grito de gol se escuche en toda la casa.\nEsta frase es oro para volumen de puntos.',
      pointsPareto: 78,
      pointsNormal: 39,
      imageUrls: [
        'https://placehold.co/600x400/F37121/FFFFFF?text=Parlante+BT'
      ],
      category: 'Tecnología',
      popularity: 80,
      dateAdded: '2024-01-07'
    },
    {
      id: 'rw_008',
      name: 'Barra de sonido',
      description: 'Cada jugada, cada emoción, como si estuvieras al borde de la cancha.\nEleva la experiencia del partido.',
      pointsPareto: 217,
      pointsNormal: 108,
      imageUrls: [
        'https://i.postimg.cc/tCDb516f/Barra-de-sonido-1.webp',
        'https://i.postimg.cc/c4TWmK3z/Barra-de-sonido-2.webp',
        'https://i.postimg.cc/ncTxksmd/Barra-de-sonido-3.webp',
        'https://i.postimg.cc/J4K8qyX6/Barra-de-sonido-4.webp'
      ],
      category: 'Tecnología',
      popularity: 85,
      dateAdded: '2024-01-08'
    },
    {
      id: 'rw_009',
      name: 'Televisor 43"',
      description: 'Vive cada partido como si estuvieras en la tribuna.\nPerfecta, directa y poderosa.',
      pointsPareto: 1000,
      pointsNormal: 500,
      imageUrls: [
        'https://i.postimg.cc/BQ7yb2Dh/Tv-43-1.jpg',
        'https://i.postimg.cc/pXc7rK86/Tv-43-2.webp',
        'https://i.postimg.cc/pXc7rK8S/Tv-43-3.webp',
        'https://i.postimg.cc/jd392yNk/Tv-43-4.webp'
      ],
      category: 'Tecnología',
      popularity: 90,
      dateAdded: '2024-01-09'
    },
    {
      id: 'rw_010',
      name: 'Televisor 55” – Gran premio',
      description: 'El Mundial no se mira… se vive en grande.\nFrase estrella, muy aspiracional.',
      pointsPareto: 1667,
      pointsNormal: 833,
      imageUrls: [
        'https://i.postimg.cc/CxfvKXwH/tv-55-1.webp',
        'https://i.postimg.cc/mgFdrJT3/tv-55-2.webp',
        'https://i.postimg.cc/Z5yfq2Jr/tv-55-3.webp',
        'https://i.postimg.cc/jSJ8jmRP/tv-55-4.webp'
      ],
      category: 'Tecnología',
      popularity: 100,
      dateAdded: '2024-01-10'
    },
    {
      id: 'rw_011',
      name: 'Camiseta Gulf MCO',
      description: 'Camiseta negra de algodón premium con diseño icónico de Gulf. Combina la herencia del motociclismo con la comodidad que necesitas para apoyar a tu equipo en este Mundial',
      pointsPareto: 444,
      pointsNormal: 222,
      imageUrls: [
        'https://placehold.co/600x400/003594/FFFFFF?text=Camiseta+Gulf+MCO'
      ],
      category: 'Ropa',
      popularity: 88,
      dateAdded: '2024-01-11'
    }
];

const updates = `Camiseta Gulf MCO;;https://i.postimg.cc/wB7Pv76d/Camiste_moto_Model.png;320;160;Actualizar;
Camiseta Gulf PCMO;;https://i.postimg.cc/tgYfTY9K/Camiste_Carro_Model.png;147;73;Agregar;
Gorra / Vaso cervecero ;;https://i.postimg.cc/DzwhcvnQ/Gorra_Cerrada_gulf_prolub.png;463;231;Actualizar;
Parlante Bluetooth;;https://i.postimg.cc/MZPW3jvZ/Parlante.png;349;175;Actualizar;
Licuadora 6 Velocidades;;https://i.postimg.cc/t4wbb0K4/Gemini_Generated_Image_7q90b27q90b27q90.png' };213;107;Agregar;
Picatodo Negro;;https://i.postimg.cc/qMS8yH1v/Gemini_Generated_Image_fn5hqtfn5hqtfn5h.png' };533;267;Agregar;
Freidora de aire 4 Litros;;https://i.postimg.cc/wMJBmtpj/FREIDORA_AIRE.png' };133;66;Agregar;
Cafetera Eléctrica 12 Tazas He7031a Negro;;https://i.postimg.cc/HLMgsZmk/Gemini_Generated_Image_ps3dg1ps3dg1ps3d.png' };107;53;Agregar;
Olla Arrocera 1;;https://i.postimg.cc/BQkxHfm4/Gemini_Generated_Image_kx16k9kx16k9kx16_(1).png' };295;147;Agregar;
Olla Eléctrica Multifunción;;https://i.postimg.cc/WzX9LHN7/Gemini_Generated_Image_vikqelvikqelvikq.png' };492;246;Agregar;
Sanduchera Panini;;https://i.postimg.cc/wjNDk4rM/Gemini_Generated_Image_dgqorzdgqorzdgqo.png' };332;166;Agregar;
Sanduchera Eléctrica 2 Puestos;;https://i.postimg.cc/GmDvjgfY/Gemini_Generated_Image_rdwum1rdwum1rdwu_(1).png' };267;133;Agregar;
Horno Electrico;;https://i.postimg.cc/jj01vsVJ/Gemini_Generated_Image_l69j03l69j03l69j.png' };244;122;Agregar;
Horno Microondas de Mesa;;https://i.postimg.cc/PJJy4jqW/HORNO_MICROHONDAS_25LT.png' };147;73;Agregar;
Ventilador De Piso;;https://i.postimg.cc/8CvSPKGJ/Gemini_Generated_Image_yzmjqayzmjqayzmj.png' };147;73;Agregar;
Ventilador 3 en 1;;https://i.postimg.cc/fbnP5w4b/Gemini_Generated_Image_plm36cplm36cplm3.png' };1733;867;Agregar;
Plancha Para Ropa vertical;;https://i.postimg.cc/MG2LtWkR/Gemini_Generated_Image_h03fi0h03fi0h03f.png' };2133;1067;Agregar;
Plancha De Vapor Ligera;;https://i.postimg.cc/SN3WCbgQ/Gemini_Generated_Image_11h0pr11h0pr11h0.png' };2533;1267;Agregar;
Wafflera;;https://i.postimg.cc/Qxwp1Zfx/Gemini_Generated_Image_9c59889c59889c59.png' };3873;1937;Agregar;
Nevera Convencional 211 Litros Brutos;;https://i.postimg.cc/fWKq9Jx1/Gemini_Generated_Image_8ptxku8ptxku8ptx.png' };2444;1222;Agregar;
Nevera No Frost 249 L;;https://i.postimg.cc/kMcYbBxY/Gemini_Generated_Image_6jmybw6jmybw6jmy.png' };944;472;Agregar;
Nevera No Frost 389 L;;https://i.postimg.cc/sgskYBrH/NEVERA_NO_FROST_389_L.png' };1111;556;Agregar;
Lavadora Carga Superior 15 kg;;https://i.postimg.cc/4yN55Q64/Gemini_Generated_Image_oabxktoabxktoabx.png' };133;67;Agregar;
Lavadora Carga Superior 11 kg (24lb);;https://i.postimg.cc/SQr1MJWt/Gemini_Generated_Image_hpdidehpdidehpdi.png' };267;133;Agregar;
Sofá cama;;https://i.postimg.cc/2SBCyqwN/Captura-de-pantalla-2026-03-06-144427.jpg' };2132;1066;Agregar;
Juego de comedor 6 puestos;;https://i.postimg.cc/2j1SPKg0/comedor_6_puestos.png' };949;475;Agregar;
Juego de vajilla 4 puestos;;https://i.postimg.cc/ZKPBH1rs/Vajilla_4_puestos.png' };2000;1000;Agregar;
Batería de ollas;;https://i.postimg.cc/h4XtH5Nz/BATERIA_DE_OLLAS.png' };2667;1333;Agregar;
Reloj Garmin Vivoactive 5 Marfil;;https://i.postimg.cc/CL4PRTHs/Garmin_vivoactive_5.png' };3467;1733;Agregar;
Televisor Challenger 32” LED;;https://i.postimg.cc/zvv7jrf0/TELEVISOR_SAMSUNG_50_LED_UHD.png' };4444;2222;Agregar;
Televisor 40” LED UHD 4K;;https://i.postimg.cc/76mX06qt/FREIDOREA_6L_DIGITAL_OSTER.png' };1507;753;Agregar;
Televisor 43” LED UHD 4K;;https://i.postimg.cc/2SrsQqDM/TELEVISOR_SAMSUNG_65_LED_UHD_4K.png' };378;189;Agregar;
Televisor 50” LED UHD 4K;;https://i.postimg.cc/2SrsQqDM/TELEVISOR_SAMSUNG_65_LED_UHD_4K.png' };1107;553;Agregar;
Televisor 65” LED UHD 4K;;https://i.postimg.cc/2SrsQqDM/TELEVISOR_SAMSUNG_65_LED_UHD_4K.png' };133;67;Agregar;
Barra de sonido;;https://i.postimg.cc/Wb7WdL6Z/Barra_de_sonido_500.png' };133;67;Agregar;
Parlante Clip 5 JBL;;https://i.postimg.cc/fR0zwyZK/parlante_JBL.png' };377;188;Agregar;
Parlante K-SPK300D Negro;;https://i.postimg.cc/Dwbv20nk/Parlante_torre.png' };389;194;Agregar;
Audífonos Deportivos Inalámbricos Bluetooth 5.3;;https://i.postimg.cc/ZRksrQKK/Captura-de-pantalla-2026-02-19-205312.png' };400;200;Agregar;
Audífonos Diadema Bluetooth con SD y Radio;;https://i.postimg.cc/MTR4NSrD/Gemini_Generated_Image_b7pr7wb7pr7wb7pr.png' };980;490;Agregar;
Audífonos de diadema JBL Bluetooth;;https://i.postimg.cc/7ZpL77mb/audifonos_bluetooh.png' };3667;1833;Agregar;
Mini Proyector WiFi y Bluetooth - Resolución nativa 1080P;;https://i.postimg.cc/kMLg9ydj/VIDEO_PROYECTOR.png' };3222;1611;Agregar;
Amazon Alexa;;https://i.postimg.cc/g082KJTX/Alexa_bluetooh.png' };2199;1099;Agregar;
Aspiradora Robot;;https://i.postimg.cc/ZRVjpRJF/APIRADORA_ROBOTSMART_ESTACIÓN_TP_LINK_TAPO_RV_20_MAX_PLUS.png' };2133;1067;Agregar;
Patineta eléctrica Xiaomi Scooter 5 Max;;https://i.postimg.cc/5Ndg6WXq/Captura-de-pantalla-2026-02-23-080440.png' };1333;667;Agregar;
Bicicleta Eléctrica 35kmh;;https://i.postimg.cc/CMRxWQ9n/BICICLETA_ELECTRICA_PINGUI.png' };1200;600;Agregar;
Portátil HP 14”;;https://i.postimg.cc/ZKL7WtFp/computador_inter_14.png' };1667;833;Agregar;
Tablet SAMSUNG;;https://i.postimg.cc/J43Dx9b6/table_samsung.png' };4000;2000;Agregar;
Tablet Lenovo;;https://i.postimg.cc/jjDvDHbY/Captura-de-pantalla-2026-02-23-083618.png' };5067;2533;Agregar;
Samsung Galaxy A16 · 256 GB · 8 GB RAM;; https://i.postimg.cc/90jQRHrP/a16.png };1333;667;Agregar;
Samsung Galaxy A36 · 256 GB · 8 GB RAM;; https://i.postimg.cc/ydRN88Yn/a36.png;1333;667;Agregar;
iPhone 13 · 128 GB;; https://i.postimg.cc/rz6dGZQ5/iphone_13.png;1444;722;Agregar;
iPhone 15 · 128 GB;;https://i.postimg.cc/CdyZCrmD/iphone_15.png;667;333;Agregar;
Celular SAMSUNG Galaxy A17 256 GB 8 GB RAM Azul;; https://i.postimg.cc/Y9FSCCqX/a17.png;267;133;Agregar;
Celular MOTOROLA G55;;https://i.postimg.cc/qqdvhHz8/g55.png;213;107;Agregar;
Celular MOTOROLA G56 5G 256 GB 8 GB RAM Azul Marino;;https://i.postimg.cc/K4XK7pJB/g56.png;533;267;Agregar;
Ahumador y Asador de Barril Mediano 20 Lbs;; https://i.postimg.cc/vZTNpPzv/Captura-de-pantalla-2026-02-23-120541.png;333;167;Agregar;`;

let newRewards = [...existingRewards];
let nextId = 12;

const lines = updates.split('\n').filter(l => l.trim() !== '');
for (const line of lines) {
    const parts = line.split(';');
    if (parts.length < 6) continue;
    
    const name = parts[0].trim();
    const desc = parts[1].trim();
    let url = parts[2].trim();
    // Clean up url if it has trailing ' };
    url = url.replace(/' \};$/, '');
    url = url.replace(/ \};$/, '');
    const pareto = parseInt(parts[3].trim());
    const normal = parseInt(parts[4].trim());
    const action = parts[5].trim();
    
    if (action === 'Actualizar') {
        const existing = newRewards.find(r => r.name.trim().toLowerCase() === name.toLowerCase());
        if (existing) {
            existing.imageUrls = [url];
            existing.pointsPareto = pareto;
            existing.pointsNormal = normal;
            if (desc) existing.description = desc;
        } else {
            console.log("Could not find to update:", name);
        }
    } else if (action === 'Agregar') {
        let category = 'General';
        if (name.toLowerCase().includes('tv') || name.toLowerCase().includes('televisor') || name.toLowerCase().includes('parlante') || name.toLowerCase().includes('audífonos') || name.toLowerCase().includes('celular') || name.toLowerCase().includes('tablet') || name.toLowerCase().includes('portátil') || name.toLowerCase().includes('iphone') || name.toLowerCase().includes('samsung') || name.toLowerCase().includes('motorola') || name.toLowerCase().includes('proyector') || name.toLowerCase().includes('alexa') || name.toLowerCase().includes('reloj') || name.toLowerCase().includes('barra')) {
            category = 'Tecnología';
        } else if (name.toLowerCase().includes('nevera') || name.toLowerCase().includes('lavadora') || name.toLowerCase().includes('licuadora') || name.toLowerCase().includes('freidora') || name.toLowerCase().includes('cafetera') || name.toLowerCase().includes('olla') || name.toLowerCase().includes('sanduchera') || name.toLowerCase().includes('horno') || name.toLowerCase().includes('ventilador') || name.toLowerCase().includes('plancha') || name.toLowerCase().includes('wafflera') || name.toLowerCase().includes('aspiradora') || name.toLowerCase().includes('picatodo')) {
            category = 'Electrodomésticos';
        } else if (name.toLowerCase().includes('sofá') || name.toLowerCase().includes('comedor') || name.toLowerCase().includes('vajilla') || name.toLowerCase().includes('batería') || name.toLowerCase().includes('ahumador')) {
            category = 'Hogar';
        } else if (name.toLowerCase().includes('patineta') || name.toLowerCase().includes('bicicleta')) {
            category = 'Deportes';
        } else if (name.toLowerCase().includes('camiseta') || name.toLowerCase().includes('gorra')) {
            category = 'Ropa';
        }
        
        newRewards.push({
            id: 'rw_' + String(nextId++).padStart(3, '0'),
            name: name,
            description: desc || name,
            pointsPareto: pareto,
            pointsNormal: normal,
            imageUrls: [url],
            category: category,
            popularity: Math.floor(Math.random() * 40) + 50,
            dateAdded: new Date().toISOString().split('T')[0]
        });
    }
}

fs.writeFileSync('new_rewards.json', JSON.stringify(newRewards, null, 2));
console.log('Done');
