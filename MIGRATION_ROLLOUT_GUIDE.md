# Migration Rollout Guide: Structured Courses Feature

## Overview

This guide provides step-by-step instructions for deploying the structured courses feature to production environments. The feature introduces hierarchical course organization, page-based content delivery, and context-aware quizzes with first-attempt gem rewards.

## Pre-Deployment Preparation

### Environment Assessment
- [ ] **Database Backup**: Create full backup of production MongoDB database
- [ ] **Storage Verification**: Confirm Cloudinary credentials and quotas
- [ ] **API Compatibility**: Verify all dependent services are compatible
- [ ] **Performance Baseline**: Record current system performance metrics

### Team Coordination
- [ ] **Admin Training**: Train admins on new structured courses interface
- [ ] **Content Migration Plan**: Identify courses requiring structure updates
- [ ] **Communication Plan**: Prepare user notifications and support responses
- [ ] **Rollback Plan**: Document complete rollback procedure

### Infrastructure Requirements
- [ ] **MongoDB**: Version 4.4+ with sufficient storage for new fields
- [ ] **Node.js**: Version 16+ for backend services
- [ ] **Cloudinary**: Configured with adequate storage limits
- [ ] **CDN**: Updated for new media asset URLs

## Migration Scripts Overview

### Available Migration Scripts
Located in `backend/scripts/` directory:

- `migrate-m0.js`: Baseline migration (roles and categories)
- `migrate-m1.js`: Course structure migration (adds structure fields)
- `migrate-m2.js`: Page-based content migration (existing)
- `migrate-m3.js`: Advanced permissions migration (existing)

### New Migration Script: `migrate-structured-courses.js`
```javascript
// Adds structure metadata to existing courses
// Converts existing modules to units with backward compatibility
// Updates quiz triggers and adds pageOrder fields
// Initializes earnedGems tracking for existing users
```

## Deployment Phases

### Phase 1: Database Migration (Zero Downtime)

#### Step 1: Dry Run Migration
```bash
# In staging environment first
cd backend
npm run migrate:structured-courses -- --dry-run --verbose

# Review migration output for:
# - Courses to be updated
# - Structure assignments
# - Potential data conflicts
```

#### Step 2: Production Migration
```bash
# Execute with monitoring
npm run migrate:structured-courses -- --environment production --backup

# Monitor migration progress:
# - MongoDB operation logs
# - Application performance metrics
# - Error logs for failed operations
```

#### Step 3: Migration Verification
```bash
# Verify migration success
npm run migrate:verify-structured-courses

# Check key metrics:
# - All courses have structure fields
# - Existing modules preserved
# - Quiz triggers updated
# - No data corruption
```

### Phase 2: Backend Deployment

#### Step 1: Feature Flag Activation
```bash
# Deploy with structured courses disabled initially
export STRUCTURED_COURSES_ENABLED=false
npm run deploy:backend
```

#### Step 2: Health Checks
```bash
# Verify backend deployment
curl -f https://api.testmancer.com/health

# Test key endpoints:
curl -f https://api.testmancer.com/api/courses
curl -f https://api.testmancer.com/api/quizzes/unit/test-id
```

#### Step 3: Admin Interface Deployment
```bash
# Deploy admin interface with new features
npm run deploy:admin-frontend

# Verify admin access:
# - New course creation form
# - Unit management interface
# - Quiz builder with trigger selection
```

### Phase 3: Frontend Deployment

#### Step 1: Student Interface Update
```bash
# Deploy student-facing interface
npm run deploy:student-frontend

# Test user flows:
# - Course browsing with structure display
# - Unit navigation
# - Page viewing with media
# - Quiz taking with gem rewards
```

#### Step 2: Feature Toggle Activation
```bash
# Enable structured courses feature
export STRUCTURED_COURSES_ENABLED=true
npm run deploy:backend

# Gradual rollout if needed:
# - Enable for 10% of users initially
# - Monitor for issues
# - Gradually increase to 100%
```

## Post-Deployment Verification

### Functional Testing

#### Admin Features
- [ ] Create new course with structure selection
- [ ] Add units with proper ordering
- [ ] Create pages with rich content and media
- [ ] Build unit-triggered and page-triggered quizzes
- [ ] Verify subadmin scope restrictions

#### Student Features
- [ ] Browse courses with structure information
- [ ] Navigate through units and pages
- [ ] Take quizzes and earn gems appropriately
- [ ] View progress tracking
- [ ] Experience seamless content flow

#### API Endpoints
- [ ] Course listing with structure metadata
- [ ] Unit retrieval (modules alias)
- [ ] Page content delivery
- [ ] Quiz triggering logic
- [ ] Gem reward calculations

### Performance Testing

#### Load Testing
```bash
# Test concurrent users accessing structured courses
npm run load-test -- --scenario structured-courses --users 1000

# Monitor key metrics:
# - API response times (< 500ms)
# - Database query performance
# - Media delivery speeds
# - Quiz submission processing
```

#### Database Performance
```bash
# Analyze query patterns
npm run db:analyze-queries

# Check for:
# - New index utilization
# - Query optimization opportunities
# - Connection pool health
```

### Data Integrity Checks

#### Course Structure Validation
```bash
# Verify all courses have valid structure
npm run validate:course-structures

# Check for:
# - Valid unitType enums
# - Proper unitCount values
# - Consistent unit ordering
```

