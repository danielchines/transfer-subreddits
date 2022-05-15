import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { SubredditObj } from './types';
import SubredditList from './SubredditList';

function LoginWithReddit() {
  let { search } = useLocation();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SubredditObj[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(search);
    setLoading(true);
    fetch(`http://localhost:3001/login_redirect?code=${query.get('code')}`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setResults(data.results);
      })
      .catch((err) => {
        setLoading(false);
        console.log('ERROR', err);
      });
  }, []);

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>{results.length > 0 ? <SubredditList subreddits={results} /> : null}</div>
      )}
    </div>
  );
}

export default LoginWithReddit;
