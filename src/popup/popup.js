
// Uvozimo glavni CSS fajl kako bi Vite i Tailwind 4 procesirali stilove za Popup
// Putanja '../content/index.css' pretpostavlja da su fajlovi u src/popup/ i src/content/
import '../content/index.css';

/**
 * DOMVision Popup Logika
 * Ovde možeš dodati specifične funkcije za sam prozorčić ekstenzije,
 * kao što su podešavanja, istorija ili dugmad za promenu tema.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMVision: Popup je uspešno inicijalizovan.');

  // Primer: Možemo ispisati verziju ili trenutno vreme u konzolu popupa
  const statusElement = document.querySelector('.text-emerald-400');
  if (statusElement) {
    console.log('DOMVision Status: Active');
  }
});