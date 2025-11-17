/**
 * Grade Calculator for CPSC 3600
 * Implements specification grading calculation
 */

// Grade thresholds
const GRADE_THRESHOLDS = {
  A: 23,
  B: 20,
  C: 17,
  D: 14
};

// Calculate total points from all categories
function calculateTotalPoints() {
  const projectPoints = calculateProjectPoints();
  const examPoints = calculateExamPoints();
  const networkPoints = calculateNetworkPoints();
  const exitPoints = calculateExitPoints();

  return projectPoints + examPoints + networkPoints + exitPoints;
}

// Calculate project points
function calculateProjectPoints() {
  let total = 0;

  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`project${i}-points`);
    if (input) {
      total += parseInt(input.value) || 0;
    }
  }

  document.getElementById('projects-total').textContent = total;
  return total;
}

// Calculate exam points
function calculateExamPoints() {
  let total = 0;

  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`exam${i}-points`);
    if (input) {
      total += parseInt(input.value) || 0;
    }
  }

  document.getElementById('exams-total').textContent = total;
  return total;
}

// Calculate network analysis points
function calculateNetworkPoints() {
  let total = 0;

  for (let i = 1; i <= 5; i++) {
    const checkbox = document.getElementById(`na${i}`);
    if (checkbox && checkbox.checked) {
      total++;
    }
  }

  document.getElementById('network-total').textContent = total;
  return total;
}

// Calculate exit check points
function calculateExitPoints() {
  const completed = parseInt(document.getElementById('exit-completed').value) || 0;
  const offered = parseInt(document.getElementById('exit-offered').value) || 0;

  if (offered === 0) {
    document.getElementById('exit-graded-count').textContent = '0';
    document.getElementById('exit-percentage').textContent = '0%';
    document.getElementById('exit-points-final').textContent = '0';
    return 0;
  }

  // Calculate with 3 automatic drops
  const gradedCount = Math.max(0, offered - 3);
  const adjustedCompleted = Math.min(completed, gradedCount);
  const percentage = gradedCount > 0 ? (adjustedCompleted / gradedCount) * 100 : 0;
  const pointsEarned = (percentage / 100) * 2;
  const pointsFinal = Math.floor(pointsEarned);

  document.getElementById('exit-graded-count').textContent = gradedCount;
  document.getElementById('exit-percentage').textContent = percentage.toFixed(1) + '%';
  document.getElementById('exit-points-final').textContent = pointsFinal;

  return pointsFinal;
}

