import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubAdminCoursesManagement from '../subadmin/SubAdminCoursesManagement';
import { mockAuthContext } from '../../test-setup';

// Mock the API calls
jest.mock('../../utils/adminApi', () => ({
  createCourse: jest.fn(),
  getCourses: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
  createModule: jest.fn(),
  createPage: jest.fn()
}));

const mockAdminApi = require('../../utils/adminApi');

describe('SubAdminCoursesManagement UI Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Course Creation Flow', () => {
    it('should render course creation form with structure fields', () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      // Check if the main form elements are present
      expect(screen.getByText(/Create New Course/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it('should show structure type selector', () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      const structureTypeSelect = screen.getByLabelText(/Structure Type/i);
      expect(structureTypeSelect).toBeInTheDocument();

      // Check if all unit types are available
      expect(screen.getByRole('option', { name: 'Module' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Chapter' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Section' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Topic' })).toBeInTheDocument();
    });

    it('should show unit count input', () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      const unitCountInput = screen.getByLabelText(/Unit Count/i);
      expect(unitCountInput).toBeInTheDocument();
      expect(unitCountInput).toHaveAttribute('type', 'number');
      expect(unitCountInput).toHaveAttribute('min', '1');
      expect(unitCountInput).toHaveAttribute('max', '100');
    });

    it('should create course with structure data', async () => {
      mockAdminApi.createCourse.mockResolvedValueOnce({
        data: {
          course: {
            _id: 'test-course-id',
            title: 'Test Course',
            courseCode: 'TEST101',
            structure: {
              unitType: 'chapter',
              unitLabel: 'Chapter',
              unitCount: 5
            }
          }
        }
      });

      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      // Fill out the form
      await user.type(screen.getByLabelText(/Course Title/i), 'Test Course');
      await user.type(screen.getByLabelText(/Course Code/i), 'TEST101');
      await user.type(screen.getByLabelText(/Description/i), 'Test course description');

      // Select structure type
      const structureSelect = screen.getByLabelText(/Structure Type/i);
      await user.selectOptions(structureSelect, 'chapter');

      // Set unit count
      const unitCountInput = screen.getByLabelText(/Unit Count/i);
      await user.clear(unitCountInput);
      await user.type(unitCountInput, '5');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Create Course/i });
      await user.click(submitButton);

      // Verify API was called with correct structure data
      await waitFor(() => {
        expect(mockAdminApi.createCourse).toHaveBeenCalledWith({
          title: 'Test Course',
          courseCode: 'TEST101',
          description: 'Test course description',
          structure: {
            unitType: 'chapter',
            unitLabel: 'Chapter',
            unitCount: 5
          }
        });
      });
    });

    it('should validate unit count range', async () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      const unitCountInput = screen.getByLabelText(/Unit Count/i);

      // Test minimum value
      await user.clear(unitCountInput);
      await user.type(unitCountInput, '0');
      expect(unitCountInput).toBeInvalid();

      // Test maximum value
      await user.clear(unitCountInput);
      await user.type(unitCountInput, '101');
      expect(unitCountInput).toBeInvalid();

      // Test valid value
      await user.clear(unitCountInput);
      await user.type(unitCountInput, '5');
      expect(unitCountInput).toBeValid();
    });
  });

  describe('Course Management Actions', () => {
    const mockCourses = [
      {
        _id: 'course1',
        title: 'Course 1',
        courseCode: 'CRS101',
        structure: { unitType: 'module', unitLabel: 'Module', unitCount: 3 },
        modules: []
      },
      {
        _id: 'course2',
        title: 'Course 2',
        courseCode: 'CRS102',
        structure: { unitType: 'chapter', unitLabel: 'Chapter', unitCount: 5 },
        modules: []
      }
    ];

    beforeEach(() => {
      mockAdminApi.getCourses.mockResolvedValueOnce({ data: { courses: mockCourses } });
    });

    it('should display courses list with structure information', async () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('Course 1')).toBeInTheDocument();
        expect(screen.getByText('Course 2')).toBeInTheDocument();
      });

      // Check if structure information is displayed
      expect(screen.getByText(/3 Modules/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Chapters/i)).toBeInTheDocument();
    });

    it('should show manage action for each course', async () => {
      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      await waitFor(() => {
        const manageButtons = screen.getAllByRole('button', { name: /Manage/i });
        expect(manageButtons).toHaveLength(2);
      });
    });
  });

  describe('Unit Creation Flow', () => {
    it('should create unit with required fields', async () => {
      mockAdminApi.createModule.mockResolvedValueOnce({
        data: {
          module: {
            _id: 'test-module-id',
            title: 'Test Chapter',
            order: 1,
            estimatedTime: 60
          }
        }
      });

      render(
        <div>
          <SubAdminCoursesManagement />
        </div>
      );

      // Assuming we have a way to navigate to unit creation
      // This would be tested when the manage course flow is opened
      const unitTitleInput = screen.getByLabelText(/Unit Title/i);
      const unitDescriptionInput = screen.getByLabelText(/Description/i);
      const orderInput = screen.getByLabelText(/Order/i);
      const timeInput = screen.getByLabelText(/Estimated Time/i);

      await user.type(unitTitleInput, 'Test Chapter');
      await user.type(unitDescriptionInput, 'Chapter description');
      await user.type(orderInput, '1');
      await user.type(timeInput, '60');

      const createButton = screen.getByRole('button', { name: /Create Unit/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockAdminApi.createModule).toHaveBeenCalledWith('course-id', {
          title: 'Test Chapter',
          description: 'Chapter description',
          order: 1,
          estimatedTime: 60
        });
      });
    });
  });
});
