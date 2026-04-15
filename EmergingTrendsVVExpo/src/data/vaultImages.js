/**
 * Static mapping of imageKey → bundled local asset.
 *
 * All require() calls MUST be static literals so Metro can resolve
 * them at bundle time. Do NOT use dynamic require().
 *
 * Each key matches the `imageKey` field on a vault item in vaultMockData.js.
 * Images live in assets/clothing/ — run scripts/downloadClothingImages.js
 * once to populate that directory, then restart Expo.
 */
const vaultImages = {
  'jacket-navy':       require('../../assets/clothing/jacket-navy.jpg'),
  'shirt-white':       require('../../assets/clothing/shirt-white.jpg'),
  'jeans-blue':        require('../../assets/clothing/jeans-blue.jpg'),
  'dress-cream':       require('../../assets/clothing/dress-cream.jpg'),
  'pants-olive':       require('../../assets/clothing/pants-olive.jpg'),
  'jacket-beige':      require('../../assets/clothing/jacket-beige.jpg'),
  'blouse-white':      require('../../assets/clothing/blouse-white.jpg'),
  'blazer-grey':       require('../../assets/clothing/blazer-grey.jpg'),
  'pants-black':       require('../../assets/clothing/pants-black.jpg'),
  'blazer-nude':       require('../../assets/clothing/blazer-nude.jpg'),
  'shirt-white-work':  require('../../assets/clothing/shirt-white-work.jpg'),
  'coat-camel':        require('../../assets/clothing/coat-camel.jpg'),
  'blazer-ivory':      require('../../assets/clothing/blazer-ivory.jpg'),
  'shirt-sage-green':  require('../../assets/clothing/shirt-sage-green.jpg'),
  'jacket-charcoal':   require('../../assets/clothing/jacket-charcoal.jpg'),
};

export default vaultImages;
