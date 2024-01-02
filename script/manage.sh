#!/bin/bash

# 사용법: ./manage.sh [start|stop|restart]

# 루트 디렉토리의 .env 파일을 소스로 사용
source ./.env

# Docker Compose 파일 경로 설정
MONGO_COMPOSE_PATH="./mongo/docker-compose.yml"
ELK_COMPOSE_PATH="./docker-elk/docker-compose.yml"
MONSTACHE_COMPOSE_PATH="./monstache/docker-compose.yml"

# 네트워크 이름 설정
NETWORK_NAME=${COMMON_NETWORK:-searchEngines}

# 네트워크 확인 및 생성 함수
check_create_network() {
    if [ -z "$(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}")" ] ; then
        echo "네트워크 '$NETWORK_NAME'가 존재하지 않습니다. 생성합니다..."
        docker network create $NETWORK_NAME
    else
        echo "네트워크 '$NETWORK_NAME'가 이미 존재합니다."
    fi
}

# 시작 함수
start_services() {
    
    sh ./mongo/script/key_gen.sh


    check_create_network
    echo "MongoDB 서비스를 시작합니다."
    docker-compose --env-file ./.env -f $MONGO_COMPOSE_PATH up -d
    echo "ELK 서비스를 시작합니다."
    docker-compose --env-file ./.env -f $ELK_COMPOSE_PATH up -d
    echo "Monstache 서비스를 시작합니다."
    docker-compose --env-file ./.env -f $MONSTACHE_COMPOSE_PATH up -d
}

# 중지 함수
stop_services() {
    echo "MongoDB 서비스를 중지합니다."
    docker-compose -f $MONGO_COMPOSE_PATH down
    echo "ELK 서비스를 중지합니다."
    docker-compose -f $ELK_COMPOSE_PATH down
    echo "Monstache 서비스를 중지합니다."
    docker-compose -f $MONSTACHE_COMPOSE_PATH down
}

# 재시작 함수
restart_services() {
    stop_services
    start_services
}

# 스크립트 인자에 따른 조건 분기
case $1 in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    *)
        echo "사용법: $0 [start|stop|restart]"
        exit 1
esac

exit 0
