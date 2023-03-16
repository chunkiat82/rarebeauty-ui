FROM node:10

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .

# Install Node.js dependencies
RUN npm install --production --no-progress

# Copy application files
COPY ./build .

RUN cp /usr/share/zoneinfo/Asia/Singapore /etc/localtime
RUN echo "Asia/Singapore" > /etc/timezone

CMD [ "node", "server.js" ]
