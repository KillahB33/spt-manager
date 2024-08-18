# SPT Manager

A management tool for your remote server hosted spt instance with a web management ui.

## Features

- provide a web ui for server mod management
- add mod to your server using github link
- check if mod is latest and notify user if it isn't
- allow user to update to latest with the click of a button

# Docker Support

## Docker Image

The workflow will produce an image anytime and changes are pushed to main branch
You can download the image from ghcr.io/killahb33/spt-manager:${{ env.SPT_VERSION }}

## Volumes
Two volumes are added, a third being optional:
- `/app/SPT_Data/Server` contains standard `SPT.Server` database and configuration files. For example, `http.json` or `profiles.json`
    The container will copy standard SPT Server files to this volume if emty (i.e. mounted by the very first time)
- `/app/user` with the standard server configuration (will be created on first login)
    - `./profiles` contains the player profiles created
    - `./mods` installed server mods go here
    - `./logs` server logs will appear here
- `/app/BepInEx` this is the client side mods, mount this if you are planning to use [modsync](https://github.com/c-orter/modsync)

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
git clone https://github.com/KillahB33/spt-manager.git
cd spt-manager
docker build -t killahb33/spt-manager:latest .
```

# Running

```bash
mkdir /opt/sptarkov && mkdir /opt/sptarkov/Server && mkdir /opt/tarkov/user
docker run --name spt-aki -v /opt/sptarkov/Server:/app/SPT_Data/Server -v /opt/sptarkov/user:/app/user -e SPT_LOG_REQUESTS=false -e SPT_BACKEND_IP='External ip' -p 6969:6969 cbr/spt:latest -d
```

Where "External IP" - this is the IP address you need - your external IP, local host IP address or received in the VPN network.

Additionally, a `compose.yml` file has been provided for the sake of convenience.

# Upgrading from previous version

Usually, minor version upgrades do work out of the box, but sometimes, mods fail to load giving errors. In that case, it is needed to delete `/user/cache` folder.

- [ ] Evaluate if it's worth deleting the cache folder on server startup and its impact on server boot time. #todo

---

Know issues:

- `git-lfs` can fail because some regressions on git: https://github.com/git-lfs/git-lfs/issues/5749
    - In that case we can add `ARG GIT_CLONE_PROTECTION_ACTIVE=false` when building so that the `alpine:git` intermediate container is able to fetch all the dependencies.
- the mod is only able to handle single asset releases, so if your mod has multiple assets in a release (not including source) then it can't handle it.

Contributions:

CBR - the original [spt-docker](https://dev.sp-tarkov.com/Cbr/spt-docker) creator which this project is heavily based on
Corter - [modsync](https://github.com/c-orter/modsync) creator and collaboration partner on how we can best help the spt community