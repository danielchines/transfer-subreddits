export interface SubredditObj {
  id: string;
  title: string;
  display_name: string;
}

export interface UserObj {
  id: string;
  username: string;
  profile_pic: string;
  subreddits: string[];
}

export type RedditLoginState = 'transfer_subs_old' | 'transfer_subs_new';
