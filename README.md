# Telegram watermark bot

This is a telegram bot that will watermark images by placing a little logo in the bottom right corner, this bot will choose the ideal logo based on the contrasts in the corner of the image. You can fork this and change the assets and logos to your liking.


## Development

You need to populate the `.env` file locally via `heroku config --app=your-app >> .env` OR 
This has the default notation of `KEY:VALUE` but `heroku local` reads it as `KEY=VALUE` so make sure you change the files format.

You need heroku cli to ensure `.env` file gets loaded in. For development simply use `npm run start`
