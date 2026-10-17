# Развёртывание на сервере — по шагам

Пошаговый запуск сайта на чужом (или своём) сервере. Команды можно копировать
целиком: каждый блок — это одна законченная операция.

**Что понадобится:** 20–30 минут, сервер с Ubuntu 22.04/24.04 и root-доступ.
Репозиторий публичный, логины для скачивания кода не нужны.

---

## 0. Проверить сервер (2 минуты)

```bash
cat /etc/os-release | head -2      # Ubuntu 22.04 или 24.04
node -v                            # может быть не установлен — это нормально
free -h                            # нужно от 1 ГБ RAM (лучше 2 ГБ)
df -h /                            # от 3 ГБ свободного места
```

Если `free -h` показывает меньше 1,5 ГБ памяти — ничего страшного, на шаге 6
добавим swap-файл.

---

## 1. Войти на сервер

Два способа, оба равнозначны:

- **Из терминала:** `ssh root@IP-адрес`, пароль — тот, что выдал провайдер.
- **Из панели провайдера:** кнопка «Консоль» у сервера. Работает всегда, даже
  если SSH недоступен.

Дальше все команды выполняются на сервере, в этом же окне.

---

## 2. Поставить программы

```bash
apt update && apt -y upgrade
apt -y install git curl ca-certificates sqlite3 caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
npm i -g pnpm
node -v && pnpm -v
```

**Что это даёт:** git (скачать код), sqlite3 (бэкап базы), caddy (HTTPS сам),
Node.js 22 и pnpm. В конце должны увидеть `v22.x` и `9.x`.

Если `apt` не нашёл `caddy` — поставить из официального репозитория:

```bash
apt -y install debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  > /etc/apt/sources.list.d/caddy-stable.list
apt update && apt -y install caddy
```

---

## 3. Завести пользователя и папку для данных

```bash
adduser --system --group --shell /bin/bash --home /srv/eli eli
mkdir -p /var/lib/eli/uploads
chown -R eli:eli /var/lib/eli
```

**Что это даёт:** сайт работает не от root (взлом сайта не станет взломом
сервера). `/var/lib/eli` — отдельная папка для базы и фотографий: она лежит
**вне кода**, поэтому обновления сайта её не трогают.

---

## 4. Скачать код

```bash
git clone https://github.com/Sluchay/Eli.git /srv/eli
chown -R eli:eli /srv/eli
cd /srv/eli && git log --oneline -1
```

**Что это даёт:** код в `/srv/eli`. Если git скажет, что папка не пуста
(пользователь создал её с профилем) — `rm -rf /srv/eli` и повторить клонирование.

---

## 5. Записать настройки в `.env`

Сначала узнаём адрес сервера и придумываем публичное имя. Бесплатный вариант —
`nip.io`: он подставляет IP сам, домен покупать не нужно.

```bash
curl -4 ifconfig.me        # например: 203.0.113.5
# имя будет: el.203-0-113-5.nip.io  (точки заменены дефисами)
```

```bash
cd /srv/eli
cat > .env <<EOF
DATABASE_URL="file:/var/lib/eli/eli.db"
AUTH_SECRET="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
ADMIN_EMAIL="admin@eli.local"
ADMIN_INITIAL_PASSWORD="$(head -c 9 /dev/urandom | base64 | tr -d '\n')"
TZ="Europe/Moscow"
SITE_URL="https://el.203-0-113-5.nip.io"
UPLOAD_DIR="/var/lib/eli/uploads"
STORAGE_DRIVER="local"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
EOF
chown eli:eli .env && chmod 600 .env
grep ADMIN_INITIAL_PASSWORD .env
```

**Что это даёт:** пароль администратора и секрет сессий генерируются случайно
прямо на сервере — их не надо придумывать. **Выпиши пароль** из последней строки:
он понадобится для входа в админку.

`SITE_URL` подставь свой. Он должен начинаться с `https://` — от этого зависит
защищённая кука входа.

---

## 6. Установить, создать базу, собрать

```bash
su - eli -c 'cd /srv/eli && pnpm install'
su - eli -c 'cd /srv/eli && pnpm prisma migrate deploy'
su - eli -c 'cd /srv/eli && pnpm db:seed'
su - eli -c 'cd /srv/eli && pnpm build'
```

**Что это даёт** по порядку: зависимости (~800 МБ, 1–3 минуты) → пустая база по
схеме → демо-меню, часы, столы и первый администратор → продакшн-сборка.

**Важно:** `pnpm db:seed` запускается **один раз** на пустой базе. Повторный
запуск стирает меню, ланчи и афишу.

Если сборка упала с `JavaScript heap out of memory` — добавить swap и повторить:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

---

## 7. Автозапуск

```bash
cat > /etc/systemd/system/eli.service <<'EOF'
[Unit]
Description=ELI site
After=network.target

[Service]
Type=simple
User=eli
Group=eli
WorkingDirectory=/srv/eli
EnvironmentFile=/srv/eli/.env
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now eli
systemctl status eli --no-pager
curl -I http://127.0.0.1:3000
```

**Что это даёт:** сайт запускается сам после перезагрузки сервера и
перезапускается, если упал. `curl` в конце должен вернуть `HTTP/1.1 200 OK`.

---

## 8. HTTPS

```bash
cat > /etc/caddy/Caddyfile <<'EOF'
el.203-0-113-5.nip.io {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
EOF

systemctl reload caddy
```

Сертификат Caddy выпустит сам за несколько секунд. Открываем
`https://el.203-0-113-5.nip.io` — должен открыться сайт.

Если включён файрвол:

```bash
ufw allow 22/tcp && ufw allow 80,443/tcp
```

