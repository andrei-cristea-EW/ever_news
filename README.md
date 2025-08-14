# EverNews

A real-time news application built with Meteor.js 3.0 and React that provides live article updates with smart pagination and filtering capabilities.

## Features

- **Real-time Updates**: New articles appear automatically every 3 seconds
- **Smart Pagination**: Cursor-based pagination for efficient data loading
- **Dual Sorting**: Switch between newest-first and oldest-first article display
- **Advanced Filtering**: Filter by type, source, search terms, and date
- **Live/Historical Separation**: Clear distinction between live and historical articles
- **Pause/Resume Sync**: Control real-time updates as needed
- **Responsive Design**: Bootstrap-powered responsive interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Meteor.js 3.0
- NPM or Yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news_app
```

2. Install dependencies:
```bash
meteor npm install
```

3. Start the development server:
```bash
meteor
```

4. Open your browser to `http://localhost:3000`

## Usage

### Basic Navigation

- **Sort Articles**: Use the "Newest First" / "Oldest First" toggle to change article ordering
- **Filter Content**: Use the filter panel to narrow down articles by:
  - Type (breaking, sports, tech, politics)
  - Source (CNN, BBC, Reuters, etc.)
  - Search terms (searches title and content)
  - Date range (from specific date)

### Real-time Features

- **Live Updates**: New articles automatically appear at the top (newest-first) or bottom (oldest-first)
- **Pause Sync**: Click "Pause" to stop receiving live updates
- **Resume Sync**: Click "Resume" to continue receiving updates

### Pagination

- **Automatic Loading**: Scroll to the bottom to load more articles
- **Smart Boundaries**: 
  - Newest-first: Shows live articles first, then historical
  - Oldest-first: Shows all historical articles first, then live articles when exhausted

## Architecture

### Frontend (React + Meteor)

- **ArticleList**: Main component managing article display and pagination
- **ArticleItem**: Individual article display component
- **FilterPanel**: Controls for filtering and sorting articles

### Backend (Meteor Publications)

- **articles.newest**: Publication for newest-first sorting with auto-generation
- **articles.oldest**: Publication for oldest-first sorting with boundary constraints
- **articles.live**: Publication for real-time article updates
- **getBoundaryTimestamp**: Method to establish historical/live article boundaries

### Key Concepts

#### Cursor-based Pagination
Uses article timestamps as cursors for efficient pagination without offset issues.

#### Historical/Live Boundary
For oldest-first sorting, establishes a timestamp boundary to separate historical articles (finite) from live articles (continuous).

#### Dual Publication Strategy
Different publications for different sort directions to optimize query performance and prevent subscription conflicts.

## Data Structure

### Article Schema
```javascript
{
  _id: String,
  title: String,
  content: String,
  type: String,        // 'breaking', 'sports', 'tech', 'politics'
  source: String,      // 'CNN', 'BBC', 'Reuters', etc.
  createdAt: Date,
  url: String
}
```

## Development

### File Structure
```
imports/
├── api/
│   └── articles/
│       ├── articles.js        # Article collection and helpers
│       └── publications.js    # Meteor publications and methods
└── ui/
    ├── components/
    │   ├── ArticleList.jsx    # Main article list component
    │   ├── ArticleItem.jsx    # Individual article component
    │   └── FilterPanel.jsx    # Filter controls
    └── App.jsx               # Root component
```

### Adding New Features

1. **New Filters**: Add filter logic to `generateQuery()` function in ArticleList.jsx
2. **Article Types**: Update article generation in articles.js
3. **New Publications**: Add to publications.js following existing patterns

### Testing

Run tests with:
```bash
meteor test --driver-package meteortesting:mocha
```

## Configuration

### Environment Variables

Create a `.env` file for configuration:
```
MONGO_URL=mongodb://localhost:27017/news_app
ROOT_URL=http://localhost:3000
```

### Auto-generation

The app automatically generates articles when fewer than 10 exist in the database. Adjust this in `publications.js`:
```javascript
if (articleCount < 10) {  // Change this number
  await generateMoreArticles(10);
}
```

## Performance Considerations

- **Pagination**: Uses cursor-based pagination for consistent performance
- **Subscriptions**: Individual subscriptions per page to minimize data transfer
- **Boundary Management**: Server-side boundary calculation prevents infinite pagination
- **Reactive Updates**: Efficient reactive updates using Meteor's reactivity system

## Troubleshooting

### Common Issues

1. **Articles not loading**: Check meteor server logs for publication errors
2. **Infinite scrolling**: Verify boundary timestamp logic for oldest-first sorting
3. **Duplicate articles**: Ensure proper deduplication in live article merging
4. **Slow performance**: Check MongoDB indexes on `createdAt` field

### Debug Mode

Enable debug logging by uncommenting console.log statements in the codebase (currently removed for production).

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Meteor.js 3.0 and React