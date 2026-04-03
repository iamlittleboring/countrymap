# Country Map

An interactive map of country structure built with `React` and `Vite`.

The project is designed to help people understand:
- which institutions exist inside the system;
- how they are placed in the hierarchy;
- how they relate to one another on a visual map;
- which connections can be checked through official sources.

## Overview

`Country Map` combines two ways of exploring a complex public structure:

- `Hierarchy view` shows the system as a tree, making it easy to move from a high-level entity to a specific institution.
- `Mind map view` shows relationships between nodes, including direction, type of connection, and supporting context.

This makes the application useful both as an educational interface and as a practical exploration tool for institutional relationships.

## Features

- Global search with suggestions
- Switch between list view and visual map view
- Highlight matching nodes in search results
- Browse hierarchy levels and child nodes
- Inspect node details and breadcrumb path
- View typed relations between institutions
- Pan, zoom, and focus the active node on the map
- Fullscreen mode for the map canvas
- Interface language switching: `UA` / `EN`
- Theme switching: `Light` / `Dark`
- JSON-driven content and relationship model

## Why This Project Exists

Understanding a country-scale institutional system is difficult when the information is scattered across separate pages, documents, or diagrams.  
This project brings that structure into one place and presents it in a way that is easier to browse, explain, and extend.

It is especially useful for:
- educational projects;
- civic tech initiatives;
- research and explainers;
- internal knowledge maps;
- visualizing large organizational systems.

## Tech Stack

- `React 19`
- `Vite`
- `ESLint`
- native `fetch` for loading JSON data

## Project Structure

The codebase is organized to keep rendering and logic separated:

- `src/components` contains presentational UI components
- `src/screens` contains page-level composition
- `src/lib` contains hooks, utilities, and derived logic
- `src/data` handles loading and hydrating the map data
- `public/assets/countrymap` contains the JSON content for nodes and relations

This structure makes it easier to evolve the data model independently from the interface.

## Data Model

The application reads its content from `public/assets/countrymap`.

Main files:

- `index.json` defines the root node, available node types, relation types, asset lists, and world size
- `items/*.json` define individual nodes, including title, description, type, children, details, resources, and position
- `connections/*.json` define individual relations between nodes

This data-first approach makes it possible to:
- add institutions without rewriting UI code;
- extend the map with new relation types;
- maintain content and behavior separately.

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Architecture Notes

Three ideas are central to the project:

- `Data-driven UI`: the structure is built from JSON files instead of hardcoded layouts
- `Dual navigation`: users can explore the same system through hierarchy or through relationships
- `Separation of concerns`: components focus on rendering, while logic is moved into hooks and utility files

## Future Improvements

Possible next steps for the project:

- filtering by node type or relation type
- mobile-focused interaction improvements
- import/export for map datasets
- editing tools for nodes and relations
- richer analytical overlays and comparison modes

## Status

The project is ready for local development and further data expansion.

Collaboration of any kind is welcome. If you want to contribute, share ideas, improve the data, or build on top of the project, feel free to reach out here: [https://t.me/littleboring](https://t.me/littleboring)
