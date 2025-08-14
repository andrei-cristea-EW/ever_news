import { Meteor } from 'meteor/meteor';
import '/imports/api/articles/publications';
import { Articles, generateArticle } from '/imports/api/articles/articles';

Meteor.startup(async () => {
  await Articles.removeAsync({}); // Uncomment this line to clear the collection on startup
  
  for (let i = 0; i < 20; i++) {
    const hoursAgo = Math.random() * 72;
    const dummyDate = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
    await Articles.insertAsync(generateArticle(dummyDate));
  }
  
  Meteor.setInterval(async () => {
    await Articles.insertAsync(generateArticle());
  }, 3000);
});
