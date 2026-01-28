document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".highlight").forEach((block) => {
    // 🔒 guard: already initialized
    if (block.closest(".code-block-wrap")?.querySelector(".copy-code-btn")) {
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "code-block-wrap";
    wrap.style.position = "relative";

    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(block);

    const button = document.createElement("button");
    button.className = "copy-code-btn";
    button.textContent = "Copy";

    button.addEventListener("click", async () => {
      const code = block.querySelector("code")?.innerText ?? "";
      await navigator.clipboard.writeText(code);

      button.textContent = "Copied";
      setTimeout(() => (button.textContent = "Copy"), 1200);
    });

    wrap.appendChild(button);
  });
});