// Determine letter grade from points
function getLetterGrade(points) {
  if (points >= GRADE_THRESHOLDS.A) return 'A';
  if (points >= GRADE_THRESHOLDS.B) return 'B';
  if (points >= GRADE_THRESHOLDS.C) return 'C';
  if (points >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

// Get description for current grade
function getGradeDescription(grade, points) {
  switch (grade) {
    case 'A':
      return points === 25 ? 'Perfect score!' : 'Excellent work!';
    case 'B':
      return 'Strong performance';
    case 'C':
      return 'Satisfactory work';
    case 'D':
      return 'Minimum passing grade';
    case 'F':
      return 'Below D threshold';
    default:
      return '';
  }
}

// Calculate points needed to reach next grade
function getPointsToNextGrade(currentPoints, currentGrade) {
  if (currentGrade === 'F') {
    return { points: GRADE_THRESHOLDS.D - currentPoints, grade: 'D' };
  } else if (currentGrade === 'D') {
    return { points: GRADE_THRESHOLDS.C - currentPoints, grade: 'C' };
  } else if (currentGrade === 'C') {
    return { points: GRADE_THRESHOLDS.B - currentPoints, grade: 'B' };
  } else if (currentGrade === 'B') {
    return { points: GRADE_THRESHOLDS.A - currentPoints, grade: 'A' };
  } else {
    return { points: 0, grade: 'A' };
  }
}

// Update the grade summary display
function updateGradeSummary() {
  const totalPoints = calculateTotalPoints();

  document.getElementById('total-points').textContent = totalPoints;

  // Save state
  saveState();
}

// Generate scenario analysis for target grade
function analyzeScenario(targetGrade) {
  const currentPoints = calculateTotalPoints();
  const targetPoints = GRADE_THRESHOLDS[targetGrade];
  const pointsNeeded = targetPoints - currentPoints;

  const scenarioTitle = document.getElementById('scenario-title');
  const scenarioMessage = document.getElementById('scenario-message');
  const scenarioResult = document.getElementById('scenario-result');

  scenarioTitle.textContent = `Path to Grade ${targetGrade} (${targetPoints} points)`;

  if (currentPoints >= targetPoints) {
    scenarioMessage.innerHTML = `
      <p class="scenario-success">✓ You have already achieved this grade with ${currentPoints} points!</p>
      ${currentPoints > targetPoints ? `<p>You have ${currentPoints - targetPoints} point(s) above the threshold.</p>` : ''}
    `;
  } else {
    scenarioMessage.innerHTML = `
      <p>You need <strong>${pointsNeeded} more point(s)</strong> to reach this grade.</p>
      <p><strong>Possible strategies:</strong></p>
      <ul style="margin-top: var(--space-4);">
        ${getSuggestions(pointsNeeded)}
      </ul>
    `;
  }

  scenarioResult.style.display = 'block';
}

// Generate suggestions for earning remaining points
function getSuggestions(pointsNeeded) {
  const suggestions = [];

  const networkPoints = calculateNetworkPoints();
  const exitPoints = calculateExitPoints();

  // Define which assignments are past due (hardcoded for now)
  // Projects 1-2 are past due, Project 3 is still available
  // Exams 1-2 are past due, Exam 3 (Final) is still available
  // Network Analysis 1-3 are past due, 4-5 are still available

  // Calculate points from FUTURE projects only (Project 3)
  let futureProjectPoints = 0;
  const project3Points = parseInt(document.getElementById('project3-points').value) || 0;
  if (project3Points < 3) {
    futureProjectPoints = 3 - project3Points;
  }

  // Calculate points from FUTURE exams only (Exam 3 / Final)
  let futureExamPoints = 0;
  const exam3Points = parseInt(document.getElementById('exam3-points').value) || 0;
  if (exam3Points < 3) {
    futureExamPoints = 3 - exam3Points;
  }

  // Points lost on exams 1-2 that can be retaken during final (max 6 points from exams 1-2)
  const exam1Points = parseInt(document.getElementById('exam1-points').value) || 0;
  const exam2Points = parseInt(document.getElementById('exam2-points').value) || 0;
  const exams12Completed = exam1Points + exam2Points;
  const retakeablePoints = 6 - exams12Completed; // Can retake bundles from exams 1-2

  // Calculate remaining FUTURE network analysis (4-5 only)
  let futureNetworkPoints = 0;
  const na4Checked = document.getElementById('na4')?.checked || false;
  const na5Checked = document.getElementById('na5')?.checked || false;
  if (!na4Checked) futureNetworkPoints++;
  if (!na5Checked) futureNetworkPoints++;

  const exitRemaining = 2 - exitPoints;

  if (futureProjectPoints > 0) {
    suggestions.push(`<li>Earn ${Math.min(pointsNeeded, futureProjectPoints)} more point(s) from Project 3 (${futureProjectPoints} available)</li>`);
  }

  if (futureExamPoints > 0) {
    suggestions.push(`<li>Earn ${Math.min(pointsNeeded, futureExamPoints)} more point(s) from Exam 3 (Final) (${futureExamPoints} available)</li>`);
  }

  if (retakeablePoints > 0) {
    suggestions.push(`<li>Earn back ${Math.min(pointsNeeded, retakeablePoints)} more point(s) by retaking failed exam bundles during the final (${retakeablePoints} available from Exams 1-2)</li>`);
  }

  if (futureNetworkPoints > 0) {
    suggestions.push(`<li>Complete ${Math.min(pointsNeeded, futureNetworkPoints)} more network analysis assignment(s) (${futureNetworkPoints} remaining)</li>`);
  }

  if (exitRemaining > 0) {
    suggestions.push(`<li>Improve exit check completion to earn up to ${exitRemaining} more point(s)</li>`);
  }

  if (suggestions.length === 0) {
    suggestions.push('<li>You have maximized all available points.</li>');
  }

  return suggestions.join('');
}

// Reset all inputs
function resetCalculator() {
  // Reset project inputs
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`project${i}-points`);
    if (input) input.value = '0';
  }

  // Reset exam inputs
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`exam${i}-points`);
    if (input) input.value = '0';
  }

  // Reset network analysis checkboxes
  for (let i = 1; i <= 5; i++) {
    const checkbox = document.getElementById(`na${i}`);
    if (checkbox) checkbox.checked = false;
  }

  document.getElementById('exit-completed').value = '0';
  document.getElementById('exit-offered').value = '0';

  // Hide scenario result
  document.getElementById('scenario-result').style.display = 'none';

  // Update display
  updateGradeSummary();
}

