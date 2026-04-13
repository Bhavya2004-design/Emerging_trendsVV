import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';

function buildTripSuggestions(tripPlan, variantIndex) {
  const isBusiness = tripPlan?.tripType === 'Business';
  const destination = tripPlan?.destination || 'your destination';
  const profile = getDestinationProfile(destination);

  if (isBusiness) {
    const businessVariants = [
      [
        {
          id: 'ai-trip-look-1',
          title: profile.businessArrivalTitle,
          subtitle: `Built for ${profile.label.toLowerCase()} days in ${destination}`,
          category: 'ai-suggested',
          pieces: profile.businessArrivalPieces,
          wearing: profile.businessArrivalWearing,
          palette: profile.businessArrivalPalette,
        },
        {
          id: 'ai-trip-look-2',
          title: profile.businessDayTitle,
          subtitle: profile.businessDaySubtitle,
          category: 'ai-suggested',
          pieces: profile.businessDayPieces,
          wearing: profile.businessDayWearing,
          palette: profile.businessDayPalette,
        },
        {
          id: 'ai-trip-look-3',
          title: profile.businessEveningTitle,
          subtitle: profile.businessEveningSubtitle,
          category: 'ai-suggested',
          pieces: profile.businessEveningPieces,
          wearing: profile.businessEveningWearing,
          palette: profile.businessEveningPalette,
        },
      ],
      [
        {
          id: 'ai-trip-look-4',
          title: profile.businessAltOneTitle,
          subtitle: `Alternative AI look for ${destination}`,
          category: 'ai-suggested',
          pieces: profile.businessAltOnePieces,
          wearing: profile.businessAltOneWearing,
          palette: profile.businessAltOnePalette,
        },
        {
          id: 'ai-trip-look-5',
          title: profile.businessAltTwoTitle,
          subtitle: profile.businessAltTwoSubtitle,
          category: 'ai-suggested',
          pieces: profile.businessAltTwoPieces,
          wearing: profile.businessAltTwoWearing,
          palette: profile.businessAltTwoPalette,
        },
        {
          id: 'ai-trip-look-6',
          title: profile.businessAltThreeTitle,
          subtitle: profile.businessAltThreeSubtitle,
          category: 'ai-suggested',
          pieces: profile.businessAltThreePieces,
          wearing: profile.businessAltThreeWearing,
          palette: profile.businessAltThreePalette,
        },
      ],
    ];

    return businessVariants[variantIndex % businessVariants.length];
  }

  const personalVariants = [
    [
      {
        id: 'ai-trip-look-1',
        title: profile.personalArrivalTitle,
        subtitle: `AI look for ${destination}`,
        category: 'ai-suggested',
        pieces: profile.personalArrivalPieces,
        wearing: profile.personalArrivalWearing,
        palette: profile.personalArrivalPalette,
      },
      {
        id: 'ai-trip-look-2',
        title: profile.personalDayTitle,
        subtitle: profile.personalDaySubtitle,
        category: 'ai-suggested',
        pieces: profile.personalDayPieces,
        wearing: profile.personalDayWearing,
        palette: profile.personalDayPalette,
      },
      {
        id: 'ai-trip-look-3',
        title: profile.personalEveningTitle,
        subtitle: profile.personalEveningSubtitle,
        category: 'ai-suggested',
        pieces: profile.personalEveningPieces,
        wearing: profile.personalEveningWearing,
        palette: profile.personalEveningPalette,
      },
    ],
    [
      {
        id: 'ai-trip-look-4',
        title: profile.personalAltOneTitle,
        subtitle: `Alternative AI look for ${destination}`,
        category: 'ai-suggested',
        pieces: profile.personalAltOnePieces,
        wearing: profile.personalAltOneWearing,
        palette: profile.personalAltOnePalette,
      },
      {
        id: 'ai-trip-look-5',
        title: profile.personalAltTwoTitle,
        subtitle: profile.personalAltTwoSubtitle,
        category: 'ai-suggested',
        pieces: profile.personalAltTwoPieces,
        wearing: profile.personalAltTwoWearing,
        palette: profile.personalAltTwoPalette,
      },
      {
        id: 'ai-trip-look-6',
        title: profile.personalAltThreeTitle,
        subtitle: profile.personalAltThreeSubtitle,
        category: 'ai-suggested',
        pieces: profile.personalAltThreePieces,
        wearing: profile.personalAltThreeWearing,
        palette: profile.personalAltThreePalette,
      },
    ],
  ];

  return personalVariants[variantIndex % personalVariants.length];
}

