// GitHub Repositiory Bağlantınız (Burayı kendi reponuzla güncelleyin)
const GITHUB_REPO_URL = "https://github.com/lattesiber/kedi";

// Kedi Animasyon Kareleri
const CAT_FRAMES = [
  [
    "  /\\_/\\  ",
    " ( o.o ) ",
    "  > ^ <  "
  ],
  [
    "  /\\_/\\  ",
    " ( -.- ) ",
    "  > ^ <  "
  ],
  [
    "  /\\_/\\    Miyav! ",
    " ( ^.^ ) /       ",
    "  > ^ <  "
  ],
  [
    "  /\\_/\\  ",
    " ( -.- ) ",
    "  > ^ <  "
  ]
];

// ANSI Renk Kodları
const YELLOW = "\x1b[93m";
const CYAN = "\x1b[96m";
const RESET = "\x1b[0m";

export default function handler(req, res) {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // 1. Tarayıcı Kontrolü: curl/wget değilse GitHub'a yönlendir
  if (!userAgent.includes("curl") && !userAgent.includes("wget")) {
    res.writeHead(302, { Location: GITHUB_REPO_URL });
    return res.end();
  }

  // 2. HTTP Streaming Başlıkları
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");

  let position = 0;
  const columns = 80;

  // 3. Her 0.4 saniyede bir yeni kare basan döngü
  const interval = setInterval(() => {
    if (res.writableEnded || res.destroyed) {
      clearInterval(interval);
      return;
    }

    const frameIndex = position % CAT_FRAMES.length;
    const frame = CAT_FRAMES[frameIndex];
    const spaces = " ".repeat(position % Math.max(1, columns - 18));

    // İmleci başa al (\x1b[H) ve ekranı temizle (\x1b[2J)
    let output = "\x1b[H\x1b[2J";

    for (const line of frame) {
      if (line.includes("Miyav!")) {
        output += `${spaces}${YELLOW}  /\\_/\\    ${CYAN}Miyav! ${RESET}\n`;
      } else if (line.includes(" ( ^.^ ) /")) {
        output += `${spaces}${YELLOW} ( ^.^ ) ${CYAN}/       ${RESET}\n`;
      } else {
        output += `${spaces}${YELLOW}${line}${RESET}\n`;
      }
    }

    res.write(output);
    position++;
  }, 400);

  // 4. Bağlantı kesildiğinde (Ctrl+C) temizlik yap
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}
