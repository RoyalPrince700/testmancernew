# TestMancer Frontend UI Test Suite

This directory contains UI tests for the TestMancer frontend, focusing on critical user flows and component interactions.

## Test Setup

### Dependencies
- Jest
- React Testing Library
- User Event
- jsdom environment

### Configuration
- `jest.config.js`: Jest configuration for React testing
- `babel.config.js`: Babel presets for JSX transformation
- `test-setup.js`: Global test configuration and mocks

### Running Tests

```bash
# From frontend directory
npm test
npm run test:watch
npm run test:coverage
```

## Test Files

### SubAdminCoursesManagement.test.jsx
Tests the subadmin course creation and management interface:

**Course Creation Flow:**
- ✅ Structure type selector (Chapter/Module/Section/Topic)
- ✅ Unit count validation (1-100 range)
- ✅ Form submission with structure metadata
- ✅ API integration for course creation

**Course Management:**
- ✅ Course listing with structure information
- ✅ Dynamic unit label display
- ✅ Manage action availability
- ✅ Unit creation within courses

### QuizFlow.test.jsx
Tests quiz creation and taking workflows:

**Quiz Creation (Subadmin):**
- ✅ Unit-triggered quiz creation
- ✅ Page-triggered quiz creation with pageOrder
- ✅ Quiz builder form validation
- ✅ API integration for quiz persistence

**Quiz Taking (Student):**
- ✅ Quiz question display
- ✅ Answer selection and submission
- ✅ Score calculation and display
- ✅ Real-time validation

**Quiz Results:**
- ✅ Gem earning display (attempt vs lifetime)
- ✅ Partial correct answer handling
- ✅ Repeat attempt gem logic
- ✅ Progress tracking integration

## Mock Strategy

### API Mocks
```javascript
jest.mock('../../utils/adminApi', () => ({
  createCourse: jest.fn(),
  getCourses: jest.fn(),
  createQuiz: jest.fn(),
  submitQuiz: jest.fn()
}));
```

### Context Mocks
- AuthContext: User authentication state
- Router: React Router navigation
- External libraries: Framer Motion, React Hot Toast

### Component Isolation
- Higher-order components mocked
- External dependencies stubbed
- Focus on component logic, not implementation details

## Test Patterns

### Component Testing
```javascript
render(
  <div>
    <ComponentToTest prop={value} />
  </div>
);

expect(screen.getByText('Expected Text')).toBeInTheDocument();
```

### User Interaction Testing
```javascript
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'test value');
await user.selectOptions(select, 'option-value');
```

### Form Testing
```javascript
await user.type(screen.getByLabelText('Field Label'), 'value');
await user.click(screen.getByRole('button', { name: 'Submit' }));

await waitFor(() => {
  expect(mockApiCall).toHaveBeenCalledWith(expectedData);
});
```

### Async Testing
```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded Content')).toBeInTheDocument();
});
```

## Coverage Areas

### User Roles
- ✅ Subadmin: Course and quiz creation
- ✅ Student: Quiz taking and progress tracking
- ✅ Admin: System management (future)

### Critical Flows
- ✅ Course creation with structure
- ✅ Unit/page content management
- ✅ Quiz authoring and publishing
- ✅ Quiz attempt and scoring
- ✅ Gem earning and display

### Edge Cases
- ✅ Form validation errors
- ✅ Network failure handling
- ✅ Permission restrictions
- ✅ Empty state handling
- ✅ Loading state management

## Future Enhancements

- Visual regression testing
- Accessibility testing
- Cross-browser compatibility
- Mobile responsiveness testing
- Performance testing
- End-to-end Cypress tests
