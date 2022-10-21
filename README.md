# Stable Diffusion Naifu Discord Bot
 
Simple discord bot to connect your local Naifu environemnt (using your own GPU).\
Calling /prompt in discord will ask you to input your prompt value.\
Add orientation and size by adding, e.g. {your prompt} | {orientation} | {size}\
\
Available option: \
orientation : portrait | landscape | square \
size: mid | large

## How To Run

Run `yarn start` or `npm start` to run the bot.\
The base url is default set to `http://localhost:6969` for connecting naifu. Change the port to your local port.\
You should also start the stable diffusion backend program in your local environment.\
\
Also add an environment.js file containing your discord bot token and id.\
\
<img src="./src/asset/image.jpg" alt="drawing" width="400"/>
