const inMemoryOutfits = [];

export async function saveOutfitToDatabase(outfit) {
  inMemoryOutfits.unshift(outfit);

  // Placeholder for real DB integration.
  // Replace this with your API call once backend is ready.
  return Promise.resolve({ success: true, id: outfit.id });
}

export async function fetchOutfitsFromDatabase() {
  return Promise.resolve(inMemoryOutfits);
}
