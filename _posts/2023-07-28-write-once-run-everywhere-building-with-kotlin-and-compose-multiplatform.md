---
layout: post
title: "Write Once, Run Everywhere: Building with Kotlin and Compose Multiplatform"
date: 2023-07-28
categories: [ post ]
tags: [kotlin, android, ios, multiplatform]
---

Welcome to the world of Kotlin multiplatform app development! In this article, we'll explore a simple example of an app
built entirely with Kotlin. We'll leverage the power of Kotlin multiplatform, Compose multiplatform, Kotlin Coroutines,
Kotlin Serialization, and Ktor to create an app that runs smoothly on both Android and iOS platforms.

The focus here is on creating a multiplatform app that uses shared network logic and user interface only just on Kotlin.

We require
macOS, [Android Studio](https://developer.android.com/studio), [Kotlin Multiplatform plugin](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform-mobile), [Xcode](https://developer.apple.com/xcode/),
and a dash of enthusiasm!

> Disclaimer: I aim to focus solely on essential aspects. For the complete code, please refer to the following GitHub
> repository: [https://github.com/vladleesi/factastic](https://github.com/vladleesi/factastic).

So, let's get started!

To begin, let's create a multiplatform project in Android Studio by selecting "New Project" and then choosing the 
"Kotlin Multiplatform App" template.

![Creation of new multiplatform project](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wnn34qwg4p77gjuy6gam.png)

After creating the multiplatform project in Android Studio, the next step is to add all the necessary dependencies and
plugins.

```kotlin
// gradle.properties
org.jetbrains.compose.experimental.uikit.enabled = true
kotlin.native.cacheKind = none

// build.gradle.kts (app)
plugins {
    kotlin("multiplatform").apply(false)
    id("com.android.application").apply(false)
    id("com.android.library").apply(false)
    id("org.jetbrains.compose").apply(false)
    kotlin("plugin.serialization").apply(false)
}


// settings.gradle.kts
plugins {
    val kotlinVersion = extra["kotlin.version"] as String
    val gradleVersion = extra["gradle.version"] as String
    val composeVersion = extra["compose.version"] as String

    kotlin("jvm").version(kotlinVersion)
    kotlin("multiplatform").version(kotlinVersion)
    kotlin("plugin.serialization").version(kotlinVersion)
    kotlin("android").version(kotlinVersion)

    id("com.android.application").version(gradleVersion)
    id("com.android.library").version(gradleVersion)
    id("org.jetbrains.compose").version(composeVersion)
}

repositories {
    google()
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
}
```

After setting up versions, we proceed to work on the platform-specific 'shared' module.

```kotlin
// build.gradle.kts
plugins {
    kotlin("multiplatform")
    id("com.android.library")
    id("org.jetbrains.compose")
    kotlin("plugin.serialization")
}

listOf(
    iosX64(),
    iosArm64(),
    iosSimulatorArm64()
).forEach {
    it.binaries.framework {
        baseName = "shared"
        // IMPORTANTE: Include a static library instead of a dynamic one into the framework.
        isStatic = true
    }
}

val commonMain by getting {
    dependencies {
        // Compose Multiplatform
        implementation(compose.runtime)
        implementation(compose.foundation)
        implementation(compose.material)
        @OptIn(org.jetbrains.compose.ExperimentalComposeLibrary::class)
        implementation(compose.components.resources)

        /.../
    }
}
```

And add dependencies for Android & iOS http client specifics.

```kotlin
val androidMain by getting {
    dependencies {
        val ktorVersion = extra["ktor.version"] as String
        implementation("io.ktor:ktor-client-okhttp:$ktorVersion")
    }
}
val iosMain by getting {
    dependencies {
        val ktorVersion = extra["ktor.version"] as String
        implementation("io.ktor:ktor-client-darwin:$ktorVersion")
    }
}
```

Now, it's time to dive into the UI development. We'll focus on creating a simple UI featuring a button to generate
random useless facts from a server.

```kotlin
// shared/../FactasticApp.kt
@Composable
fun FactasticApp(viewModel: AppViewModel, modifier: Modifier = Modifier) {
    FactasticTheme {
        Surface(
            modifier = modifier.fillMaxSize(),
            color = MaterialTheme.colors.background
        ) {
            val state = viewModel.stateFlow.collectAsState()
            LaunchedEffect(Unit) {
                viewModel.loadUselessFact()
            }
            MainScreen(state.value, viewModel::onClick)
        }
    }
}
```

> Business logic inside `AppViewModel`
> is [here](https://github.com/vladleesi/factastic/blob/master/shared/src/commonMain/kotlin/dev/vladleesi/factastic/presentation/AppViewModel.kt).
> Configuration of Ktor client
> is [here](https://github.com/vladleesi/factastic/blob/master/shared/src/commonMain/kotlin/dev/vladleesi/factastic/data/api/HttpClient.kt).

Behold, the moment for the grand trick has arrived.

#### Android

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val viewModel = AppViewModel()
        setContent {
            FactasticApp(viewModel)
        }
    }
}
```

#### iOS

Let's adapt our Compose code for iOS.

```kotlin
// shared/iosMain/../FactasticApp.kt

fun MainViewController(): UIViewController {
    val viewModel = AppViewModel()
    return ComposeUIViewController {
        FactasticApp(viewModel)
    }
}
```

Next, we should open Xcode to work on the iOS part, as we need to perform some Swift-related tasks. Locate
`iosApp/iosApp.xcodeproj`, right-click on it, and then choose "Open in" -> "Xcode."

In Xcode, create a new Swift file named "ComposeView.swift" by clicking on "File" -> "New" -> "File..." -> "Swift
File" -> "Next" -> "ComposeView.swift" -> "Create."

> Oh my God, what is this? Is it Swift?

```swift
// ComposeView.swift

import Foundation
import SwiftUI
import shared

struct ComposeView: UIViewControllerRepresentable {
    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
        // ignore
    }

    func makeUIViewController(context: Context) -> some UIViewController {
        FactasticAppKt.MainViewController()
    }
}
```

Make a minor update to the existing `ContentView.swift` file in Xcode.

```swift
import SwiftUI
import shared

struct ContentView: View {
   var body: some View {
      // This one
      ComposeView()
   }
}

struct ContentView_Previews: PreviewProvider {
	static var previews: some View {
		ContentView()
	}
}
```

That's all the Xcode part, you may forget about it (if you can) and return to Android Studio.

Before running the app, we must build the iOS module using the following command:
`./gradlew :shared:compileKotlinIosArm64`.

In Android Studio, select the target platform, and then click on the "Run" button to launch the application on the
chosen platform.

![Choosing target platform for launch](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wy2c9iv7xbl1vms6qo3z.jpg)

Well done!

| Android (Dark theme)                                                                                       | iOS (Light theme)                                                                                       |
|------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| ![Android (Dark theme)](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tvgbm18ch9x2vmypi0z2.gif) | ![iOS (Light theme)](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/htgbvoh1d4402og8ims6.gif) |

Resources:

- [Kotlin Multiplatform for mobile](https://kotlinlang.org/docs/multiplatform-mobile-getting-started.html)
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)
- [Kotlin Serialization](https://kotlinlang.org/docs/serialization.html)
- [Ktor](https://ktor.io/docs/getting-started-ktor-client.html)
- [Napier](https://github.com/AAkira/Napier)

Update as of 08/02/2023:
Additionally, I have incorporated [the desktop module](https://github.com/vladleesi/factastic/tree/master/desktop) into
the project.

P.S.
I'd greatly appreciate receiving feedback. If my examples happen to be useful to you, please, consider giving a star to
the [GitHub repository](https://github.com/vladleesi/factastic). Thank you!