// Save state to localStorage
function saveState() {
  const state = {
    projects: {},
    exams: {},
    network: {},
    exitCompleted: document.getElementById('exit-completed').value,
    exitOffered: document.getElementById('exit-offered').value
  };

  // Save project points
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`project${i}-points`);
    state.projects[`project${i}`] = input ? input.value : '0';
  }

  // Save exam points
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`exam${i}-points`);
    state.exams[`exam${i}`] = input ? input.value : '0';
  }

  // Save network analysis checkboxes
  for (let i = 1; i <= 5; i++) {
    const checkbox = document.getElementById(`na${i}`);
    state.network[`na${i}`] = checkbox ? checkbox.checked : false;
  }

  localStorage.setItem('cpsc3600-grade-calculator', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const saved = localStorage.getItem('cpsc3600-grade-calculator');
  if (!saved) return;

  try {
    const state = JSON.parse(saved);

    // Load project points
    if (state.projects) {
      for (let i = 1; i <= 3; i++) {
        const key = `project${i}`;
        const input = document.getElementById(`${key}-points`);
        if (input && state.projects[key] !== undefined) {
          input.value = state.projects[key];
        }
      }
    }

    // Load exam points
    if (state.exams) {
      for (let i = 1; i <= 3; i++) {
        const key = `exam${i}`;
        const input = document.getElementById(`${key}-points`);
        if (input && state.exams[key] !== undefined) {
          input.value = state.exams[key];
        }
      }
    }

    // Load network analysis checkboxes
    if (state.network) {
      Object.keys(state.network).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) checkbox.checked = state.network[key];
      });
    }

    if (state.exitCompleted !== undefined) {
      document.getElementById('exit-completed').value = state.exitCompleted;
    }
    if (state.exitOffered !== undefined) {
      document.getElementById('exit-offered').value = state.exitOffered;
    }

    updateGradeSummary();
  } catch (error) {
    console.error('Error loading saved state:', error);
  }
}

// Initialize event listeners
function init() {
  // Load saved state
  loadState();

  // Add project input listeners
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`project${i}-points`);
    if (input) input.addEventListener('input', updateGradeSummary);
  }

  // Add exam input listeners
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`exam${i}-points`);
    if (input) input.addEventListener('input', updateGradeSummary);
  }

  // Network analysis checkboxes
  document.querySelectorAll('.network-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateGradeSummary);
  });

  // Exit check inputs
  document.getElementById('exit-completed').addEventListener('input', updateGradeSummary);
  document.getElementById('exit-offered').addEventListener('input', updateGradeSummary);

  // Target grade buttons
  document.querySelectorAll('.target-btn').forEach(button => {
    button.addEventListener('click', () => {
      const targetGrade = button.dataset.target;
      analyzeScenario(targetGrade);
    });
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all inputs? This cannot be undone.')) {
      resetCalculator();
      localStorage.removeItem('cpsc3600-grade-calculator');
    }
  });

  // Initial calculation
  updateGradeSummary();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