function getDestinationProfile(destination = '') {
  const normalizedDestination = destination.toLowerCase();

  if (/(dubai|bali|miami|singapore|bangkok|phuket|goa|maldives|honolulu|marrakech)/.test(normalizedDestination)) {
    return {
      label: 'Warm Weather',
      businessArrivalTitle: 'Warm Arrival Edit',
      businessArrivalPieces: ['Unlined sand blazer', 'Silk shell', 'Cream ankle trouser'],
      businessArrivalWearing: ['Unlined sand blazer', 'Light silk shell', 'Cream ankle trouser', 'Tan leather tote'],
      businessArrivalPalette: ['#c9a47a', '#f6eee2', '#d8c7af'],
      businessDayTitle: 'Heat-Smart Meeting Look',
      businessDaySubtitle: 'Breathable tailoring for warm days and polished movement',
      businessDayPieces: ['Linen blazer', 'Sleeveless knit', 'Airy straight trouser'],
      businessDayWearing: ['Linen blazer', 'Sleeveless knit top', 'Airy straight trouser', 'Low block slingbacks'],
      businessDayPalette: ['#b89a73', '#f5efe7', '#ceb89a'],
      businessEveningTitle: 'Resort Dinner Tailoring',
      businessEveningSubtitle: 'Sharp enough for dinner, light enough for evening heat',
      businessEveningPieces: ['Fluid black set', 'Minimal heel', 'Structured clutch'],
      businessEveningWearing: ['Fluid black sleeveless top', 'Matching tailored trouser', 'Minimal heel sandal', 'Structured clutch'],
      businessEveningPalette: ['#2a2624', '#cbb8a4', '#544842'],
      businessAltOneTitle: 'Client Lunch Linen Set',
      businessAltOnePieces: ['Soft beige blazer', 'Fine rib tank', 'Stone trouser'],
      businessAltOneWearing: ['Soft beige blazer', 'Fine rib tank', 'Stone trouser', 'Slim belt'],
      businessAltOnePalette: ['#c1a07a', '#efe4d8', '#d7c7b3'],
      businessAltTwoTitle: 'Conference Breeze Layers',
      businessAltTwoSubtitle: 'Breathable structure for indoor-outdoor agendas',
      businessAltTwoPieces: ['Light mocha jacket', 'Pale blue shirt', 'Driftwood trouser'],
      businessAltTwoWearing: ['Light mocha jacket', 'Pale blue shirt', 'Driftwood trouser', 'Leather loafers'],
      businessAltTwoPalette: ['#9f8165', '#d9e2e8', '#cbb8a0'],
      businessAltThreeTitle: 'Evening Terrace Set',
      businessAltThreeSubtitle: 'Clean lines with lighter evening layers',
      businessAltThreePieces: ['Taupe drape top', 'Column skirt', 'Soft blazer'],
      businessAltThreeWearing: ['Taupe drape top', 'Column skirt', 'Soft blazer', 'Compact shoulder bag'],
      businessAltThreePalette: ['#8a7364', '#dccfc0', '#514845'],
      personalArrivalTitle: 'Sunny City Walk Set',
      personalArrivalPieces: ['Linen overshirt', 'Soft tank', 'Relaxed short trouser'],
      personalArrivalWearing: ['Linen overshirt', 'Soft tank top', 'Relaxed short trouser', 'Crossbody bag'],
      personalArrivalPalette: ['#c2a07a', '#f5ede4', '#cdb89d'],
      personalDayTitle: 'Cafe Linen Set',
      personalDaySubtitle: 'Easy warm-weather layers with breathable textures',
      personalDayPieces: ['Open weave shirt', 'Cream tank', 'Flow trouser'],
      personalDayWearing: ['Open weave shirt', 'Cream tank', 'Flow trouser', 'Simple sandals'],
      personalDayPalette: ['#ad9271', '#faf5ee', '#d9c3a7'],
      personalEveningTitle: 'Sunset Dinner Look',
      personalEveningSubtitle: 'Lightweight evening dressing for warmer nights',
      personalEveningPieces: ['Silky slip dress', 'Light wrap', 'Mini clutch'],
      personalEveningWearing: ['Silky slip dress', 'Light wrap layer', 'Minimal heel sandal', 'Mini clutch'],
      personalEveningPalette: ['#7d685d', '#ecd8c8', '#3e3634'],
      personalAltOneTitle: 'Boardwalk Morning Combo',
      personalAltOnePieces: ['Cotton shirt', 'Ribbed tank', 'Easy drawstring pant'],
      personalAltOneWearing: ['Cotton shirt', 'Ribbed tank', 'Easy drawstring pant', 'Slide sandal'],
      personalAltOnePalette: ['#bca184', '#f5eee5', '#d1bfab'],
      personalAltTwoTitle: 'Late Lunch Resort Edit',
      personalAltTwoSubtitle: 'Soft shapes and lighter fabrics for warm city stops',
      personalAltTwoPieces: ['Textured shirt', 'Soft vest', 'Wide-leg sand pant'],
      personalAltTwoWearing: ['Textured shirt', 'Soft vest layer', 'Wide-leg sand pant', 'Strappy flat'],
      personalAltTwoPalette: ['#9e876a', '#f6f0e8', '#cfba9b'],
      personalAltThreeTitle: 'Warm Night Stroll Outfit',
      personalAltThreeSubtitle: 'Simple evening set without heavy layering',
      personalAltThreePieces: ['Silky cami', 'Light trouser', 'Soft cropped jacket'],
      personalAltThreeWearing: ['Silky cami', 'Light trouser', 'Soft cropped jacket', 'Mini handbag'],
      personalAltThreePalette: ['#6d5c54', '#e8d7ca', '#4e4744'],
    };
  }

  if (/(london|seattle|amsterdam|dublin|vancouver|edinburgh|manchester|brussels)/.test(normalizedDestination)) {
    return {
      label: 'Rainy City',
      businessArrivalTitle: 'Rain-Ready Arrival Edit',
      businessArrivalPieces: ['Waterproof trench', 'Fine knit', 'Dark straight trouser'],
      businessArrivalWearing: ['Waterproof trench coat', 'Fine knit top', 'Dark straight trouser', 'Structured tote'],
      businessArrivalPalette: ['#8f8579', '#f1ece4', '#4f6272'],
      businessDayTitle: 'Storm-Ready Meeting Set',
      businessDaySubtitle: 'Layered polish that still works in wet weather',
      businessDayPieces: ['Compact trench', 'Blue shirt', 'Graphite trouser'],
      businessDayWearing: ['Compact trench', 'Blue shirt', 'Graphite trouser', 'Weatherproof loafer'],
      businessDayPalette: ['#a58f7a', '#dbe4ec', '#5b6670'],
      businessEveningTitle: 'After-Hours Rain Edit',
      businessEveningSubtitle: 'Evening tailoring with enough structure for cooler drizzle',
      businessEveningPieces: ['Dark midi dress', 'Short wool coat', 'Leather boot'],
      businessEveningWearing: ['Dark midi dress', 'Short wool coat', 'Leather ankle boot', 'Compact shoulder bag'],
      businessEveningPalette: ['#2f3035', '#b7a99b', '#4e5056'],
      businessAltOneTitle: 'Client Lunch Layer Set',
      businessAltOnePieces: ['Camel raincoat', 'Fine knit shell', 'Ivory straight trouser'],
      businessAltOneWearing: ['Camel raincoat', 'Fine knit shell', 'Ivory straight trouser', 'Polished flat'],
      businessAltOnePalette: ['#b59673', '#efe6da', '#ddd2c1'],
      businessAltTwoTitle: 'Presentation Layer Stack',
      businessAltTwoSubtitle: 'Designed for polished movement through changing weather',
      businessAltTwoPieces: ['Charcoal coat', 'Blue shirt', 'Graphite trouser'],
      businessAltTwoWearing: ['Charcoal coat', 'Blue shirt', 'Graphite trouser', 'Compact umbrella'],
      businessAltTwoPalette: ['#44454d', '#d7e1eb', '#5c6069'],
      businessAltThreeTitle: 'Networking Under Layers',
      businessAltThreeSubtitle: 'Sleek enough for dinner, practical enough for repeat wear',
      businessAltThreePieces: ['Structured jacket', 'Taupe drape top', 'Dark column skirt'],
      businessAltThreeWearing: ['Structured jacket', 'Taupe drape top', 'Dark column skirt', 'Ankle boot'],
      businessAltThreePalette: ['#232428', '#c7b4a3', '#59505a'],
      personalArrivalTitle: 'Rainy City Walk Set',
      personalArrivalPieces: ['Light trench', 'Ribbed tee', 'Relaxed denim'],
      personalArrivalWearing: ['Light trench coat', 'Striped ribbed tee', 'Relaxed blue denim', 'Crossbody bag'],
      personalArrivalPalette: ['#baa488', '#f4ede4', '#547091'],
      personalDayTitle: 'Cafe Cardigan Set',
      personalDaySubtitle: 'Soft cardigan with easy layers for wet streets and indoor stops',
      personalDayPieces: ['Soft cardigan', 'White tank', 'Pleated neutral skirt'],
      personalDayWearing: ['Soft cardigan', 'White tank', 'Pleated neutral skirt', 'Water-resistant sneaker'],
      personalDayPalette: ['#9e8c75', '#faf7f1', '#d4c0a6'],
      personalEveningTitle: 'Rainy Evening Look',
      personalEveningSubtitle: 'Polished dark layers for a cooler night out',
      personalEveningPieces: ['Black midi dress', 'Cropped jacket', 'Ankle boot', 'Quilted bag'],
      personalEveningWearing: ['Black midi dress', 'Cropped jacket', 'Ankle boot', 'Quilted shoulder bag'],
      personalEveningPalette: ['#1f2024', '#bcb0a6', '#3b4148'],
      personalAltOneTitle: 'Museum Morning Combo',
      personalAltOnePieces: ['Soft oatmeal coat', 'Breton knit', 'Cropped blue jean'],
      personalAltOneWearing: ['Soft oatmeal coat', 'Breton knit', 'Cropped blue jean', 'Leather sneaker'],
      personalAltOnePalette: ['#b8a590', '#f5efe6', '#5d7698'],
      personalAltTwoTitle: 'Late Lunch Edit',
      personalAltTwoSubtitle: 'Relaxed silhouette with cleaner proportions and extra coverage',
      personalAltTwoPieces: ['Textured cardigan', 'Cream tank', 'Wide-leg sand pant'],
      personalAltTwoWearing: ['Textured cardigan', 'Cream tank', 'Wide-leg sand pant', 'Low boot'],
      personalAltTwoPalette: ['#8f7c66', '#f8f5ee', '#cebaa0'],
      personalAltThreeTitle: 'Night Stroll Layers',
      personalAltThreeSubtitle: 'Simple evening set with built-in warmth and rain-ready shoes',
      personalAltThreePieces: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser'],
      personalAltThreeWearing: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser', 'Leather ankle boot'],
      personalAltThreePalette: ['#5b4f4b', '#e8ddd0', '#2f3845'],
    };
  }

  if (/(moscow|berlin|stockholm|oslo|helsinki|zurich|vienna|prague|toronto|copenhagen)/.test(normalizedDestination)) {
    return {
      label: 'Cool Weather',
      businessArrivalTitle: 'Cold-Weather Arrival Edit',
      businessArrivalPieces: ['Wool coat', 'Fine turtleneck', 'Tailored trouser'],
      businessArrivalWearing: ['Wool coat', 'Fine turtleneck', 'Tailored trouser', 'Leather tote'],
      businessArrivalPalette: ['#8e7b6d', '#eee7dd', '#536272'],
      businessDayTitle: 'Thermal Meeting Layers',
      businessDaySubtitle: 'Sharper proportions with enough warmth for cooler days',
      businessDayPieces: ['Long coat', 'Blue poplin shirt', 'Charcoal trouser'],
      businessDayWearing: ['Long coat', 'Blue poplin shirt', 'Charcoal trouser', 'Leather boot'],
      businessDayPalette: ['#8f8a83', '#dde6ef', '#585c67'],
      businessEveningTitle: 'Winter Dinner Tailoring',
      businessEveningSubtitle: 'Evening polish with colder-night layers built in',
      businessEveningPieces: ['Dark knit dress', 'Structured wool coat', 'Tall boot'],
      businessEveningWearing: ['Dark knit dress', 'Structured wool coat', 'Tall boot', 'Compact clutch'],
      businessEveningPalette: ['#26272b', '#bcae9f', '#4a4a52'],
      businessAltOneTitle: 'Client Lunch Wool Set',
      businessAltOnePieces: ['Camel coat', 'Merino knit', 'Ivory trouser'],
      businessAltOneWearing: ['Camel coat', 'Merino knit', 'Ivory trouser', 'Block heel boot'],
      businessAltOnePalette: ['#b09371', '#efe7dc', '#dad1c4'],
      businessAltTwoTitle: 'Presentation Coat Stack',
      businessAltTwoSubtitle: 'Polished movement for cold mornings and indoor meetings',
      businessAltTwoPieces: ['Charcoal overcoat', 'Blue shirt', 'Graphite trouser'],
      businessAltTwoWearing: ['Charcoal overcoat', 'Blue shirt', 'Graphite trouser', 'Leather ankle boot'],
      businessAltTwoPalette: ['#4a4a50', '#d4dfea', '#636872'],
      businessAltThreeTitle: 'Evening Networking Wool Set',
      businessAltThreeSubtitle: 'Warm enough for transit, sleek enough for dinner',
      businessAltThreePieces: ['Structured wool blazer', 'Taupe knit top', 'Dark column skirt'],
      businessAltThreeWearing: ['Structured wool blazer', 'Taupe knit top', 'Dark column skirt', 'Tall boot'],
      businessAltThreePalette: ['#2c2d31', '#c6b3a2', '#5b535d'],
      personalArrivalTitle: 'Cold City Walk Set',
      personalArrivalPieces: ['Long wool coat', 'Ribbed knit', 'Relaxed denim'],
      personalArrivalWearing: ['Long wool coat', 'Ribbed knit', 'Relaxed denim', 'Shoulder bag'],
      personalArrivalPalette: ['#a89383', '#f0e7dd', '#5b7290'],
      personalDayTitle: 'Cozy Cafe Layer Set',
      personalDaySubtitle: 'Softer knits and weightier layers for cooler sightseeing',
      personalDayPieces: ['Chunky cardigan', 'Soft mock neck', 'Pleated wool skirt'],
      personalDayWearing: ['Chunky cardigan', 'Soft mock neck', 'Pleated wool skirt', 'Leather boot'],
      personalDayPalette: ['#9a886f', '#faf4ed', '#d0baa2'],
      personalEveningTitle: 'Cold Evening Look',
      personalEveningSubtitle: 'Sharper evening pieces with real warmth built in',
      personalEveningPieces: ['Dark knit dress', 'Wool coat', 'Heeled boot', 'Structured bag'],
      personalEveningWearing: ['Dark knit dress', 'Wool coat', 'Heeled boot', 'Structured mini bag'],
      personalEveningPalette: ['#232327', '#bfb2a7', '#3f4248'],
      personalAltOneTitle: 'Gallery Morning Combo',
      personalAltOnePieces: ['Soft coat', 'Fine striped knit', 'Cropped jean'],
      personalAltOneWearing: ['Soft coat', 'Fine striped knit', 'Cropped jean', 'Leather sneaker'],
      personalAltOnePalette: ['#b19e8a', '#f4ede5', '#607691'],
      personalAltTwoTitle: 'Late Lunch Knit Edit',
      personalAltTwoSubtitle: 'Relaxed silhouette with heavier layers and cleaner proportions',
      personalAltTwoPieces: ['Textured cardigan', 'Cream knit', 'Wide-leg wool pant'],
      personalAltTwoWearing: ['Textured cardigan', 'Cream knit', 'Wide-leg wool pant', 'Loafer'],
      personalAltTwoPalette: ['#8c7863', '#f6f0e8', '#c7b198'],
      personalAltThreeTitle: 'Night Stroll Wool Outfit',
      personalAltThreeSubtitle: 'Simple evening set with colder-weather structure',
      personalAltThreePieces: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser'],
      personalAltThreeWearing: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser', 'Heeled boot'],
      personalAltThreePalette: ['#5e534f', '#e6dbcf', '#303846'],
    };
  }

  return {
    label: 'City Travel',
    businessArrivalTitle: 'Arrival Meeting Edit',
    businessArrivalPieces: ['Stone trench', 'Soft white knit', 'Blue straight denim'],
    businessArrivalWearing: ['Stone trench coat', 'Soft white knit top', 'Blue straight denim jeans', 'Black crossbody bag'],
    businessArrivalPalette: ['#b8a48a', '#f5efe6', '#506786'],
    businessDayTitle: 'Client Lunch Uniform',
    businessDaySubtitle: 'Balanced tailoring for city movement and polished stops',
    businessDayPieces: ['Camel blazer', 'Soft shell top', 'Straight ivory trouser'],
    businessDayWearing: ['Camel blazer', 'Soft shell top', 'Straight ivory trouser', 'Leather loafer'],
    businessDayPalette: ['#b79e82', '#f5f1ea', '#d8c9b8'],
    businessEveningTitle: 'Elegant Evening Look',
    businessEveningSubtitle: 'Sleek dinner-ready set with repeat-wear value',
    businessEveningPieces: ['Black midi dress', 'Structured heel', 'Quilted clutch'],
    businessEveningWearing: ['Black sleeveless midi dress', 'Structured heel', 'Quilted clutch', 'Light outer layer'],
    businessEveningPalette: ['#1a1a1a', '#2d2d2d', '#3c3c3c'],
    businessAltOneTitle: 'Client Lunch Uniform',
    businessAltOnePieces: ['Camel blazer', 'Fine knit shell', 'Ivory straight trouser'],
    businessAltOneWearing: ['Camel blazer', 'Fine knit shell', 'Ivory straight trouser', 'Low heel'],
    businessAltOnePalette: ['#ba9873', '#efe6da', '#ddd2c1'],
    businessAltTwoTitle: 'Presentation Layer Stack',
    businessAltTwoSubtitle: 'Designed for polished movement across the day',
    businessAltTwoPieces: ['Charcoal coat', 'Blue shirt', 'Graphite trouser'],
    businessAltTwoWearing: ['Charcoal coat', 'Blue shirt', 'Graphite trouser', 'Structured tote'],
    businessAltTwoPalette: ['#44454d', '#d7e1eb', '#5c6069'],
    businessAltThreeTitle: 'Evening Networking Set',
    businessAltThreeSubtitle: 'Sleek enough for dinner, practical enough for repeat wear',
    businessAltThreePieces: ['Structured black jacket', 'Taupe drape top', 'Dark column skirt'],
    businessAltThreeWearing: ['Structured black jacket', 'Taupe drape top', 'Dark column skirt', 'Compact shoulder bag'],
    businessAltThreePalette: ['#232428', '#c7b4a3', '#59505a'],
    personalArrivalTitle: 'City Walk Layer Set',
    personalArrivalPieces: ['Light trench', 'Ribbed tee', 'Relaxed denim'],
    personalArrivalWearing: ['Light beige trench coat', 'Striped ribbed tee', 'Relaxed blue denim', 'Black handbag'],
    personalArrivalPalette: ['#baa488', '#f4ede4', '#547091'],
    personalDayTitle: 'Cafe Cardigan Set',
    personalDaySubtitle: 'Soft cardigan with a white tank and pleated neutral skirt',
    personalDayPieces: ['Soft cardigan', 'White tank', 'Pleated neutral skirt'],
    personalDayWearing: ['Soft cardigan', 'White tank', 'Pleated neutral skirt', 'Flat sneaker'],
    personalDayPalette: ['#9e8c75', '#faf7f1', '#d4c0a6'],
    personalEveningTitle: 'Elegant Evening Look',
    personalEveningSubtitle: 'Sleek black midi dress with a clean evening finish',
    personalEveningPieces: ['Black midi dress', 'Black heels', 'Quilted clutch'],
    personalEveningWearing: ['Black sleeveless midi dress', 'Black block heels', 'Quilted clutch', 'Fine outer layer'],
    personalEveningPalette: ['#1a1a1a', '#2d2d2d', '#3c3c3c'],
    personalAltOneTitle: 'Museum Morning Combo',
    personalAltOnePieces: ['Soft oatmeal coat', 'Breton knit', 'Cropped blue jean'],
    personalAltOneWearing: ['Soft oatmeal coat', 'Breton knit', 'Cropped blue jean', 'Crossbody bag'],
    personalAltOnePalette: ['#b8a590', '#f5efe6', '#5d7698'],
    personalAltTwoTitle: 'Late Lunch Edit',
    personalAltTwoSubtitle: 'Relaxed silhouette with cleaner proportions',
    personalAltTwoPieces: ['Textured cardigan', 'Cream tank', 'Wide-leg sand pant'],
    personalAltTwoWearing: ['Textured cardigan', 'Cream tank', 'Wide-leg sand pant', 'Ballet flat'],
    personalAltTwoPalette: ['#8f7c66', '#f8f5ee', '#cebaa0'],
    personalAltThreeTitle: 'Night Stroll Outfit',
    personalAltThreeSubtitle: 'Simple evening set with warmer layering built in',
    personalAltThreePieces: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser'],
    personalAltThreeWearing: ['Short wool jacket', 'Silky blouse', 'Dark tailored trouser', 'Mini shoulder bag'],
    personalAltThreePalette: ['#5b4f4b', '#e8ddd0', '#2f3845'],
  };
}

