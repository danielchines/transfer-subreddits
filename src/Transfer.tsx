import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CircularProgress, Grid, Paper, Button, Box } from '@mui/material';
import { RedditLoginState, SubredditObj, UserObj } from './types';
import SubredditList from './SubredditList';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

function Transfer() {
  let { search } = useLocation();

  const [loading, setLoading] = useState({ old: false, new: false });

  // const [results, setResults] = useState<SubredditObj[]>([]);
  const [oldUser, setOldUser] = useState<UserObj | undefined>();
  const [newUser, setNewUser] = useState<UserObj | undefined>();
  const [numSelected, setNumSelected] = useState(0);
  const [alreadyAddedSubs, setAlreadyAddedSubs] = useState<string[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(search);
    const state: string = query.get('state') ?? 'transfer_subs_old';
    // TODO: URL ENCODE
    const authCode = query.get('code');
    if (!authCode) {
      clearSessionStorage();
    } else {
      setLoading({ old: state === 'transfer_subs_old', new: state === 'transfer_subs_new' });
      fetch(`http://localhost:3001/login_redirect?code=${authCode}&state=${state}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('state:', state);
          if (state === 'transfer_subs_new') {
            setLoading((cur) => {
              return { ...cur, new: false };
            });
            if (data.user) {
              setNewUser(data.user);
              sessionStorage.setItem('new_user', JSON.stringify(data.user));
              const oldFromStorage: UserObj = JSON.parse(sessionStorage.getItem('old_user') ?? 'null');
              if (!!oldFromStorage) {
                setAlreadyAddedSubs(data.user.subreddits.filter((x: string) => oldFromStorage.subreddits.includes(x)));
              }
            }
          } else {
            setLoading((cur) => {
              return { ...cur, old: false };
            });
            if (data.user) {
              setOldUser(data.user);
              sessionStorage.setItem('old_user', JSON.stringify(data.user));
            }
          }
        })
        .catch((err) => {
          setLoading({ old: false, new: false });
          console.log('ERROR', err);
        });
      setUsersFromStorage();
    }
  }, []);

  const setUsersFromStorage = () => {
    const oldFromStorage: UserObj = JSON.parse(sessionStorage.getItem('old_user') ?? 'null');
    if (!oldUser && oldFromStorage) {
      setOldUser(oldFromStorage);
    }
    const newFromStorage: UserObj = JSON.parse(sessionStorage.getItem('new_user') ?? 'null');
    if (!newUser && newFromStorage) {
      setNewUser(newFromStorage);
    }
    if (!alreadyAddedSubs.length && newFromStorage && oldUser) {
      setAlreadyAddedSubs(newFromStorage.subreddits.filter((x: string) => oldUser.subreddits.includes(x)));
    }
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem('new_user');
    sessionStorage.removeItem('old_user');
  };

  const CLIENT_ID = 'Yqp41cNngMPkh9UQBnI5cA';
  const REDIRECT_URI = 'http://localhost:3000';

  function openLogin(old: boolean) {
    const SCOPE = 'mysubreddits,identity' + (old ? '' : ',subscribe');
    const STATE = 'transfer_subs_' + (old ? 'old' : 'new'); // don't change this
    const AUTH_URL = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=${STATE}&redirect_uri=${REDIRECT_URI}&duration=temporary&scope=${SCOPE}`;
    window.open(AUTH_URL, '_self');
  }

  return (
    <div style={{ width: '100%', maxWidth: 1120, marginBottom: 30 }}>
      <header>
        <h1 style={{ marginBottom: 40 }}>Transfer your subreddits</h1>
      </header>
      <Grid container spacing={4} justifyContent='center'>
        <Grid item xs={5} md={5}>
          <Paper sx={{ minHeight: 300, alignitems: 'center' }}>
            {oldUser ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                }}
              >
                <Chip
                  avatar={
                    oldUser.profile_pic.length ? (
                      <Avatar alt='picture' src={oldUser.profile_pic} />
                    ) : (
                      <Avatar>{oldUser.username[0]}</Avatar>
                    )
                  }
                  label={oldUser.username}
                  sx={{ margin: '8px 0' }}
                />
                <p style={{ fontSize: 12 }}>{oldUser.subreddits.length} subreddits</p>
              </Box>
            ) : null}
            {loading.old ? (
              <CircularProgress sx={{ margin: 16 }} />
            ) : !oldUser ? (
              <Button variant='contained' onClick={() => openLogin(true)} sx={{ marginTop: 16 }}>
                Login with Old Account
              </Button>
            ) : (
              <SubredditList selectable={false} subreddits={oldUser ? oldUser.subreddits : []} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={5} md={5}>
          <Paper sx={{ minHeight: 300 }}>
            {loading.new ? (
              <CircularProgress sx={{ margin: 16 }} />
            ) : !newUser ? (
              <Box>
                <Button
                  variant='contained'
                  disabled={!!!oldUser}
                  onClick={() => openLogin(false)}
                  sx={{ marginTop: 16 }}
                >
                  Login with New Account
                </Button>
                <p style={{ fontSize: 11 }}>
                  You'll need to logout of your old account first
                  <br />
                  Then click 'Back' then click allow
                </p>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                  }}
                >
                  <Chip
                    avatar={
                      newUser.profile_pic.length ? (
                        <Avatar alt='picture' src={newUser.profile_pic} />
                      ) : (
                        <Avatar>{newUser.username[0]}</Avatar>
                      )
                    }
                    label={newUser.username}
                    sx={{ margin: '8px 0' }}
                  />
                  <p style={{ fontSize: 12 }}>
                    Already subscribed to {alreadyAddedSubs.length} of {oldUser?.subreddits.length}
                  </p>
                </Box>
                <SubredditList
                  selectable={true}
                  subreddits={oldUser ? oldUser.subreddits : []}
                  disabledSubreddits={alreadyAddedSubs}
                  numberSelectedChanged={(num) => setNumSelected(num)}
                />
                <Button onClick={() => console.log('transfer')} color='primary' sx={{ padding: 2 }}>
                  Subscribe to {numSelected} Subreddits
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Transfer;
