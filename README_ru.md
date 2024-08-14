# SPT-AKI docker
Частный Dockerfile для создания докер-контейнера SPT-AKI

## Требования

Debian или другой Linux дистрибутив\
Docker\
git [LFS](https://git-lfs.github.com/)

# Поддержка Docker

## Разделы
Добавлено два раздела:
- `/app/Aki_Data/Server` Содержит стандартные для `SPT-Aki.Server` базу данных и конфигурационные файлы. К примеру - `http.json` или `profiles.json` .
    Контейнер скопирует стандартные файлы для Aki Server в этот раздел если он пуст (к примеру первый запуск контейнера)\

- `/app/user` Содержит стандартные серверные конфигурации (будут созданы при первой авторизации)
    - `./profiles` содержит созданные профили игроков
    - `./mods` установленные серверные моды находятся здесь
    - `./logs` логи сервера появятся здесь

## Переменные среды
- `SPT_LOG_REQUESTS` при значении false, выключает логирование запросов к SPT-AKI
- `SPT_BACKEND_IP` ручное указание внешнего IP адреса в `http.conf` как `backendIp` параметр

Не стесняйтесь экспериментировать с различными настройками и конфигурациями.

# Как собрать

Обновите ARG `SPT_VERSION` в Dockerfile файле на нужный тег
Вы можете ознакомиться с версиями тегов в репозитории [SPT-AKI/Server](https://dev.sp-tarkov.com/SPT-AKI/Server/src/branch/master)
SPT организует свой выпуск с помощью тегов в ветках выпуска. 3.8.0 не был выпущен как тег `master`, как это было сделано раньше. 
Примечание: Было бы замечательно развивать Dockerfile включить SPT_VERSION для ветки и всегда использовать latest тег) 

```bash
git clone https://dev.sp-tarkov.com/Cbr/spt-docker.git
cd spt-docker
docker buildx build -f Dockerfile -t cbr/spt:latest ./
```

# Running

```bash
mkdir /opt/spt-aki && mkdir /opt/spt-aki/Server && mkdir /opt/spt-aki/user
docker run --name spt-aki -v /opt/spt-aki/Server:/app/Aki_Data/Server -v /opt/spt-aki/user:/app/user -e SPT_LOG_REQUESTS=false -e SPT_BACKEND_IP='External IP' -p 6969:6969 cbr/spt:latest -d
```

Где External IP - это нужный вам IP адрес - ваш внешний IP, IP адрес локального хоста или полученный в VPN сети.

# Обновление с предыдущей версии

Обычно обновления минорных версий работают «из коробки», но иногда моды не загружаются и выдают ошибки. В этом случае необходимо удалить папку `/user/cache`.

- [ ] Оцените, стоит ли удалять папку кэша при запуске сервера и как это повлияет на время загрузки сервера. #Планы на будущее
---

