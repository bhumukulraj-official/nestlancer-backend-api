## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

- [ ] ✨ Feature – New functionality
- [ ] 🐛 Bug Fix – Fixes an issue
- [ ] ♻️ Refactor – Code restructuring without behavior change
- [ ] 📝 Documentation – Documentation updates only
- [ ] 🔧 Chore – Build, CI, tooling, dependencies
- [ ] ⚡ Performance – Performance improvement
- [ ] 🧪 Test – Adding or updating tests

## Related Issue

<!-- Link to the related issue: Fixes #123 / Closes #123 / Related to #123 -->
Fixes #

## Changes Made

<!-- List the key changes made in this PR -->

-
-
-

## Checklist

### Code Quality
- [ ] My code follows the project's coding standards (`docs/guides/coding-standards.md`)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary (complex logic, non-obvious decisions)
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or lint errors

### Testing
- [ ] I have added unit tests covering the new/changed code
- [ ] I have added integration tests where applicable
- [ ] All new and existing tests pass (`pnpm test`)
- [ ] Code coverage has not decreased

### Database
- [ ] No database migrations required
- [ ] Database migrations are included and have been tested
- [ ] Migrations are backward compatible (can rollback safely)

### API
- [ ] No API changes
- [ ] API changes are backward compatible (no breaking changes in v1)
- [ ] OpenAPI spec has been updated
- [ ] New endpoints follow the standard response envelope format

### Security
- [ ] No security implications
- [ ] Input validation is implemented for all new endpoints
- [ ] Authentication and authorization are properly enforced
- [ ] No sensitive data is logged or exposed in responses

## Testing Done

<!-- Describe how you tested the changes -->

### Unit Tests
- [ ] Ran `pnpm test` – all passing

### Integration Tests
- [ ] Ran `pnpm test:integration` – all passing

### Manual Testing
<!-- Describe any manual testing performed -->

## Screenshots

<!-- If applicable, add screenshots for UI-related changes -->

## Deployment Notes

<!-- Any special steps or considerations needed for deployment -->

- [ ] No special deployment steps required
- [ ] Environment variables need to be added/updated
- [ ] Feature flags need to be configured
- [ ] Cache invalidation required
- [ ] Worker scaling adjustments needed

## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on -->
