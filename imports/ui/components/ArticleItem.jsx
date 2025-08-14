import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

const getTypeColor = (type) => {
  const colors = {
    breaking: 'danger',
    business: 'success',
    technology: 'primary',
    sports: 'warning',
    health: 'info',
    science: 'secondary'
  };
  return colors[type] || 'secondary';
};

const ArticleItem = ({ article }) => {
  return (
    <Card className="mb-3 article-item">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <Badge bg="dark" text="light" className="me-2">
            {article.source}
          </Badge>
          <Badge bg={getTypeColor(article.type)} className="me-2">
            {article.type}
          </Badge>
        </div>
        <small className="text-muted">
          {formatDate(article.createdAt)}
        </small>
      </Card.Header>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>{article.content}</Card.Text>
        <div className="d-flex justify-content-end align-items-center">
          <small className="text-muted">
            {timeAgo(article.createdAt)}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleItem;