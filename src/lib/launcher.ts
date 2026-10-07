export const CHROME_FOR_TESTING_VERSION = "154.0.8037.92";

const CHROME_FOR_TESTING_BASE =
  "https://storage.googleapis.com/chrome-for-testing-public";

export function sanitizeBaseUrl(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export function buildLauncherScript(baseUrl: string): string {
  const version = CHROME_FOR_TESTING_VERSION;
  const lines = [
    "@echo off",
    "setlocal",
    'set "ROOT=%LOCALAPPDATA%\\TVAppGuard"',
    `set "CFT_VERSION=${version}"`,
    `set "BASE=${baseUrl}"`,
    'set "CHROME=%ROOT%\\chrome-win64\\chrome.exe"',
    "",
    'if not exist "%ROOT%" mkdir "%ROOT%"',
    "",
    "if not exist \"%CHROME%\" (",
    "  echo Downloading Chrome for Testing one time, this can take a few minutes...",
    `  curl -L -o "%ROOT%\\chrome.zip" "${CHROME_FOR_TESTING_BASE}/%CFT_VERSION%/win64/chrome-win64.zip"`,
    '  tar -xf "%ROOT%\\chrome.zip" -C "%ROOT%"',
    '  del "%ROOT%\\chrome.zip"',
    ")",
    "",
    "if not exist \"%ROOT%\\extension\\manifest.json\" (",
    "  echo Downloading the TVApp popup guard...",
    '  curl -L -o "%ROOT%\\extension.zip" "%BASE%/api/guard/extension"',
    '  if not exist "%ROOT%\\extension" mkdir "%ROOT%\\extension"',
    '  tar -xf "%ROOT%\\extension.zip" -C "%ROOT%\\extension"',
    '  del "%ROOT%\\extension.zip"',
    ")",
    "",
    "echo Opening TVApp...",
    'start "" "%CHROME%" --user-data-dir="%ROOT%\\profile" --load-extension="%ROOT%\\extension" --no-first-run --no-default-browser-check --disable-search-engine-choice-screen --disable-sync --disable-default-apps --no-service-autorun --disable-features=Translate "%BASE%"',
    "endlocal",
    "",
  ];
  return lines.join("\r\n");
}
