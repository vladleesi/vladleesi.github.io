document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".highlight").forEach(block => {
    const button = document.createElement("button")
    button.className = "copy-code-btn"
    button.textContent = "Copy"

    button.addEventListener("click", () => {
      const code = block.querySelector("code").innerText
      navigator.clipboard.writeText(code)

      button.textContent = "Copied"
      setTimeout(() => (button.textContent = "Copy"), 1200)
    })

    block.style.position = "relative"
    block.appendChild(button)
  })
})