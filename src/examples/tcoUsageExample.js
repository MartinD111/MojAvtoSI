/**
 * TCO Engine Usage Examples
 * Production-ready integration patterns
 */

import {
  calculateTCO,
  calculateLeasePayment,
  calculateLoanPayment,
  compareTCO,
  tcoSensitivityAnalysis,
} from '../services/tcoEngine';

// ============================================================================
// EXAMPLE 1: Basic TCO Calculation for a Single Vehicle
// ============================================================================

export function example_basicTCO() {
  const vehicle = {
    isNew: true,
    price: 45000,
    msrp: 45000,
    mpg: 28,
    kWhPer100km: 0,
    annualMiles: 12000,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 9000,
    term: 36,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
    baseInsurance: 1200,
  };

  const result = calculateTCO(vehicle, user, finance, external);

  console.log('=== Audi RS7 Sportback TCO ===');
  console.log(`Total Monthly Cost: $${result.totalMonthly}`);
  console.log(`Total Annual Cost: $${result.totalAnnual}`);
  console.log(`Cost Per Mile: $${result.costPerMile}`);
  console.log('\nBreakdown:');
  Object.entries(result.breakdown).forEach(([key, item]) => {
    console.log(`  ${item.label}: $${item.monthly}/month`);
  });

  return result;
}

// ============================================================================
// EXAMPLE 2: Compare Multiple Vehicles
// ============================================================================

export function example_vehicleComparison() {
  const vehicles = [
    {
      id: 'audi_rs7',
      name: 'Audi RS7 Sportback',
      isNew: true,
      price: 45000,
      msrp: 45000,
      mpg: 28,
      residualRate: 0.55,
      powertrain: 'ICE',
      category: 'sedan',
    },
    {
      id: 'tesla_model_3',
      name: 'Tesla Model 3',
      isNew: true,
      price: 42000,
      msrp: 42000,
      kWhPer100km: 18,
      residualRate: 0.6,
      powertrain: 'EV',
      category: 'sedan',
    },
    {
      id: 'honda_accord',
      name: 'Honda Accord',
      isNew: false,
      price: 22000,
      mpg: 32,
      residualRate: 0.65,
      powertrain: 'ICE',
      category: 'sedan',
    },
  ];

  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 5000,
    term: 60,
    apr: 0.065,
  };

  const external = {
    fuelPrice: 3.5,
    electricityPrice: 0.14,
    taxRate: 0.0725,
    state: 'CA',
    baseInsurance: 1200,
  };

  const comparison = compareTCO(vehicles, user, finance, external);

  console.log('=== Vehicle Comparison ===\n');
  comparison.forEach((item) => {
    console.log(`${item.name}`);
    console.log(`  Monthly: $${item.tco.totalMonthly}`);
    console.log(`  Annual: $${item.tco.totalAnnual}`);
    console.log(`  Per Mile: $${item.tco.costPerMile}`);
    console.log('');
  });

  // Find cheapest option
  const cheapest = comparison.reduce((min, item) =>
    item.tco.totalMonthly < min.tco.totalMonthly ? item : min
  );

  console.log(`💰 Cheapest Option: ${cheapest.name} at $${cheapest.tco.totalMonthly}/month`);

  return comparison;
}

// ============================================================================
// EXAMPLE 3: Sensitivity Analysis - How Price Affects TCO
// ============================================================================

export function example_pricesSensitivity() {
  const baseVehicle = {
    isNew: true,
    price: 35000,
    msrp: 35000,
    mpg: 28,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 5000,
    term: 60,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
  };

  // Test: How does price range affect TCO?
  const priceRange = [25000, 30000, 35000, 40000, 45000];
  const sensitivity = tcoSensitivityAnalysis(
    baseVehicle,
    user,
    finance,
    external,
    'price',
    priceRange
  );

  console.log('=== Price Sensitivity Analysis ===\n');
  sensitivity.forEach((result) => {
    console.log(`$${result.price.toLocaleString()} → $${result.totalMonthly}/month`);
  });

  return sensitivity;
}

// ============================================================================
// EXAMPLE 4: Credit Score Impact on Insurance & Total Cost
// ============================================================================