function reasonForItem(item, tripPlan) {
  const tripType = tripPlan?.tripType || 'Trip';

  if (item.title.toLowerCase().includes('conference') || item.title.toLowerCase().includes('meeting')) {
    return `Strong fit for ${tripType.toLowerCase()} days that need a sharper look.`;
  }
  if (item.title.toLowerCase().includes('arrival') || item.title.toLowerCase().includes('walk')) {
    return 'Easy to repeat, comfortable in transit, and simple to pack.';
  }
  if (item.title.toLowerCase().includes('capsule') || item.title.toLowerCase().includes('minimal')) {
    return 'Works across multiple outfits and keeps your packing versatile.';
  }

  return 'Balanced pick for layering, rewear, and low-effort styling during the trip.';
}

function wearingDetailsForItem(item) {
  if (item?.wearing?.length) {
    return item.wearing;
  }

  return (item?.pieces || []).map(piece => `${piece}`);
}

function SuggestedLookPreview({ item }) {
  const isLookOne = item.id === 'ai-trip-look-1';
  const isLookTwo = item.id === 'ai-trip-look-2';
  const isLookThree = item.id === 'ai-trip-look-3';
  const hasPhotoPreview = isLookOne || isLookTwo || isLookThree;

  const photoSource = isLookOne
    ? require('./paris.png')
    : isLookTwo
    ? require('./look2.png')
    : require('./look3.png');

  return (
    <View style={styles.previewFrame}>
      {hasPhotoPreview ? (
        <Image
          source={photoSource}
          style={styles.previewPhoto}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.previewImage, styles.previewPlaceholder]}>
          <View style={[styles.previewGarmentTall, { backgroundColor: item.palette[0] }]} />
          <View style={[styles.previewGarmentTop, { backgroundColor: item.palette[1] }]} />
          <View style={[styles.previewGarmentBottom, { backgroundColor: item.palette[2] }]} />
        </View>
      )}
      {!hasPhotoPreview ? <View style={styles.previewGlowLeft} /> : null}
      {!hasPhotoPreview ? <View style={styles.previewGlowRight} /> : null}
    </View>
  );
}

