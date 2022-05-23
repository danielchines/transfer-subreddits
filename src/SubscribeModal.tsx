import React, { useEffect, useState } from 'react';
import { Modal, Paper, CircularProgress } from '@mui/material';

interface Props {
  open: boolean;
  handleClose: () => void;
  subreddits: string[];
  token?: string; // for Reddit API
}

export default function SubscribeModal(props: Props) {
  const { open, handleClose, subreddits, token } = props;
  const [numSubscribed, setNumSubscribed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && token && subreddits.length) {
      callAPI();
    }
  }, [open, token, subreddits]);

  const callAPI = () => {
    console.log('in CallAPI, subreddits', subreddits);
    setLoading(true);
    fetch(`http://localhost:3001/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subreddits }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('got data:', data);
        if (data.subreddits) {
          setNumSubscribed((num) => num + data.subreddits.length);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log('ERROR', err);
      });
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
        {loading && <CircularProgress />}
        <p id='parent-modal-description'>
          Subscribed to {numSubscribed} of {subreddits.length} subreddits.
        </p>
        {/* <ChildModal /> */}
      </Paper>
    </Modal>
  );
}
