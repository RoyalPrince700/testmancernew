import React from 'react';

const ProgressIndicator = ({ step, getMaxSteps, hasGoogleAvatar, showUniversityStep, formData }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-4">
        {Array.from({ length: getMaxSteps() }, (_, i) => i + 1).map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNum <= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < getMaxSteps() && (
              <div className={`w-12 h-1 mx-2 ${
                stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {hasGoogleAvatar ? (
            <>
              {step === 1 && 'Welcome to TestMancer!'}
              {step === 2 && 'Choose Your Learning Path'}
              {step === 3 && showUniversityStep && 'Select Your University'}
              {step === 4 && showUniversityStep && formData.university && 'Choose Your Faculty'}
              {step === 5 && showUniversityStep && formData.university && formData.faculty && 'Select Your Department'}
              {step === 6 && showUniversityStep && formData.university && formData.faculty && formData.department && 'Choose Your Level'}
              {step === (showUniversityStep ? (formData.university && formData.faculty && formData.department ? 7 : 4) : 3) && 'Study Preferences'}
              {(step === 4 && !showUniversityStep) && 'Study Preferences'}
              {(step === 7 && showUniversityStep && !(formData.university && formData.faculty && formData.department)) && 'Study Preferences'}
            </>
          ) : (
            <>
              {step === 1 && 'Welcome to TestMancer!'}
              {step === 2 && 'Create Your Username'}
              {step === 3 && 'Choose Your Learning Path'}
              {step === 4 && showUniversityStep && 'Select Your University'}
              {step === 5 && showUniversityStep && formData.university && 'Choose Your Faculty'}
              {step === 6 && showUniversityStep && formData.university && formData.faculty && 'Select Your Department'}
              {step === 7 && showUniversityStep && formData.university && formData.faculty && formData.department && 'Choose Your Level'}
              {step === (showUniversityStep ? (formData.university && formData.faculty && formData.department ? 8 : 5) : 4) && 'Study Preferences'}
              {(step === 4 && !showUniversityStep) && 'Study Preferences'}
              {(step === 5 && showUniversityStep && !formData.university) && 'Study Preferences'}
              {(step === 8 && showUniversityStep && !(formData.university && formData.faculty && formData.department)) && 'Almost done! Set your study preferences'}
            </>
          )}
        </h1>
        <p className="text-gray-600">
          {hasGoogleAvatar ? (
            <>
              {step === 1 && 'Create your unique username to get started'}
              {step === 2 && 'Tell us what you\'re preparing for'}
              {step === 3 && showUniversityStep && 'Which university are you attending?'}
              {step === 4 && showUniversityStep && formData.university && 'Which faculty are you in?'}
              {step === 5 && showUniversityStep && formData.university && formData.faculty && 'Which department are you studying?'}
              {step === 6 && showUniversityStep && formData.university && formData.faculty && formData.department && 'What level are you currently in?'}
              {step === (showUniversityStep ? (formData.university && formData.faculty && formData.department ? 7 : 4) : 3) && 'Help us personalize your learning experience'}
              {(step === 4 && !showUniversityStep) && 'Help us personalize your learning experience'}
              {(step === 7 && showUniversityStep && !(formData.university && formData.faculty && formData.department)) && 'Almost done! Set your study preferences'}
            </>
          ) : (
            <>
              {step === 1 && 'Create your unique profile to get started'}
              {step === 2 && 'Create your unique username to get started'}
              {step === 3 && 'Tell us what you\'re preparing for'}
              {step === 4 && showUniversityStep && 'Which university are you attending?'}
              {step === 5 && showUniversityStep && formData.university && 'Which faculty are you in?'}
              {step === 6 && showUniversityStep && formData.university && formData.faculty && 'Which department are you studying?'}
              {step === 7 && showUniversityStep && formData.university && formData.faculty && formData.department && 'What level are you currently in?'}
              {step === (showUniversityStep ? (formData.university && formData.faculty && formData.department ? 8 : 5) : 4) && 'Help us personalize your learning experience'}
              {(step === 4 && !showUniversityStep) && 'Help us personalize your learning experience'}
              {(step === 5 && showUniversityStep && !formData.university) && 'Help us personalize your learning experience'}
              {(step === 8 && showUniversityStep && !(formData.university && formData.faculty && formData.department)) && 'Almost done! Set your study preferences'}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;