export default function TripAiSuggestionsPage({
  tripPlan,
  onBack,
  onUseSuggestions,
}) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const suggestedItems = useMemo(() => buildTripSuggestions(tripPlan, variantIndex), [tripPlan, variantIndex]);
  const activeLook = suggestedItems[activeLookIndex] || suggestedItems[0];

  function handleAnotherSet() {
    setVariantIndex(current => current + 1);
    setActiveLookIndex(0);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <ScreenBackButton onPress={onBack} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>PACKING PICKS</Text>
            <Text style={styles.headerSubtitle}>for {tripPlan?.destination || 'your trip'}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>AI CURATED</Text>
            <Text style={styles.heroTitle}>Smart packing set for your {tripPlan?.tripType || 'trip'}</Text>
            <Text style={styles.heroText}>Generated around repeat wear, lighter packing, and your destination mood.</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{tripPlan?.destination || 'Trip'}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{tripPlan?.tripType || 'Trip'}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{suggestedItems.length} looks</Text>
              </View>
            </View>
          </View>

          {activeLook ? (
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionTopRow}>
                <View>
                  <Text style={styles.optionLabel}>LOOK {activeLookIndex + 1} OF {suggestedItems.length}</Text>
                  <Text style={styles.itemTitle}>{activeLook.title}</Text>
                  <Text style={styles.itemSubtitle}>{activeLook.subtitle}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>AI PICK</Text>
                </View>
              </View>

              <SuggestedLookPreview item={activeLook} />

              <View style={styles.lookTabsRow}>
                {suggestedItems.map((item, index) => {
                  const isActive = index === activeLookIndex;

                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.lookTab, isActive && styles.lookTabActive]}
                      onPress={() => setActiveLookIndex(index)}
                    >
                      <Text style={[styles.lookTabText, isActive && styles.lookTabTextActive]}>
                        Look {index + 1}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.piecesWrap}>
                {activeLook.pieces.map(piece => (
                  <View key={piece} style={styles.pieceChip}>
                    <Text style={styles.pieceChipText}>{piece}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.wearingSection}>
                <Text style={styles.wearingTitle}>What she is wearing</Text>
                {wearingDetailsForItem(activeLook).map(detail => (
                  <Text key={detail} style={styles.wearingText}>- {detail}</Text>
                ))}
              </View>

              <Text style={styles.reasonText}>{reasonForItem(activeLook, tripPlan)}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Choose Different Looks</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => onUseSuggestions(suggestedItems)}
          >
            <Text style={styles.primaryButtonText}>Use These Suggestions</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ece6db',
  },
  screen: {
    flex: 1,
    backgroundColor: '#ece6db',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#22201d',
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6d665d',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 190,
  },
  heroCard: {
    backgroundColor: '#f8f4ed',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd4c8',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#86aa9c',
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 27,
    color: '#2a2825',
    fontWeight: '700',
  },
  heroText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#6a645d',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: '#efe7dc',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: '#6b6359',
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionCard: {
    backgroundColor: '#f9f7f2',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd6cb',
  },
  suggestionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#8aa896',
    fontWeight: '700',
  },
  itemTitle: {
    marginTop: 4,
    fontSize: 18,
    lineHeight: 22,
    color: '#24211d',
    fontWeight: '700',
    maxWidth: 210,
  },
  itemSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6f695f',
  },
  scoreBadge: {
    backgroundColor: '#dcebe2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreBadgeText: {
    color: '#567666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  previewFrame: {
    height: 190,
    borderRadius: 18,
    backgroundColor: '#e3dbcf',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e7ddcf',
  },
  previewPlaceholder: {
    backgroundColor: '#e7ddcf',
  },
  previewGarmentTall: {
    position: 'absolute',
    left: '18%',
    top: '17%',
    width: 72,
    height: 116,
    borderRadius: 26,
    backgroundColor: '#b89e7c',
  },
  previewGarmentTop: {
    position: 'absolute',
    right: '16%',
    top: '24%',
    width: 68,
    height: 56,
    borderRadius: 22,
    backgroundColor: '#f6f1ea',
  },
  previewGarmentBottom: {
    position: 'absolute',
    right: '18%',
    bottom: '16%',
    width: 50,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#496485',
  },
  previewGlowLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  previewGlowRight: {
    position: 'absolute',
    right: 20,
    top: '35%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  reasonText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#615a53',
  },
  wearingSection: {
    marginTop: 4,
  },
  wearingTitle: {
    marginTop: 2,
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#544d46',
  },
  wearingText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#615a53',
  },
  lookTabsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 2,
  },
  lookTab: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#efe7dc',
    marginRight: 8,
  },
  lookTabActive: {
    backgroundColor: '#dcebe2',
  },
  lookTabText: {
    color: '#6b6359',
    fontSize: 12,
    fontWeight: '700',
  },
  lookTabTextActive: {
    color: '#4f725f',
  },
  piecesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  pieceChip: {
    backgroundColor: '#efe7dc',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pieceChipText: {
    color: '#6a6258',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#ece6db',
    borderTopWidth: 1,
    borderTopColor: '#ddd5ca',
  },
  tertiaryButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#dfeae4',
    marginBottom: 10,
  },
  tertiaryButtonText: {
    color: '#4c7060',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7fa794',
    backgroundColor: '#f6f2ea',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#587666',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#7fa794',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});