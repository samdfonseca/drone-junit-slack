FROM node:alpine

COPY . /app
WORKDIR /app

RUN yarn install && yarn run build && \
    chmod +x ./bin/drone-junit-slack && \
    ln -sf /app/bin/drone-junit-slack /usr/bin/drone-junit-slack

ENTRYPOINT ["/usr/bin/drone-junit-slack"]