export function example_creditScoreImpact() {
  const vehicle = {
    isNew: true,
    price: 35000,
    msrp: 35000,
    mpg: 28,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const baseUser = {
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 5000,
    term: 60,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
  };

  const creditScores = [580, 620, 660, 700, 740, 780];

  console.log('=== Credit Score Impact ===\n');
  creditScores.forEach((score) => {
    const user = { ...baseUser, creditScore: score };
    const tco = calculateTCO(vehicle, user, finance, external);
    const insurance = tco.breakdown.insurance.monthly;
    console.log(`Score ${score}: Insurance $${insurance}/mo | Total $${tco.totalMonthly}/mo`);
  });
}

// ============================================================================
// EXAMPLE 5: New vs Used Vehicle Analysis
// ============================================================================

export function example_newVsUsed() {
  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 5000,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
  };

  // New vehicle scenario
  const newVehicle = {
    isNew: true,
    price: 35000,
    msrp: 35000,
    mpg: 28,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const newFinance = {
    ...finance,
    term: 36,
  };

  // Used vehicle scenario (3-year-old equivalent)
  const usedVehicle = {
    isNew: false,
    price: 25000, // ~71% of new price
    mpg: 28,
    residualRate: 0.65, // Better residual for used
    powertrain: 'ICE',
    category: 'sedan',
  };

  const usedFinance = {
    ...finance,
    term: 60,
    apr: 0.075,
  };

  const tcoNew = calculateTCO(newVehicle, user, newFinance, external);
  const tcoUsed = calculateTCO(usedVehicle, user, usedFinance, external);

  console.log('=== New vs Used Comparison ===\n');
  console.log('NEW VEHICLE:');
  console.log(`  Monthly: $${tcoNew.totalMonthly}`);
  console.log(`  3-year Total: $${(tcoNew.totalMonthly * 36).toLocaleString()}`);
  console.log(`  5-year Total: $${(tcoNew.totalMonthly * 60).toLocaleString()}`);

  console.log('\nUSED VEHICLE (3-year-old):');
  console.log(`  Monthly: $${tcoUsed.totalMonthly}`);
  console.log(`  5-year Total: $${(tcoUsed.totalMonthly * 60).toLocaleString()}`);

  const difference = tcoNew.totalMonthly - tcoUsed.totalMonthly;
  const percent = ((difference / tcoUsed.totalMonthly) * 100).toFixed(1);

  console.log(`\n${difference > 0 ? '📈' : '📉'} Difference: $${Math.abs(difference)}/month (${percent}%)`);

  return { newVehicle: tcoNew, usedVehicle: tcoUsed };
}

// ============================================================================
// EXAMPLE 6: EV vs Gas Comparison
// ============================================================================

export function example_evVsGas() {
  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const finance = {
    downPayment: 7000,
    term: 60,
  };

  const external = {
    fuelPrice: 3.5,
    electricityPrice: 0.14,
    taxRate: 0.0725,
    state: 'CA',
  };

  const gasCar = {
    isNew: true,
    price: 42000,
    msrp: 42000,
    mpg: 32,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const evCar = {
    isNew: true,
    price: 44000,
    msrp: 44000,
    kWhPer100km: 18,
    residualRate: 0.62,
    powertrain: 'EV',
    category: 'sedan',
  };

  const tcoGas = calculateTCO(gasCar, user, finance, external);
  const tcoEv = calculateTCO(evCar, user, finance, external);

  console.log('=== EV vs Gas Comparison ===\n');
  console.log('GAS VEHICLE:');
  console.log(`  Fuel Cost: $${tcoGas.breakdown.energy.monthly}/month`);
  console.log(`  Maintenance: $${tcoGas.breakdown.maintenance.monthly}/month`);
  console.log(`  Total: $${tcoGas.totalMonthly}/month`);

  console.log('\nEV:');
  console.log(`  Electricity Cost: $${tcoEv.breakdown.energy.monthly}/month`);
  console.log(`  Maintenance: $${tcoEv.breakdown.maintenance.monthly}/month`);
  console.log(`  Total: $${tcoEv.totalMonthly}/month`);

  const savings = tcoGas.totalMonthly - tcoEv.totalMonthly;
  console.log(`\n⚡ Monthly Savings with EV: $${savings.toFixed(0)}`);
  console.log(`   5-year Savings: $${(savings * 60).toLocaleString()}`);

  return { gas: tcoGas, ev: tcoEv };
}

// ============================================================================
// EXAMPLE 7: Down Payment Impact
// ============================================================================

export function example_downPaymentImpact() {
  const vehicle = {
    isNew: true,
    price: 35000,
    msrp: 35000,
    mpg: 28,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const user = {
    creditScore: 740,
    age: 35,
    state: 'CA',
    annualMiles: 12000,
  };

  const baseFinance = {
    term: 60,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
  };

  const downPayments = [0, 5000, 10000, 15000, 20000];

  console.log('=== Down Payment Impact ===\n');
  downPayments.forEach((dp) => {
    const finance = { ...baseFinance, downPayment: dp };
    const tco = calculateTCO(vehicle, user, finance, external);
    const dpPercent = ((dp / vehicle.price) * 100).toFixed(0);
    console.log(`${dpPercent}% down ($${dp.toLocaleString()}): $${tco.totalMonthly}/month`);
  });
}

// ============================================================================
// EXAMPLE 8: Real-world Scenario - First-time Buyer
// ============================================================================

export function example_firstTimeBuyer() {
  console.log('=== First-Time Buyer Scenario ===\n');
  console.log('Profile:');
  console.log('  - 28 years old');
  console.log('  - Credit score: 620 (building credit)');
  console.log('  - Location: Texas');
  console.log('  - Annual budget: ~$400/month');
  console.log('  - Annual miles: 15,000\n');

  const vehicle = {
    isNew: false,
    price: 18000,
    mpg: 30,
    residualRate: 0.65,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const user = {
    creditScore: 620,
    age: 28,
    state: 'TX',
    annualMiles: 15000,
  };

  const finance = {
    downPayment: 3000,
    term: 60,
    apr: 0.089, // Higher rate due to credit score
  };

  const external = {
    fuelPrice: 3.3,
    electricityPrice: 0.12,
    taxRate: 0.0625,
    state: 'TX',
    baseInsurance: 1400, // Higher for young driver
  };

  const tco = calculateTCO(vehicle, user, finance, external);

  console.log('Selected Vehicle: 2021 Honda Civic - $18,000\n');
  console.log('Cost Breakdown:');
  Object.entries(tco.breakdown).forEach(([key, item]) => {
    console.log(`  ${item.label}: $${item.monthly}/month`);
  });

  console.log(`\n📊 Total Monthly Cost: $${tco.totalMonthly}`);
  console.log(`✅ Within budget: ${tco.totalMonthly <= 400 ? 'YES' : 'NO'}`);
  console.log(`💳 Total 5-year cost: $${(tco.totalMonthly * 60).toLocaleString()}`);

  return tco;
}

// ============================================================================
// EXAMPLE 9: Luxury vs Budget - True Cost Comparison
// ============================================================================

export function example_luxuryVsBudget() {
  const user = {
    creditScore: 740,
    age: 45,
    state: 'CA',
    annualMiles: 10000,
  };

  const finance = {
    downPayment: 10000,
    term: 60,
  };

  const external = {
    fuelPrice: 3.5,
    taxRate: 0.0725,
    state: 'CA',
  };

  const budget = {
    isNew: false,
    price: 15000,
    mpg: 32,
    residualRate: 0.65,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const luxury = {
    isNew: true,
    price: 75000,
    msrp: 75000,
    mpg: 24,
    residualRate: 0.55,
    powertrain: 'ICE',
    category: 'sedan',
  };

  const tcoBudget = calculateTCO(budget, user, finance, external);
  const tcoLuxury = calculateTCO(luxury, user, finance, external);

  console.log('=== Luxury vs Budget ===\n');

  console.log('BUDGET CAR ($15,000):');
  console.log(`  Monthly: $${tcoBudget.totalMonthly}`);
  console.log(`  5-year total: $${(tcoBudget.totalMonthly * 60).toLocaleString()}`);

  console.log('\nLUXURY CAR ($75,000):');
  console.log(`  Monthly: $${tcoLuxury.totalMonthly}`);
  console.log(`  5-year total: $${(tcoLuxury.totalMonthly * 60).toLocaleString()}`);

  const difference = tcoLuxury.totalMonthly - tcoBudget.totalMonthly;
  console.log(`\n💰 Monthly Premium: $${difference.toFixed(0)}`);
  console.log(`   5-year Premium: $${(difference * 60).toLocaleString()}`);

  return { budget: tcoBudget, luxury: tcoLuxury };
}
