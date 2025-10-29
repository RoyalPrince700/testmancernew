import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  FaBullseye,
  FaBook,
  FaBrain,
  FaPencilAlt,
  FaGraduationCap,
  FaBookOpen,
  FaFlask,
  FaLightbulb,
  FaStar,
  FaGem,
  FaClipboardList,
  FaUniversity,
  FaFlagUsa,
  FaGlobe,
  FaBuilding,
  FaCheck,
  FaTimes,
  FaRocket,
  FaClock,
  FaMoon,
  FaSun
} from 'react-icons/fa';

// Import the new components
import ProgressIndicator from '../components/onboarding/ProgressIndicator';
import AvatarSelection from '../components/onboarding/AvatarSelection';
import UsernameStep from '../components/onboarding/UsernameStep';
import LearningCategories from '../components/onboarding/LearningCategories';
import UniversitySelection from '../components/onboarding/UniversitySelection';
import FacultySelection from '../components/onboarding/FacultySelection';
import DepartmentSelection from '../components/onboarding/DepartmentSelection';
import LevelSelection from '../components/onboarding/LevelSelection';
import StudyPreferences from '../components/onboarding/StudyPreferences';
import NavigationButtons from '../components/onboarding/NavigationButtons';

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    avatar: user?.avatar || '🎯',
    learningCategories: [],
    university: '',
    faculty: '',
    department: '',
    level: '',
    studyPreferences: {
      frequency: '',
      timeOfDay: '',
      notifications: true
    }
  });
  const [saving, setSaving] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showUniversityStep, setShowUniversityStep] = useState(false);

  // Check if user has Google avatar
  const hasGoogleAvatar = user?.avatar && user.avatar !== '🎯';

  const avatarOptions = [
    { emoji: '🎯', icon: FaBullseye },
    { emoji: '📚', icon: FaBook },
    { emoji: '🧠', icon: FaBrain },
    { emoji: '✏️', icon: FaPencilAlt },
    { emoji: '🎓', icon: FaGraduationCap },
    { emoji: '📖', icon: FaBookOpen },
    { emoji: '🔬', icon: FaFlask },
    { emoji: '💡', icon: FaLightbulb },
    { emoji: '🏆', icon: FaGem },
    { emoji: '⭐', icon: FaStar },
    { emoji: '🌟', icon: FaStar },
    { emoji: '💎', icon: FaGem }
  ];

  const learningCategories = [
    {
      id: 'undergraduate',
      label: 'Undergraduate',
      description: 'Degree Program Support',
      icon: FaUniversity,
      color: 'bg-indigo-500',
      courseCount: 67
    },
    {
      id: 'waec',
      label: 'WAEC',
      description: 'West African Examinations Council',
      icon: FaClipboardList,
      color: 'bg-blue-500',
      courseCount: 45
    },
    {
      id: 'jamb',
      label: 'JAMB',
      description: 'Joint Admissions and Matriculation Board',
      icon: FaGraduationCap,
      color: 'bg-green-500',
      courseCount: 32
    },
    {
      id: 'toefl',
      label: 'TOEFL',
      description: 'Test of English as a Foreign Language',
      icon: FaFlagUsa,
      color: 'bg-orange-500',
      courseCount: 28
    },
    {
      id: 'ielts',
      label: 'IELTS',
      description: 'International English Language Testing',
      icon: FaGlobe,
      color: 'bg-red-500',
      courseCount: 24
    },
    {
      id: 'ican',
      label: 'ICAN',
      description: 'Institute of Chartered Accountants of Nigeria',
      icon: FaGem,
      color: 'bg-teal-500',
      courseCount: 15
    },
    {
      id: 'postutme',
      label: 'Post-UTME',
      description: 'University Admission Screening',
      icon: FaBuilding,
      color: 'bg-purple-500',
      courseCount: 18
    }
  ];

  const nigerianUniversities = [
    'University of Lagos (UNILAG)',
    'University of Ibadan (UI)',
    'Obafemi Awolowo University (OAU)',
    'University of Nigeria, Nsukka (UNN)',
    'Ahmadu Bello University (ABU)',
    'University of Benin (UNIBEN)',
    'Federal University of Technology, Akure (FUTA)',
    'Lagos State University (LASU)',
    'Nnamdi Azikiwe University (UNIZIK)',
    'University of Ilorin (UNILORIN)',
    'Bayero University, Kano (BUK)',
    'University of Port Harcourt (UNIPORT)',
    'Federal University, Oye-Ekiti (FUOYE)',
    'Ekiti State University (EKSU)',
    'Adekunle Ajasin University (AAUA)',
    'Other Nigerian University'
  ];

  const faculties = [
    'Faculty of Arts',
    'Faculty of Science',
    'Faculty of Engineering',
    'Faculty of Medicine',
    'Faculty of Law',
    'Faculty of Business Administration',
    'Faculty of Education',
    'Faculty of Agriculture',
    'Faculty of Social Sciences',
    'Faculty of Environmental Sciences',
    'Faculty of Pharmacy',
    'Faculty of Dentistry',
    'Faculty of Veterinary Medicine',
    'Faculty of Computing',
    'Faculty of Basic Medical Sciences'
  ];

  const departmentsByFaculty = {
    'Faculty of Arts': [
      'English Language',
      'History and International Studies',
      'Linguistics',
      'Theatre Arts',
      'Philosophy',
      'Religious Studies',
      'Music',
      'Fine Arts',
      'Foreign Languages'
    ],
    'Faculty of Science': [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Biochemistry',
      'Microbiology',
      'Computer Science',
      'Statistics',
      'Geology',
      'Botany',
      'Zoology'
    ],
    'Faculty of Engineering': [
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Chemical Engineering',
      'Petroleum Engineering',
      'Computer Engineering',
      'Biomedical Engineering',
      'Aerospace Engineering',
      'Agricultural Engineering'
    ],
    'Faculty of Medicine': [
      'Medicine and Surgery',
      'Nursing Science',
      'Medical Laboratory Science',
      'Radiography',
      'Physiotherapy',
      'Anatomy',
      'Physiology'
    ],
    'Faculty of Law': [
      'Law'
    ],
    'Faculty of Business Administration': [
      'Accounting',
      'Business Administration',
      'Finance',
      'Marketing',
      'Management',
      'Economics',
      'Banking and Finance'
    ],
    'Faculty of Education': [
      'Education Arts',
      'Education Science',
      'Education Social Science',
      'Education Foundation',
      'Curriculum Studies',
      'Educational Management',
      'Guidance and Counseling'
    ],
    'Faculty of Agriculture': [
      'Agronomy',
      'Animal Science',
      'Agricultural Economics',
      'Agricultural Extension',
      'Soil Science',
      'Crop Science',
      'Fisheries',
      'Forestry'
    ],
    'Faculty of Social Sciences': [
      'Sociology',
      'Psychology',
      'Political Science',
      'Geography',
      'Economics',
      'International Relations',
      'Public Administration'
    ],
    'Faculty of Environmental Sciences': [
      'Architecture',
      'Estate Management',
      'Urban and Regional Planning',
      'Surveying and Geoinformatics',
      'Building Technology'
    ],
    'Faculty of Pharmacy': [
      'Pharmacy'
    ],
    'Faculty of Dentistry': [
      'Dentistry'
    ],
    'Faculty of Veterinary Medicine': [
      'Veterinary Medicine'
    ],
    'Faculty of Computing': [
      'Computer Science',
      'Information Technology',
      'Software Engineering',
      'Cybersecurity',
      'Data Science'
    ],
    'Faculty of Basic Medical Sciences': [
      'Anatomy',
      'Physiology',
      'Biochemistry',
      'Pharmacology',
      'Medical Laboratory Science'
    ]
  };

  const levels = [
    '100 Level (Freshman)',
    '200 Level (Sophomore)',
    '300 Level (Junior)',
    '400 Level (Senior)',
    '500 Level (Graduate)',
    '600 Level (Postgraduate)'
  ];

  const studyFrequencies = [
    { value: 'daily', label: 'Daily Study', description: 'Regular daily practice' },
    { value: 'weekends', label: 'Weekend Study', description: 'Focused weekend sessions' },
    { value: 'flexible', label: 'As Needed', description: 'Study when convenient' }
  ];

  const studyTimes = [
    { value: 'morning', label: 'Morning (6AM-12PM)', description: 'Early bird learner', icon: FaSun },
    { value: 'afternoon', label: 'Afternoon (12PM-6PM)', description: 'Midday study time', icon: FaSun },
    { value: 'evening', label: 'Evening (6PM-12AM)', description: 'Night owl learner', icon: FaMoon },
    { value: 'flexible', label: 'Flexible', description: 'Anytime works for me', icon: FaClock }
  ];

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) return;

    setUsernameChecking(true);
    try {
      const response = await axios.get(`/api/users/check-username/${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Username check failed:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Debounced username checking
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        checkUsernameAvailability(formData.username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.username]);

  // Check if university step should be shown
  useEffect(() => {
    const shouldShowUniversity = formData.learningCategories.includes('undergraduate') ||
                                formData.learningCategories.includes('postutme');
    setShowUniversityStep(shouldShowUniversity);

    // Clear university and academic fields if not needed
    if (!shouldShowUniversity) {
      setFormData(prev => ({
        ...prev,
        university: '',
        faculty: '',
        department: '',
        level: ''
      }));
    }
  }, [formData.learningCategories]);

  // Clear academic fields when university changes
  useEffect(() => {
    if (!formData.university) {
      setFormData(prev => ({
        ...prev,
        faculty: '',
        department: '',
        level: ''
      }));
    }
  }, [formData.university]);

  // Clear department and level when faculty changes
  useEffect(() => {
    if (!formData.faculty) {
      setFormData(prev => ({
        ...prev,
        department: '',
        level: ''
      }));
    }
  }, [formData.faculty]);

  // Clear level when department changes
  useEffect(() => {
    if (!formData.department) {
      setFormData(prev => ({
        ...prev,
        level: ''
      }));
    }
  }, [formData.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      learningCategories: prev.learningCategories.includes(categoryId)
        ? prev.learningCategories.filter(id => id !== categoryId)
        : [...prev.learningCategories, categoryId]
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      studyPreferences: {
        ...prev.studyPreferences,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    const maxSteps = getMaxSteps();
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const onboardingData = {
        username: formData.username,
        // Only include avatar if user doesn't have Google avatar
        ...(hasGoogleAvatar ? {} : { avatar: formData.avatar }),
        learningCategories: formData.learningCategories,
        isUndergraduate: formData.learningCategories.includes('undergraduate'),
        university: formData.university,
        faculty: formData.faculty,
        department: formData.department,
        level: formData.level,
        studyPreferences: {
          frequency: formData.studyPreferences.frequency || 'flexible',
          timeOfDay: formData.studyPreferences.timeOfDay || 'flexible',
          notifications: formData.studyPreferences.notifications
        },
        onboardingCompleted: true
      };

      await updateProfile(onboardingData);
      toast.success('Welcome to TestMancer!', {
        icon: <FaRocket className="text-blue-500" />,
      });

      // Redirect to the intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    // For users with Google avatar, username is step 1, so we don't shift it
    if (hasGoogleAvatar && step === 1) {
      return formData.username.trim().length >= 3 &&
             formData.username.trim().length <= 20 &&
             usernameAvailable === true;
    }

    const actualStep = hasGoogleAvatar ? step : step - 1;

    switch (actualStep) {
      case 1:
        return formData.username.trim().length >= 3 &&
               formData.username.trim().length <= 20 &&
               usernameAvailable === true;
      case 2:
        return formData.learningCategories.length > 0;
      case 3:
        return showUniversityStep ? formData.university.length > 0 : true;
      case 4:
        return showUniversityStep && formData.university
          ? formData.faculty.length > 0
          : formData.studyPreferences.frequency.length > 0 &&
            formData.studyPreferences.timeOfDay.length > 0;
      case 5:
        return showUniversityStep && formData.university && formData.faculty
          ? formData.department.length > 0
          : formData.studyPreferences.frequency.length > 0 &&
            formData.studyPreferences.timeOfDay.length > 0;
      case 6:
        return showUniversityStep && formData.university && formData.faculty && formData.department
          ? formData.level.length > 0
          : formData.studyPreferences.frequency.length > 0 &&
            formData.studyPreferences.timeOfDay.length > 0;
      case 7:
        return formData.studyPreferences.frequency.length > 0 &&
               formData.studyPreferences.timeOfDay.length > 0;
      case 8:
        return formData.studyPreferences.frequency.length > 0 &&
               formData.studyPreferences.timeOfDay.length > 0;
      default:
        return false;
    }
  };

  const generateUsername = () => {
    const adjectives = ['Smart', 'Brilliant', 'Clever', 'Wise', 'Quick', 'Sharp'];
    const nouns = ['Scholar', 'Student', 'Learner', 'Thinker', 'Mind', 'Brain'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const suggestedUsername = `${randomAdj}${randomNoun}${randomNum}`;

    setFormData(prev => ({ ...prev, username: suggestedUsername }));
  };

  const getMaxSteps = () => {
    let steps = 4; // avatar/username, username/categories, categories, preferences

    if (showUniversityStep) {
      steps += 1; // university step
      if (formData.university) {
        steps += 1; // faculty step
        if (formData.faculty) {
          steps += 1; // department step
          if (formData.department) {
            steps += 1; // level step
          }
        }
      }
    }

    return hasGoogleAvatar ? steps - 1 : steps;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <ProgressIndicator
          step={step}
          getMaxSteps={getMaxSteps}
          hasGoogleAvatar={hasGoogleAvatar}
          showUniversityStep={showUniversityStep}
          formData={formData}
        />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Avatar Step - Only show if no Google avatar */}
          {step === 1 && !hasGoogleAvatar && (
            <AvatarSelection
              avatarOptions={avatarOptions}
              formData={formData}
              handleAvatarSelect={handleAvatarSelect}
              handleInputChange={handleInputChange}
              usernameChecking={usernameChecking}
              usernameAvailable={usernameAvailable}
              generateUsername={generateUsername}
            />
          )}

          {/* Username Step */}
          {step === (hasGoogleAvatar ? 1 : 2) && (
            <UsernameStep
              formData={formData}
              handleInputChange={handleInputChange}
              usernameChecking={usernameChecking}
              usernameAvailable={usernameAvailable}
              generateUsername={generateUsername}
            />
          )}

          {/* Learning Categories Step */}
          {step === (hasGoogleAvatar ? 2 : 3) && (
            <LearningCategories
              learningCategories={learningCategories}
              formData={formData}
              handleCategoryToggle={handleCategoryToggle}
            />
          )}

          {step === (hasGoogleAvatar ? 3 : 4) && showUniversityStep && (
            <UniversitySelection
              nigerianUniversities={nigerianUniversities}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {/* Faculty Selection Step */}
          {step === (hasGoogleAvatar ? 4 : 5) && showUniversityStep && formData.university && (
            <FacultySelection
              faculties={faculties}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {/* Department Selection Step */}
          {step === (hasGoogleAvatar ? 5 : 6) && showUniversityStep && formData.university && formData.faculty && (
            <DepartmentSelection
              departmentsByFaculty={departmentsByFaculty}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {/* Level Selection Step */}
          {step === (hasGoogleAvatar ? 6 : 7) && showUniversityStep && formData.university && formData.faculty && formData.department && (
            <LevelSelection
              levels={levels}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {((step === (hasGoogleAvatar ? 3 : 4) && !showUniversityStep) ||
            (step === (hasGoogleAvatar ? 4 : 5) && showUniversityStep && !formData.university) ||
            (step === (hasGoogleAvatar ? 7 : 8) && showUniversityStep && formData.university && formData.faculty && formData.department && formData.level)) && (
            <StudyPreferences
              studyFrequencies={studyFrequencies}
              studyTimes={studyTimes}
              formData={formData}
              handlePreferenceChange={handlePreferenceChange}
            />
          )}

        </div>

        {/* Navigation */}
        <NavigationButtons
          step={step}
          getMaxSteps={getMaxSteps}
          canProceed={canProceed}
          saving={saving}
          prevStep={prevStep}
          nextStep={nextStep}
          handleComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default Onboarding;
