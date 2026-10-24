# Studio 1.2

## Genially

Нажмите «Облегчить код для Genially» → «Скопировать iframe». Вставьте целиком в **Insert → Other**, растяните рамку игры и откройте предпросмотр презентации. Старый блок с полным HTML удалите.

Код содержит только iframe со ссылкой на `https://galmizmaria-beep.github.io/krossvord/dist/player.html`. Настройки и вопросы сжаты в URL-фрагменте; фрагмент не отправляется серверу при загрузке страницы. Игра требует интернет. Стандартные GIF и шрифты загружаются с GitHub Pages. Изменение проекта не меняет ранее созданную ссылку — создайте новый iframe.

При размере ссылки больше 60 000 символов скачайте автономный HTML и разместите его на своём хостинге. В диалоге есть поле HTTPS-адреса.

«Скачать автономный HTML» сохраняет полноценную офлайн-игру. Не вставляйте содержимое файла в поле Genially. Кнопка «Скачать код .txt» сохраняет только iframe.

## Новый персонаж

Прозрачный GIF из 12 разных кадров: удивление, язык, подмигивание и жест лапой. Нажатие на кота вызывает реакцию. «Остановить анимацию» находится в настройках кота. Системное предпочтение уменьшения движения по-прежнему отключает CSS-переходы, но не подменяет GIF неподвижным изображением без выбора в проекте.

Старые встроенные персонажи обновляются по хешу при открытии проекта, пользовательские изображения сохраняются.

ImageGen: `exec-582c2a36-b7e8-4efa-a001-5c7883c76241.png`. Лист: `design/black-cat-spritesheet.png`. Сборка: `scripts/build-cat-gif.cjs`, 12 кадров по 362 × 362, прозрачность, бесконечный цикл. Первый кадр сохранён как статичная версия.

Промпт: Create a professional 3D animation sprite sheet, EXACTLY 4 columns and 3 rows, twelve equal square frames, transparent background, no grid, no text. Funny original fluffy charcoal-black round cat, ridiculously huge expressive golden yellow eyes, tiny orange nose, two goofy little buck teeth, tiny tongue, wild tufts, plush groomed fur with visible strands, stubby paws. Premium animated feature film quality, charming mischievous comic timing, warm key light, lavender rim light. Seated facing camera, same locked camera and scale. Frames 1–3 curious head tilt; 4 blink; 5–6 surprised mouth and raised paws; 7–9 tongue out, thumbs-up, grin; 10–11 wink then paws lower; 12 return to initial pose. Real distinct expressions.

Пример пользователя: https://storage.yandexcloud.net/chefs-kiss-english.ru/Plurals/index.html — изучен исходный HTML и первый кадр GIF. Там используется прозрачный GIF в img и CSS-реакции. Изображения примера не копировались в проект.

## Интерфейс и проверка

Современное оформление Studio находится в `dist/studio.css` и не включается в экспорт игры.

`tests/embed.test.cjs` проверяет сжатую и обычную ссылку, запуск player.html, локализацию/цвета, один iframe без стилей и скриптов родительской страницы, явную паузу GIF, реакцию на клик и некорректные ссылки. Регрессии проверяют скачивание автономного HTML отдельно от iframe TXT.

Browser не обнаружил доступных браузеров. Визуальная проверка Studio и непосредственная вставка в авторизованный Genially не выполнены. JSDOM проверяет DOM и выполнение сценариев, но не заменяет рендеринг браузера или проверку ограничений Genially.
