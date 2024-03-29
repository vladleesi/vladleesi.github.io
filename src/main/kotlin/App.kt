import js.core.jso
import pages.*
import react.VFC
import react.create
import react.dom.client.createRoot
import react.router.RouterProvider
import react.router.dom.createHashRouter
import style.appStyle
import style.faviconLink
import style.fontLink
import web.dom.document

private val appRouter = createHashRouter(
    routes = arrayOf(
        jso {
            path = "/"
            element = HomePage.create()
            errorElement = Error.create()
        },
        jso {
            path = "/kutilicious"
            element = KutiliciousPage.create()
            errorElement = Error.create()
        },
        jso {
            path = "/braindance"
            element = BraindancePage.create()
            errorElement = Error.create()
        },
        jso {
            path = "/yet-another-calculator"
            element = YetAnotherCalculatorPage.create()
            errorElement = Error.create()
        },
        jso {
            path = "/factastic"
            element = FactasticPage.create()
            errorElement = Error.create()
        },
        jso {
            path = "/scanmate"
            element = ScanmatePage.create()
            errorElement = Error.create()
        }
    ),
)

private val App = VFC {
    RouterProvider {
        router = appRouter
    }
}

fun main() {
    with(document.head) {
        appendChild(faviconLink)
        appendChild(fontLink)
        appendChild(appStyle)
    }

    val root = document.createElement("div")
        .also(document.body::appendChild)

    createRoot(root)
        .render(App.create())
}
