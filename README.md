# Spofity Music Bot

This is a discord music bot that I threw together because I was unhappy with alternatives. Before we start, no, it doesn't use Spotify. It's just because my name at the time was Spof, and it's funny.

With that out of the way, here's how to set it up.

1. Download either the latest [release](/WWYDF/Spofity/releases), or clone this repository.
2. Download [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) and put the binary or script in `deps/`.
3. Run `yarn build`, then `yarn start`.
4. It should exit with an error. Next, open `config.json`.
5. Put your bot's token in `bot_token` inside the quotes.
6. Save and run `yarn start` again.
7. Invite the bot to your server and it should work.

If it stops working, please open a new issue.