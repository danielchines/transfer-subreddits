import React, { useEffect, useState } from 'react';
import { Modal, Paper, Alert, LinearProgress } from '@mui/material';
import snoowrap from 'snoowrap';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
  open: boolean;
  handleClose: () => void;
  subreddits: string[];
  token?: string; // for Reddit API
}
const userAgent = 'web:com.example.transfersubreddits:v1.0.0 (by /u/dhines5)';

export default function SubscribeModal(props: Props) {
  const { open, handleClose, subreddits, token } = props;
  const [numSubscribed, setNumSubscribed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subscribingTo, setSubscribingTo] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (open && token && subreddits.length) {
      let Reddit = new snoowrap({ accessToken: token, userAgent });
      // snoowrap._nextRequestTimestamp = -1;
      subscribe(Reddit);
    }
  }, [open, token, subreddits]);

  // const callAPI = () => {
  //   console.log('in CallAPI, subreddits', subreddits);
  //   setLoading(true);
  //   fetch(`http://localhost:3001/subscribe`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ subreddits }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('got data:', data);
  //       if (data.subreddits) {
  //         setNumSubscribed((num) => num + data.subreddits.length);
  //       }
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       console.log('ERROR', err);
  //     });
  // };

  const subscribe = async (Reddit: any) => {
    const subs = subreddits;
    setLoading(true);
    for (let i = 0; i < subs.length; i++) {
      try {
        setSubscribingTo('r/' + subs[i]);
        const sub = await Reddit.getSubreddit(subs[i]);
        const res = await sub.subscribe();
        setNumSubscribed(i + 1);
      } catch (err: any) {
        console.log(`error subscribing on ${i} of ${subs.length}\n` + err.error ?? err);
        setLoading(false);
        setErrorText('Error while subscribing. Please try again later.');
        break;
      }
    }
    setSubscribingTo('');
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
    >
      <Paper sx={{ width: 400 }}>
        <h2 id='parent-modal-title'>Subscribing to subreddits</h2>
        {errorText.length ? <Alert severity='error'>{errorText}</Alert> : null}
        {numSubscribed === subreddits.length ? <CheckCircleIcon sx={{ fontSize: 72 }} color='success' /> : null}
        <p id='parent-modal-description'>
          Subscribed to {numSubscribed} of {subreddits.length} subreddits.
        </p>
        {loading && <LinearProgress variant='determinate' value={numSubscribed / subreddits.length} />}
        {subscribingTo.length ? <p style={{ fontSize: 12 }}>Subscribing to {subscribingTo}</p> : null}
        {/* <ChildModal /> */}
      </Paper>
    </Modal>
  );
}
