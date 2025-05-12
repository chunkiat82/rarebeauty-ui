# Use Node.js LTS version
FROM node:20-slim

# Set timezone
ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY src/ ./src/
COPY src/api/keys/ ./src/api/keys/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose the application port
EXPOSE 3002

# Start the application
CMD [ "node", "src/index.js" ]
