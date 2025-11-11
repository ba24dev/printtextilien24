# Printshop MVP

This repository contains the source code for the Printshop MVP, a textile printshop built using Next.js 16 and Hydrogen React. The project is designed to be lightweight, modular, and easily extendable.

## Tech Stack

- **Framework**: Next.js 16, React 18, TypeScript
- **Shopify Integration**: Hydrogen React, GraphQL API
- **Database**: Supabase (Postgres)
- **Storage**: Supabase Storage (with future support for R2/S3 via adapter)
- **UI/State Management**: Konva, Zustand/Jotai, React Hook Form
- **Validation**: Zod
- **Search**: Orama
- **Hosting**: Vercel

## Development Plan

The development process is divided into chunks, as outlined in the `docs/Chunks.md` file. Each chunk represents a specific milestone or feature set.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Contributing

Contributions are welcome! Please follow the chunk-based development plan and ensure all code is well-documented and tested.

## License

This project is licensed under the MIT License.