**Если на сервере уже стоит nginx** и порты 80/443 заняты — Caddy не нужен,
добавь в nginx (файл `/etc/nginx/sites-available/eli`):

```nginx
server {
    listen 80;
    server_name el.203-0-113-5.nip.io;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

и затем `ln -s ../sites-available/eli /etc/nginx/sites-enabled/ && certbot --nginx -d el.203-0-113-5.nip.io`.

---

## 9. Проверить, что всё живо

```bash
cd /srv/eli
pnpm check:pages
pnpm check:styles
pnpm check:admin
```

**Что это даёт:** скрипты сами ходят на `127.0.0.1:3000` и проверяют, что все
страницы отвечают, стили собрались, а админка закрыта паролем.

---

## 10. Первый вход в админку

1. Открыть `https://адрес/admin`
2. Логин `admin@eli.local`, пароль — из `.env` (шаг 5)
3. Сразу: раздел **«Доступы»** → **«Сменить свой пароль»**

С этого момента владелец правит меню сам, без тебя: админка — часть сайта.

---

## 11. Бэкапы (2 минуты, делается один раз)

```bash
cat > /usr/local/bin/eli-backup.sh <<'EOF'
#!/bin/bash
set -euo pipefail
D=/var/lib/eli
B=$D/backups
mkdir -p "$B"
sqlite3 "$D/eli.db" ".backup '$B/eli-$(date +%F).db'"
tar -czf "$B/uploads-$(date +%F).tgz" -C "$D" uploads
find "$B" -type f -mtime +14 -delete
EOF

chmod +x /usr/local/bin/eli-backup.sh
echo '0 4 * * * root /usr/local/bin/eli-backup.sh' > /etc/cron.d/eli-backup
/usr/local/bin/eli-backup.sh && ls -lh /var/lib/eli/backups
```

**Что это даёт:** каждый день в 4:00 копия базы и фотографий, хранение 14 дней.
Прежняя копия перед неудачным обновлением — то, что спасает.

---

## 12. Обновления

```bash
cat > /usr/local/bin/eli-update.sh <<'EOF'
#!/bin/bash
set -euo pipefail
su - eli -c 'cd /srv/eli && git pull --ff-only'
su - eli -c 'cd /srv/eli && pnpm install --frozen-lockfile && pnpm prisma migrate deploy && pnpm build'
systemctl restart eli
echo "обновлено: $(cd /srv/eli && git log --oneline -1)"
EOF

chmod +x /usr/local/bin/eli-update.sh
```

Дальше любое обновление — одна команда:

```bash
eli-update.sh
```

**Что это даёт:** новые версии кода приезжают с GitHub, база мигрирует сама,
сайт перезапускается. Данные (меню, фото, стоп-лист) не затрагиваются — они в
`/var/lib/eli`, а не в коде.

---

## 13. Если что-то не так

| Симптом | Что проверить |
|---|---|
| Сайт не открывается, «502» | `systemctl status eli` → `journalctl -u eli -n 50` |
| `curl 127.0.0.1:3000` не отвечает | сервис не запустился или упал; смотреть journalctl |
| Сборка падает по памяти | добавить swap (шаг 6) и `pnpm build` ещё раз |
| Нет сертификата, HTTPS не работает | `journalctl -u caddy -n 50`, порты 80/443, правильность имени в Caddyfile |
| Порт 3000 занят | `ss -ltnp \| grep 3000` — поменять порт в службе и Caddyfile |
| После `git pull` сайт старый | не выполнен `pnpm build` и `systemctl restart eli` |
| Забыл пароль админки | сказать мне — пришлю скрипт сброса |

---

## 14. Когда появится настоящий домен

1. У владельца куплен домен, A-запись указывает на IP сервера.
2. В `/etc/caddy/Caddyfile` заменить `nip.io`-адрес на домен, `systemctl reload caddy`.
3. В `/srv/eli/.env` заменить `SITE_URL` на новый адрес, `systemctl restart eli`.

Сайт не переезжает, данные не трогаются, сертификат выпускается сам.

---

## Приложение: Git и доступы

**Репозиторий публичный.** Значит `git clone` работает без логинов — серверу
друг ничего не должен. Секретов в репозитории нет: `.env` и `data/` в
`.gitignore`.

**Если позже решишь закрыть репозиторий** — серверу нужен доступ. Лучший способ
не «дать свой пароль», а deploy key:

```bash
ssh-keygen -t ed25519 -C "eli deploy" -f ~/.ssh/eli_deploy -N ""
cat ~/.ssh/eli_deploy.pub
```

Ключ добавить в GitHub: репозиторий → Settings → Deploy keys → Add deploy key
(галочку «Allow write access» не ставить), а в `~/.ssh/config` на сервере:

```
Host github-eli
  HostName github.com
  User git
  IdentityFile ~/.ssh/eli_deploy
```

и клонировать как `git clone git@github-eli:Sluchay/Eli.git /srv/eli`.

**Типичные ошибки при push с домашнего компьютера:**

| Ошибка | Причина | Решение |
|---|---|---|
| `Permission denied (publickey)` | ключ не добавлен в GitHub | Settings → SSH keys, вставить `id_rsa.pub`; либо перейти на HTTPS |
| `RPC failed; HTTP 408` | медленный канал, GitHub оборвал загрузку | `git config http.version HTTP/1.1` и повторить; либо SSH |
| `! [rejected] main -> main (fetch first)` | на GitHub уже есть README | `git fetch origin` → `git push --force-with-lease` |
| `src refspec main does not match any` | запущено не в той папке или нет коммитов | `cd` в папку проекта, проверить `git log --oneline -1` |
