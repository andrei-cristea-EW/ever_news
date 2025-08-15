import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Articles, generateMoreArticles } from './articles.js';

const ARTICLE_GENERATION_THRESHOLD = 10;

const buildSortOptions = (direction) => ({ createdAt: direction });

const buildQueryWithBoundary = (query, boundary) => {
  if (!boundary) return query;
  return {
    ...query,
    createdAt: {
      ...query.createdAt,
      $lt: boundary
    }
  };
};

const findArticlesWithOptions = (query, limit, skip, sortOptions) => {
  return Articles.find(query, {
    limit,
    skip,
    sort: sortOptions
  });
};

Meteor.publish('articles.live', function (query, sortDirection) {
  check(query, Object);
  check(sortDirection, Number);

  const sortOptions = buildSortOptions(sortDirection);
  return Articles.find(query, { sort: sortOptions });
});

Meteor.publish('articles.newest', async function (limit, skip, query) {
  check(limit, Number);
  check(skip, Number);
  check(query, Object);

  const sortDirection = -1;
  const sortOptions = buildSortOptions(sortDirection);

  const articleCount = await findArticlesWithOptions(query, limit, skip, sortOptions).countAsync();

  if (articleCount < ARTICLE_GENERATION_THRESHOLD) {
    await generateMoreArticles(ARTICLE_GENERATION_THRESHOLD);
  }

  return findArticlesWithOptions(query, limit, skip, sortOptions);
});

Meteor.publish('articles.oldest', async function (limit, skip, query, historicalBoundary) {
  check(limit, Number);
  check(skip, Number);  
  check(query, Object);
  check(historicalBoundary, Match.Maybe(Date));

  const sortDirection = 1;
  const sortOptions = buildSortOptions(sortDirection);
  const finalQuery = buildQueryWithBoundary(query, historicalBoundary);

  return findArticlesWithOptions(finalQuery, limit, skip, sortOptions);
});