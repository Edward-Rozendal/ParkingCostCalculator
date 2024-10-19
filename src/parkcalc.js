/**
 * Calculate the parking tarif.
 * @param {string} parking - The parking lot type.
 * @param {number} duration - The parking duration in minutes.
 * @returns {number} - The calculated tarig.
 */
export function calculateTarif(parking, duration) {
    let tarif;
    if (parking === 'Valet') {
        tarif = duration / 2.5;
    } else if (parking === 'Long-Term Surface') {
        tarif = 3 * duration;
    } else {
        tarif = duration;
    }
    return tarif;
}
