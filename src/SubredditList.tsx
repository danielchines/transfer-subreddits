import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import { SubredditObj } from './types';

export default function SubredditList(props: { subreddits: SubredditObj[] }) {
  const { subreddits } = props;
  const [checked, setChecked] = React.useState([0]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  return (
    <Box
      sx={{
        width: '100%',
        height: 400,
        maxWidth: 360,
        bgcolor: 'background.paper',
        overflow: 'auto',
      }}
    >
      <List
        sx={{
          height: 400,
          width: 350,
        }}
      >
        {subreddits.map((sub: SubredditObj, i: number) => {
          return (
            <ListItem key={i} disablePadding dense>
              <ListItemButton onClick={handleToggle(i)}>
                <ListItemText primary={`r/${sub.display_name}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
