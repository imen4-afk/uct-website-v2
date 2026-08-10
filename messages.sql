create table messages (
  id bigint generated always as identity primary key,
  user_message text not null,
  bot_reply text,
  created_at timestamp default now()
);
