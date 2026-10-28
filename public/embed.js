/*
 * FormFlow embed script
 * Paste this on any website to add a floating chat button for a form:
 *
 *   <script src="https://YOUR-APP/embed.js" data-form="FORM_SLUG"
 *           data-color="#dc2626" async></script>
 *
 * The button opens a panel with the form's chat inside an iframe, so the
 * host website's styles and scripts can't interfere with it (or vice versa)
 */
(function () {
    var script = document.currentScript;
    if (!script) return;

    var slug = script.getAttribute("data-form");
    if (!slug) {
        console.error('FormFlow: add data-form="<form slug>" to the script tag.');
        return;
    }
    // Only allow a plain hex colour, so nothing odd can be injected into CSS
    var color = script.getAttribute("data-color") || "#dc2626";
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) color = "#dc2626";

    // The app's address is wherever this script was loaded from
    var appOrigin = new URL(script.src).origin;
    var formUrl = appOrigin + "/f/" + encodeURIComponent(slug) + "?embed=1";

    // Don't add a second button if the snippet is pasted twice
    var marker = "formflow-" + slug;
    if (document.getElementById(marker)) return;

    // ----- Styles (all class names start with "ff-" to avoid clashes) -----
    var style = document.createElement("style");
    style.textContent =
        ".ff-launcher:hover{transform:scale(1.06)}" +
        ".ff-launcher:focus-visible{outline:3px solid #fff;outline-offset:2px}" +
        ".ff-panel{position:fixed;right:20px;bottom:88px;z-index:2147483000;" +
        "width:380px;height:560px;max-height:calc(100vh - 108px);display:none;" +
        "border-radius:16px;overflow:hidden;background:#fff;" +
        "box-shadow:0 12px 40px rgba(0,0,0,.3)}" +
        ".ff-panel.ff-open{display:block}" +
        ".ff-panel iframe{width:100%;height:100%;border:0;display:block}" +
        ".ff-close:hover{opacity:.8}" +
        // Phones: the panel takes over the whole screen.
        "@media (max-width:480px){.ff-panel{right:0;bottom:0;width:100%;" +
        "height:100%;max-height:none;border-radius:0}}";
    document.head.appendChild(style);

    // Buttons get their look as inline "!important" styles, so a website's
    // own CSS (e.g. a rule for every <button>) can't restyle them
    function lockStyles(element, styles) {
        for (var name in styles) {
            element.style.setProperty(name, styles[name], "important");
        }
    }

    // ----- The panel (the iframe is only created on first open) -----
    var panel = document.createElement("div");
    panel.id = marker;
    panel.className = "ff-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat form");

    var close = document.createElement("button");
    close.type = "button";
    close.className = "ff-close";
    close.setAttribute("aria-label", "Close chat");
    close.textContent = "\u00d7"; // a multiplication sign used as an X
    lockStyles(close, {
        position: "absolute",
        top: "8px",
        right: "8px",
        width: "32px",
        height: "32px",
        margin: "0",
        padding: "0",
        border: "0",
        "border-radius": "8px",
        background: "rgba(255,255,255,.2)",
        color: "#fff",
        font: "20px/1 sans-serif",
        cursor: "pointer",
    });

    // ----- The round button -----
    var chatIcon =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" ' +
        'stroke="#fff" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>';
    var closeIcon =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
        'stroke="#fff" stroke-width="2.5" stroke-linecap="round" ' +
        'aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "ff-launcher";
    lockStyles(launcher, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        "z-index": "2147483000",
        width: "56px",
        height: "56px",
        margin: "0",
        padding: "0",
        border: "0",
        "border-radius": "50%",
        background: color,
        cursor: "pointer",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "box-shadow": "0 8px 24px rgba(0,0,0,.25)",
        transition: "transform .15s",
    });
    launcher.setAttribute("aria-label", "Open chat");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = chatIcon;

    var iframe = null;
    var isOpen = false;

    function setOpen(open) {
        isOpen = open;
        if (open && !iframe) {
            iframe = document.createElement("iframe");
            iframe.src = formUrl;
            iframe.title = "Chat form";
            panel.insertBefore(iframe, close);
        }
        panel.className = open ? "ff-panel ff-open" : "ff-panel";
        launcher.innerHTML = open ? closeIcon : chatIcon;
        launcher.setAttribute("aria-label", open ? "Close chat" : "Open chat");
        launcher.setAttribute("aria-expanded", String(open));
        updateLauncher();
    }

    // On phones the open panel covers the whole screen and has its own close
    // button, so the round button is hidden while the panel is open
    var phone = window.matchMedia("(max-width: 480px)");
    function updateLauncher() {
        var hide = isOpen && phone.matches;
        launcher.style.setProperty("display", hide ? "none" : "flex", "important");
    }
    phone.addEventListener("change", updateLauncher);

    launcher.addEventListener("click", function () {
        setOpen(!isOpen);
    });
    close.addEventListener("click", function () {
        setOpen(false);
        launcher.focus();
    });
    // Escape closes the panel: here on the website, or inside the chat
    // (the chat page sends a "formflow:close" message to this page)
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && isOpen) setOpen(false);
    });
    window.addEventListener("message", function (event) {
        if (
            iframe &&
            event.source === iframe.contentWindow &&
            event.origin === appOrigin &&
            event.data &&
            event.data.type === "formflow:close"
        ) {
            setOpen(false);
            launcher.focus();
        }
    });

    panel.appendChild(close);
    document.body.appendChild(panel);
    document.body.appendChild(launcher);
})();