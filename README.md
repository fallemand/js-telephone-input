# js-telephone-input

## Overview
Input with telephone mask and validations for each country.

## Demo
[URL here!](http://mercadolibre.github.io/js-telephone-input)

## How to use

### Install

[Instructions to install and use]

## Contribute
This is the way you can contribute with this project:

### Development
#### Install
Download this repository, and install node dependencies from the root:

```
npm install
```

Run build task for generate development assets:
```
npm run build
```

Run the following command for browse the demo at [http://localhost:3000](http://localhost:3000):
```
npm start
```

Run dist task for generate production assets:
```
npm run dist
```

##### Tests

**Unit**

Run test command for run unit tests:
```
npm test
```

**End to End**

Just once run install-selenium task for preapare the enviroment for run e2e tests:
```
npm run install-selenium
```

Then run nightwatch every time you want to run e2e tests:
```
npm run nightwatch
```

If you need to pass parameters to the task you can do it so:
```
npm run nightwatch -- --verbose
```
Look at all the options [here](http://nightwatchjs.org/guide#command-line-options).

##### Deploy

Run swift command for upload static files to swift server (assuming that we upload the v1.0.0 release):
```
npm run swift -- --release v1.0.0
```

Run gh-pages command for deploy site to gh-pages:
```
npm run gh-pages
```


## Maintenance

Front-End team (frontend@mercadolibre.com)

## Change log
[See releases](https://github.com/mercadolibre/js-telephone-input/releases)

## TO-DO
[See the issue tracker](https://github.com/mercadolibre/js-telephone-input/issues)

## Browser support
