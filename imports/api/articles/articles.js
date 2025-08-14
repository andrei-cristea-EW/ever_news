import { Mongo } from 'meteor/mongo';

export const Articles = new Mongo.Collection('articles');

export const generateArticle = (customDate = null) => {
  const titles = [
    "Breaking: Major Scientific Discovery Announced",
    "Technology Giants Announce New Partnership",
    "Global Climate Summit Reaches Historic Agreement",
    "Sports Championship Finals Draw Record Viewers",
    "Economic Markets Show Positive Trends",
    "New Archaeological Find Reveals Ancient Secrets",
    "Healthcare Innovation Promises Better Treatment",
    "Space Exploration Mission Achieves Milestone"
  ];

  const sources = ["Reuters", "BBC", "CNN", "Associated Press", "The Guardian", "NPR"];
  const types = ["breaking", "business", "technology", "sports", "health", "science"];

  const loremParagraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?"
  ];

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    content: loremParagraphs[Math.floor(Math.random() * loremParagraphs.length)],
    type: types[Math.floor(Math.random() * types.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    createdAt: customDate || new Date()
  };
};

// generate articles so that we have infinite scroll
export const generateMoreArticles = async (nrOfArticlesToGenerate) => {
  const oldestArticle = await Articles.findOneAsync({}, { sort: { createdAt: 1 } });
  let baseTimestamp = oldestArticle ? new Date(oldestArticle.createdAt) : new Date();
  
  for (let i = 0; i < nrOfArticlesToGenerate; i++) {
    const hoursAgo = Math.random() * 24 + (i * 2);
    const olderTimestamp = new Date(baseTimestamp.getTime() - (hoursAgo * 60 * 60 * 1000));
    
    await Articles.insertAsync(generateArticle(olderTimestamp));
  }
}