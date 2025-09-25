# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve globally to serve static files
RUN npm install -g serve

# Expose port 9000
EXPOSE 9000

# Serve the built app
#CMD ["serve", "-s", "dist", "-l", "9000"]

CMD ["serve", "-s", "dist", "-l", "9000", "--single"]
