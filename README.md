# Binance-Locked-Staking
<p align="center"><img src="https://raw.githubusercontent.com/emmtte/Binance-Locked-Staking/main/screenshot.jpg"></p>

**Receive a daily telegram notification of what is possible to stake or save in Binance's locked staking and savings based on your spot balance**

## Installation
### Prerequisites
```
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl
mkdir earn && cd $_
curl -O "https://raw.githubusercontent.com/emmtte/Binance-Locked-Staking/main/{config.mjs,earn.mjs,package.json}"
```

### Nodejs
https://github.com/nodesource/distributions
```
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install --global yarn
cd earn
yarn install
```

## Configuration
### Binance
- https://www.binance.com/en/my/settings/api-management
1. Log in into your Binance account and navigate to the API Management page
2. Label your new API Click and create a new key
3. Check only the 'Read Info' permission
5. Copy the **API key** to the configuration file config.mjs as binanceKey
6. Copy the **Secret key** to the configuration file config.mjs as binanceSecret

### Telegram
- https://telegram.me/botfather
1. Use the **/newbot** command to create a new bot. The BotFather will ask you for a name and username, then generate an authorization token for your new bot.
2. The **name** of your bot is displayed in contact details and elsewhere.
3. The **Username** is a short name, to be used in mentions and telegram.me links. Usernames are 5-32 characters long and are case insensitive, but may only include Latin characters, numbers, and underscores. Your bot's username must end in ‘bot’.
4. Copy the **TOKEN** to the configuration file config.mjs as telegramToken
5. Send a dummy message to your new bot
6. Go to following url https://api.telegram.org/botTOKEN/getUpdates (replace the TOKEN word by your telegram TOKEN)
7. Look for ``"chat":{"id":``
8. Copy the **chatid** to the configuration file config.mjs as telegramToken
````
sudo apt-get install -y jq
TELEGRAM_TOKEN=
curl https://api.telegram.org/bot$TELEGRAM_TOKEN/getUpdates | jq .result[0].message.chat.id
````

## Running
```
cd earn
node earn.mjs
```
## MIT License

Copyright (c) march 9, 2022 emmtte

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


