import React from 'react';
import Button from '@mui/material/Button';
import VirtualizedList from './VirtualizedList';

function Home() {
  const CLIENT_ID = 'Yqp41cNngMPkh9UQBnI5cA';
  const REDIRECT_URI = 'http://localhost:3000/login/callback';
  const SCOPE = 'mysubreddits,identity'; // subscribe

  function openLogin() {
    const AUTH_URL = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=whatever&redirect_uri=${REDIRECT_URI}&duration=temporary&scope=${SCOPE}`;
    window.open(AUTH_URL, '_self');
  }

  return (
    <div className='App'>
      <header>
        <h1>Transfer your subreddits</h1>
      </header>
      <Button variant='contained' color='primary' onClick={() => openLogin()}>
        Login with Old Account
      </Button>
    </div>
  );
}

export default Home;
