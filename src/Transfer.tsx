import { useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CircularProgress, Grid, Paper, Button, Box } from '@mui/material';
import { UserObj } from './types';
import SubredditList from './SubredditList';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import SubscribeModal from './SubscribeModal';
import snoowrap from 'snoowrap';
const userAgent = 'web:com.example.transfersubreddits:v1.0.0 (by /u/dhines5)';

function Transfer() {
  const [loading, setLoading] = useState({ old: false, new: false });

  // const [results, setResults] = useState<SubredditObj[]>([]);
  const [oldUser, setOldUser] = useState<UserObj | undefined>();
  const [newUser, setNewUser] = useState<UserObj | undefined>();
  const [selectedSubs, setSelectedSubs] = useState<number[]>([]);
  const [alreadyAddedSubs, setAlreadyAddedSubs] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorText, setErrorText] = useState('');

  const removeQueryParams = () => {
    const param = searchParams.get('code');
    if (param) {
      searchParams.delete('code');
      searchParams.delete('state');
      setSearchParams(searchParams);
    }
  };

  useEffect(() => {
    const state: string = searchParams.get('state') ?? 'transfer_subs_old';
    // TODO: URL ENCODE
    const authCode = searchParams.get('code');
    if (!authCode) {
      setUsersFromStorage();
    } else {
      setLoading({ old: state === 'transfer_subs_old', new: state === 'transfer_subs_new' });
      callRedirect(authCode, state);
    }
  }, [searchParams]);

  const callRedirect = (authCode: string, state: string) => {
    fetch(`http://localhost:3001/login_redirect?code=${authCode}&state=${state}`)
      .then((response) => response.json())
      .then((data) => {
        if (state === 'transfer_subs_new') {
          if (data.user) {
            setNewUser(data.user);
            sessionStorage.setItem('new_user', JSON.stringify(data.user));
            const oldFromStorage: UserObj = JSON.parse(sessionStorage.getItem('old_user') ?? 'null');
            if (!!oldFromStorage) {
              setAlreadyAddedSubs(data.user.subreddits.filter((x: string) => oldFromStorage.subreddits.includes(x)));
            }
          }
        } else {
          if (data.user) {
            setOldUser(data.user);
            sessionStorage.setItem('old_user', JSON.stringify(data.user));
          }
        }
        removeQueryParams();
      })
      .catch((err) => {
        console.log('ERROR', err);
        setErrorText('Error while fetching subreddits. Please try again later.');
      })
      .finally(() => setLoading({ old: false, new: false }));
  };

  const setUsersFromStorage = async () => {
    const oldFromStorage: UserObj = JSON.parse(sessionStorage.getItem('old_user') ?? 'null');
    if (!oldUser && oldFromStorage) {
      setOldUser(oldFromStorage);
    }
    const newFromStorage: UserObj = JSON.parse(sessionStorage.getItem('new_user') ?? 'null');
    if (!newUser && newFromStorage) {
      setNewUser(newFromStorage);
    }
    if (newFromStorage && oldFromStorage) {
      setAlreadyAddedSubs(newFromStorage.subreddits.filter((x: string) => oldFromStorage.subreddits.includes(x)));
    }
  };

  const refreshNewSubs = async () => {
    const currentNewUser: UserObj = JSON.parse(sessionStorage.getItem('new_user') ?? 'null');
    if (currentNewUser && oldUser && currentNewUser.subreddits.length < oldUser.subreddits.length) {
      setLoading((cur) => {
        return { ...cur, new: true };
      });
      const Reddit = new snoowrap({ accessToken: currentNewUser.token, userAgent });
      let subscriptions = await (await Reddit).getSubscriptions({ limit: 100 });
      if (!subscriptions.isFinished) {
        for (let i = 0; i < 10; i++) {
          subscriptions = await subscriptions.fetchMore({ amount: 100, append: true });
          if (subscriptions.isFinished) {
            break;
          }
        }
      }
      const subs = subscriptions
        .filter((obj) => obj.display_name.slice(0, 2) !== 'u_')
        .flatMap(({ display_name }) => display_name)
        .sort();

      const newU: UserObj = { ...currentNewUser, subreddits: subs };
      setNewUser(newU);
      sessionStorage.setItem('new_user', JSON.stringify(newU));
      setLoading((cur) => {
        return { ...cur, new: false };
      });
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
        {errorText.length ? <Alert severity='error'>{errorText}</Alert> : null}
        <h1 style={{ marginBottom: 40 }}>Transfer your subreddits</h1>
      </header>
      <SubscribeModal
        open={modalOpen}
        handleClose={async () => {
          setModalOpen(false);
          await refreshNewSubs();
        }}
        subreddits={selectedSubs && oldUser ? selectedSubs.map((i) => oldUser.subreddits[i]) : []}
        token={newUser ? newUser.token : ''}
      />
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
                  selectedSubsChanged={setSelectedSubs}
                />
                <Button
                  onClick={() => setModalOpen(true)}
                  variant='contained'
                  sx={{ padding: 1, margin: 1 }}
                  disabled={!newUser || !oldUser}
                >
                  Subscribe to {selectedSubs.length} Subreddits
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
