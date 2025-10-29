import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowDown, FaChevronDown } from 'react-icons/fa';

const NavigationButtons = ({
  step,
  getMaxSteps,
  canProceed,
  saving,
  prevStep,
  nextStep,
  handleComplete,
  hasLongContent = false
}) => {
  return (
    <>
      {/* Scroll Indicator */}
      {hasLongContent && (
        <div className="flex items-center justify-center mt-6 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FaChevronDown className="mr-2 animate-bounce" />
            <span>Scroll for more options</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pb-6">
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

      {/* Floating Next Button */}
      {step < getMaxSteps() && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`btn-primary rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 ${
              canProceed() ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'
            }`}
            title="Next Step"
          >
            →
          </button>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center mt-2 pb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          Skip onboarding for now
        </Link>
      </div>
    </>
  );
};

export default NavigationButtons;
