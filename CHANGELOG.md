# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2021-11-15

## Changed
- Fixed the treatment of sensitive data

## [1.1.0] - 2021-11-12
This release includes some major visual changes

## Added
- Use of Bootstrap for UI components
- Summary view, with generic info about Terraform plan
- Search menu for list view with filtering and grouping options

## Changed
- Improve sensitive values management, manage deeply nested sensitive values
- Now only list view or graph view is active at the same time. Added buttons on navbar for selecting views
- Properly manage when resource address has an string index with dots
- Make all elements fit a 1080 screen without scroll
- Reduced navbar size
- Show a single column on detail when action is delete or create
- Don't show unified diff if the field is unchanged
- Update README and gif

## [1.0.1] - 2021-10-25

### Changed
- Fixed docker image generation.

## [1.0.0] - 2021-10-21
This is the first version since the fork from https://github.com/hieven/terraform-visual

### Added
- Support for sensitive values
- Dockerfile
- Improve readibility of focused view by keeping field names as a single line
- List view and reformated layout
- Gradients for create-destroy and destroy-create operations
- Use unified diff style for fields with more than 4 lines
- 'Hide unchanged fields' button
- Changed text color for selected item
- Icons to reprensent fields data type
- Icon to represent if field is changed or not

### Changed
- Increased graph hgap
- Updated `yarn` dependencies

### Removed
- Some useless code

