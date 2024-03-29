package pages

import emotion.react.css
import react.VFC
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.h2
import web.cssom.AlignItems
import web.cssom.Display
import web.cssom.FlexDirection
import web.cssom.JustifyContent

val FactasticPage = VFC {
    div {
        css {
            justifyContent = JustifyContent.center
            alignItems = AlignItems.center
            display = Display.grid
            flexDirection = FlexDirection.column
        }
        h2 {
            +"The Factastic page is under construction.."
        }
    }
}