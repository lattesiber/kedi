// GITHUB REPO LİNKİNİ BURAYA YAPIŞTIR
const GITHUB_REPO_URL = "https://github.com/lattesiber/kedi";

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

const YELLOW = "\x1b[93m";
const CYAN = "\x1b[96m";
const RESET = "\x1b[0m";

// PARROT.LIVE'IN SIRRI: 
// 2J = Ekranı temizle, 3J = Scroll geçmişini temizle, H = İmleci 0,0 noktasına sabitle
const CLEAR_SCREEN = "\x1b[2J\x1b[3J\x1b[H"; 

export default function handler(req, res) {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // Tarayıcı mı yoksa Terminal mi kontrolü
  const isTerminal = userAgent.includes("curl") || 
                     userAgent.includes("wget") || 
                     userAgent.includes("powershell") ||
                     userAgent.includes("winhttp");

  if (!isTerminal) {
    // Tarayıcıdan girildiyse repo linkine yönlendir
    res.writeHead(302, { Location: GITHUB_REPO_URL });
    return res.end();
  }

  // Terminal ise animasyon akışını (Stream) başlat
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");

  let position = 0;
  // Kedinin taşmasını engellemek için yürüme sınırı. 
  // 50 karakter sağa gidince başa dönecek, böylece terminalde aşağı kayma (bug) olmayacak.
  const MAX_WIDTH = 50; 

  const interval = setInterval(() => {
    // Bağlantı kopuksa döngüyü durdur
    if (res.writableEnded || res.destroyed) {
      clearInterval(interval);
      return;
    }

    const frameIndex = position % CAT_FRAMES.length;
    const frame = CAT_FRAMES[frameIndex];
    
    // Boşluk sayısını MAX_WIDTH'e göre sınırla (Kedi loop yapsın)
    const spacesCount = position % MAX_WIDTH;
    const spaces = " ".repeat(spacesCount);

    // Her karede ekranı ve geçmişi tamamen temizleyerek titremeyi engelle
    let output = CLEAR_SCREEN;

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

  // Kullanıcı terminali kapattığında (Ctrl+C) hafızayı temizle
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}
