class PriorityCalculator {

  static weights = {
    urgency: 30,
    financialGap: 20,
    vulnerability: 20,
    medicalSeverity: 15,
    socialIsolation: 8,
    animalWelfare: 4,
    sustainability: 3
  };

  static calculate(aiScores) {

    if (!aiScores) return 50;

    let total = 0;

    total += (aiScores.urgency / 10) * this.weights.urgency;
    total += (aiScores.financialGap / 10) * this.weights.financialGap;
    total += (aiScores.vulnerability / 10) * this.weights.vulnerability;
    total += (aiScores.medicalSeverity / 10) * this.weights.medicalSeverity;
    total += (aiScores.socialIsolation / 10) * this.weights.socialIsolation;
    total += (aiScores.animalWelfare / 10) * this.weights.animalWelfare;
    total += (aiScores.sustainability / 10) * this.weights.sustainability;

    return Math.round(total);
  }

  static getLabel(score) {

    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';

    return 'Low';
  }
}

module.exports = PriorityCalculator;