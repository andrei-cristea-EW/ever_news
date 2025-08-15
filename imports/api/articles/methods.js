import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Articles } from './articles.js';

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