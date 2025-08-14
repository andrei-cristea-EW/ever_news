import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Articles, generateMoreArticles } from './articles.js';

Meteor.publish('articles.live', function (query, sortDirection) {
  check(query, Object);
  check(sortDirection, Number);

  const sortOptions = { createdAt: sortDirection };

  return Articles.find(query, {
    sort: sortOptions
  });
});

Meteor.methods({
  async getBoundaryTimestamp(query) {
    check(query, Object);
    
    const newestArticle = await Articles.findOneAsync(query, { 
      sort: { createdAt: -1 } 
    });
    
    const boundaryTimestamp = newestArticle?.createdAt || new Date();
    
    return boundaryTimestamp;
  }
});

Meteor.publish('articles.newest', async function (limit, skip, query) {
  check(limit, Number);
  check(skip, Number);
  check(query, Object);

  const sortDirection = -1;
  const sortOptions = { createdAt: sortDirection };

  const articleCount = await Articles.find(query, {
    limit: limit,
    skip: skip,
    sort: sortOptions
  }).countAsync();

  if (articleCount < 10) {
    await generateMoreArticles(10);
  }

  return Articles.find(query, {
    limit: limit,
    skip: skip,
    sort: sortOptions
  });
});

Meteor.publish('articles.oldest', async function (limit, skip, query, historicalBoundary) {
  check(limit, Number);
  check(skip, Number);  
  check(query, Object);
  check(historicalBoundary, Match.Maybe(Date));

  const sortDirection = 1;
  const sortOptions = { createdAt: sortDirection };

  let finalQuery = { ...query };
  if (historicalBoundary) {
    finalQuery = {
      ...query,
      createdAt: {
        ...query.createdAt,
        $lt: historicalBoundary
      }
    };
  }



  return Articles.find(finalQuery, {
    limit: limit,
    skip: skip,
    sort: sortOptions
  });
});