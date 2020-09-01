
```
git remote add live ssh://root@khe.io/var/www/kenthackenough.git
git push live master
```

## The following information is likely out of date

![Kent Hack Enough](https://khe.io/img/blue_logo.svg "Kent Hack Enough")
---
The world's best hackathon website.

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)]()

## About
This API was made in an effort to ease the organization of Kent Hack Enough as we continue to grow in size. This project was built by Paul Dilyard (@pdilyard), and is currently maintained by HacKSU leadership.

## Installation
First, make sure that the appropriate version of Docker is installed (consult Google if you aren't sure what to install on your OS).

Next, clone the repository

``` git clone https://github.com/hacksu/kenthackenough.git ```

After cloning the repository, navigate into it and install the npm packages

``` cd kenthackenough ```

``` npm install ```

Finally, you'll want to set up a `config.js` file

``` cp config/config_example.js config/config.js ```

Then edit `config/config.js` and enter your desired values

You should now be ready to run the API and contribute to the code!

## Running
Running the API is very simple thanks to Docker

Then, you'll want to set up a `config.js` file

``` cp config/config_example.js config/config.js ```

Then edit `config/config.js` and enter your desired values

Simply run
``` docker-compose up ```
to start the API, and then
``` docker-compose down ```
to stop the containers.
If you make changes to the config file or any other file in the project, make sure to run
`docker-compose build` to ensure that those changes got copied to your container!
Then you're ready to restart the container with `docker-compose up`

## Documentation
See the repository's [Wiki](https://github.com/hacksu/kenthackenough/wiki) for detailed documentation.
