# Иллюстрации

Сгенерированы встроенным ImageGen для этого проекта, затем уменьшены системным `sips` с сохранением прозрачности. Это растровые изображения, а не интерактивные WebGL-модели. Реакции кота выполняются CSS; собственные GIF состояний поддерживаются.

- `dist/assets/forest-cat.png`: кот Листик, 640 px по большей стороне.
- `dist/assets/forest-border.png`: ботанический лесной бордюр, 1400 px по большей стороне.

## Финальный промпт кота

Use case: stylized-concept. Asset type: transparent cutout mascot for a Russian educational crossword editor with warm storybook forest aesthetic. Create one adorable premium 3D ginger cat tutor, full body seated, fluffy orange fur, cream muzzle and chest, large expressive green eyes, tiny round brass glasses, forest green knitted scarf, holding a small open aged cream book in front paws. A small fern beside the feet. Beautiful polished 3D animated film aesthetic, tactile fur and fabric, gentle warm studio lighting, friendly intelligent expression, three quarter front view, entire cat visible with generous margins. No text, no watermark, no background, genuinely transparent alpha. Single character, no extra paws. Intended to sit beside a crossword grid.

## Финальный промпт бордюра

Use case: illustration-story. Asset type: subtle decorative footer border for a warm parchment educational crossword game UI. Wide panoramic low horizontal forest floor border, 3:1 aspect ratio. Fine hand painted watercolor and vintage storybook ink illustration in moss green, warm ochre, rust and cream. Small fern fronds, grasses, tiny orange mushrooms, acorns, scattered oak leaves and a couple of small pine saplings gathered along the bottom edge, with botanical stems rising slightly along far left and far right. Very generous totally empty transparent space across center and upper area, transparent background. Delicate detailed cottagecore artwork inspired by old botanical fairy tale books. No characters, no text, no letters, no watermark. Crisp usable UI decorative asset.

## Новый помощник 1.1 — Уголёк

Сгенерирован встроенным ImageGen по новому пользовательскому референсу. Это чёрный пушистый 3D-кот с большими жёлтыми глазами. Исходный лист `design/black-cat-spritesheet.png` содержит 12 последовательных кадров; скрипт `scripts/build-cat-gif.cjs` кодирует их в настоящий зацикленный GIF с прозрачностью. Движение нарисовано в кадрах, CSS не является источником анимации GIF.

Результат: `dist/assets/black-cat.gif` — 12 кадров, 362×362, 417480 байт. Для уменьшения анимации используется `dist/assets/black-cat-still.png`.

Промпт: «Create a precise animation sprite sheet, exactly 4 columns x 3 rows, of the same cute funny fluffy black 3D cartoon cat inspired by the supplied reference: shaggy charcoal fur, enormous golden yellow eyes, tiny dark golden nose, goofy friendly face, one tiny tooth, plump seated body and front paws. Transparent background. Same scale and camera in all cells. Sequence: neutral, raise right paw, wave outward/inward, half blink, closed eyes, reopen, lower paw, return to neutral. Full ears and paws visible, no text, no clothes, no glasses, no books.»
