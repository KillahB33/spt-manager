# single-player-tarkov-docker
Private Dockerfile to build a docker container for Single-Player-Tarkov

[README на Русском языке](README_ru.md)

## Requirements

Debian or another Linux distr\
Docker\
git [LFS](https://git-lfs.github.com/)

# Docker Support

## Volumes
Two volumes are added:
- `/app/SPT_Data/Server` contains standard `SPT.Server` database and configuration files. For example, `http.json` or `profiles.json`
    The container will copy standard SPT Server files to this volume if emty (i.e. mounted by the very first time)
- `/app/user` with the standard server configuration (will be created on first login)
    - `./profiles` contains the player profiles created
    - `./mods` installed server mods go here
    - `./logs` server logs will appear here

## Enviroment Variables
- `SPT_LOG_REQUESTS` when false, disables SPT-AKI Request Logging
- `SPT_BACKEND_IP` when present, used in `http.conf` as `backendIp` property

Feel free to play yourself with the different setups and configs.

# How to build

Update `SPT_VERSION` Dockerfile ARG with the desired tag
You can look for the most recent tag with `git describe --tags --abbrev=0`
The way SPT is organizing their release is by tags on  release branches. 3.8.0 was not released as a tag on `master` as it was done before. 
Note: It can be a good idea to evolve the Dockerfile to include SPT_VERSION for the branch and always use latest tag) 

```bash
git clone https://dev.sp-tarkov.com/Cbr/spt-docker.git
cd spt-docker
docker buildx build -f Dockerfile -t cbr/spt:latest ./
```

# Running

```bash
mkdir /opt/spt-aki && mkdir /opt/spt-aki/Server && mkdir /opt/spt-aki/user
docker run --name spt-aki -v /opt/spt-aki/Server:/app/SPT_Data/Server -v /opt/spt-aki/user:/app/user -e SPT_LOG_REQUESTS=false -e SPT_BACKEND_IP='External ip' -p 6969:6969 cbr/spt:latest -d
```

Where "External IP" - this is the IP address you need - your external IP, local host IP address or received in the VPN network.

Additionally, a `compose.yml` file has been provided for the sake of convenience.

# Upgrading from previous version

Usually, minor version upgrades do work out of the box, but sometimes, mods fail to load giving errors. In that case, it is needed to delete `/user/cache` folder.

- [ ] Evaluate if it's worth deleting the cache folder on server startup and its impact on server boot time. #todo

---

Know issues:
`git-lfs` can fail because some regressions on git: https://github.com/git-lfs/git-lfs/issues/5749
In that case we can add `ARG GIT_CLONE_PROTECTION_ACTIVE=false` when building so that the `alpine:git` intermediate container is able to fetch all the dependencies.
