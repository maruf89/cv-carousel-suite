CV Carousel Suite
============

Installation
----------

You'll need installed:

+ nodejs
+ npm

**Quick Start** go to where you want this repo installed and run `git clone git@github.com:maruf89/cv-carousel-suite.git && cd cv-carousel-suite && npm install && npm start`


To install all the dependencies
`npm install`

To build script and start server
`npm start`

`gulp serve` - starts serving from the existing `/build` directory

Demos
-------

Once the webserver has started you can go to

**Carousel Swipe** found at [https://localhost:8000/local/carousel/carousel_swipe.html](https://localhost:8000/local/carousel/carousel_swipe.html)

**Fun with Color & Sine** found at [https://localhost:8000/local/drawer/color_test.html](https://localhost:8000/local/drawer/color_test.html)

To Develop
-----------

A [Typescript](https://www.typescriptlang.org/) library to store shared javascript business logic that can be used across any platform than can run JS.

Once you have those it's helpful to have these scripts installed globally

`npm install --global gulp typescript ts-node jshint`

From the root directory call `npm install` to install the remaining dependencies.

IDE
-----------

I recommend [Visual Studio Code](http://code.visualstudio.com/) along with the `TSLint` plugin
