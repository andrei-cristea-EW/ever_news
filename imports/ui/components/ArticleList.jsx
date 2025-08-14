import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import ArticleItem from './ArticleItem';
import FilterPanel from './FilterPanel';
import { Articles } from '../../api/articles/articles';

const ITEMS_PER_PAGE = 10;

const ArticleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortDirection, setSortDirection] = useState(-1);
  const [syncPaused, setSyncPaused] = useState(false);
  
  const [pageArticles, setPageArticles] = useState({});
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);
  const [liveArticles, setLiveArticles] = useState([]);
  const [boundaryEstablished, setBoundaryEstablished] = useState(false);
  const [allHistoricalLoaded, setAllHistoricalLoaded] = useState(false);
  const [historicalBoundary, setHistoricalBoundary] = useState(null);
  const previousSubscriptionRef = useRef(null);
  const previousSortDirectionRef = useRef(null);

  const [boundaryTimestamp, setBoundaryTimestamp] = useState(null);
  const [boundaryReady, setBoundaryReady] = useState(false);
  
  useEffect(() => {
    if (sortDirection !== 1) {
      setBoundaryTimestamp(null);
      setBoundaryReady(true);
      return;
    }

    setBoundaryReady(false);
    const baseQuery = generateQuery(filters);
    
    Meteor.callAsync('getBoundaryTimestamp', baseQuery)
      .then(timestamp => {
        setBoundaryTimestamp(timestamp);
        setBoundaryReady(true);
      })
      .catch(error => {
        console.error('[Method] getBoundaryTimestamp error:', error);
        setBoundaryReady(true);
      });
  }, [sortDirection, filters]);

  const { articles, isLoading } = useTracker(() => {
    if (pageArticles[currentPage]) {
      return { articles: [], isLoading: false };
    }

    if (sortDirection === 1 && !boundaryReady) {
      return { articles: [], isLoading: true };
    }

    if (previousSortDirectionRef.current !== null && 
        previousSortDirectionRef.current !== sortDirection && 
        previousSubscriptionRef.current) {
      previousSubscriptionRef.current.stop();
      previousSubscriptionRef.current = null;
    }

    const baseQuery = generateQuery(filters);
    let query = { ...baseQuery };
    
    if (sortDirection === 1 && boundaryTimestamp) {
      query = {
        ...query,
        createdAt: {
          ...query.createdAt,
          $lt: boundaryTimestamp
        }
      };
    }
    
    const subscriptionId = `page${currentPage}-sort${sortDirection}-ts${endTimestamp ? endTimestamp.getTime() : 'none'}`;
    
    if (currentPage > 1 && endTimestamp) {
      if (sortDirection === -1) {
        query = {
          ...query,
          createdAt: {
            ...query.createdAt,
            $lt: endTimestamp
          }
        };
      } else {
        query = {
          ...query,
          createdAt: {
            ...query.createdAt,
            $gt: endTimestamp
          }
        };
      }
    }
    
    const publicationName = sortDirection === -1 ? 'articles.newest' : 'articles.oldest';
    const handle = Meteor.subscribe(publicationName, ITEMS_PER_PAGE, 0, query, boundaryTimestamp);
    
    previousSubscriptionRef.current = handle;
    previousSortDirectionRef.current = sortDirection;
    
    const articles = Articles.find(query, {
      sort: { createdAt: sortDirection },
      limit: ITEMS_PER_PAGE
    }).fetch();
    
    return {
      articles,
      isLoading: !handle.ready()
    };
  }, [currentPage, filters, sortDirection, endTimestamp, pageArticles[currentPage], boundaryTimestamp, boundaryReady]);

  const { liveArticlesData, liveLoading } = useTracker(() => {
    if (!boundaryEstablished || syncPaused) {
      return { liveArticlesData: [], liveLoading: false };
    }
    
    if (sortDirection === 1 && !allHistoricalLoaded) {
      return { liveArticlesData: [], liveLoading: false };
    }

    const baseQuery = generateQuery(filters);
    const liveQuery = {
      ...baseQuery,
      createdAt: {
        ...baseQuery.createdAt,
        $gt: boundaryTimestamp || startTimestamp
      }
    };

    const handle = Meteor.subscribe('articles.live', liveQuery, sortDirection);
    const liveArticlesData = Articles.find(liveQuery, {
      sort: { createdAt: sortDirection }
    }).fetch();

    return {
      liveArticlesData,
      liveLoading: !handle.ready()
    };
  }, [boundaryEstablished, syncPaused, filters, sortDirection, boundaryTimestamp, startTimestamp, allHistoricalLoaded]);

  useEffect(() => {
    if (articles.length > 0 && !pageArticles[currentPage]) {
      setPageArticles(prev => ({
        ...prev,
        [currentPage]: articles
      }));
      
      const newest = sortDirection === -1 ? articles[0] : articles[articles.length - 1];
      const oldest = sortDirection === -1 ? articles[articles.length - 1] : articles[0];
      
      if (currentPage === 1) {
        if (sortDirection === -1) {
          setStartTimestamp(newest.createdAt);
          setEndTimestamp(oldest.createdAt);
          setBoundaryEstablished(true);
        } else {
          setStartTimestamp(newest.createdAt);
          setEndTimestamp(newest.createdAt);
        }
      } else {
        if (sortDirection === -1) {
          setEndTimestamp(oldest.createdAt);
        } else {
          setEndTimestamp(newest.createdAt);
        }
      }
      
      if (articles.length < ITEMS_PER_PAGE) {
        setAllHistoricalLoaded(true);
        if (sortDirection === 1 && currentPage > 1) {
          setBoundaryEstablished(true);
        }
      }
    }
  }, [articles, currentPage, pageArticles, sortDirection]);

  useEffect(() => {
    if (liveArticlesData.length > 0) {
      setLiveArticles(prev => {
        const newArticles = liveArticlesData.filter(newArticle => 
          !prev.some(existing => existing._id === newArticle._id)
        );
        
        if (newArticles.length > 0) {
          if (sortDirection === -1) {
            return [...newArticles, ...prev];
          } else {
            return [...prev, ...newArticles];
          }
        }
        return prev;
      });
    }
  }, [liveArticlesData, sortDirection]);

  useEffect(() => {
    if (previousSubscriptionRef.current) {
      previousSubscriptionRef.current.stop();
      previousSubscriptionRef.current = null;
    }
    
    setPageArticles({});
    setStartTimestamp(null);
    setEndTimestamp(null);
    setLiveArticles([]);
    setBoundaryEstablished(false);
    setAllHistoricalLoaded(false);
    setCurrentPage(1);
    
    previousSortDirectionRef.current = null;
  }, [filters, sortDirection]);

  useEffect(() => {
    let isLoading = false;
    
    const handleScroll = () => {
      if (isLoading) return;
      
      const scrollTop = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        const expectedPage = Math.ceil(Object.keys(pageArticles).length);
        if (currentPage <= expectedPage) {
          isLoading = true;
          setCurrentPage(prev => prev + 1);
          setTimeout(() => { isLoading = false; }, 1000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, pageArticles]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (direction) => {
    setSortDirection(direction);
  };

  const handleToggleSync = () => {
    setSyncPaused(!syncPaused);
  };

  function generateQuery(filters) {
    let query = {};
    if (filters.type && filters.type !== 'all') query.type = filters.type;
    if (filters.source && filters.source !== 'all') query.source = filters.source;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } }
      ];
    }
    if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
    return query;
  }

  const historicalArticles = [];
  for (let page = 1; page <= currentPage; page++) {
    if (pageArticles[page]) {
      historicalArticles.push(...pageArticles[page]);
    }
  }
  
  let allArticles;
  if (sortDirection === -1) {
    allArticles = [...liveArticles, ...historicalArticles];
  } else {
    if (allHistoricalLoaded) {
      allArticles = [...historicalArticles, ...liveArticles];
    } else {
      allArticles = [...historicalArticles];
    }
  }


  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">EverNews</h1>

          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            sortDirection={sortDirection}
            syncPaused={syncPaused}
            onToggleSync={handleToggleSync}
          />

          {syncPaused && (
            <div className="alert alert-warning">
              Data synchronization is paused. Click "Resume" to continue receiving updates.
            </div>
          )}
          <div className="text-center my-4">
            <small className="text-muted">
              Showing {allArticles.length} articles ({liveArticles.length} live + {historicalArticles.length} historical) (Page {currentPage})
              {startTimestamp && endTimestamp && (
                <div>
                  Range: {new Date(startTimestamp).toLocaleString()} to {new Date(endTimestamp).toLocaleString()}
                </div>
              )}
            </small>
          </div>

          <div className="articles-container">
            {allArticles.map((article) => (
              <ArticleItem key={article._id} article={article} />
            ))}
          </div>

          {(isLoading || liveLoading) && (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading articles...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleList;