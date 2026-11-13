export interface BarangayInfo {
  name: string;
  elevationMeters: number;
  terrainType: 'Highland Ridge' | 'River Valley' | 'Alluvial Plain' | 'Mountain Foothill';
  primaryCrops: string[];
}

export interface MunicipalityBarangayData {
  municipality: string;
  elevation: string;
  primaryZone: string;
  pagasaStation: string;
  barangays: BarangayInfo[];
}

export const NUEVA_VIZCAYA_BARANGAYS: Record<string, MunicipalityBarangayData> = {
  Bambang: {
    municipality: 'Bambang',
    elevation: '310m - 520m',
    primaryZone: 'Agri-Trading & Vegetable Hub (NVAT)',
    pagasaStation: 'DOST-PAGASA NV Agro-Met Station, Bambang',
    barangays: [
      { name: 'Poblacion', elevationMeters: 320, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Tomatoes', 'Eggplant'] },
      { name: 'Aliaga', elevationMeters: 310, terrainType: 'River Valley', primaryCrops: ['Yellow Corn', 'Watermelon', 'Ampalaya'] },
      { name: 'Almaguer North', elevationMeters: 330, terrainType: 'Alluvial Plain', primaryCrops: ['Lowland Vegetables', 'Cabbage'] },
      { name: 'Almaguer South', elevationMeters: 340, terrainType: 'Alluvial Plain', primaryCrops: ['String Beans', 'Squash', 'Okra'] },
      { name: 'Banggot', elevationMeters: 325, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Bell Pepper'] },
      { name: 'Buag', elevationMeters: 360, terrainType: 'Mountain Foothill', primaryCrops: ['Carrots', 'Baguio Beans', 'Corn'] },
      { name: 'Calaocan', elevationMeters: 315, terrainType: 'River Valley', primaryCrops: ['Leafy Greens', 'Rice'] },
      { name: 'Homestead', elevationMeters: 380, terrainType: 'Mountain Foothill', primaryCrops: ['Root Crops', 'Sweet Potato'] },
      { name: 'Macate', elevationMeters: 410, terrainType: 'Mountain Foothill', primaryCrops: ['Ginger', 'Turmeric', 'Cassava'] },
      { name: 'San Antonio North', elevationMeters: 315, terrainType: 'River Valley', primaryCrops: ['Chili', 'Tomatoes', 'Corn'] },
      { name: 'San Antonio South', elevationMeters: 318, terrainType: 'River Valley', primaryCrops: ['Rice', 'Onions'] },
      { name: 'San Fernando', elevationMeters: 350, terrainType: 'Alluvial Plain', primaryCrops: ['Cabbage', 'Cauliflower'] },
      { name: 'Santo Domingo', elevationMeters: 330, terrainType: 'River Valley', primaryCrops: ['Cucumber', 'Squash'] }
    ]
  },
  Bayombong: {
    municipality: 'Bayombong',
    elevation: '280m - 490m',
    primaryZone: 'Provincial Capital & Research Valley',
    pagasaStation: 'DOST-PAGASA Synoptic Station, Bayombong Airport Radar',
    barangays: [
      { name: 'District IV (Poblacion)', elevationMeters: 290, terrainType: 'River Valley', primaryCrops: ['Urban Organics', 'Microgreens'] },
      { name: 'Bonfal East', elevationMeters: 285, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Corn', 'Ampalaya'] },
      { name: 'Bonfal West', elevationMeters: 280, terrainType: 'Alluvial Plain', primaryCrops: ['Vegetables', 'Sweet Corn'] },
      { name: 'Bonfal Proper', elevationMeters: 285, terrainType: 'River Valley', primaryCrops: ['Rice', 'Watermelon'] },
      { name: 'Busilac', elevationMeters: 360, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Banana', 'Coffee'] },
      { name: 'Casat', elevationMeters: 320, terrainType: 'Alluvial Plain', primaryCrops: ['Tomatoes', 'String Beans'] },
      { name: 'La Torre North', elevationMeters: 300, terrainType: 'River Valley', primaryCrops: ['Squash', 'Lowland Veggies'] },
      { name: 'La Torre South', elevationMeters: 305, terrainType: 'River Valley', primaryCrops: ['Eggplant', 'Chili Pepper'] },
      { name: 'Masoc', elevationMeters: 340, terrainType: 'Mountain Foothill', primaryCrops: ['Ginger', 'Root Crops'] },
      { name: 'Paitan', elevationMeters: 310, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Petchay', 'Mustasa'] },
      { name: 'Salvacion', elevationMeters: 380, terrainType: 'Mountain Foothill', primaryCrops: ['Coffee Robusta', 'Citrus'] },
      { name: 'Vista Alegre', elevationMeters: 420, terrainType: 'Mountain Foothill', primaryCrops: ['Highland Greens', 'Fruit Trees'] }
    ]
  },
  Solano: {
    municipality: 'Solano',
    elevation: '270m - 340m',
    primaryZone: 'Commercial & Cold Storage Gateway',
    pagasaStation: 'DOST-PAGASA NV Agrometeorological Satellite Center',
    barangays: [
      { name: 'Poblacion South', elevationMeters: 275, terrainType: 'Alluvial Plain', primaryCrops: ['Hydroponics', 'Specialty Veggies'] },
      { name: 'Poblacion North', elevationMeters: 275, terrainType: 'Alluvial Plain', primaryCrops: ['Commercial Produce'] },
      { name: 'Aggub', elevationMeters: 280, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Corn'] },
      { name: 'Bangaan', elevationMeters: 290, terrainType: 'River Valley', primaryCrops: ['Squash', 'Ampalaya', 'Okra'] },
      { name: 'Bascaran', elevationMeters: 285, terrainType: 'River Valley', primaryCrops: ['Paddy Rice', 'String Beans'] },
      { name: 'Concepcion', elevationMeters: 280, terrainType: 'Alluvial Plain', primaryCrops: ['Corn', 'Eggplant'] },
      { name: 'Curifang', elevationMeters: 295, terrainType: 'Mountain Foothill', primaryCrops: ['Cassava', 'Banana', 'Sweet Potato'] },
      { name: 'Dadap', elevationMeters: 285, terrainType: 'Alluvial Plain', primaryCrops: ['Tomatoes', 'Green Onions'] },
      { name: 'Lactawan', elevationMeters: 290, terrainType: 'River Valley', primaryCrops: ['Rice', 'Water Spinach'] },
      { name: 'Osmeña', elevationMeters: 280, terrainType: 'Alluvial Plain', primaryCrops: ['Lowland Greens', 'Chili'] },
      { name: 'Roxas', elevationMeters: 282, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Corn'] },
      { name: 'Tucal', elevationMeters: 310, terrainType: 'Mountain Foothill', primaryCrops: ['Papaya', 'Legumes'] }
    ]
  },
  Kayapa: {
    municipality: 'Kayapa',
    elevation: '1100m - 1950m',
    primaryZone: 'Highland Temperate Vegetable Capital',
    pagasaStation: 'DOST-PAGASA Cordillera/Caraballo Radar Link',
    barangays: [
      { name: 'Poblacion', elevationMeters: 1250, terrainType: 'Highland Ridge', primaryCrops: ['Wongbok Cabbage', 'Carrots', 'Potatoes'] },
      { name: 'Pingkian', elevationMeters: 1350, terrainType: 'Highland Ridge', primaryCrops: ['Red Cabbage', 'Iceberg Lettuce', 'Celery'] },
      { name: 'Balangabang', elevationMeters: 1480, terrainType: 'Highland Ridge', primaryCrops: ['Broccoli', 'Cauliflower', 'Sweet Peas'] },
      { name: 'Babadi', elevationMeters: 1180, terrainType: 'Mountain Foothill', primaryCrops: ['Baguio Beans', 'Bell Pepper'] },
      { name: 'Bessang', elevationMeters: 1600, terrainType: 'Highland Ridge', primaryCrops: ['Japanese Radish', 'Zucchini', 'Parsley'] },
      { name: 'Cabayo', elevationMeters: 1420, terrainType: 'Highland Ridge', primaryCrops: ['Carrots', 'Chinese Greens'] },
      { name: 'Castillo', elevationMeters: 1300, terrainType: 'Mountain Foothill', primaryCrops: ['Sayote', 'Ginger', 'Highland Corn'] },
      { name: 'Latupan', elevationMeters: 1510, terrainType: 'Highland Ridge', primaryCrops: ['Iceberg Lettuce', 'Strawberry'] },
      { name: 'Pangawan', elevationMeters: 1220, terrainType: 'Mountain Foothill', primaryCrops: ['Sayote', 'Yacon', 'Sweet Potato'] },
      { name: 'Talicat', elevationMeters: 1380, terrainType: 'Highland Ridge', primaryCrops: ['Leeks', 'Scallions', 'Wongbok'] },
      { name: 'Tupaya', elevationMeters: 1450, terrainType: 'Highland Ridge', primaryCrops: ['Broccoli', 'Snow Peas'] }
    ]
  },
  Kasibu: {
    municipality: 'Kasibu',
    elevation: '680m - 1350m',
    primaryZone: 'Citrus & Tropical Highland Valley (Malabing Valley)',
    pagasaStation: 'DOST-PAGASA Agromet Satellite Station, Kasibu',
    barangays: [
      { name: 'Poblacion', elevationMeters: 780, terrainType: 'Mountain Foothill', primaryCrops: ['Satsuma Mandarin', 'Ponkan', 'Ginger'] },
      { name: 'Malabing', elevationMeters: 850, terrainType: 'Mountain Foothill', primaryCrops: ['Malabing Citrus', 'Valencia Orange', 'Pomelo'] },
      { name: 'Watwat', elevationMeters: 920, terrainType: 'Mountain Foothill', primaryCrops: ['Honey Orange', 'Calamansi', 'Robusta Coffee'] },
      { name: 'Didipio', elevationMeters: 740, terrainType: 'River Valley', primaryCrops: ['Arabica Coffee', 'Banana', 'Root Crops'] },
      { name: 'Alimit', elevationMeters: 810, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Ginger', 'Pineapple'] },
      { name: 'Capisaan', elevationMeters: 890, terrainType: 'Mountain Foothill', primaryCrops: ['Cave Mushroom', 'Citrus', 'Honey'] },
      { name: 'Bua', elevationMeters: 730, terrainType: 'River Valley', primaryCrops: ['Upland Rice', 'Corn', 'String Beans'] },
      { name: 'Antutot', elevationMeters: 820, terrainType: 'Mountain Foothill', primaryCrops: ['Ponkan', 'Red Lady Papaya'] },
      { name: 'Lupa', elevationMeters: 860, terrainType: 'Mountain Foothill', primaryCrops: ['Mandarin Oranges', 'Avocado'] },
      { name: 'Nantauan', elevationMeters: 790, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Root Crops'] }
    ]
  },
  Aritao: {
    municipality: 'Aritao',
    elevation: '340m - 620m',
    primaryZone: 'Onion, Rice & Highway Agri Corridor',
    pagasaStation: 'DOST-PAGASA Southern NV Weather Sensor Network',
    barangays: [
      { name: 'Poblacion', elevationMeters: 350, terrainType: 'Alluvial Plain', primaryCrops: ['Red Onion', 'White Onion', 'Garlic'] },
      { name: 'Banganan', elevationMeters: 360, terrainType: 'River Valley', primaryCrops: ['Red Creole Onion', 'Shallots'] },
      { name: 'Betinas', elevationMeters: 375, terrainType: 'River Valley', primaryCrops: ['Rice', 'Sweet Corn'] },
      { name: 'Bone North', elevationMeters: 410, terrainType: 'Mountain Foothill', primaryCrops: ['Lowland Vegetables', 'Eggplant'] },
      { name: 'Bone South', elevationMeters: 420, terrainType: 'Mountain Foothill', primaryCrops: ['Tomatoes', 'Bell Pepper'] },
      { name: 'Darapidap', elevationMeters: 345, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Watermelon'] },
      { name: 'Kirang', elevationMeters: 390, terrainType: 'River Valley', primaryCrops: ['Red Onions', 'Corn', 'Tobacco'] },
      { name: 'Nagcuartelan', elevationMeters: 380, terrainType: 'Alluvial Plain', primaryCrops: ['Ginger', 'String Beans'] },
      { name: 'Oway-an', elevationMeters: 480, terrainType: 'Mountain Foothill', primaryCrops: ['Root Crops', 'Bananas'] }
    ]
  },
  Bagabag: {
    municipality: 'Bagabag',
    elevation: '240m - 380m',
    primaryZone: 'Pineapple & Northern Transit Plain',
    pagasaStation: 'DOST-PAGASA Bagabag Airport Synoptic Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 250, terrainType: 'Alluvial Plain', primaryCrops: ['Pineapple', 'Rice'] },
      { name: 'Bakir', elevationMeters: 260, terrainType: 'River Valley', primaryCrops: ['Smooth Cayenne Pineapple', 'Corn'] },
      { name: 'Baretbet', elevationMeters: 270, terrainType: 'Alluvial Plain', primaryCrops: ['Sweet Pineapple', 'Watermelon'] },
      { name: 'Careb', elevationMeters: 255, terrainType: 'River Valley', primaryCrops: ['Paddy Rice', 'Tilapia/Freshwater'] },
      { name: 'Lantap', elevationMeters: 280, terrainType: 'Alluvial Plain', primaryCrops: ['Pineapple', 'Sweet Potato'] },
      { name: 'Paniki', elevationMeters: 290, terrainType: 'Mountain Foothill', primaryCrops: ['Cassava', 'Banana'] },
      { name: 'San Geronimo', elevationMeters: 245, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Ampalaya'] },
      { name: 'San Pedro', elevationMeters: 250, terrainType: 'Alluvial Plain', primaryCrops: ['Tomatoes', 'Eggplant'] },
      { name: 'Tuao', elevationMeters: 265, terrainType: 'River Valley', primaryCrops: ['Corn', 'Legumes'] }
    ]
  },
  DupaxDelSur: {
    municipality: 'Dupax del Sur',
    elevation: '380m - 1200m',
    primaryZone: 'Heritage Valley & High Ridge Agro-Forestry',
    pagasaStation: 'DOST-PAGASA Dupax Southern Sierra Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 410, terrainType: 'River Valley', primaryCrops: ['Organic Rice', 'Highland Corn'] },
      { name: 'Abaca', elevationMeters: 620, terrainType: 'Mountain Foothill', primaryCrops: ['Abaca Fiber', 'Arabica Coffee'] },
      { name: 'Banila', elevationMeters: 490, terrainType: 'River Valley', primaryCrops: ['Corn', 'Cassava'] },
      { name: 'Caranglan Border', elevationMeters: 750, terrainType: 'Highland Ridge', primaryCrops: ['Root Crops', 'Ginger'] },
      { name: 'Domang', elevationMeters: 580, terrainType: 'Mountain Foothill', primaryCrops: ['Coffee', 'Cacao', 'Banana'] },
      { name: 'Mangayang', elevationMeters: 670, terrainType: 'Mountain Foothill', primaryCrops: ['Sweet Potato', 'Taro'] },
      { name: 'Sanguit', elevationMeters: 850, terrainType: 'Highland Ridge', primaryCrops: ['Highland Vegetables', 'Cabbage'] }
    ]
  },
  DupaxDelNorte: {
    municipality: 'Dupax del Norte',
    elevation: '360m - 980m',
    primaryZone: 'Valley Farming & Citrus Extension',
    pagasaStation: 'DOST-PAGASA Dupax Sierra Radar Node',
    barangays: [
      { name: 'Malasin (Poblacion)', elevationMeters: 380, terrainType: 'River Valley', primaryCrops: ['Rice', 'Sweet Corn'] },
      { name: 'Binuangan', elevationMeters: 440, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Ginger'] },
      { name: 'Bulala', elevationMeters: 410, terrainType: 'River Valley', primaryCrops: ['Tomatoes', 'String Beans'] },
      { name: 'Inaban', elevationMeters: 490, terrainType: 'Mountain Foothill', primaryCrops: ['Coffee', 'Banana'] },
      { name: 'Lamo', elevationMeters: 390, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Ampalaya', 'Okra'] },
      { name: 'Mabasa', elevationMeters: 550, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Papaya'] },
      { name: 'New Gumiad', elevationMeters: 720, terrainType: 'Highland Ridge', primaryCrops: ['Highland Cabbage', 'Carrots'] },
      { name: 'Oyao', elevationMeters: 610, terrainType: 'Mountain Foothill', primaryCrops: ['Root Crops', 'Corn'] }
    ]
  },
  SantaFe: {
    municipality: 'Santa Fe',
    elevation: '620m - 1250m',
    primaryZone: 'Dalton Pass Gateway & Organic Forest Farm',
    pagasaStation: 'DOST-PAGASA Dalton Pass Highland Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 680, terrainType: 'Mountain Foothill', primaryCrops: ['Sayote', 'Broom Grass', 'Banana'] },
      { name: 'Bacneng', elevationMeters: 820, terrainType: 'Mountain Foothill', primaryCrops: ['Highland Corn', 'Ginger'] },
      { name: 'Balete', elevationMeters: 910, terrainType: 'Highland Ridge', primaryCrops: ['Mountain Tea', 'Coffee'] },
      { name: 'Baliling', elevationMeters: 780, terrainType: 'Mountain Foothill', primaryCrops: ['Sayote', 'Sweet Potato'] },
      { name: 'Imugan', elevationMeters: 1050, terrainType: 'Highland Ridge', primaryCrops: ['Wild Berry Jams', 'Organic Honey', 'Ginger Tea'] },
      { name: 'Tactac', elevationMeters: 720, terrainType: 'Mountain Foothill', primaryCrops: ['Banana Saba', 'Cassava'] },
      { name: 'Villaflores', elevationMeters: 640, terrainType: 'River Valley', primaryCrops: ['Upland Rice', 'Corn'] }
    ]
  },
  Villaverde: {
    municipality: 'Villaverde',
    elevation: '290m - 620m',
    primaryZone: 'Bintawan River Basin & Vegetable Fields',
    pagasaStation: 'DOST-PAGASA NV Agromet Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 310, terrainType: 'River Valley', primaryCrops: ['Rice', 'Eggplant', 'Tomatoes'] },
      { name: 'Bintawan North', elevationMeters: 330, terrainType: 'Alluvial Plain', primaryCrops: ['Yellow Corn', 'Bitter Gourd'] },
      { name: 'Bintawan South', elevationMeters: 325, terrainType: 'Alluvial Plain', primaryCrops: ['Watermelon', 'String Beans'] },
      { name: 'Cabuluan', elevationMeters: 360, terrainType: 'Mountain Foothill', primaryCrops: ['Banana', 'Cassava'] },
      { name: 'Ibong', elevationMeters: 315, terrainType: 'River Valley', primaryCrops: ['Rice', 'Chili Pepper'] },
      { name: 'Nagbitin', elevationMeters: 380, terrainType: 'Mountain Foothill', primaryCrops: ['Sweet Potato', 'Papaya'] },
      { name: 'Ocapon', elevationMeters: 450, terrainType: 'Mountain Foothill', primaryCrops: ['Ginger', 'Coffee'] }
    ]
  },
  Quezon: {
    municipality: 'Quezon',
    elevation: '320m - 750m',
    primaryZone: 'East Cordillera Valley & Citrus Fringe',
    pagasaStation: 'DOST-PAGASA Central NV Sensor',
    barangays: [
      { name: 'Poblacion', elevationMeters: 340, terrainType: 'River Valley', primaryCrops: ['Rice', 'Corn', 'Ampalaya'] },
      { name: 'Baresbes', elevationMeters: 380, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Banana'] },
      { name: 'Buliwao', elevationMeters: 360, terrainType: 'River Valley', primaryCrops: ['Yellow Corn', 'Sweet Corn'] },
      { name: 'Calaoagan', elevationMeters: 350, terrainType: 'Alluvial Plain', primaryCrops: ['Eggplant', 'Tomatoes'] },
      { name: 'Daramuangan', elevationMeters: 410, terrainType: 'Mountain Foothill', primaryCrops: ['Ginger', 'Cassava'] },
      { name: 'Maasin', elevationMeters: 490, terrainType: 'Mountain Foothill', primaryCrops: ['Coffee Robusta', 'Citrus'] },
      { name: 'Runruno', elevationMeters: 620, terrainType: 'Highland Ridge', primaryCrops: ['Highland Vegetables', 'Taro'] }
    ]
  },
  Ambaguio: {
    municipality: 'Ambaguio',
    elevation: '850m - 2100m',
    primaryZone: 'Mt. Pulag Foothills & High Altitude Coffee',
    pagasaStation: 'DOST-PAGASA High-Elevation Pulag Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 920, terrainType: 'Mountain Foothill', primaryCrops: ['Arabica High Altitude Coffee', 'Sayote'] },
      { name: 'Ammoweg', elevationMeters: 1100, terrainType: 'Highland Ridge', primaryCrops: ['Specialty Coffee', 'Ginger', 'Taro'] },
      { name: 'Camandag', elevationMeters: 1350, terrainType: 'Highland Ridge', primaryCrops: ['Baguio Cabbage', 'Carrots', 'Potatoes'] },
      { name: 'Dudan', elevationMeters: 1050, terrainType: 'Highland Ridge', primaryCrops: ['Arabica Coffee', 'Sayote'] },
      { name: 'Labau', elevationMeters: 1220, terrainType: 'Highland Ridge', primaryCrops: ['Sweet Peas', 'Leafy Greens'] },
      { name: 'Napuran', elevationMeters: 1480, terrainType: 'Highland Ridge', primaryCrops: ['Highland Broccoli', 'Strawberries'] },
      { name: 'Salingsingan', elevationMeters: 1600, terrainType: 'Highland Ridge', primaryCrops: ['Wongbok Cabbage', 'Iceberg Lettuce'] }
    ]
  },
  AlfonsoCastaneda: {
    municipality: 'Alfonso Castañeda',
    elevation: '420m - 980m',
    primaryZone: 'Pantabangan Watershed & Agro-Forestry Corridor',
    pagasaStation: 'DOST-PAGASA Sierra Madre Agromet Sensor',
    barangays: [
      { name: 'Lublub (Poblacion)', elevationMeters: 450, terrainType: 'River Valley', primaryCrops: ['Rice', 'Corn', 'Freshwater Tilapia'] },
      { name: 'Abuyo', elevationMeters: 510, terrainType: 'Mountain Foothill', primaryCrops: ['Banana', 'Cassava'] },
      { name: 'Galintuja', elevationMeters: 620, terrainType: 'Mountain Foothill', primaryCrops: ['Ginger', 'Sweet Potato'] },
      { name: 'Lipuga', elevationMeters: 580, terrainType: 'River Valley', primaryCrops: ['Corn', 'Vegetables'] },
      { name: 'Pelaway', elevationMeters: 670, terrainType: 'Mountain Foothill', primaryCrops: ['Coffee', 'Root Crops'] },
      { name: 'Cauayan', elevationMeters: 480, terrainType: 'River Valley', primaryCrops: ['Rice', 'Ampalaya'] }
    ]
  },
  Diadi: {
    municipality: 'Diadi',
    elevation: '280m - 620m',
    primaryZone: 'Magat River Basin & Fruit Orchards',
    pagasaStation: 'DOST-PAGASA Magat Basin Agromet Station',
    barangays: [
      { name: 'Poblacion', elevationMeters: 295, terrainType: 'River Valley', primaryCrops: ['Mango Carabao', 'Rice', 'Corn'] },
      { name: 'Arwas', elevationMeters: 310, terrainType: 'Alluvial Plain', primaryCrops: ['Watermelon', 'Tomatoes'] },
      { name: 'Balete', elevationMeters: 340, terrainType: 'Mountain Foothill', primaryCrops: ['Banana', 'Papaya'] },
      { name: 'Bugnay', elevationMeters: 360, terrainType: 'Mountain Foothill', primaryCrops: ['Citrus', 'Ginger'] },
      { name: 'Decabacan', elevationMeters: 320, terrainType: 'River Valley', primaryCrops: ['Paddy Rice', 'Corn'] },
      { name: 'Escoting', elevationMeters: 420, terrainType: 'Mountain Foothill', primaryCrops: ['Cassava', 'Sweet Potato'] },
      { name: 'Langayan', elevationMeters: 350, terrainType: 'River Valley', primaryCrops: ['Eggplant', 'Okra'] },
      { name: 'Nagsabaran', elevationMeters: 300, terrainType: 'Alluvial Plain', primaryCrops: ['Rice', 'Legumes'] },
      { name: 'San Luis', elevationMeters: 330, terrainType: 'River Valley', primaryCrops: ['Tomatoes', 'String Beans'] }
    ]
  }
};
