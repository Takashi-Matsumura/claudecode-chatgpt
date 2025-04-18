# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- `npm run dev`: Start development server with turbopack
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Code Style Guidelines
- **TypeScript**: Use strict typing; avoid `any` types when possible
- **Imports**: Use absolute imports with `@/*` path alias
- **Component Structure**: React functional components with TypeScript interfaces for props
- **Naming**: 
  - PascalCase for React components
  - camelCase for variables and functions
  - snake_case for API responses and database fields
- **Formatting**: Standard Next.js/React patterns with 2-space indentation
- **Error Handling**: Use try/catch for async operations; proper error states in components
- **CSS**: Use Tailwind for styling

## Architecture
- Next.js 15 app router with React 19
- TypeScript for type safety
- Tailwind CSS for styling