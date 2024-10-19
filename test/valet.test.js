import { expect } from 'chai';
import { calculateTarif } from '../src/parkcalc.js';

describe('Valet Parking Tarif', function () {

    it('should return $ 12.00 for 30 minutes', function () {
        const result = calculateTarif('Valet', 30);
        expect(result).to.equal(12.00);
    });

});
