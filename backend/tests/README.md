# TestMancer Backend Test Suite

This directory contains comprehensive tests for the TestMancer backend, covering all features implemented in Phase 12 and previous phases.

## Test Categories

### 1. Model Structure Tests (`model-structure.test.js`)
Tests the new data model changes introduced in the structured courses feature:

- **Course Model**: Tests for `structure` field with `unitType`, `unitLabel`, and `unitCount`
- **Quiz Model**: Tests for `trigger` (unit/page) and `pageOrder` fields
- **User Model**: Tests for `earnedGems` tracking per quiz question

### 2. Page-Triggered Quiz Tests (`page-triggered-quiz.test.js`)
Tests the page-level quiz functionality:

- Creating quizzes triggered by specific pages
- Retrieving quizzes by course/module/pageOrder
- First-attempt gem logic for page quizzes
- Repeat attempt behavior (no additional gems)

### 3. Integration Tests (`integration-course-creation.test.js`)
End-to-end tests covering the complete subadmin workflow:

- Course creation with structure metadata
- Unit (chapter/module/section/topic) creation
- Page creation with media attachments
- Unit-level and page-level quiz creation
- Student quiz taking and gem earning
- Verification of first-attempt gem logic

### 4. Existing Tests (Enhanced)
- **Quiz Submission Tests** (`quiz-submission.test.js`): Enhanced with new gem logic
- **User Gem Logic Tests** (`user-gem-logic.test.js`): Tests the earnedGems tracking methods

## Test Fixtures (`test-fixtures.js`)

Comprehensive test data and utilities:

- **Test Users**: Subadmin, student, and admin user templates
- **Test Courses**: Various course types (basic, chapter-based, topic-based)
- **Test Modules**: Unit templates with pages
- **Test Quizzes**: Unit-triggered and page-triggered quiz templates
- **Mock Functions**: Authentication and API response mocks
- **Helper Functions**: Test setup and cleanup utilities

## Running Tests

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string configured

### Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/model-structure.test.js

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Environment Variables
- `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://localhost:27017/testmancer-test`)

## Test Coverage

The test suite covers:

### Unit Tests
- ✅ Model validation and structure
- ✅ Business logic methods
- ✅ Data transformation and virtuals
- ✅ Schema constraints and defaults

### Integration Tests
- ✅ Complete user workflows
- ✅ API endpoint interactions
- ✅ Database state changes
- ✅ Cross-model relationships

### Edge Cases
- ✅ First-attempt vs repeat quiz attempts
- ✅ Partial correct answers
- ✅ Validation boundaries
- ✅ Permission checks
- ✅ Error handling

## Key Features Tested

### First-Attempt Gem Logic
- Gems awarded only on first correct attempt per question
- Tracking across multiple quiz attempts
- Per-quiz question gem history
- Lifetime vs attempt-specific gem reporting

### Page-Triggered Quizzes
- Quiz association with specific pages
- Retrieval by course/module/pageOrder
- Page navigation integration
- Media attachment handling

### Structured Course Creation
- Dynamic unit types (chapter/module/section/topic)
- Unit count validation
- Hierarchical content organization
- Subadmin permission enforcement

### UI Integration Points
- Form validation for structure fields
- Dynamic label rendering
- Quiz trigger selection
- Progress and gem display

## Test Architecture

### Mock Strategy
- Axios API calls mocked for isolated testing
- Authentication middleware mocked
- External dependencies stubbed
- Database connections managed per test

### Test Data Management
- Isolated test databases
- Cleanup between test runs
- Reusable fixture data
- Randomized test identifiers

### Assertion Patterns
- Exact value matching for critical logic
- Range validation for dynamic content
- Error condition verification
- State transition testing

## CI/CD Integration

Tests are designed to run in CI environments:
- No external service dependencies (except MongoDB)
- Deterministic test execution
- Clear pass/fail criteria
- Comprehensive error reporting

## Future Enhancements

- API endpoint load testing
- Performance regression tests
- Cross-browser UI testing
- Accessibility testing
- Internationalization testing
