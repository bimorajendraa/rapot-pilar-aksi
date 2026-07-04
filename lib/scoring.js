// Single source of truth for the assessment scoring formula.
// Mirrors calcTotalScore()/submitAssessment() in app.js — do not diverge.

const INDICATOR_COUNT = 16;
const RATING_MIN = 1;
const RATING_MAX = 4;

const PILLAR_WEIGHTS = [22, 25, 23, 30]; // Pilar 1..4, must sum to 100

function computeScore(ratings) {
    const pillars = [
        ratings.slice(0, 4),
        ratings.slice(4, 8),
        ratings.slice(8, 12),
        ratings.slice(12, 16),
    ];

    const total = pillars.reduce((sum, indicators, i) => {
        const pillarSum = indicators.reduce((a, b) => a + b, 0);
        return sum + (pillarSum / 16) * PILLAR_WEIGHTS[i];
    }, 0);

    return Math.round(total * 100) / 100;
}

function computeBand(score) {
    if (score >= 95) return 'Outstanding';
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
}

function isValidRatings(ratings) {
    return Array.isArray(ratings) &&
        ratings.length === INDICATOR_COUNT &&
        ratings.every(r => Number.isInteger(r) && r >= RATING_MIN && r <= RATING_MAX);
}

module.exports = {
    INDICATOR_COUNT,
    RATING_MIN,
    RATING_MAX,
    PILLAR_WEIGHTS,
    computeScore,
    computeBand,
    isValidRatings,
};
