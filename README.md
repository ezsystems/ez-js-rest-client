JavaScript client for eZ Publish REST interface.
===========
Main goal is to ease the communication with the eZ Publish backend and provide a unified interface for all needed operations.

Installation
------------
Project maintenance is handled in nodejs environment with a help of Grunt task runner.
To install everything properly you should install nodejs first (http://nodejs.org/).

Next, from project's root directory run ```npm install -g grunt-cli``` command.
It will install Grunt task runner and make ```grunt``` command available anywhere on your system.
Depending on the user setup, this action might require to be root.
After that run ```npm install``` command . That should make other commands available.

Building
--------
Building project files into single file dist/CAPI.js is achieved by running ```grunt``` command.
Building with consequent jshint spell check is achieved by running ```grunt hint``` command.

Testing - Unit tests
--------------------
Unit Tests are executed by running ```grunt test``` command.
"CAPI.spec.js" file is auto-generated and then executed in "spec" folder.
It is composed of project files in following order:

* test/CAPI.testing.header.js
* All the CAPI files ("sourceFiles" array in Gruntfile.js)
* test/*.tests.js ("testCombo" array in Gruntfile.js)

Testing - Manual tests
----------------------
Manual testing functional can be achieved by installing Symfony2 bundle "jsRestClientBundle", which is situated in the test/manual/ folder.

Before bundle installation run ```grunt``` command once. It will concatenate all the source files into Resources/public/js/CAPI.js file.

Then the bundle could be installed into your current ezPublish 5.x instance using following instruction:
* Create ```path/to/ezpublish5/src/EzSystems``` if it does not exist.
* Symlink the bundle into /src/EzSystems/ (keep folder name).
* Edit /ezpublish/EzPublishKernel.php and add the following line before in the return statement of the method registerBundles:

    ```php
    $bundles[] = new EzSystems\jsRestClientBundle\jsRectClientBundle();
    ```

* Import routing.yml file of the bundle into main routing file by adding the following lines at the very bottom of ```ezpublish/config/routing.yml```:

    ```
    jsRestClientBundle:
        resource: "@jsRestClientBundle/Resources/config/routing.yml"
    ```

* Clear the Symfony 2 caches with ezpublish/console.

After these steps you may access /js-rest-client-test/ path where you will find testing html page.
Most of requests can be configured a little bit before executing them by changing input values.
See details of tests implementation in Resources/public/js/cookbook-*.js files.