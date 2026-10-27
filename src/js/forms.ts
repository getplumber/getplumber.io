/**
 * Progressive enhancement for the site forms (book a demo, newsletter).
 * Any <form data-form> posts its fields as JSON to its action and shows the
 * outcome in its [data-form-status] element. Invalid fields get aria-invalid.
 */

const MESSAGES: Record<string, string> = {
  ok: "Thanks, we will be in touch shortly.",
  invalid: "Please check the highlighted fields.",
  rate_limited: "Too many requests. Please try again in a few minutes.",
  unconfigured: "This form is not active yet. Email us at hello@getplumber.io.",
  error: "Something went wrong. Email us at hello@getplumber.io.",
};

interface ApiError {
  error?: string;
  fields?: string[];
}

function enhance(form: HTMLFormElement) {
  if (form.dataset.enhanced === "true") return;
  form.dataset.enhanced = "true";

  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");

  const setStatus = (text: string, isError: boolean) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("text-danger-500", isError);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (button) button.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as ApiError;

      if (res.ok) {
        form.reset();
        setStatus(MESSAGES.ok, false);
        return;
      }

      body.fields?.forEach((name) => {
        form.querySelector(`[name="${name}"]`)?.setAttribute("aria-invalid", "true");
      });
      setStatus(MESSAGES[body.error ?? "error"] ?? MESSAGES.error, true);
    } catch {
      setStatus(MESSAGES.error, true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function init() {
  document.querySelectorAll<HTMLFormElement>("form[data-form]").forEach(enhance);
}

init();
document.addEventListener("astro:after-swap", init);
