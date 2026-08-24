# Contributing to Project HAAT Core

Thank you for your interest in contributing to the Project HAAT Just-In-Time (JIT) compilation architecture. We value rigorous engineering standards, minimal memory footprints, and clean, modular design principles.

## Getting Started
1. **Fork the Repository**: Create your own workspace fork under your GitHub handle or organization.
2. **Clone Locally**: Clone your fork to your local environment and ensure you have Go 1.22+ and Git installed.
3. **Branching Strategy**: Always create feature or fix branches from `main` using descriptive naming conventions:
   - `feature/your-module-name`
   - `fix/issue-description`
   - `refactor/performance-tweak`

## Adding Complex Components & Modules
When contributing new interactive components (such as sliders, data grids, modals, or custom widgets), strict architectural rules apply:
- **Directory Structure**: Every component must reside in its own dedicated directory inside the root `./templates/{modulname}/` path.
- **Asset Separation**: Provide standalone, optimized files for styling (`{modulname}.css`) and runtime behavior (`{modulname}.js`).
- **Registry Registration**: Update the central `components.json` manifest file to register your module paths correctly so the in-memory loader can index them at startup.
- **Design System Compliance**: Ensure all custom CSS stylesheets adhere to high-contrast, modern styling principles (utilizing robust variables and structural layouts).

## Pull Request Guidelines
- Ensure all automated continuous integration (CI) workflows pass successfully before requesting a review.
- Write clear, concise commit messages explaining the technical rationale behind changes.
- Avoid introducing external runtime dependencies unless explicitly approved by the core maintainers.