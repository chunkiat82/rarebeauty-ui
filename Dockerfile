FROM node:8.1.3-alpine

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .
COPY ./build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

RUN echo "Asia/Singapore" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

CMD [ "node", "server.js" ]