#### Quiz Trigger Validation
```bash
# Ensure all quizzes have valid triggers
npm run validate:quiz-triggers

# Verify:
# - Unit quizzes have moduleId
# - Page quizzes have pageOrder
# - No orphaned quiz associations
```

## Rollback Procedures

### Emergency Rollback (Full Revert)

#### Step 1: Feature Disable
```bash
# Immediately disable structured courses
export STRUCTURED_COURSES_ENABLED=false
npm run deploy:backend
npm run deploy:frontend
```

#### Step 2: Database Rollback
```bash
# Rollback migration changes
npm run migrate:rollback-structured-courses

# This will:
# - Remove structure fields from courses
# - Restore original module structure
# - Reset quiz triggers to 'unit'
# - Remove pageOrder fields
```

#### Step 3: Code Rollback
```bash
# Revert to previous deployment
git checkout <previous-commit-hash>
npm run deploy:full-rollback
```

### Partial Rollback (Selective Features)

#### Option 1: Disable Page Quizzes Only
```bash
# Keep unit structure but disable page quizzes
export PAGE_QUIZZES_ENABLED=false
npm run deploy:backend
```

#### Option 2: Revert to Module Terminology
```bash
# Keep structure but revert to "modules" terminology
export USE_MODULES_TERMINOLOGY=true
npm run deploy:frontend
```

## Monitoring and Alerting

### Key Metrics to Monitor

#### System Health
- API response times and error rates
- Database connection pool usage
- Memory and CPU utilization
- Media delivery success rates

#### Feature Adoption
- Percentage of courses using new structure
- Admin feature usage (unit creation, quiz building)
- Student engagement with structured content
- Quiz completion and gem earning rates

#### Data Quality
- Course structure validation errors
- Quiz trigger consistency
- Media upload success rates
- User progress data integrity

### Alert Configuration

#### Critical Alerts
- Migration script failures
- Database connection issues
- API endpoint failures (>5% error rate)
- Media upload failures

#### Warning Alerts
- Increased response times (>1s)
- High database connection usage (>80%)
- Course structure validation errors
- Quiz submission processing delays

## Troubleshooting Common Issues

### Migration Failures
**Issue**: Migration script fails midway
**Solution**:
1. Check MongoDB connection and permissions
2. Review error logs for specific failure points
3. Use partial rollback to clean failed state
4. Retry migration with `--resume` flag

### API Compatibility Issues
**Issue**: Frontend can't communicate with updated backend
**Solution**:
1. Verify API contract matches frontend expectations
2. Check for breaking changes in response formats
3. Use feature flags to disable problematic endpoints
4. Implement backward compatibility shims

### Performance Degradation
**Issue**: System slowdowns after deployment
**Solution**:
1. Analyze database query performance
2. Check for missing indexes on new fields
3. Implement query optimization
4. Consider read replica for heavy queries

### Content Migration Problems
**Issue**: Existing courses don't display properly
**Solution**:
1. Verify migration correctly set structure fields
2. Check unit ordering and page associations
3. Validate media URL transformations
4. Test with specific course IDs

## Post-Migration Tasks

### Content Migration
- [ ] **Course Updates**: Convert legacy courses to structured format
- [ ] **Admin Training**: Train content creators on new features
- [ ] **Quality Assurance**: Review and update course content
- [ ] **Student Communication**: Notify users of new features

### System Optimization
- [ ] **Index Creation**: Add database indexes for new query patterns
- [ ] **Cache Configuration**: Update caching strategies for structured content
- [ ] **CDN Optimization**: Optimize media delivery for new assets
- [ ] **Monitoring Setup**: Configure comprehensive monitoring

### Documentation Updates
- [ ] **User Guides**: Update student-facing documentation
- [ ] **Admin Training**: Create training materials for new features
- [ ] **API Documentation**: Update API references and examples
- [ ] **Troubleshooting Guide**: Document common issues and solutions

## Success Criteria

### Technical Success
- [ ] Zero data loss during migration
- [ ] All existing functionality preserved
- [ ] New features working as designed
- [ ] Performance meets or exceeds baseline

### User Experience Success
- [ ] Admin can create structured courses easily
- [ ] Students can navigate content intuitively
- [ ] Quiz experience is engaging and fair
- [ ] Progress tracking is clear and accurate

### Business Success
- [ ] Increased course creation activity
- [ ] Higher student engagement metrics
- [ ] Positive user feedback on new features
- [ ] Improved content organization

## Support and Escalation

### During Deployment
- **Technical Issues**: Contact DevOps team immediately
- **Data Concerns**: Escalate to Database Administration
- **User Impact**: Notify Customer Success team
- **Media Issues**: Contact Cloudinary support

### Post-Deployment
- **Bug Reports**: Use GitHub Issues with structured-courses label
- **Feature Requests**: Submit enhancement requests
- **Performance Issues**: Create performance incident tickets
- **User Questions**: Direct to updated documentation

---

**Deployment Commander Checklist**

**Pre-Deployment:**
- [ ] Backup completed and verified
- [ ] Migration dry-run successful
- [ ] Team trained and ready
- [ ] Rollback plan documented

**During Deployment:**
- [ ] Migration executed successfully
- [ ] Services deployed without errors
- [ ] Health checks passing
- [ ] Feature flags configured

**Post-Deployment:**
- [ ] Functional testing completed
- [ ] Performance within acceptable ranges
- [ ] Monitoring alerts configured
- [ ] User communication sent

**Success Confirmation:**
- [ ] All success criteria met
- [ ] No critical issues reported
- [ ] Team confident in stability
- [ ] Documentation updated
