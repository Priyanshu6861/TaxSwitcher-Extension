import Plugin from "src/plugin-system/plugin.class";

export default class TaxSwitcherPlugin extends Plugin {
  init() {
    if (window.__taxSwitcherInitialized) return;
    window.__taxSwitcherInitialized = true;

    const taxTemplate = document.querySelector("template[data-tax-switcher]");
    if (!taxTemplate) {
      this.hideLoading();
      return;
    }

    const html = taxTemplate.innerHTML;
    if (html.trim()) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
    }

    this.handleTopBarTaxSwitch();
    this.handleHeaderTaxSwitch();
    this.handlePDPTaxSwitch();
    this.handleMobileCanvasTaxSwitch();
    this.handleFooterTaxSwitch();

    const dataElem = document.getElementById("tax-switcher-data");
    if (!dataElem) {
      this.hideLoading();
      return;
    }

    const firstPopUpConfig = dataElem.getAttribute("data-show-first-popup");
    if (firstPopUpConfig === "1") {
      this.showFirstPopUp(dataElem);
    }

    this.hideLoading();
  }

  showLoading() {
    if (document.getElementById("tax-switcher-loading")) return;
    const loader = document.createElement("div");
    loader.id = "tax-switcher-loading";
    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100vw";
    loader.style.height = "100vh";
    loader.style.background = "rgb(0 0 0 / 70%)";
    loader.style.display = "flex";
    loader.style.alignItems = "center";
    loader.style.justifyContent = "center";
    loader.style.zIndex = "9999";

    loader.innerHTML = `
      <div style="border: 2px solid #bebebe;
        border-top: 2px solid #0026ff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;">
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      </style>`;
    document.body.appendChild(loader);
  }

  hideLoading() {
    const loader = document.getElementById("tax-switcher-loading");
    if (loader) {
      loader.remove();
    }
  }

  showFirstPopUp(dataElem) {
    const cookieName = "taxPromptShown";
    const switchUrl = dataElem.getAttribute("data-switch-url");
    const modalUrl = dataElem.getAttribute("data-modal-url");
    if (!this.getCookie(cookieName) && modalUrl && switchUrl) {
      fetch(modalUrl, {
        method: "GET",
        credentials: "same-origin",
      })
        .then((response) => response.text())
        .then((html) => {
          if (html.trim().length > 0) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const modalElem = tempDiv.querySelector("#taxSwitcherFirstModal");
            if (modalElem) {
              document.body.appendChild(modalElem);
              const modal = new bootstrap.Modal(modalElem);
              modal.show();
            }

            document.querySelectorAll("[data-tax-choice]").forEach((button) => {
              button.addEventListener("click", (e) => {
                e.preventDefault();

                const netValue = button.dataset.taxChoice;
                const returnUrl = window.location.href;

                const dataElem = document.getElementById("tax-switcher-data");
                if (dataElem) {
                  const firstPopUpConfig = dataElem.getAttribute(
                    "data-show-loading-animation"
                  );
                  if (firstPopUpConfig === "1") {
                    this.showLoading();
                  }
                }

                fetch(switchUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: `net=${encodeURIComponent(
                    netValue
                  )}&return=${encodeURIComponent(returnUrl)}`,
                }).then(() => {
                  this.setCookie(cookieName, "1", 365);
                  window.location.reload();
                });
              });
            });
          }
        });
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; expires=" +
      expires +
      "; path=/";
  }

  handleTopBarTaxSwitch() {
    this.handleTaxSwitch(
      "taxSwitchProductDetailInput-topbar",
      "taxSwitcherForm-topbar",
      "taxModeInput-topbar"
    );
  }
  handleHeaderTaxSwitch() {
    this.handleTaxSwitch(
      "taxSwitchProductDetailInput-header",
      "taxSwitcherForm-header",
      "taxModeInput-header"
    );
  }

  handlePDPTaxSwitch() {
    this.handleTaxSwitch(
      "taxSwitchProductDetailInput-Main",
      "taxSwitcherForm-Main",
      "taxModeInput-Main"
    );
  }

  handleMobileCanvasTaxSwitch() {
    this.handleTaxSwitch(
      "taxSwitchProductDetailInput-mobileCanvas",
      "taxSwitcherForm-mobileCanvas",
      "taxModeInput-mobileCanvas"
    );
  }

  handleFooterTaxSwitch() {
    this.handleTaxSwitch(
      "taxSwitchProductDetailInput-footer",
      "taxSwitcherForm-footer",
      "taxModeInput-footer"
    );
  }

  handleTaxSwitch(checkboxId, formId, inputId) {
    const checkbox = document.getElementById(checkboxId);
    const form = document.getElementById(formId);
    const hiddenInput = document.getElementById(inputId);
    if (checkbox && form && hiddenInput) {
      checkbox.addEventListener("change", () => {
        hiddenInput.value = checkbox.checked ? "0" : "1";

        const dataElem = document.getElementById("tax-switcher-data");
        if (dataElem) {
          const firstPopUpConfig = dataElem.getAttribute(
            "data-show-loading-animation"
          );
          if (firstPopUpConfig === "1") {
            this.showLoading();
          }
        }

        const formData = new FormData(form);
        fetch(form.action, {
          method: form.method || "POST",
          body: formData,
          credentials: "same-origin",
        })
          .then((response) => {
            if (response.redirected) {
              window.location.href = response.url;
            } else {
              window.location.reload();
            }
          })
          .catch(() => {
            window.location.reload();
          });
      });
    }
  }
}
