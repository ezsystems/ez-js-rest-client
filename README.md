# JavaScript client library for the eZ Publish REST API

[![Build Status](https://travis-ci.org/ezsystems/ez-js-rest-client.png)](https://travis-ci.org/ezsystems/ez-js-rest-client)

This repository provides a JavaScript library meant to ease the usage of [the eZ
Publish REST API](https://confluence.ez.no/display/EZP/eZ+Publish+REST+API).

## Installation

The eZ Publish JavaScript REST Client is a [bower](http://blower.io) package, so
the easiest way to install it is to run:

```
$ bower install --save ezsystems/ez-js-rest-client
```

Then you can include in your project the file
`bower\_components/ez-js-rest-client/dist/CAPI-min.js` (or the non minified
version). It's also possible to directly take `dist/CAPI.js` or
`dist/CAPI-min.js` in a clone of this repository.

## Development

### Requirements

The project maintenance is handled in a [nodejs](http://nodejs.org) based
environment with a help of Grunt task runner.

* Install [nodejs](http://nodejs.org/)
* Clone this repository
* From the root of the repository, install the local npm dependencies:
  ```
  $ npm install
  ```
* Install the global dependencies (usually you need to be root)
  ```
  # npm install -g grunt-cli yuidocjs
  ```

### API Documentation

The JavaScript API documentation can be generated in the `api` directory with:

```
$ grunt doc
```
Alternatively, you can run
```
$ grunt livedoc
```
to run the [yuidoc documentation
server](http://yui.github.io/yuidoc/args/index.html#server). The dynamic
documentation can then be reached at http://127.0.0.1:3000.


### Build

The library can be built with:

```
$ grunt build
```

This command will (re)generate the files `dist/CAPI.js` and `dist/CAPI-min.js`.

### Tests

#### Unit tests

The unit tests can be executed with:
```
$ grunt test
```

It's also possible to generate a coverage report with:

```
$ grunt coverage
```

After this command, the report is available in
`test/coverage/lcov-report/index.html`.

#### Continuous execution

During development it may be quite handy to automatically rerun unit-tests and/or
lint checks, once any project related file has changed.

Using so called `watch` tasks this can easily be achieved. Currently the following
of those tasks exist:

- `watch:lint`: On each file change execute a linting run
- `watch:test`: Execute a unit-test run on each file change

#### Manual tests

The library can be manually tested by installing the Symfony2 bundle
*jsRestClientBundle*, which is situated in the test/manual/ folder.

Before bundle installation run `grunt build` command once. It will build all the
source files into Resources/public/js/CAPI.js file.

Then the bundle could be installed into your current ezPublish 5.x instance
using following instruction:

* Create `path/to/ezpublish5/src/EzSystems` if it does not exist.
* Symlink the bundle into /src/EzSystems/ (keep folder name).
* Edit /ezpublish/EzPublishKernel.php and add the following line before in the
  return statement of the method registerBundles:

    ```php
    $bundles[] = new EzSystems\jsRestClientBundle\jsRestClientBundle();
    ```

* Import routing.yml file of the bundle into main routing file by adding the
  following lines at the very bottom of `ezpublish/config/routing.yml`:

    ```yaml
    jsRestClientBundle:
        resource: "@jsRestClientBundle/Resources/config/routing.yml"
    ```

* Clear the Symfony 2 caches with ezpublish/console.

After these steps you may access `/js-rest-client-test/` path where you will find
testing html page.  Most of requests can be configured a little bit before
executing them by changing input values.  See details of tests implementation in
Resources/public/js/cookbook-*.js files.
