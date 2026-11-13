import highlandCabbageImg from '../assets/images/crop_highland_cabbage_1794537504739.jpg';
import redOnionsImg from '../assets/images/crop_red_onions_1794537505408.jpg';
import satsumaCitrusImg from '../assets/images/crop_satsuma_citrus_1794537505097.jpg';
import saladTomatoesImg from '../assets/images/crop_salad_tomatoes_1794537504337.jpg';
import garlicPeppersImg from '../assets/images/crop_garlic_peppers_1794537504070.jpg';
import carrotsRiceImg from '../assets/images/crop_carrots_rice_1794537532524.jpg';
import eggplantAmpalayaImg from '../assets/images/crop_eggplant_ampalaya_1794537532312.jpg';

export const CROP_ASSETS = {
  highlandCabbage: highlandCabbageImg,
  redOnions: redOnionsImg,
  satsumaCitrus: satsumaCitrusImg,
  saladTomatoes: saladTomatoesImg,
  garlicPeppers: garlicPeppersImg,
  carrotsRice: carrotsRiceImg,
  eggplantAmpalaya: eggplantAmpalayaImg,
};

export const REAL_CROP_GALLERY = [
  { id: 'cabbage', label: 'Highland Cabbage Harvest', url: highlandCabbageImg },
  { id: 'onions', label: 'Red Creole Onions (Bambang)', url: redOnionsImg },
  { id: 'citrus', label: 'Kasibu Satsuma Citrus', url: satsumaCitrusImg },
  { id: 'tomatoes', label: 'Satsuki Tomatoes & Broccoli', url: saladTomatoesImg },
  { id: 'garlic', label: 'Native Garlic & Bell Peppers', url: garlicPeppersImg },
  { id: 'carrots', label: 'Cordillera Carrots & Rice', url: carrotsRiceImg },
  { id: 'eggplant', label: 'Lowland Eggplant & Squash', url: eggplantAmpalayaImg },
];

export function getCropPhotoByName(cropName: string, category?: string): string {
  const text = `${cropName} ${category || ''}`.toLowerCase();
  if (text.includes('onion') || text.includes('shallot') || text.includes('sibuyas')) {
    return redOnionsImg;
  }
  if (text.includes('citrus') || text.includes('satsuma') || text.includes('orange') || text.includes('pineapple') || text.includes('calamansi') || text.includes('lanzones')) {
    return satsumaCitrusImg;
  }
  if (text.includes('tomato') || text.includes('broccoli') || text.includes('ginger') || text.includes('beans') || text.includes('peas')) {
    return saladTomatoesImg;
  }
  if (text.includes('garlic') || text.includes('pepper') || text.includes('bell') || text.includes('chili') || text.includes('spices')) {
    return garlicPeppersImg;
  }
  if (text.includes('carrot') || text.includes('rice') || text.includes('corn') || text.includes('coffee') || text.includes('cassava') || text.includes('potato') || text.includes('taro')) {
    return carrotsRiceImg;
  }
  if (text.includes('eggplant') || text.includes('ampalaya') || text.includes('squash') || text.includes('okra') || text.includes('tilapia') || text.includes('pinakbet')) {
    return eggplantAmpalayaImg;
  }
  return highlandCabbageImg;
}
