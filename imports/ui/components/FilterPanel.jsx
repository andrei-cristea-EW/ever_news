import React from 'react';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onSortChange, 
  sortDirection, 
  syncPaused, 
  onToggleSync 
}) => {
  const types = ['all', 'breaking', 'business', 'technology', 'sports', 'health', 'science'];
  const sources = ['all', 'Reuters', 'BBC', 'CNN', 'Associated Press', 'The Guardian', 'NPR'];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search articles..."
            />
          </div>
        
          <div className="col-md-2">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={filters.type || 'all'}
              onChange={(e) => onFilterChange('type', e.target.value)}
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        
          <div className="col-md-2">
            <label className="form-label">Source</label>
            <select
              className="form-select"
              value={filters.source || 'all'}
              onChange={(e) => onFilterChange('source', e.target.value)}
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        
          <div className="col-md-2">
            <label className="form-label">Date From</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            />
          </div>
        
          <div className="col-md-2">
            <label className="form-label">Sort</label>
            <select
              className="form-select"
              value={sortDirection}
              onChange={(e) => onSortChange(parseInt(e.target.value))}
            >
              <option value={-1}>Newest First</option>
              <option value={1}>Oldest First</option>
            </select>
          </div>
        
          <div className="col-md-2 d-flex align-items-end">
            <button
              className={`btn w-100 ${syncPaused ? 'btn-success' : 'btn-warning'}`}
              onClick={onToggleSync}
              style={{ minWidth: '80px' }}
            >
              {syncPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;