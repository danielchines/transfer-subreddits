import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

interface Props {
  subreddits: string[];
  numberSelectedChanged?: (num: number) => void;
  disabledSubreddits?: string[];
  selectable: boolean;
}

export default function SubredditList(props: Props) {
  const { subreddits, numberSelectedChanged, disabledSubreddits, selectable } = props;
  const [checked, setChecked] = React.useState<number[]>([]);

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

  React.useEffect(() => {
    let arr: number[] = [...Array(subreddits.length).keys()];
    arr = arr.filter((x) => disabledSubreddits?.indexOf(subreddits[x]) === -1);
    setChecked(arr);
  }, [subreddits]);

  React.useEffect(() => {
    if (numberSelectedChanged !== undefined) {
      numberSelectedChanged(checked.length);
    }
  }, [checked]);

  return (
    <Box
      sx={{
        width: '100%',
        // height: 400,
        // maxWidth: 360,
        bgcolor: 'background.paper',
        overflow: 'auto',
      }}
    >
      <List
        sx={{
          height: 400,
          // width: 350,
        }}
      >
        {subreddits.map((name: string, i: number) => {
          const labelId = `subreddit-checkbox-${i}`;

          return selectable ? (
            <ListItem key={i} disablePadding={selectable} dense sx={{ height: 36 }}>
              <ListItemButton onClick={handleToggle(i)} dense disabled={disabledSubreddits?.indexOf(name) !== -1}>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(i) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                    size='small'
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={<a>r/{name}</a>} />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem key={i} dense sx={{ height: 36 }}>
              <ListItemText id={labelId} primary={`r/${name}`} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
