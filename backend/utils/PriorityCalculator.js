class PriorityCalculator {
  static calculate({ health_condition, income_level, family_size, urgency, category }) {
    let score = 0;

    const healthScores = { critical: 50, serious: 35, moderate: 20 };
    score += healthScores[health_condition] || 0;

    const incomeScores = { very_low: 30, low: 20, medium: 10 };
    score += incomeScores[income_level] || 0;

    if (family_size > 5) score += 20;
    else if (family_size >= 3) score += 10;
    else score += 5;

    const urgencyScores = { critical: 25, high: 15, medium: 8, low: 3 };
    score += urgencyScores[urgency] || 0;

    if (category === 'animal') score += 10;

    return score;
  }
}

module.exports = PriorityCalculator;