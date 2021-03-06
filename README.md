[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<a href="https://zenhub.com"><img src="https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png"></a>

[![Build Status](https://travis-ci.org/learning-layers/LD-Meteor.svg?branch=master)](https://travis-ci.org/learning-layers/LD-Meteor)
*The current build status only covers code linting since there are problems to get the tests running currently. This will be resolved by changing the project structure in one of the upcoming commits.*

# LD-Meteor
Living Documents implemented in Meteor (web framework)

**Table of Contents**
- [LD-Meteor](#ld-meteor)
- [Development](#development)
    - [Setting up the development environment](#setting-up-development)
    - [Customizing your settings-dev.json file (TODO)](#customizing-the-settings)
- [Deployment (TODO)](#deployment)
    - [Deployment via mupx (TODO)](#deployment-mupx)
    - [Deployment in the Layers Box (TODO)](#deployment-layersbox)
- [License](#license)

## Development

### Setting up the development environment
*You should have your IDE already set up*
In order to get the development environment up and running follow these steps:

1. Go to https://www.meteor.com/install and perform the necessary steps to install meteor on your OS.

2. Clone this github repository.

3. Perform ```meteor npm install``` to install all needed dependencies.

4. Start the client and server via ```meteor --settings settings-dev.test.json```.

5. Now the server should be running at [http://localhost:3000](http://localhost:3000).

6. The next step that you should do is to create a file called settings-dev.json in the project directory and customize your settings there.

### Customizing your settings-dev.json file
*TODO finish*

1. Copy the settings-dev.example.json file into a file in the same directory called settings-dev.json.

2. Enter your Facebook, Google and Learning Layers OIDC crendentials (@see TODO link to Wiki).

3. In the email property enter in the url the smtp string that allows you to access your email account: e.g. ```smtp://<username>:<password>@<domain>:<port>```

## Deployment
### Deployment via mupx
*TODO*
### Deployment in the Layers Box
*TODO*

## License
LD-Meteor is released under the MIT [license](https://github.com/learning-layers/LD-Meteor/blob/master/LICENSE) by Martin Bachl, Institute of Applied Research / Institute for Learning and Innovation in Networks, University of applied sciences Karlsruhe

### Bootswatch Paper Theme
The [Bootswatch Paper Theme](http://bootswatch.com/paper/) by Thomas Park is licensed under the [MIT License](https://github.com/thomaspark/bootswatch/blob/gh-pages/LICENSE). Based on [Bootstrap](http://getbootstrap.com/). Icons from [Font Awesome](http://fortawesome.github.io/Font-Awesome/). Web fonts from [Google](https://www.google.com/fonts/).

### Hopscotch
Hopscotch is licensed under the [Apache License V2.0](https://github.com/linkedin/hopscotch/blob/master/LICENSE).
"Hopscotch is a framework to make it easy for developers to add product tours to their pages." - [Hopscotch Github Repository 2016](https://github.com/linkedin/hopscotch)
