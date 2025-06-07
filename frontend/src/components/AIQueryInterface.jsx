import React, { useState } from 'react';

export function AIQueryInterface() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError('Failed to process query. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    if (response.status === 'error') {
      return <div className="error-message">{response.message}</div>;
    }

    if (!response.data) return null;

    return (
      <div className="response-container">
        <div className="response-message">{response.data.message}</div>
        {response.data.items && (
          <div className="response-items">
            {response.data.items.map((item, index) => (
              <div key={index} className="response-item">
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
        {response.data.total !== undefined && (
          <div className="response-total">
            Total: {response.data.total.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ai-query-interface">
      <h2>AI Query Assistant</h2>
      <form onSubmit={handleSubmit} className="query-form">
        <div className="input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about inventory, sales, claims, dealers, or products..."
            className="query-input"
          />
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Processing...' : 'Ask'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-container">
          {error}
        </div>
      )}

      <div className="response-section">
        {renderResponse()}
      </div>

      <style jsx>{`
        .ai-query-interface {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .query-form {
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .query-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }

        .submit-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .submit-button:disabled {
          background-color: #ccc;
        }

        .error-container {
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .response-container {
          margin-top: 20px;
        }

        .response-message {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .response-items {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
        }

        .response-item {
          padding: 10px;
          background-color: #f5f5f5;
          margin-bottom: 10px;
          border-radius: 4px;
        }

        .response-item pre {
          margin: 0;
          white-space: pre-wrap;
        }

        .response-total {
          margin-top: 10px;
          font-size: 18px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
} 