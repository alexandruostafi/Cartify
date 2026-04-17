const bcrypt         = require('bcrypt');
const { initDb, run, get } = require('./db');

async function seed() {
  await initDb();
  console.log('🌱 Seeding database...');

  // Clear existing data to avoid duplicates on re-seed
  run('DELETE FROM order_items');
  run('DELETE FROM orders');
  run('DELETE FROM cart');
  run('DELETE FROM products');
  run('DELETE FROM categories');
  run('DELETE FROM users');

  // Categories – Warhammer 40K factions & product types
  const categories = [
    'Space Marines',
    'Chaos Space Marines',
    'Aeldari',
    'Orks',
    'Necrons',
    'Tyranids',
    'T\'au Empire',
    'Adeptus Mechanicus',
    'Paints & Tools',
    'Terrain & Scenery'
  ];
  for (const name of categories) {
    try { run('INSERT INTO categories (name) VALUES (?)', [name]); } catch (_) {}
  }

  const getCat = name => get('SELECT id FROM categories WHERE name = ?', [name]).id;

  // Admin user
  const adminPwd = await bcrypt.hash('admin123', 10);
  try {
    run("INSERT INTO users (name, email, password, role) VALUES ('Fabricator General', 'admin@warforge.com', ?, 'admin')", [adminPwd]);
  } catch (_) {}

  // Sample customer
  const customerPwd = await bcrypt.hash('customer123', 10);
  try {
    run("INSERT INTO users (name, email, password, role) VALUES ('Brother Cassius', 'cassius@example.com', ?, 'customer')", [customerPwd]);
  } catch (_) {}

  // Products – Warhammer 40K miniatures
  const products = [
    {
      name: 'Primaris Intercessors Squad',
      description: 'A box of 10 multipart plastic Primaris Intercessors. Armed with bolt rifles, they form the core battleline of any Space Marine army. Includes multiple weapon and head options.',
      price: 52.00, stock: 40,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120101309_SMPrimarisIntercessorsStock.jpg?fm=webp&w=892&h=920',
      category: 'Space Marines'
    },
    {
      name: 'Ultramarines Captain in Gravis Armour',
      description: 'A finely detailed single-model kit of a Space Marine Captain clad in heavy Gravis armour. Comes with a master-crafted power sword and boltstorm gauntlet. Ideal centrepiece HQ choice.',
      price: 35.00, stock: 25,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99070101077_SMCPTGravisArmourStock.jpg?fm=webp&w=892&h=920',
      category: 'Space Marines'
    },
    {
      name: 'Redemptor Dreadnought',
      description: 'A towering Primaris Dreadnought armed with a macro plasma incinerator or heavy onslaught gatling cannon. Highly poseable multipart plastic kit with incredible detail.',
      price: 65.00, stock: 18,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120101310_SMPrimarisRedemptorDreadnoughtStock.jpg?fm=webp&w=892&h=920',
      category: 'Space Marines'
    },
    {
      name: 'Chaos Terminators',
      description: 'Box of 5 Chaos Terminators in baroque, corrupted power armour. Loaded with weapon options including combi-bolters, power fists, chain axes, and a reaper autocannon.',
      price: 48.00, stock: 30,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120102171_CSMTerminatorSquadStock.jpg?fm=webp&w=1200&h=1237',
      category: 'Chaos Space Marines'
    },
    {
      name: 'Abaddon the Despoiler',
      description: 'The Warmaster of Chaos in all his dark glory. This stunning centrepiece model towers over other infantry. Armed with the daemon sword Drach\'nyen and the Talon of Horus.',
      price: 55.00, stock: 12,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120102175_AbaddonDespoilerUpdateStock.jpg?fm=webp&w=892&h=920',
      category: 'Chaos Space Marines'
    },
    {
      name: 'Wraithguard',
      description: 'Box of 5 Aeldari Wraithguard, towering ghost warriors that can be built with devastating wraithcannons or D-scythes. Elegant and deadly multipart plastic kit.',
      price: 42.50, stock: 22,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120104083_WaithguardStock.jpg?fm=webp&w=892&h=920',
      category: 'Aeldari'
    },
    {
      name: 'Ork Boyz Mob',
      description: 'A rowdy mob of 20 Ork Boyz ready for a proper WAAAGH! Includes choppas, sluggas, shootas, and options for a Nob leader with power klaw. The backbone of any Ork horde.',
      price: 40.00, stock: 50,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99122709002_OGTOrcBoyzMob06.jpg?fm=webp&w=892&h=920',
      category: 'Orks'
    },
    {
      name: 'Necron Warriors + Scarabs',
      description: 'Box of 10 Necron Warriors armed with gauss flayers or gauss reapers. The relentless core of any Necron dynasty.',
      price: 38.00, stock: 35,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120110052_NecronWarriorsStock.jpg?fm=webp&w=892&h=920',
      category: 'Necrons'
    },
    {
      name: 'Tyranid Hive Tyrant',
      description: 'A monstrous synapse creature that can be built as a walking Hive Tyrant or a winged Flyrant. Includes heavy venom cannon, stranglethorn cannon, and monstrous bonesword options.',
      price: 55.00, stock: 15,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120106060_HiveTyrantStock.jpg?fm=webp&w=892&h=920',
      category: 'Tyranids'
    },
    {
      name: 'T\'au Crisis Battlesuit Team',
      description: 'Box of 3 XV8 Crisis Battlesuits with a huge range of weapon systems including burst cannons, plasma rifles, fusion blasters, missile pods, and shield generators.',
      price: 60.00, stock: 20,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120113072_TAUCrisisBattlesuitStock.jpg?fm=webp&w=892&h=920',
      category: 'T\'au Empire'
    },
    {
      name: 'Skitarii Rangers',
      description: 'Skitarii Rangers, featuring cowls and gasmasks, stalk their prey with galvanic rifles. Each trooper is sealed in heavy, industrialised Skitarii warplate, emblazoned with the symbol of the Adeptus Mechanicus, bristling with data-collecting sensors, antennae and environmental monitors.',
      price: 40.00, stock: 28,
      image_url: 'https://m.media-amazon.com/images/I/61RLIOCU-vL._AC_SX679_.jpg',
      category: 'Adeptus Mechanicus'
    },
    {
      name: 'Warhammer 40,000: Paints + Tools Set',
      description: 'You’ll find 13 different Citadel Colour paints in 12ml pots, featuring the essential colours needed to paint your first models – they\'re particularly suited to Space Marines of the Ultramarines Chapter and Tyranids of Hive Fleet Leviathan.',
      price: 33.50, stock: 60,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/52170199001_WH40KPaintAndToolSet07.jpg?fm=webp&w=892&h=920',
      category: 'Paints & Tools'
    },
    {
      name: 'Citadel Mouldline Remover',
      description: 'A precision tool designed to cleanly remove mouldlines from plastic, resin, and metal miniatures without damaging fine detail. An essential hobby tool.',
      price: 18.00, stock: 75,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99239999116_MouldlineRemoverStock.jpg?fm=webp&w=892&h=920',
      category: 'Paints & Tools'
    },
    {
      name: 'Aegis Defence Line',
      description: 'A modular fortification terrain kit featuring barricade walls and a quad-gun emplacement. Gives your battlefield an Imperial strongpoint. Compatible with standard 28mm bases.',
      price: 32.50, stock: 20,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120105108_AMAegisDefencelineStock.jpg?fm=webp&w=892&h=920',
      category: 'Terrain & Scenery'
    },
    {
      name: 'Battlezone: Fronteris — Vox-Antenna & Auspex Shrine',
      description: 'Build an immersive battlefield and wage war on a hotly contested frontier world with terrain pieces representing rugged Imperial structures – such as a Vox-Antenna and Auspex Shrine.',
      price: 95.00, stock: 10,
      image_url: 'https://www.warhammer.com/app/resources/catalog/product/920x950/99120199095_BZFVoxAntennaandAuspexShrineStock.jpg?fm=webp&w=892&h=920',
      category: 'Terrain & Scenery'
    },
  ];

  const insertProduct = (p) => {
    try {
      run(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.stock, p.image_url, getCat(p.category)]
      );
    } catch (_) {}
  };

  for (const p of products) {
    insertProduct(p);
  }

  console.log('✅ Seeding complete!');
  console.log('   Admin login  → admin@warforge.com / admin123');
  console.log('   Customer     → cassius@example.com / customer123');
}

seed().catch(console.error);
