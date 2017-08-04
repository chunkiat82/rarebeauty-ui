FROM node:8.2.1

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .
COPY ./build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/Asia/Singapore /etc/localtime
RUN echo "Asia/Singapore" > /etc/timezone

CMD [ "node", "server.js" ]
