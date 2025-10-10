import React from 'react';
import { Link } from 'react-router-dom';

const NavigationButtons = ({
  step,
  getMaxSteps,
  canProceed,
  saving,
  prevStep,
  nextStep,
  handleComplete
}) => {
  return (
    <>
      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {step < getMaxSteps() ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!canProceed() || saving}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Completing...' : 'Complete Setup'}
          </button>
        )}
      </div>

      {/* Skip Option */}
      <div className="text-center mt-6">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          Skip onboarding for now
        </Link>
      </div>
    </>
  );
};

export default NavigationButtons;
