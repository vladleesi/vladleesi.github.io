---
layout: post
title: "How to set up publication signature with the Gradle plugin"
date: 2023-06-11
author: "Vladislav Kochetov"
categories: [ post ]
tags: [gradle, gpg, signing, nexus]
---

## Introduction:
In the realm of software development, ensuring the security and integrity of your artifacts is of paramount importance. One effective approach is to sign your artifacts using GPG (GNU Privacy Guard) keys. This article will guide you through the process of setting up GPG, generating keys, and utilizing [The Signing Plugin](https://docs.gradle.org/current/userguide/signing_plugin.html) to sign artifacts before publishing them to Nexus.

### 1. Installing GPG:
To begin, let's install GPG on our system. Follow the instructions below:

**Linux**:
- Open a terminal window.
- Execute the command: `sudo apt-get install gnupg`

**macOS**:
- Open a terminal window.
- Run the command: `brew install gnupg`

**Windows**:
- Download the Gpg4win installer from the [Gpg4win website](https://gpg4win.org/).
- Run the installer and follow the on-screen instructions.

### 2. Generating GPG Keys:
Once GPG is installed, let's generate GPG keys. These keys will be used to sign your artifacts. Follow these steps:

- Open a terminal or command prompt.
- Execute the command: `gpg --full-generate-key`
- Follow the interactive prompts to configure your key, such as selecting the key type and size.
- Set a strong passphrase for your key. Remember this passphrase as you will need it later.
- Once the key generation is complete, your GPG key pair will be stored in the GPG keyring.

### 3. Configuring The Signing Plugin:

- Open the `build.gradle` file of your project.
- Add the following lines to the top of the file:

   ```groovy
   plugins {
       id 'signing'
   }
   ```

- Configure the signing plugin for root project:

   ```groovy
   signing {
       sign publishing.publications
   }
   ```

- Provide the GPG key details in `gradle.properties`:

   ```groovy
signing.keyId=YOUR_KEY_ID
signing.secretKeyRingFile=~/.gnupg/secring.gpg
signing.password=YOUR_PASSPHRASE
   ```

**Note**:
- To get the `keyId`, you can run the following command `gpg --list-keys --keyid-format short` and take the 8-digit value
- The secring.gpg file has been removed in GPG 2.1. However, GPG still can create such a file: `gpg --export-secret-keys -o secring.gpg`
- To upload your public key to the keyserver, you can use the following command `gpg --keyserver hkp://keyserver.ubuntu.com --send-keys YOUR_KEY_ID`

### 4. Publish with signing:
`./gradlew publishToMavenLocal`
`./gradlew publish`