# Enhanced Package Master Application

## Overview
This Angular 16 application implements an Enhanced Package Master functionality for spa/wellness centers based on comprehensive requirements. The application allows creating flexible spa packages with various rules and booking configurations.

## Features Implemented

### 1. Enhanced Package Master Functionality
- **Parallel Booking Rules**: Checkbox to define if all services must be availed together
- **Gender-Specific Availability**: Dropdown to restrict packages by gender (All/Females/Males)
- **Fixed vs Customizable Packages**: Option to create packages with predefined services or allow client selection
- **Admin Configurability**: Validity extensions, complimentary options, and renewal settings
- **Package Type**: Pre-paid vs Post-paid package options
- **Service Sequencing**: Option to enforce service order
- **Counter Sale**: Only pre-paid packages visible for counter sales

### 2. Package Management
- Create and edit packages with comprehensive validation
- Service/product rate details with individual pricing
- Dynamic service selection based on package type
- Outlet-specific configurations
- Extension rules and renewal settings

### 3. Appointment Booking
- Client selection and management
- Package-based appointment booking
- Service selection within packages
- Parallel booking warnings and confirmations
- Payment type handling (pre-paid/post-paid)
- Sequence-based service selection

### 4. Package Listing
- Comprehensive table view of all packages
- Filter and search functionality
- Status management (Active/Inactive)
- Quick actions for edit, delete, and status toggle
- Detailed package information display

## Technical Stack

- **Angular**: 16.2.0
- **Angular Material**: 16.2.0 (for UI components)
- **Bootstrap**: 5.3.0 (for additional styling)
- **TypeScript**: 5.1.0
- **RxJS**: 7.8.0 (for reactive programming)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── package-master/          # Package creation/editing
│   │   ├── package-listing/         # Package management table
│   │   └── appointment/            # Appointment booking
│   ├── services/
│   │   ├── package.service.ts      # Package data management
│   │   └── validation.service.ts   # Custom form validators
│   ├── models/
│   │   └── package.model.ts        # Data models and interfaces
│   ├── shared/                     # Shared components (if any)
│   └── styles/                     # Global styles
└── assets/                         # Static assets
```

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Steps to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Angular CLI** (if not already installed)
   ```bash
   npm install -g @angular/cli@16
   ```

3. **Start Development Server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open Browser**
   Navigate to `http://localhost:4200`

## Package Creation Features

### Basic Package Information
- Package name with validation (no special characters)
- Description and validity period
- Status management (Active/Inactive)

### Package Rules
- **Booked in Parallel**: All services must be availed simultaneously
- **Available For**: Gender restrictions (All/Females/Males)
- **Package Type**: Fixed (predefined services) or Customizable (client selects from pool)

### Customizable Package Settings
- Minimum selectable services
- Maximum selectable services
- Validation to ensure min ≤ max

### Payment & Sharing Options
- **Payment Type**: Pre-paid or Post-paid
- **Sharer Package**: Services can be shared with others
- **Follow Sequence**: Services must be taken in order

### Extension Settings
- Extension fee configuration
- Complimentary extension option (automatically sets fee to zero)
- Maximum number of extensions allowed
- Available extension durations (15, 30, 60, 90 days)
- Auto vs Manual renewal options

### Service Configuration
- Dynamic service selection from available services
- Individual service rate configuration
- Sequence number assignment for ordered services
- Real-time rate calculation

## Appointment Booking Features

### Client Management
- Client selection from pre-defined list
- Gender-based package filtering
- Client information display

### Package Selection
- Available packages based on client gender
- Package details display with rules and restrictions
- Service selection within packages

### Service Selection Rules
- **Fixed Packages**: All services pre-selected
- **Customizable Packages**: Client selects within min/max limits
- **Parallel Booking**: Warning when deselecting services
- **Sequence-based**: Services numbered and ordered

### Payment Summary
- Real-time total calculation
- Payment type indication
- Service count display

## Package Listing Features

### Comprehensive Table View
- Package name and description
- Services list with chips (showing first 2 + count)
- Validity and renewal information
- Extension rules and available durations
- Package type indicators
- Gender and sharing information
- Rate calculations
- Status indicators

### Table Actions
- Edit package (navigates to package master)
- Toggle active/inactive status
- Delete package with confirmation
- Search and filter functionality
- Pagination support
- Sortable columns

## Data Models

### Package Interface
```typescript
interface Package {
  id?: number;
  name: string;
  description?: string;
  validity: number;
  isBookedInParallel: boolean;
  availableFor: 'All' | 'Females' | 'Males';
  packageType: 'Fixed' | 'Customizable';
  minSelectableServices?: number;
  maxSelectableServices?: number;
  extensionFee: number;
  isComplimentaryExtension: boolean;
  maxExtensions: number;
  availableDurations: number[];
  renewalType: 'Auto' | 'Manual';
  paymentType: 'Pre-paid' | 'Post-paid';
  isSharerPackage: boolean;
  followSequence: boolean;
  services: PackageService[];
  isActive: boolean;
}
```

## Custom Validations

### Package Name Validator
- Prevents special characters in package names
- Allows alphanumeric characters and spaces

### Min-Max Service Validator
- Ensures minimum selectable ≤ maximum selectable
- Cross-field validation for customizable packages

### Extension Fee Validator
- Sets fee to zero when complimentary option is selected
- Prevents manual fee entry for complimentary extensions

### Sequence Validator
- Validates sequence numbers (1-100)
- Ensures proper ordering for sequential services

## UI Components Used

### Angular Material Components
- Mat-Card for section containers
- Mat-Form-Field for input fields
- Mat-Select for dropdowns
- Mat-Checkbox for boolean options
- Mat-Radio for single selections
- Mat-Slide-Toggle for status
- Mat-Table for data display
- Mat-Chip for tags and indicators
- Mat-Icon for visual elements
- Mat-Snackbar for notifications
- Mat-Dialog for confirmations
- Mat-Datepicker for date selection
- Mat-Expansion-Panel for collapsible content

### Bootstrap Classes
- Grid system for responsive layout
- Utility classes for spacing and alignment
- Custom CSS for enhanced styling

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

Potential areas for expansion:
1. Backend API integration
2. User authentication and authorization
3. Advanced reporting and analytics
4. Email/SMS notifications
5. Calendar integration
6. Payment gateway integration
7. Multi-language support
8. Advanced search and filtering
9. Export functionality (PDF/Excel)
10. Real-time updates using WebSockets

## Development Notes

### Code Organization
- Components are feature-based and modular
- Services handle business logic and data management
- Models define type safety throughout the application
- Reactive forms with comprehensive validation
- Consistent naming conventions and code structure

### Best Practices Followed
- TypeScript strict mode enabled
- OnPush change detection where applicable
- Memory leak prevention with proper subscriptions
- Accessible UI components
- SEO-friendly structure
- Error handling and user feedback
- Loading states and user experience considerations

## Testing

The application includes:
- Component unit tests
- Service unit tests
- Integration tests
- End-to-end test setup

To run tests:
```bash
npm test                # Unit tests
npm run e2e            # E2E tests
npm run test:coverage  # Coverage report
```

## Build and Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is created for demonstration purposes and includes comprehensive package management functionality for spa/wellness centers.

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.
