import {
  createUIMessageStreamResponse,
  createUIMessageStream,
} from "ai";

function getMockResponse(): string {
  const responses = [
    "Merhaba! Size nasıl yardımcı olabilirim? AkOs proje yönetim sistemi hakkında sorularınızı yanıtlayabilirim. Projeleriniz, müşterileriniz, teklifler veya hakediş süreçleri hakkında bilgi almak isterseniz sormaktan çekinmeyin.",
    "Bu harika bir soru! İnşaat projelerinde maliyet kontrolü için birkaç önerim var:\n\n1. **BOQ takibi** — Her iş kalemini düzenli kontrol edin\n2. **Hakediş planlaması** — Aylık hakediş dönemlerini takip edin\n3. **Taşeron yönetimi** — Sözleşme koşullarını net belirleyin\n4. **Satınalma optimizasyonu** — Toplu alım avantajlarını değerlendirin\n\nDaha detaylı bilgi ister misiniz?",
    "Tabii ki! İşte proje zaman çizelgesi oluşturma adımları:\n\n- Projenin kapsamını ve iş kırılım yapısını belirleyin\n- Her bir aktivite için süre tahminlerini yapın\n- Kritik yol analizini gerçekleştirin\n- Kaynak planlamasını yapın\n- Gantt şemasını oluşturun\n\nBu konuda AkOs sistemi size otomatik raporlama ve takip imkanı sunuyor.",
    "Hakediş süreci hakkında bilgi vermeme sevindim. Genel adımlar şunlardır:\n\n1. Saha ölçümleri yapılır\n2. İş kalemleri ve miktarlar doğrulanır\n3. Birim fiyatlar uygulanır\n4. Kesintiler ve avanslar hesaplanır\n5. Hakediş raporu oluşturulur\n6. Onay sürecine sunulur\n\nSistem üzerinden tüm bu adımları kolayca takip edebilirsiniz.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST() {
  const text = getMockResponse();
  const words = text.split(" ");

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (const word of words) {
        writer.write({ type: "text-delta", delta: word + " ", id: "msg-1" });
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
