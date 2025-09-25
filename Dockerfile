# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g vite


# Copy source code
COPY . .

# Expose port 9000
EXPOSE 9000

# Start React dev server on port 9000
#CMD ["npm", "run", "preview", "--", "--port", "9000", "--host"]
CMD ["npm", "run", "preview"]
