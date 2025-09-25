NETWORK_NAME=ctfd_net

docker network inspect $NETWORK_NAME >/dev/null 2>&1
docker network create $NETWORK_NAME

docker ps -a --format '{{.Names}}' | grep -w regist_ctf >/dev/null 2>&1
docker rm -f regist_ctf

DOCKER_BUILDKIT=0 docker-compose build
docker-compose up -d