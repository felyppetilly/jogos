// Gera os ícones do app (tela de início do iPad/iPhone e manifest) a partir do
// dinossauro do OpenMoji, sobre fundo creme sólido (o iOS não aceita transparência).
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const dino = join(raiz, 'img', 'emoji', '1F995.svg');
const FUNDO = '#fff4e0';

for (const [nome, tam] of [['apple-touch-icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const desenho = Math.round(tam * 0.72); // margem segura para ícone "maskable"
  const img = await sharp(dino, { density: 600 }).resize(desenho, desenho).png().toBuffer();
  await sharp({ create: { width: tam, height: tam, channels: 4, background: FUNDO } })
    .composite([{ input: img, gravity: 'center' }])
    .flatten({ background: FUNDO })
    .png()
    .toFile(join(raiz, 'icons', nome));
  console.log(`ícone ${nome}`);
}
