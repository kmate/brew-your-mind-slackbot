import { describe, it, expect } from '@jest/globals';
import { convert } from '../src/english2numbers';

describe('english2numbers.convert', () => {
    it('converts single numbers', () => {
        expect(convert('zero')).toBe(0);
        expect(convert('one')).toBe(1);
        expect(convert('ten')).toBe(10);
        expect(convert('nineteen')).toBe(19);
        expect(convert('twenty')).toBe(20);
        expect(convert('ninety')).toBe(90);
    });

    it('converts compound numbers', () => {
        expect(convert('twenty one')).toBe(21);
        expect(convert('thirty five')).toBe(35);
        expect(convert('forty two')).toBe(42);
        expect(convert('sixty nine')).toBe(69);
        expect(convert('eighty eight')).toBe(88);
    });

    it('returns 0 for unknown words', () => {
        expect(convert('foobar')).toBe(0);
        expect(convert('unknown words')).toBe(0);
    });

    it('ignores case and extra spaces', () => {
        expect(convert('Twenty One')).toBe(21);
        expect(convert('  forty   two  ')).toBe(42);
    });

    it('handles empty string', () => {
        expect(convert('')).toBe(0);
    });
});
